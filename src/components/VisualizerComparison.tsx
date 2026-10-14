import { Check, Eye, Maximize2, Palette } from 'lucide-react'
import type { Song, VisualStyle } from '../types/music'
import { MusicVisual } from './MusicVisual'

const options: Array<{ style: VisualStyle; name: string; description: string }> = [
  { style: 'album', name: 'Cover art', description: 'Artwork in focus' },
  { style: 'equalizer', name: 'Equalizer', description: 'Animated energy' },
  { style: 'vinyl', name: 'Vinyl', description: 'Record-player mood' },
  { style: 'minimal', name: 'Minimal', description: 'Editorial typography' },
]

type Props = {
  song: Song
  selected: VisualStyle
  onSelect: (style: VisualStyle) => void
  onPreview: (style: VisualStyle) => void
}

export function VisualizerComparison({ song, selected, onSelect, onPreview }: Props) {
  const selectedName = options.find(option => option.style === selected)?.name ?? 'Cover art'

  return <section aria-labelledby="compare-visualizers-heading">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id="compare-visualizers-heading" className="flex items-center gap-2 text-sm font-bold"><Eye size={16} className="text-lime" /> Compare all four looks</h3>
        <p className="mt-2 max-w-xl text-xs leading-6 text-ui-muted">Select a visual to edit its colors, or use the expand button to inspect it at full size.</p>
      </div>
      <span className="compare-counter">4 LIVE PREVIEWS</span>
    </div>
    <div className="visualizer-compare-grid" role="group" aria-label="Choose a visualizer">
      {options.map(option => {
        const active = option.style === selected
        return <div key={option.style} className={`visualizer-compare-option ${active ? 'visualizer-compare-option-active' : ''}`}>
          <div className="visualizer-compare-art">
            <button
              type="button"
              className="visualizer-compare-select"
              aria-pressed={active}
              aria-label={`Select ${option.name} visualizer`}
              onClick={() => onSelect(option.style)}
            >
              <MusicVisual song={{ ...song, visual_style: option.style }} compact />
              <span className={`visualizer-compare-check ${active ? 'visualizer-compare-check-active' : ''}`} aria-hidden="true">
                {active ? <Check size={13} strokeWidth={3} /> : <Palette size={12} />}
              </span>
            </button>
            <button
              type="button"
              className="visualizer-compare-expand"
              onClick={() => onPreview(option.style)}
              aria-label={`Open full-size ${option.name} preview`}
              title={`Preview ${option.name} at full size`}
            ><Maximize2 size={17} /></button>
          </div>
          <button
            type="button"
            className="visualizer-compare-meta"
            onClick={() => onSelect(option.style)}
            aria-label={`Select ${option.name} visualizer`}
            aria-pressed={active}
          >
            <span className="visualizer-compare-name">{option.name}</span>
            <span className="visualizer-compare-description">{option.description}</span>
            <span className={`visualizer-compare-state ${active ? 'visualizer-compare-state-active' : ''}`}>{active ? 'SELECTED' : 'CHOOSE STYLE'}</span>
          </button>
        </div>
      })}
    </div>
    <p className="mt-4 flex items-center gap-2 text-xs leading-6 text-ui-muted" role="status" aria-live="polite">
      <Check size={14} className="shrink-0 text-lime" />
      <span><strong className="text-ui-text">{selectedName}</strong> is selected. The color editor below only changes this style.</span>
    </p>
  </section>
}
