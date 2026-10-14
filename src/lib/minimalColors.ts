import type { MinimalColors } from '../types/music'

export const defaultMinimalColors: MinimalColors = {
  background: '#E6DFCF',
  text: '#201E20',
  accent: '#201E20',
}

export const minimalColorPresets: { name: string; colors: MinimalColors }[] = [
  { name: 'Paper', colors: defaultMinimalColors },
  { name: 'Midnight', colors: { background: '#171A2A', text: '#F6F1E8', accent: '#BEF474' } },
  { name: 'Rose', colors: { background: '#F5C9CC', text: '#4E2336', accent: '#B54C72' } },
  { name: 'Ocean', colors: { background: '#C0E6E9', text: '#0C3444', accent: '#2B8192' } },
  { name: 'Cobalt', colors: { background: '#3348D3', text: '#FFFFFF', accent: '#D8FF78' } },
  { name: 'Forest', colors: { background: '#173C32', text: '#EBF5D7', accent: '#C7E87A' } },
]

const isHexColor = (value: unknown): value is string =>
  typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value)

export function getMinimalColors(colors?: MinimalColors | null): MinimalColors {
  return {
    background: isHexColor(colors?.background) ? colors.background : defaultMinimalColors.background,
    text: isHexColor(colors?.text) ? colors.text : defaultMinimalColors.text,
    accent: isHexColor(colors?.accent) ? colors.accent : defaultMinimalColors.accent,
  }
}

function relativeLuminance(color: string): number {
  const channels = [1, 3, 5].map(offset => {
    const value = parseInt(color.slice(offset, offset + 2), 16) / 255
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722
}

export function getContrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first)
  const b = relativeLuminance(second)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}
