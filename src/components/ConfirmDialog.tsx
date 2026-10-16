import { useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Trash2 } from 'lucide-react'

type Props = {
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  busy?: boolean
}

export function ConfirmDialog({ title, description, confirmLabel, onConfirm, onClose, busy = false }: Props) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const descriptionId = useId()
  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const overflow = document.body.style.overflow
    const dialog = ref.current
    dialog?.showModal()
    document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = overflow; previous?.focus() }
  }, [])
  return createPortal(<dialog ref={ref} className="confirm-dialog" aria-labelledby={titleId} aria-describedby={descriptionId}
    onCancel={event => { event.preventDefault(); if (!busy) onClose() }}>
    <div className="confirm-dialog-icon"><Trash2 size={24} /></div>
    <h2 id={titleId} className="font-display mt-5 text-2xl font-bold tracking-[-0.04em]">{title}</h2>
    <p id={descriptionId} className="mt-3 text-sm leading-7 text-ui-muted">{description}</p>
    <div className="mt-7 flex flex-wrap justify-end gap-3">
      <button type="button" autoFocus disabled={busy} className="btn-secondary" onClick={onClose}>Cancel</button>
      <button type="button" disabled={busy} className="btn-danger" onClick={onConfirm}>{busy ? 'Deleting…' : confirmLabel}</button>
    </div>
  </dialog>, document.body)
}
