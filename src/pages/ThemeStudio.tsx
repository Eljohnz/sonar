import { useEffect, useState } from 'react'
import { Check, Contrast, Palette, RotateCcw, SlidersHorizontal, Sparkles } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { getContrastRatio } from '../lib/minimalColors'
import { getOnColor, siteColorFields, siteThemePresets, type SiteColorKey } from '../lib/siteTheme'

function ColorField({ colorKey, label, description }: { colorKey: SiteColorKey; label: string; description: string }) {
  const { palette, setColor } = useTheme()
  const value = palette[colorKey]
  const [draft, setDraft] = useState(value)
  const [invalid, setInvalid] = useState(false)
  useEffect(() => { setDraft(value); setInvalid(false) }, [value])

  const updateHex = (next: string) => {
    setDraft(next)
    if (/^#[0-9a-fA-F]{6}$/.test(next)) { setInvalid(false); setColor(colorKey, next.toUpperCase()) }
    else setInvalid(true)
  }

  return <div className="theme-color-field">
    <label htmlFor={`site-color-${colorKey}`} className="flex min-w-0 flex-1 flex-col gap-1">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xs text-ui-muted">{description}</span>
    </label>
    <div className="flex items-center gap-2">
      <input type="color" className="theme-color-picker" aria-label={`Choose ${label.toLowerCase()} color`} value={value} onChange={event => setColor(colorKey, event.target.value.toUpperCase())} />
      <input id={`site-color-${colorKey}`} className={`theme-hex-input ${invalid ? 'theme-hex-invalid' : ''}`} aria-invalid={invalid} aria-label={`${label} hex color`} maxLength={7} spellCheck={false} value={draft} onChange={event => updateHex(event.target.value)} onBlur={() => { if (invalid) { setDraft(value); setInvalid(false) } }} />
    </div>
  </div>
}

export function ThemeStudio() {
  const { palette, setPalette, resetPalette } = useTheme()
  const backgroundContrast = getContrastRatio(palette.background, palette.text)
  const surfaceContrast = getContrastRatio(palette.surface, palette.text)
  const sidebarContrast = getContrastRatio(palette.sidebar, palette.text)
  const textMutedContrast = getContrastRatio(palette.background, palette.textMuted)
  const warnings = [
    { label: 'Page text vs background', value: backgroundContrast },
    { label: 'Text vs panels', value: surfaceContrast },
    { label: 'Text vs sidebar', value: sidebarContrast },
    { label: 'Muted text vs background', value: textMutedContrast },
  ].filter(item => item.value < 4.5)

  return <div className="pb-12">
    <div className="eyebrow"><span className="text-lime">PERSONALIZE</span> / YOUR SPACE</div>
    <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.07em]">THEME <span className="text-lime">STUDIO.</span></h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ui-muted">Make SONAR feel like yours. Choose a ready-made theme or customize all eight site colors. Every change applies instantly across the app.</p>
      </div>
      <button type="button" onClick={resetPalette} className="btn-secondary"><RotateCcw size={16} /> Reset to original</button>
    </div>
    <div className="mt-9 form-panel">
      <div className="flex items-center gap-3"><Sparkles size={19} className="text-lime" /><h2 className="font-display text-xl font-bold tracking-tight">Start with a palette</h2></div>
      <p className="mt-2 text-xs leading-6 text-ui-muted">Select one of these presets, then tweak individual colors below.</p>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {siteThemePresets.map(preset => {
          const selected = siteColorFields.every(({ key }) => preset.palette[key].toUpperCase() === palette[key].toUpperCase())
          return <button key={preset.name} type="button" aria-pressed={selected} onClick={() => setPalette({ ...preset.palette })} className={`theme-preset ${selected ? 'theme-preset-active' : ''}`}>
            <div className="theme-preset-sample" style={{ backgroundColor: preset.palette.background }}>
              <div className="flex gap-1.5"><span className="h-5 flex-1 rounded" style={{ backgroundColor: preset.palette.primary }} /><span className="h-5 w-8 rounded" style={{ backgroundColor: preset.palette.secondary }} /></div>
              <div className="mt-2 flex gap-1.5"><span className="h-8 w-5 rounded" style={{ backgroundColor: preset.palette.sidebar }} /><span className="h-8 flex-1 rounded" style={{ backgroundColor: preset.palette.surface }} /></div>
              {selected && <span className="theme-preset-check" style={{ backgroundColor: preset.palette.primary, color: getOnColor(preset.palette.primary) }}><Check size={12} strokeWidth={3} /></span>}
            </div>
            <span className="mt-3 block text-left text-xs font-bold">{preset.name}</span>
            <span className="mt-1 block text-left text-[10px] leading-4 text-ui-muted">{preset.description}</span>
          </button>
        })}
      </div>
    </div>
    <div className="mt-6 grid items-start gap-6 2xl:grid-cols-[1.15fr_.85fr]">
      <section className="form-panel">
        <div className="mb-6 flex items-center gap-3"><SlidersHorizontal size={19} className="text-lime" /><div><h2 className="font-display text-xl font-bold tracking-tight">Fine-tune every color</h2><p className="mt-1 text-xs text-ui-muted">Use the picker or enter a six-digit hex value.</p></div></div>
        <div className="grid gap-3">{siteColorFields.map(field => <ColorField key={field.key} colorKey={field.key} label={field.label} description={field.description} />)}</div>
        {warnings.length > 0 ? <div role="status" className="mt-5 rounded-xl border border-amber-400/25 bg-amber-400/10 p-4 text-xs leading-6 text-amber-300"><div className="mb-2 flex items-center gap-2 font-bold"><Contrast size={15} /> Readability reminder</div>{warnings.map(warning => <div key={warning.label}>{warning.label}: {warning.value.toFixed(1)}:1 (recommended 4.5:1 or higher)</div>)}</div> : <div role="status" className="mt-5 flex items-center gap-2 text-xs text-lime"><Check size={16} /> Main text colors have good contrast against their backgrounds.</div>}
      </section>
      <section className="form-panel 2xl:sticky 2xl:top-5">
        <div className="mb-5 flex items-center gap-3"><Palette size={19} className="text-lime" /><div><h2 className="font-display text-xl font-bold tracking-tight">Live preview</h2><p className="mt-1 text-xs text-ui-muted">Your site is already updating as you edit.</p></div></div>
        <div className="theme-preview-stage">
          <div className="theme-preview-sidebar"><div className="font-display text-lg font-bold">SONAR<span className="text-lime">.</span></div><div className="theme-preview-side-active">Discover</div><div className="theme-preview-side-muted">Your library</div><div className="theme-preview-side-muted">My account</div></div>
          <div className="theme-preview-content">
            <div className="mb-3 flex items-center justify-between gap-2"><span className="text-[10px] font-bold">WELCOME TO SONAR</span><span className="h-3 w-3 rounded-full bg-lime" /></div>
            <div className="theme-preview-hero"><div className="relative z-10"><div className="text-[9px] font-semibold tracking-widest opacity-80">MAKE SOME NOISE</div><div className="font-display mt-2 text-xl font-bold leading-tight">MUSIC LOOKS<br /><span className="text-lime">DIFFERENT.</span></div><span className="mt-3 inline-flex rounded-md bg-lime px-3 py-2 text-[9px] font-bold text-ui-onprimary">EXPLORE MUSIC</span></div><div className="theme-preview-glow" /></div>
            <div className="mt-3 rounded-lg bg-ui-surface p-3"><div className="text-xs font-bold">Featured tracks</div><div className="mt-2 flex items-center gap-2"><div className="h-9 w-9 rounded-md" style={{ background: 'linear-gradient(145deg, #B778FF, #4D327D)' }} /><div><div className="text-[10px] font-semibold">Midnight Radio</div><div className="text-[9px] text-ui-muted">A sample song</div></div></div></div>
            <div className="mt-2 rounded-lg bg-ui-input px-3 py-2 text-[10px] text-ui-muted">Search music...</div>
          </div>
        </div>
        <p className="mt-5 text-xs leading-6 text-ui-muted">Saved automatically in this browser. A future account-sync feature can carry your theme across devices.</p>
        <p className="mt-3 rounded-lg border border-ui-border p-3 text-[11px] leading-5 text-ui-muted">Every music visualizer uses its own independent colors. Changing the site palette will not modify the colors that authors saved with their songs.</p>
      </section>
    </div>
  </div>
}
