export type VisualStyle = 'album' | 'equalizer' | 'vinyl' | 'minimal'
export type SongStatus = 'published' | 'hidden'

export type MinimalColors = {
  background: string
  text: string
  accent: string
}

export type AlbumColors = {
  background: string
  text: string
  accent: string
}

export type EqualizerColors = {
  background: string
  bars: string
  grid: string
  text: string
}

export type VinylColors = {
  background: string
  record: string
  accent: string
  text: string
}

export type VisualPaletteMap = {
  album: AlbumColors
  equalizer: EqualizerColors
  vinyl: VinylColors
  minimal: MinimalColors
}

export type VisualColors = Partial<VisualPaletteMap>

export interface Song {
  id: string
  user_id: string | null
  spotify_id: string | null
  spotify_url: string | null
  title: string
  artist: string
  album: string | null
  cover_url: string | null
  visual_style: VisualStyle
  visual_colors?: VisualColors | null
  minimal_colors?: MinimalColors | null
  caption: string | null
  status: SongStatus
  created_at: string
}

export type SongInput = Pick<Song, 'spotify_id' | 'spotify_url' | 'title' | 'artist' | 'album' | 'cover_url' | 'visual_style' | 'visual_colors' | 'minimal_colors' | 'caption'>
export type Profile = {
  id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
}
