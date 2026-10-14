import { getContrastRatio } from './minimalColors'

export type SitePalette = {
  primary: string
  secondary: string
  background: string
  sidebar: string
  surface: string
  input: string
  text: string
  textMuted: string
}

export type SiteColorKey = keyof SitePalette

export const siteColorFields: { key: SiteColorKey; label: string; description: string }[] = [
  { key: 'primary', label: 'Primary', description: 'Buttons, links and active states' },
  { key: 'secondary', label: 'Secondary', description: 'Hero graphics and soft gradients' },
  { key: 'background', label: 'Page background', description: 'The entire site canvas' },
  { key: 'sidebar', label: 'Sidebar', description: 'Navigation and sidebar background' },
  { key: 'surface', label: 'Surface', description: 'Panels, containers and sections' },
  { key: 'input', label: 'Input', description: 'Form fields and controls' },
  { key: 'text', label: 'Primary text', description: 'Headings and main body text' },
  { key: 'textMuted', label: 'Secondary text', description: 'Descriptions, captions and labels' },
]

export const defaultSitePalette: SitePalette = {
  primary: '#D4FB78',
  secondary: '#8052C5',
  background: '#0B0E14',
  sidebar: '#11141B',
  surface: '#151921',
  input: '#0B0F16',
  text: '#F7F7F9',
  textMuted: '#A2A2B0',
}

export const siteThemePresets: { name: string; description: string; palette: SitePalette }[] = [
  { name: 'Original', description: 'Lime + ultraviolet', palette: defaultSitePalette },
  { name: 'Ocean', description: 'Deep sea + electric blue', palette: { primary: '#55D6F8', secondary: '#4266E8', background: '#071924', sidebar: '#0B2130', surface: '#102B3B', input: '#091B28', text: '#F5FCFF', textMuted: '#A6C0CE' } },
  { name: 'Rose', description: 'Soft pink + violet', palette: { primary: '#F79AC1', secondary: '#AC75E8', background: '#1C111C', sidebar: '#241725', surface: '#30202F', input: '#211622', text: '#FFF0F6', textMuted: '#C4A7BE' } },
  { name: 'Daylight', description: 'Clean, bright + cobalt', palette: { primary: '#3651DD', secondary: '#9974E8', background: '#F5F4F1', sidebar: '#FFFFFF', surface: '#FFFFFF', input: '#F0F1F5', text: '#19202F', textMuted: '#5E6675' } },
  { name: 'Forest', description: 'Moss + mint', palette: { primary: '#C8F27C', secondary: '#42A888', background: '#0B1C19', sidebar: '#112720', surface: '#19352B', input: '#10271E', text: '#F2F8E8', textMuted: '#AEC4B3' } },
  { name: 'Amber', description: 'Warm orange + plum', palette: { primary: '#FDBB67', secondary: '#BC6B85', background: '#211719', sidebar: '#2B1D21', surface: '#38272B', input: '#281D20', text: '#FFF4E8', textMuted: '#CBB2AD' } },
]

const isHexColor = (value: unknown): value is string => typeof value === 'string' && /^#[\da-fA-F]{6}$/.test(value)
export const normalizeHex = (value: string) => value.toUpperCase()

export function getSitePalette(value: unknown): SitePalette {
  if (!value || typeof value !== 'object') return { ...defaultSitePalette }
  const saved = value as Record<string, unknown>
  return Object.fromEntries(siteColorFields.map(({ key }) => [key, isHexColor(saved[key]) ? normalizeHex(saved[key]) : defaultSitePalette[key]])) as SitePalette
}

export function getOnColor(background: string): string {
  return getContrastRatio(background, '#12151D') >= getContrastRatio(background, '#FFFFFF') ? '#12151D' : '#FFFFFF'
}

export function isLightPalette(palette: SitePalette): boolean {
  return getContrastRatio(palette.background, '#12151D') > getContrastRatio(palette.background, '#FFFFFF')
}
