import { useEffect, useRef, useState } from 'react'
import { ArrowRight, FilePenLine, Music2, Pencil, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { MusicVisual } from '../components/MusicVisual'
import { useMusic } from '../context/MusicContext'
import { isLocalSubmission } from '../lib/localSubmissions'
import { readSubmissionDraft } from '../lib/submissionDraft'
import type { Song } from '../types/music'

export function LocalSubmissions() {
  const { songs, deleteSong } = useMusic()
  const mine = songs.filter(isLocalSubmission)
  const [draft] = useState(() => readSubmissionDraft())
  const [target, setTarget] = useState<Song | null>(null)
  const [working, setWorking] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const noticeRef = useRef<HTMLParagraphElement>(null)
  useEffect(() => { if (notice) noticeRef.current?.focus({ preventScroll: true }) }, [notice])

  const remove = async () => {
    if (!target) return
    setWorking(true); setError('')
    try {
      await deleteSong(target.id)
      setNotice(`“${target.title}” was deleted from this browser.`)
      setTarget(null)
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not delete this song.'); setTarget(null) }
    finally { setWorking(false) }
  }

  return <>
    <div className="eyebrow"><span className="text-lime">YOUR SPACE</span> / THIS BROWSER</div>
    <div className="mt-3 flex flex-wrap items-end justify-between gap-5"><div>
      <h1 className="font-display text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.065em]">YOUR SUBMISSIONS<span className="text-lime">.</span></h1>
      <p className="mt-3 max-w-xl text-sm leading-7 text-ui-muted">Your tracks, your visuals. Edit the details or remove a submission saved in this browser.</p>
    </div><Link to="/submit" className="btn-primary"><Plus size={16} /> Share a track</Link></div>
    {draft && <section className="draft-resume-panel mt-8" aria-labelledby="saved-draft-title"><FilePenLine size={25} className="text-lime shrink-0" /><div className="min-w-0 flex-1"><p className="eyebrow text-lime">SAVED DRAFT</p><h2 id="saved-draft-title" className="mt-1 font-bold break-words">{draft.title || 'Your next track'}</h2><p className="mt-1 text-xs leading-6 text-ui-muted">{draft.artist ? `${draft.artist} · ` : ''}Your details and visual colors are ready to continue.</p></div><Link to="/submit" className="btn-secondary">Continue draft <ArrowRight size={15} /></Link></section>}
    <div className="mt-9 flex items-center justify-between gap-4 border-b border-ui-border pb-5"><span className="eyebrow">PUBLISHED HERE</span><span className="text-sm text-ui-muted">{mine.length} {mine.length === 1 ? 'track' : 'tracks'}</span></div>
    {notice && <p ref={noticeRef} tabIndex={-1} role="status" className="mt-5 text-sm text-lime">{notice}</p>}
    {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
    {mine.length ? <div className="mt-6 space-y-4">{mine.map(song => <article key={song.id} className="submission-row">
      <Link to={`/song/${song.id}`} viewTransition className="submission-thumbnail" aria-label={`View ${song.title}`}><MusicVisual song={song} compact /></Link>
      <div className="min-w-0"><p className="eyebrow">{song.visual_style} VISUAL</p><Link to={`/song/${song.id}`} viewTransition className="font-display mt-1 block break-words text-xl font-bold tracking-[-0.04em] hover:text-lime">{song.title}</Link><p className="mt-1 break-words text-sm text-ui-muted">{song.artist}</p></div>
      <div className="submission-row-actions"><Link to={`/song/${song.id}/edit`} className="btn-secondary" aria-label={`Edit ${song.title}`}><Pencil size={15} /> Edit</Link><button type="button" onClick={() => { setNotice(''); setError(''); setTarget(song) }} className="btn-secondary" aria-label={`Delete ${song.title}`}><Trash2 size={15} /> Delete</button></div>
    </article>)}</div> : <div className="empty-state mt-7"><Music2 size={32} className="mx-auto mb-4 text-lime" /><p>No submissions here yet. Your published tracks will appear in this space.</p><Link to="/submit" className="btn-primary mt-6">Share your first track <ArrowRight size={16} /></Link></div>}
    <p className="mt-7 text-xs leading-6 text-ui-muted">This space belongs to this browser. Fictional showcase tracks are kept separate from your submissions.</p>
    {target && <ConfirmDialog title="Delete this submission?" description={`“${target.title}” will be removed from Discover and your library in this browser. This cannot be undone.`} confirmLabel="Delete submission" busy={working} onClose={() => setTarget(null)} onConfirm={() => void remove()} />}
  </>
}
