import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowLeft, ArrowRight, Check, Maximize2, X } from 'lucide-react'
import { MusicVisual } from './MusicVisual'
import type { Song, VisualStyle } from '../types/music'

const styles: { id: VisualStyle; label: string }[] = [
  { id: 'album', label: 'Cover art' },
  { id: 'equalizer', label: 'Equalizer' },
  { id: 'vinyl', label: 'Vinyl' },
  { id: 'minimal', label: 'Minimal' },
]

type Props = {
  song: Song
  style: VisualStyle
  selected?: VisualStyle
  onChangeStyle?: (style: VisualStyle) => void
  onSelect?: (style: VisualStyle) => void
  mode?: 'compose' | 'view'
  onClose: () => void
}

export function VisualPreviewModal({ song, style, selected, onChangeStyle, onSelect, onClose, mode = 'compose' }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const currentIndex = styles.findIndex(item => item.id === style)
  const current = styles[currentIndex]
  const isSelected = style === selected

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      previousFocus?.focus()
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      if (mode === 'compose' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        const target = event.target
        if (target instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return
        event.preventDefault()
        const next = (currentIndex + (event.key === 'ArrowRight' ? 1 : -1) + styles.length) % styles.length
        onChangeStyle?.(styles[next].id)
      }
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])'))
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex, onChangeStyle, onClose, mode])

  const switchStyle = (direction: number) => {
    onChangeStyle?.(styles[(currentIndex + direction + styles.length) % styles.length].id)
  }

  return createPortal(
    <div className="visual-preview-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={dialogRef} className="visual-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="visual-preview-title" aria-describedby="visual-preview-description" tabIndex={-1}>
        <div className="visual-preview-header">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-lime"><Maximize2 size={13} /> {mode === 'view' ? 'FULL-SIZE VISUAL' : 'FULL-SIZE PREVIEW'}</div>
            <h2 id="visual-preview-title" className="font-display mt-1 text-[clamp(20px,2.2vw,28px)] font-bold tracking-[-0.05em]">{current.label}</h2>
            <p id="visual-preview-description" className="mt-1 text-xs text-ui-muted">{mode === 'view' ? 'The published design and colors for this track.' : 'Inspect your song card before publishing.'}</p>
          </div>
          <button ref={closeButtonRef} type="button" onClick={onClose} className="visual-preview-close" aria-label="Close full-size preview" title="Close preview"><X size={20} /></button>
        </div>
        <div className="visual-preview-main">
          <div className="visual-preview-stage">
            <MusicVisual song={{ ...song, visual_style: style }} large />
          </div>
          <div className="visual-preview-details">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-lime">{current.label.toUpperCase()} / SONAR</p>
              <p className="font-display mt-2 break-words text-xl font-bold tracking-[-0.04em]">{song.title}</p>
              <p className="mt-1 break-words text-sm text-ui-muted">{song.artist}</p>
              {song.caption && <p className="mt-3 break-words text-xs italic leading-6 text-ui-muted">“{song.caption}”</p>}
            </div>
            {mode === 'compose' && <div className="visual-preview-pager" aria-label="Browse visual styles">
              <button type="button" onClick={() => switchStyle(-1)} aria-label="Preview previous visualizer" title="Previous style"><ArrowLeft size={19} /></button>
              <span aria-live="polite">{currentIndex + 1} / {styles.length}</span>
              <button type="button" onClick={() => switchStyle(1)} aria-label="Preview next visualizer" title="Next style"><ArrowRight size={19} /></button>
            </div>}
          </div>
        </div>
        <div className="visual-preview-footer">
          <div className="min-w-0 text-xs leading-5 text-ui-muted">{mode === 'view' ? 'A visual moment, shared through music.' : isSelected ? 'This style is currently selected.' : 'Your published card will use the style you select.'}</div>
          <div className="visual-preview-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
            {mode === 'compose' && <button type="button" className="btn-primary" onClick={() => { onSelect?.(style); onClose() }}>
              {isSelected ? <><Check size={16} /> Keep this style</> : <><Check size={16} /> Use this style</>}
            </button>}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
