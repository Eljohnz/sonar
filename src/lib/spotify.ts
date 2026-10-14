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

export async function getSpotifyPreview(spotifyUrl: string): Promise<{ title: string; cover: string | null }> {
  const parsed = parseSpotifyTrackUrl(spotifyUrl)
  if (!parsed) throw new Error('Please paste a valid Spotify track URL.')
  const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(parsed.url)}`)
  if (!response.ok) throw new Error('Spotify could not find this song.')
  const result: { title?: string; thumbnail_url?: string | null } = await response.json()
  return { title: result.title ?? '', cover: result.thumbnail_url ?? null }
}
