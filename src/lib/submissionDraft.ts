import type { Song, VisualPaletteMap, VisualStyle } from '../types/music'
import { createVisualColors, normalizeVisualColors } from './visualColors'

export type SubmissionDraft = {
  spotifyUrl: string
  title: string
  artist: string
  album: string
  cover: string | null
  caption: string
  style: VisualStyle
  visualColors: VisualPaletteMap
}

const KEY = 'sonar.submission-draft.v1'

export function emptySubmissionDraft(): SubmissionDraft {
  return { spotifyUrl: '', title: '', artist: '', album: '', cover: null, caption: '', style: 'album', visualColors: createVisualColors() }
}

export function songToDraft(song: Song): SubmissionDraft {
  return { spotifyUrl: song.spotify_url ?? '', title: song.title, artist: song.artist, album: song.album ?? '',
    cover: song.cover_url, caption: song.caption ?? '', style: song.visual_style,
    visualColors: normalizeVisualColors(song.visual_colors, song.minimal_colors) }
}

export function hasDraftContent(draft: SubmissionDraft): boolean {
  return Boolean(draft.spotifyUrl || draft.title || draft.artist || draft.album || draft.caption || draft.cover ||
    draft.style !== 'album' || JSON.stringify(draft.visualColors) !== JSON.stringify(createVisualColors()))
}

export function readSubmissionDraft(storage?: Pick<Storage, 'getItem'>): SubmissionDraft | null {
  try {
    const saved = JSON.parse((storage ?? window.localStorage).getItem(KEY) ?? 'null')
    const value = saved?.values
    if (saved?.version !== 1 || !value || typeof value !== 'object' || Array.isArray(value) ||
      !['spotifyUrl', 'title', 'artist', 'album', 'caption'].every(key => typeof value[key] === 'string') ||
      !['album', 'equalizer', 'vinyl', 'minimal'].includes(value.style)) return null
    let cover: string | null = null
    if (typeof value.cover === 'string') {
      try { if (new URL(value.cover).protocol === 'https:') cover = value.cover } catch { /* Ignore invalid artwork. */ }
    }
    return { spotifyUrl: value.spotifyUrl.slice(0, 2048), title: value.title.slice(0, 160), artist: value.artist.slice(0, 160),
      album: value.album.slice(0, 160), caption: value.caption.slice(0, 280), cover, style: value.style,
      visualColors: normalizeVisualColors(value.visualColors) }
  } catch { return null }
}

export function saveSubmissionDraft(draft: SubmissionDraft, storage?: Pick<Storage, 'setItem'>): boolean {
  try {
    (storage ?? window.localStorage).setItem(KEY, JSON.stringify({ version: 1, values: draft }))
    return true
  } catch { return false }
}

export function clearSubmissionDraft(storage?: Pick<Storage, 'removeItem'>): boolean {
  try {
    (storage ?? window.localStorage).removeItem(KEY)
    return true
  } catch { return false }
}
