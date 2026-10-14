import { useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Link2, LoaderCircle, Maximize2, Music2, Sparkles } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { MusicVisual } from '../components/MusicVisual'
import { VisualizerComparison } from '../components/VisualizerComparison'
import { VisualColorEditor } from '../components/VisualColorEditor'
import { VisualPreviewModal } from '../components/VisualPreviewModal'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import { isDemo } from '../lib/supabase'
import { createVisualColors } from '../lib/visualColors'
import { getSpotifyPreview, parseSpotifyTrackUrl } from '../lib/spotify'
import type { Song, VisualPaletteMap, VisualStyle } from '../types/music'

export function Submit() {
  const { user } = useAuth()
  const { addSong } = useMusic()
  const navigate = useNavigate()
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [album, setAlbum] = useState('')
  const [cover, setCover] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [style, setStyle] = useState<VisualStyle>('album')
  const [previewStyle, setPreviewStyle] = useState<VisualStyle | null>(null)
  const [visualColors, setVisualColors] = useState<VisualPaletteMap>(createVisualColors)
  const [fetching, setFetching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')

  const parsed = parseSpotifyTrackUrl(spotifyUrl)
  const previewSong: Song = { id: 'preview', user_id: null, spotify_url: parsed?.url || null, spotify_id: parsed?.id || null, title: title || 'YOUR SONG TITLE', artist: artist || 'Your artist', album: album || null, cover_url: cover, visual_style: style, visual_colors: visualColors, minimal_colors: style === 'minimal' ? visualColors.minimal : null, caption: caption || null, status: 'published', created_at: new Date().toISOString() }

  const fetchDetails = async () => {
    setNotice(''); setError('')
    if (!parsed) { setError('Paste a Spotify track link (not a playlist, album, or artist URL).'); return }
    setFetching(true)
    try {
      const result = await getSpotifyPreview(parsed.url)
      if (result.title) setTitle(result.title)
      setCover(result.cover)
      setNotice('Spotify preview found! Please verify the song title and fill in the artist.')
    } catch {
      setNotice('We could not automatically load Spotify metadata. You can still fill in the fields manually and submit the valid track URL.')
    } finally { setFetching(false) }
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError('')
    if (!parsed) { setError('A valid Spotify track URL is required.'); return }
    if (!title.trim() || !artist.trim()) { setError('Add the song title and artist.'); return }
    setSaving(true)
    try {
      await addSong({ spotify_url: parsed.url, spotify_id: parsed.id, title: title.trim(), artist: artist.trim(), album: album.trim() || null, cover_url: cover, visual_style: style, visual_colors: visualColors, minimal_colors: style === 'minimal' ? visualColors.minimal : null, caption: caption.trim() || null })
      navigate('/')
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not publish song.') } finally { setSaving(false) }
  }

  if (!isDemo && !user) return <div className="mx-auto max-w-xl py-20 text-center"><Music2 size={46} className="mx-auto text-lime" /><h1 className="section-title mt-6">Sign in to share your music.</h1><p className="mt-4 text-sm leading-7 text-ui-muted">You need an account before posting songs to the community.</p><Link to="/login" className="btn-primary mt-7 inline-flex">Sign in <ArrowRight size={16} /></Link></div>

  return <>
    <Link to="/" className="inline-flex items-center gap-2 text-xs text-ui-text/50 hover:text-ui-text"><ArrowLeft size={15} /> Back to discover</Link>
    <div className="mt-7 mb-9"><div className="eyebrow"><span className="text-lime">CREATE</span> / ADD TO THE FREQUENCY</div><h1 className="font-display mt-2 text-[clamp(36px,5vw,60px)] font-bold tracking-[-0.07em]">SHARE YOUR <span className="text-lime">SOUND.</span></h1><p className="mt-3 text-sm text-ui-muted">Pick the track, choose the vibe, and make it your own.</p></div>
    <form onSubmit={submit} className="grid gap-8 xl:grid-cols-[1fr_350px]"><div className="space-y-7">
      <div className="form-panel"><div className="panel-title"><span>01</span> FIND THE TRACK</div><label className="form-label" htmlFor="spotify">Spotify track link</label><div className="flex flex-col gap-3 sm:flex-row"><div className="form-input-wrap flex-1"><Link2 size={18} className="text-ui-muted" /><input id="spotify" type="url" value={spotifyUrl} onChange={e => { setSpotifyUrl(e.target.value); setCover(null) }} placeholder="https://open.spotify.com/track/..." required /></div><button type="button" disabled={fetching} onClick={() => void fetchDetails()} className="btn-secondary shrink-0">{fetching ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />} Fetch details</button></div><p className="mt-3 text-xs leading-6 text-ui-muted">We use Spotify oEmbed to find the title and cover art. Artist and album may need to be entered manually.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2"><div><label className="form-label" htmlFor="title">Song title <span>*</span></label><input className="form-input" id="title" value={title} onChange={e => setTitle(e.target.value)} required maxLength={160} placeholder="Your favorite song" /></div><div><label className="form-label" htmlFor="artist">Artist <span>*</span></label><input className="form-input" id="artist" value={artist} onChange={e => setArtist(e.target.value)} required maxLength={160} placeholder="Artist name" /></div><div className="sm:col-span-2"><label className="form-label" htmlFor="album">Album <small>(optional)</small></label><input className="form-input" id="album" value={album} onChange={e => setAlbum(e.target.value)} maxLength={160} placeholder="Album name" /></div></div>
      </div>
      <div className="form-panel"><div className="panel-title"><span>02</span> CHOOSE YOUR VISUAL</div>
        <VisualizerComparison song={previewSong} selected={style} onSelect={setStyle} onPreview={setPreviewStyle} />
        <VisualColorEditor key={style} style={style} colors={visualColors[style]} onChange={colors => setVisualColors(current => ({ ...current, [style]: colors }))} />
      </div>
      <div className="form-panel"><div className="panel-title"><span>03</span> MAKE IT PERSONAL</div><label className="form-label" htmlFor="caption">Your caption <small>(optional)</small></label><textarea className="form-input min-h-[110px] resize-y" id="caption" maxLength={280} value={caption} onChange={e => setCaption(e.target.value)} placeholder="What does this song mean to you?" /><div className="mt-2 text-right text-xs text-ui-muted">{caption.length} / 280</div></div>
      {notice && <div className="rounded-xl border border-lime/20 bg-lime/8 p-4 text-xs leading-6 text-ui-muted">{notice}</div>}
      {error && <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-200">{error}</div>}
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="max-w-xs text-xs leading-6 text-ui-muted">{isDemo ? 'Demo submissions save only on your device.' : 'Published songs will be visible to other visitors.'}</p><button disabled={saving} type="submit" className="btn-primary">{saving ? 'Publishing...' : 'Publish song'} <ArrowRight size={17} /></button></div>
    </div>
    <aside><div className="sticky top-8 rounded-[18px] border border-ui-border bg-ui-surface p-5"><div className="mb-5 flex items-center justify-between gap-3"><span className="text-[11px] font-bold uppercase tracking-[0.15em]">Live preview</span><div className="flex items-center gap-2"><span className="flex items-center gap-2 text-[10px] text-lime"><span className="h-2 w-2 rounded-full bg-lime" /> LIVE</span><button type="button" className="visual-preview-trigger" aria-label="Open full-size preview of selected visualizer" title="Expand preview" onClick={() => setPreviewStyle(style)}><Maximize2 size={17} /></button></div></div><MusicVisual song={previewSong} large /><div className="mt-5 font-display text-xl font-bold tracking-[-0.035em] break-words">{previewSong.title}</div><div className="mt-1 text-sm text-ui-muted">{previewSong.artist}</div><div className="mt-5 flex items-center justify-between border-t border-ui-border pt-4 text-[10px] tracking-[0.12em] text-ui-muted"><span>{style.toUpperCase()} VISUAL</span><span>SONAR / PREVIEW</span></div></div></aside>
    </form>
    {previewStyle !== null && <VisualPreviewModal song={previewSong} style={previewStyle} selected={style} onChangeStyle={setPreviewStyle} onSelect={setStyle} onClose={() => setPreviewStyle(null)} />}
  </>
}
