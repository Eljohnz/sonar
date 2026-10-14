export function parseSpotifyTrackUrl(raw: string): { id: string; url: string } | null {
  try {
    const input = raw.trim()
    const uri = /^spotify:track:([a-zA-Z0-9]{22})$/.exec(input)
    if (uri) return { id: uri[1], url: `https://open.spotify.com/track/${uri[1]}` }
    const parsed = new URL(input)
    if (parsed.protocol !== 'https:' || parsed.hostname !== 'open.spotify.com') return null
    const parts = parsed.pathname.split('/').filter(Boolean)
    const at = parts.findIndex(part => part === 'track')
    const id = parts[at + 1]
    if (at < 0 || !id || !/^[a-zA-Z0-9]{22}$/.test(id)) return null
    return { id, url: `https://open.spotify.com/track/${id}` }
  } catch {
    return null
  }
}

export async function getSpotifyPreview(spotifyUrl: string, signal?: AbortSignal): Promise<{ title: string; cover: string | null }> {
  const parsed = parseSpotifyTrackUrl(spotifyUrl)
  if (!parsed) throw new Error('Please paste a valid Spotify track URL.')
  const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.url)}`, { signal })
  if (!response.ok) throw new Error('Spotify could not find this song.')
  const result: unknown = await response.json()
  if (!result || typeof result !== 'object') throw new Error('Spotify returned an invalid preview.')
  const metadata = result as Record<string, unknown>
  return { title: typeof metadata.title === 'string' ? metadata.title : '', cover: typeof metadata.thumbnail_url === 'string' ? metadata.thumbnail_url : null }
}

// Cancellation alone is insufficient: a response may already be decoding when aborted.
export function createSpotifyPreviewLoader() {
  let active: AbortController | null = null
  return {
    get pending() { return active !== null },
    cancel() { active?.abort(); active = null },
    async load(url: string) {
      active?.abort()
      const request = new AbortController()
      active = request
      try {
        const preview = await getSpotifyPreview(url, request.signal)
        return active === request && !request.signal.aborted ? preview : null
      } catch (error) {
        if (active !== request || request.signal.aborted) return null
        throw error
      } finally {
        if (active === request) active = null
      }
    },
  }
}
