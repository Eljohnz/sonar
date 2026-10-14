import { useEffect, useState } from 'react'
import { Check, RotateCcw, SlidersHorizontal } from 'lucide-react'
import { getContrastRatio } from '../lib/minimalColors'
import { defaultVisualColors, visualColorFields, visualColorPresets } from '../lib/visualColors'
import type { VisualPaletteMap, VisualStyle } from '../types/music'

type Props<K extends VisualStyle> = {
  style: K
  colors: VisualPaletteMap[K]
  onChange: (colors: VisualPaletteMap[K]) => void
}

function ColorControl({ label, description, value, onChange }: {
  label: string
  description: string
  value: string
  onChange: (color: string) => void
}) {
  const [draft, setDraft] = useState(value)
  useEffect(() => setDraft(value), [value])
  const valid = /^#[a-f\d]{6}$/i.test(draft)

  return <label className="visual-color-field">
    <span className="mb-1 block text-xs font-bold">{label}</span>
    <span className="mb-3 block text-[10px] leading-5 text-ui-muted">{description}</span>
    <span className="flex items-center gap-2">
      <input
        type="color"
        className="minimal-color-picker shrink-0"
        aria-label={`${label} color picker`}
        value={value}
        onChange={event => onChange(event.target.value.toUpperCase())}
      />
      <input
        type="text"
        className={`visual-hex-input ${valid ? '' : 'theme-hex-invalid'}`}
        aria-label={`${label} six-digit hex color`}
        aria-invalid={!valid}
        value={draft}
        maxLength={7}
        spellCheck={false}
        onChange={event => {
          const next = event.target.value.toUpperCase()
          setDraft(next)
          if (/^#[A-F\d]{6}$/.test(next)) onChange(next)
        }}
        onBlur={() => { if (!valid) setDraft(value) }}
      />
    </span>
  </label>
}

export function VisualColorEditor<K extends VisualStyle>({ style, colors, onChange }: Props<K>) {
  const fields = visualColorFields[style]
  const current = colors as unknown as Record<string, string>
  const presets = visualColorPresets[style]
  const reset = () => onChange({ ...defaultVisualColors[style] } as VisualPaletteMap[K])
  const textColor = current.text
  const backgroundColor = current.background
  const ratio = getContrastRatio(backgroundColor, textColor)
  const textOnArt = style === 'album'

  return <section className="mt-6 border-t border-ui-border pt-6" aria-label={`${style} visualizer colors`}>
    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
      <h3 className="flex items-center gap-2 text-sm font-bold"><SlidersHorizontal size={16} className="text-lime" /> Customize {style === 'album' ? 'Cover art' : style.charAt(0).toUpperCase() + style.slice(1)} colors</h3>
      <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 text-xs font-semibold text-ui-muted transition hover:text-lime"><RotateCcw size={13} /> Reset {style} colors</button>
    </div>
    <p className="mb-4 text-xs leading-6 text-ui-muted">Pick a preset or customize individual colors. These settings belong to this visualizer only.</p>
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {presets.map(preset => {
        const sample = preset.colors as Record<string, string>
        const selected = fields.every(field => current[field.key].toUpperCase() === sample[field.key].toUpperCase())
        return <button
          type="button"
          key={preset.name}
          aria-pressed={selected}
          onClick={() => onChange({ ...preset.colors } as VisualPaletteMap[K])}
          className={`minimal-preset ${selected ? 'minimal-preset-active' : ''}`}
        >
          <span className="minimal-preset-colors" style={{ backgroundColor: sample.background }}>
            {fields.filter(field => field.key !== 'background' && field.key !== 'text').map(field => <span key={field.key} className="h-2 w-5 rounded-full" style={{ backgroundColor: sample[field.key] }} />)}
            <span className="h-2 w-5 rounded-full" style={{ backgroundColor: sample.text }} />
            {selected && <Check size={14} className="ml-auto" style={{ color: sample.text }} />}
          </span>
          <span className="text-[11px] font-semibold">{preset.name}</span>
        </button>
      })}
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {fields.map(field => <ColorControl
        key={`${style}-${field.key}`}
        label={field.label}
        description={field.description}
        value={current[field.key]}
        onChange={hex => onChange({ ...colors, [field.key]: hex } as VisualPaletteMap[K])}
      />)}
    </div>
    {ratio < 4.5 && <p role="status" className="mt-4 text-xs leading-6 text-amber-300">Readability warning: text and background contrast is {ratio.toFixed(1)}:1 (recommended 4.5:1). {textOnArt ? 'Album artwork may also affect readability.' : 'Try a lighter text color or a darker background.'}</p>}
  </section>
}
