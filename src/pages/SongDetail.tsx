import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, Disc3, Heart, LoaderCircle, Maximize2, Music2, Share2 } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { MusicVisual } from '../components/MusicVisual'
import { SongCard } from '../components/SongCard'
import { VisualPreviewModal } from '../components/VisualPreviewModal'
import { useMusic } from '../context/MusicContext'
import { isDemo } from '../lib/supabase'
import type { VisualStyle } from '../types/music'

const styleNames: Record<VisualStyle, string> = { album: 'Cover art', equalizer: 'Equalizer', vinyl: 'Vinyl', minimal: 'Minimal' }

export function SongDetail() {
  const { id } = useParams()
  const { songs, likedIds, likes, toggleLike, busy, error, refresh } = useMusic()
  const [expanded, setExpanded] = useState(false)
  const [liking, setLiking] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [notice, setNotice] = useState('')
  const [actionError, setActionError] = useState('')
  const song = songs.find(item => item.id === id)

  useEffect(() => {
    const previousTitle = document.title
    document.title = song ? `${song.title} — ${song.artist} | SONAR` : 'Song details | SONAR'
    return () => { document.title = previousTitle }
  }, [song?.title, song?.artist])

  if (!song) return <section className="song-empty-state" aria-live="polite">
    {busy ? <LoaderCircle size={32} className="animate-spin text-lime" /> : <Disc3 size={40} className="text-lime" />}
    <h1 className="section-title">{busy ? 'Finding your frequency…' : error ? 'This track could not load.' : 'This track is out of range.'}</h1>
    <p>{busy ? 'Loading the song and its visual.' : error ? 'Try loading the songs again.' : 'It may have been removed, or the link belongs to a song saved in another browser.'}</p>
    <div className="flex flex-wrap justify-center gap-3">
      {error && <button className="btn-secondary" onClick={() => void refresh()}>Try again</button>}
      <Link to="/" viewTransition className="btn-primary">Explore songs <ArrowRight size={16} /></Link>
    </div>
  </section>

  const liked = likedIds.includes(song.id)
  const likeCount = (likes[song.id] ?? 0) + (liked && song.user_id === null ? 1 : 0)
  const sharedDate = new Date(song.created_at)
  const dateLabel = Number.isNaN(sharedDate.getTime()) ? null : sharedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  const moreSongs = songs.filter(item => item.id !== song.id && item.status === 'published').slice(0, 3)

  const likeSong = async () => {
    setLiking(true); setActionError(''); setNotice('')
    try {
      await toggleLike(song.id)
      setNotice(liked ? 'Removed from your library.' : 'Added to your library.')
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not update your like. Please try again.')
    } finally { setLiking(false) }
  }

  const shareSong = async () => {
    setActionError(''); setNotice('')
    // Local submissions have no public SONAR page on another person's device.
    const url = isDemo ? song.spotify_url : window.location.href
    if (!url) { setNotice('This fictional demo track has no public link to share.'); return }
    setSharing(true)
    try {
      await navigator.clipboard.writeText(url)
      setNotice(isDemo ? 'Spotify link copied. Your SONAR design is saved in this browser.' : 'Song link copied. Ready to share.')
    } catch {
      setActionError('Could not copy the link. You can use the Spotify button or copy the page address.')
    } finally { setSharing(false) }
  }

  return <>
    <div className="song-detail-topline">
      <Link to="/" viewTransition className="song-back-link"><ArrowLeft size={15} /> Back to Discover</Link>
      <span className="eyebrow">SONAR / TRACK NOTES</span>
    </div>
    <section className="song-detail-hero" aria-labelledby="song-title">
      <div className="song-art-panel">
        <div className="song-art-stage"><MusicVisual song={song} large />
          <button type="button" className="song-expand-button" onClick={() => setExpanded(true)} aria-label="Expand song visual" aria-haspopup="dialog"><Maximize2 size={17} /> <span>View full size</span></button>
        </div>
        <div className="song-art-label"><span><Disc3 size={14} /> {styleNames[song.visual_style]} visual</span><span>SONAR RECORDS</span></div>
      </div>
      <div className="song-track-notes">
        <div className="eyebrow"><span className="text-lime">THE TRACK</span> / {song.status === 'hidden' ? 'HIDDEN' : 'COMMUNITY SELECT'}</div>
        <h1 id="song-title" className="song-detail-title">{song.title}</h1>
        <p className="song-detail-artist">{song.artist}</p>
        <dl className="song-metadata">
          {song.album && <div><dt>Album</dt><dd>{song.album}</dd></div>}
          <div><dt>Visual style</dt><dd>{styleNames[song.visual_style]}</dd></div>
          {dateLabel && <div><dt>Shared</dt><dd><time dateTime={song.created_at}>{dateLabel}</time></dd></div>}
        </dl>
        {song.caption && <div className="song-caption"><p className="eyebrow">WHY THIS TRACK</p><blockquote>“{song.caption}”</blockquote></div>}
        <div className="song-detail-actions">
          {song.spotify_url && <a className="btn-primary" target="_blank" rel="noopener noreferrer" href={song.spotify_url}>Listen on Spotify <ArrowUpRight size={17} /></a>}
          <button type="button" disabled={liking} aria-pressed={liked} onClick={() => void likeSong()} className={`btn-secondary ${liked ? 'song-liked' : ''}`}>
            {liking ? <LoaderCircle size={17} className="animate-spin" /> : <Heart size={17} fill={liked ? 'currentColor' : 'none'} />}
            {liked ? 'Liked' : 'Like'} <span className="song-like-count">{likeCount}</span>
          </button>
          <button type="button" disabled={sharing} className="btn-secondary" onClick={() => void shareSong()}><Share2 size={16} /> {isDemo && song.spotify_url ? 'Share Spotify link' : 'Share'}</button>
        </div>
        <div className="song-action-feedback">
          <p role="status">{notice && <><Check size={14} /> {notice}</>}</p>
          {actionError && <p role="alert" className="song-action-error">{actionError}</p>}
        </div>
        <p className="text-xs leading-6 text-ui-muted">{isDemo ? 'Likes stay in your library on this browser.' : 'Like this track to save it to your library.'}</p>
      </div>
    </section>
    <section className="song-player-panel" aria-labelledby="song-player-title">
      <div className="song-player-heading"><div><p className="eyebrow"><span className="text-lime">PRESS PLAY</span> / LISTEN A LITTLE CLOSER</p><h2 id="song-player-title" className="font-display mt-1 text-2xl font-bold tracking-[-0.04em]">The sound behind the visual.</h2></div><Music2 size={24} className="text-lime shrink-0" /></div>
      {song.spotify_id ? <iframe className="h-[152px] w-full rounded-xl" loading="lazy" title={`Spotify player for ${song.title}`} src={`https://open.spotify.com/embed/track/${song.spotify_id}`} allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" /> : <div className="song-player-placeholder"><Disc3 size={30} className="text-lime shrink-0" /><div><p className="font-semibold text-ui-text">A visual demo, waiting for a real track.</p><p>This fictional song has no audio. Share a Spotify track to bring its player here.</p><Link to="/submit" className="mt-3 inline-flex items-center gap-2 text-lime font-bold">Share your sound <ArrowRight size={14} /></Link></div></div>}
      {song.spotify_id && <p className="mt-4 text-xs leading-6 text-ui-muted">Playback is provided by Spotify. Availability depends on Spotify and your account.</p>}
    </section>
    {moreSongs.length > 0 && <section className="my-12" aria-labelledby="more-tracks-title"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow"><span className="text-lime">KEEP EXPLORING</span> / COMMUNITY SELECTS</div><h2 id="more-tracks-title" className="section-title">Stay on the frequency<span className="text-lime">.</span></h2></div><Link to="/" viewTransition className="song-back-link">All tracks <ArrowRight size={16} /></Link></div><div className="grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">{moreSongs.map((item, index) => <SongCard key={item.id} song={item} index={index} />)}</div></section>}
    {expanded && <VisualPreviewModal song={song} style={song.visual_style} mode="view" onClose={() => setExpanded(false)} />}
  </>
}
