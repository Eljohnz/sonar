import type { MinimalColors, Song, VisualColors, VisualStyle } from '../types/music'
import { normalizeVisualColors } from './visualColors'
import { parseSpotifyTrackUrl } from './spotify'

type ReadStorage = Pick<Storage, 'getItem'>
type WriteStorage = Pick<Storage, 'setItem'>
const styles: VisualStyle[] = ['album', 'equalizer', 'vinyl', 'minimal']
const optionalText = (value: unknown): string | null => typeof value === 'string' ? value : null

function readValue(key: string, storage?: ReadStorage): unknown {
  try {
    // Access the storage property inside the guard; the getter itself can throw.
    return JSON.parse((storage ?? window.localStorage).getItem(key) ?? 'null')
  } catch { return null }
}

function readSong(value: unknown): Song | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const item = value as Record<string, unknown>
  if (typeof item.id !== 'string' || !item.id.trim() || item.id.startsWith('demo-') ||
      typeof item.title !== 'string' || !item.title.trim() ||
      typeof item.artist !== 'string' || !item.artist.trim() ||
      !styles.includes(item.visual_style as VisualStyle) ||
      (item.status !== 'published' && item.status !== 'hidden') ||
      typeof item.created_at !== 'string' || Number.isNaN(Date.parse(item.created_at))) return null

  const spotify = typeof item.spotify_url === 'string' ? parseSpotifyTrackUrl(item.spotify_url) : null
  const palettes = normalizeVisualColors(item.visual_colors as VisualColors | null, item.minimal_colors as MinimalColors | null)
  let cover: string | null = null
  if (typeof item.cover_url === 'string') {
    try { if (new URL(item.cover_url).protocol === 'https:') cover = item.cover_url } catch { /* Ignore invalid artwork URLs. */ }
  }
  return {
    id: item.id, user_id: optionalText(item.user_id), title: item.title, artist: item.artist,
    spotify_url: spotify?.url ?? null, spotify_id: spotify?.id ?? null,
    album: optionalText(item.album), caption: optionalText(item.caption), cover_url: cover,
    visual_style: item.visual_style as VisualStyle, status: item.status, created_at: item.created_at,
    visual_colors: palettes, minimal_colors: palettes.minimal,
  }
}

export function readDemoSongs(storage?: ReadStorage): Song[] {
  const saved = readValue('sonar_songs', storage)
  if (!Array.isArray(saved)) return []
  const ids = new Set<string>()
  return saved.flatMap(value => {
    const song = readSong(value)
    if (!song || ids.has(song.id)) return []
    ids.add(song.id)
    return [song]
  })
}

export function readDemoLikes(storage?: ReadStorage): string[] {
  const saved = readValue('sonar_likes', storage)
  return Array.isArray(saved) ? [...new Set(saved.filter((id): id is string => typeof id === 'string' && Boolean(id.trim())))] : []
}

export function writeDemoValue(key: 'sonar_songs' | 'sonar_likes', value: unknown, storage?: WriteStorage): boolean {
  try {
    (storage ?? window.localStorage).setItem(key, JSON.stringify(value))
    return true
  } catch { return false }
}
