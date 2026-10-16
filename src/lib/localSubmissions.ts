import type { Song, SongInput } from '../types/music'
import { parseSpotifyTrackUrl } from './spotify'

export function isLocalSubmission(song: Song | undefined): song is Song {
  return Boolean(song && song.user_id === null && !song.id.startsWith('demo-'))
}

export function requireLocalSubmission(song: Song | undefined): Song {
  if (!isLocalSubmission(song)) throw new Error('Only your own submissions saved in this browser can be changed.')
  return song
}

export function editLocalSubmission(song: Song, input: SongInput): Song {
  requireLocalSubmission(song)
  const spotify = parseSpotifyTrackUrl(input.spotify_url ?? '')
  if (!spotify || !input.title.trim() || !input.artist.trim()) throw new Error('Add a valid Spotify track, title, and artist.')
  return { ...song, ...input, spotify_url: spotify.url, spotify_id: spotify.id,
    title: input.title.trim(), artist: input.artist.trim(),
    id: song.id, user_id: song.user_id, status: song.status, created_at: song.created_at }
}
