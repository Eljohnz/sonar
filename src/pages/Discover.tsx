import { ArrowRight, ArrowUpRight, AudioLines, Disc3, Headphones, Search, Shuffle, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { SongCard } from '../components/SongCard'
import { MusicVisual } from '../components/MusicVisual'
import { useMusic } from '../context/MusicContext'
import type { VisualStyle } from '../types/music'

const filters: Array<{ label: string; value: VisualStyle | 'all' }> = [
  { label: 'All tracks', value: 'all' }, { label: 'Album art', value: 'album' }, { label: 'Equalizer', value: 'equalizer' }, { label: 'Vinyl', value: 'vinyl' }, { label: 'Minimal', value: 'minimal' },
]

export function Discover() {
  const { songs, busy, error } = useMusic()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<VisualStyle | 'all'>('all')
  const published = songs.filter(song => song.status === 'published')
  const featured = published[0]
  const visible = useMemo(() => published.filter(song => (filter === 'all' || song.visual_style === filter) && `${song.title} ${song.artist}`.toLowerCase().includes(search.toLowerCase())), [published, filter, search])
  return <>
    <div className="mb-10 flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="inline-block h-2 w-2 rounded-full bg-lime ambient-dot" /><span className="text-[11px] font-bold uppercase tracking-[0.18em] text-ui-muted">THE COMMUNITY FREQUENCY</span></div><span className="text-[11px] font-semibold tracking-[0.07em] text-ui-muted">INDEPENDENTLY CURATED BY EVERYONE</span></div>
    <section className="hero-banner relative overflow-hidden rounded-[20px] border border-ui-border p-6 md:p-10 lg:p-12">
      <div className="hero-halo" />
      <div className="relative z-10 max-w-[620px]"><span className="inline-flex items-center gap-2 rounded-full border border-ui-border-strong bg-ui-text/5 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ui-text/85"><Sparkles size={13} className="text-lime" /> Your soundtrack, reimagined</span>
        <h1 className="font-display mt-7 text-[clamp(44px,5.2vw,78px)] font-bold leading-[0.98] tracking-[-0.075em]">MUSIC LOOKS<br /><span className="text-lime">DIFFERENT</span> HERE.</h1>
        <p className="mt-6 max-w-[380px] text-sm leading-[1.8] text-ui-text/70">A home for songs worth sharing. Discover new sounds, create your own visual moments, and let the music speak.</p>
        <div className="mt-8 flex flex-wrap items-center gap-3"><Link to="/submit" className="inline-flex items-center gap-2 rounded-full bg-lime px-6 py-3.5 text-xs font-bold text-ui-onprimary transition hover:-translate-y-0.5">Share your sound <ArrowUpRight size={17} /></Link><a href="#discover-songs" className="inline-flex items-center gap-2 rounded-full border border-ui-border-strong px-6 py-3.5 text-xs font-bold text-ui-text transition hover:border-lime/70">Explore tracks <ArrowRight size={16} /></a></div>
      </div>
      <div className="hero-decoration" aria-hidden="true"><div className="hero-decoration-core"><AudioLines size={100} strokeWidth={0.8} /></div></div>
      <span className="absolute bottom-6 right-8 z-10 hidden text-[10px] tracking-[0.22em] text-ui-text/50 md:block">SONAR / VOL. 001</span>
    </section>
    <section className="mt-12"><div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div><div className="eyebrow"><span className="text-lime">01</span> / THE SPOTLIGHT</div><h2 className="section-title">On repeat <span className="text-lime">↗</span></h2></div><p className="max-w-[300px] text-xs leading-6 text-ui-muted">One song. One moment. One unique visual perspective.</p></div>
      {featured ? <div className="featured-card grid overflow-hidden rounded-[16px] border border-ui-border md:grid-cols-[0.95fr_1.05fr]"><div className="min-h-[290px]"><MusicVisual song={featured} large /></div><div className="flex flex-col justify-between p-7 md:p-9"><div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] text-lime"><span className="h-2 w-2 rounded-full bg-lime" /> FEATURED TRACK</div><div className="py-9"><h3 className="font-display text-[clamp(28px,3.7vw,56px)] font-bold uppercase leading-[1.02] tracking-[-0.06em]">{featured.title}</h3><p className="mt-3 text-base text-ui-muted">{featured.artist}</p><p className="mt-5 max-w-[380px] text-sm italic leading-6 text-ui-text/55">“{featured.caption ?? 'Every track tells a story.'}”</p></div><div className="flex items-center justify-between gap-3"><span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ui-muted">{featured.visual_style} / {featured.album || 'Community selection'}</span><Link to={`/song/${featured.id}`} viewTransition className="inline-flex items-center gap-2 rounded-full border border-ui-border/15 px-4 py-2.5 text-xs font-bold transition hover:border-lime hover:text-lime">Explore <ArrowUpRight size={15} /></Link></div></div></div> : <div className="empty-state">No tracks yet. Be the first to add one.</div>}
    </section>
    <section id="discover-songs" className="mt-16 scroll-mt-8"><div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><div className="eyebrow"><span className="text-lime">02</span> / COMMUNITY SELECTS</div><h2 className="section-title">Find your frequency<span className="text-lime">.</span></h2></div><div className="search-control"><Search size={16} className="text-ui-text/50" /><input aria-label="Search tracks" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search songs or artists..." /></div></div>
      <div className="mb-7 flex gap-2 overflow-x-auto pb-2">{filters.map(item => <button key={item.value} onClick={() => setFilter(item.value)} className={`filter-chip ${filter === item.value ? 'filter-chip-active' : ''}`}>{item.label}</button>)}</div>
      {error && <p className="mb-4 rounded-lg border border-red-400/30 bg-red-400/10 p-4 text-xs text-red-200">{error}</p>}
      {busy && !songs.length ? <div className="empty-state">Loading songs...</div> : visible.length ? <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">{visible.map((song, index) => <SongCard key={song.id} song={song} index={index} />)}</div> : <div className="empty-state">No songs found. Try a different search or share something new.</div>}
    </section>
    <section className="my-16 grid gap-4 rounded-[18px] border border-ui-border bg-ui-surface p-6 md:grid-cols-[1fr_auto] md:items-center md:p-9"><div className="flex items-start gap-4"><div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-lime/12 text-lime"><Headphones size={25} /></div><div><h2 className="font-display text-2xl font-bold tracking-[-0.04em]">Your taste deserves a stage.</h2><p className="mt-2 text-sm leading-7 text-ui-muted">Post a Spotify link, choose a visual style and share the soundtrack to your story.</p></div></div><Link to="/submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-lime px-6 py-3.5 text-xs font-bold text-ui-onprimary">Submit a track <Shuffle size={16} /></Link></section>
    <div className="flex justify-center pb-5 text-ui-muted"><Disc3 size={32} /></div>
  </>
}

