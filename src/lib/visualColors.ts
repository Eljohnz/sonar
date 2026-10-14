import { defaultMinimalColors } from './minimalColors'
import type { MinimalColors, VisualColors, VisualPaletteMap, VisualStyle } from '../types/music'

export type VisualColorField = {
  key: string
  label: string
  description: string
}

export const defaultVisualColors: VisualPaletteMap = {
  album: { background: '#30224F', text: '#FFFFFF', accent: '#E7CBFF' },
  equalizer: { background: '#221C38', bars: '#AE87FF', grid: '#B8A3ED', text: '#FFFFFF' },
  vinyl: { background: '#7354A8', record: '#191B22', accent: '#E6D6F7', text: '#FFFFFF' },
  minimal: defaultMinimalColors,
}

export const visualColorFields: Record<VisualStyle, VisualColorField[]> = {
  album: [
    { key: 'background', label: 'Backdrop', description: 'Poster background and album-art overlay' },
    { key: 'text', label: 'Text', description: 'Song information and labels' },
    { key: 'accent', label: 'Accent', description: 'Decorative rings and rule' },
  ],
  equalizer: [
    { key: 'background', label: 'Background', description: 'Visualizer canvas' },
    { key: 'bars', label: 'Bars', description: 'Animated equalizer bars' },
    { key: 'grid', label: 'Grid', description: 'Grid lines and kicker' },
    { key: 'text', label: 'Text', description: 'Song name' },
  ],
  vinyl: [
    { key: 'background', label: 'Background', description: 'Turntable canvas' },
    { key: 'record', label: 'Record', description: 'Vinyl disc color' },
    { key: 'accent', label: 'Accent', description: 'Tonearm and label without cover art' },
    { key: 'text', label: 'Text', description: 'Record information' },
  ],
  minimal: [
    { key: 'background', label: 'Background', description: 'Card background' },
    { key: 'text', label: 'Text', description: 'Title and details' },
    { key: 'accent', label: 'Accent', description: 'Line and arrow' },
  ],
}

type VisualPreset<K extends VisualStyle = VisualStyle> = {
  name: string
  colors: VisualPaletteMap[K]
}

export const visualColorPresets: { [K in VisualStyle]: VisualPreset<K>[] } = {
  album: [
    { name: 'Ultraviolet', colors: defaultVisualColors.album },
    { name: 'Sunset', colors: { background: '#5E2940', text: '#FFF2E6', accent: '#FFBC80' } },
    { name: 'Forest', colors: { background: '#103F38', text: '#F4FFE8', accent: '#C7F28A' } },
    { name: 'Daylight', colors: { background: '#EAE7DF', text: '#191A2A', accent: '#795ED2' } },
    { name: 'Cobalt', colors: { background: '#152F82', text: '#FFFFFF', accent: '#99F1FF' } },
    { name: 'Raspberry', colors: { background: '#7A2959', text: '#FFF0F7', accent: '#FBCB5D' } },
  ],
  equalizer: [
    { name: 'Frequency', colors: defaultVisualColors.equalizer },
    { name: 'Acid', colors: { background: '#101B14', bars: '#D4FB78', grid: '#4F8464', text: '#F4FFE8' } },
    { name: 'Icewave', colors: { background: '#0E2F40', bars: '#5DE6EC', grid: '#5B94AF', text: '#E7FAFF' } },
    { name: 'Fire', colors: { background: '#35191D', bars: '#FF9863', grid: '#BF5965', text: '#FFF0E7' } },
    { name: 'Pink Noise', colors: { background: '#2C1839', bars: '#FF8DC8', grid: '#BD74DD', text: '#FFF5FC' } },
    { name: 'Monochrome', colors: { background: '#101215', bars: '#F1F2F4', grid: '#777B88', text: '#FFFFFF' } },
  ],
  vinyl: [
    { name: 'Classic', colors: defaultVisualColors.vinyl },
    { name: 'Cherry', colors: { background: '#B85767', record: '#39212B', accent: '#FDE5C7', text: '#FFF6EA' } },
    { name: 'Mint', colors: { background: '#9DDCC8', record: '#183C3B', accent: '#F4EAB9', text: '#163A36' } },
    { name: 'Gold', colors: { background: '#504028', record: '#171718', accent: '#E9BD6D', text: '#FFF4D8' } },
    { name: 'Indigo', colors: { background: '#263D90', record: '#141728', accent: '#A5D7FF', text: '#F5FAFF' } },
    { name: 'Cream', colors: { background: '#E7D9C0', record: '#403C3A', accent: '#8E6955', text: '#302B2A' } },
  ],
  minimal: [
    { name: 'Paper', colors: defaultMinimalColors },
    { name: 'Midnight', colors: { background: '#171A2A', text: '#F6F1E8', accent: '#BEF474' } },
    { name: 'Rose', colors: { background: '#F5C9CC', text: '#4E2336', accent: '#B54C72' } },
    { name: 'Ocean', colors: { background: '#C0E6E9', text: '#0C3444', accent: '#2B8192' } },
    { name: 'Cobalt', colors: { background: '#3348D3', text: '#FFFFFF', accent: '#D8FF78' } },
    { name: 'Forest', colors: { background: '#173C32', text: '#EBF5D7', accent: '#C7E87A' } },
  ],
}

export function createVisualColors(): VisualPaletteMap {
  return {
    album: { ...defaultVisualColors.album },
    equalizer: { ...defaultVisualColors.equalizer },
    vinyl: { ...defaultVisualColors.vinyl },
    minimal: { ...defaultVisualColors.minimal },
  }
}

const isHex = (value: unknown): value is string => typeof value === 'string' && /^#[\da-fA-F]{6}$/.test(value)

// Sanitize colors read from localStorage or the database before placing them into inline styles.
export function getVisualColors<K extends VisualStyle>(
  style: K,
  saved?: VisualColors | null,
  legacyMinimal?: MinimalColors | null,
): VisualPaletteMap[K] {
  const fallback = defaultVisualColors[style] as Record<string, string>
  const candidate = (style === 'minimal' && !saved?.minimal ? legacyMinimal : saved?.[style]) as Record<string, unknown> | null | undefined
  const safe = Object.fromEntries(
    Object.entries(fallback).map(([key, defaultValue]) => [key, isHex(candidate?.[key]) ? candidate[key] : defaultValue]),
  )
  return safe as VisualPaletteMap[K]
}

export function normalizeVisualColors(saved?: VisualColors | null, legacyMinimal?: MinimalColors | null): VisualPaletteMap {
  return {
    album: getVisualColors('album', saved),
    equalizer: getVisualColors('equalizer', saved),
    vinyl: getVisualColors('vinyl', saved),
    minimal: getVisualColors('minimal', saved, legacyMinimal),
  }
}
