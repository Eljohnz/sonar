import { ArrowUpRight, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Song } from '../types/music'
import { useMusic } from '../context/MusicContext'
import { MusicVisual } from './MusicVisual'

export function SongCard({ song, index }: { song: Song; index: number }) {
  const { likedIds, likes, toggleLike } = useMusic()
  const liked = likedIds.includes(song.id)
  return <article className="song-card group min-w-0">
    <Link to={`/song/${song.id}`} viewTransition aria-label={`Open ${song.title}`} className="block relative">
      <MusicVisual song={song} />
      <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/40 opacity-0 backdrop-blur-sm transition group-hover:opacity-100 group-focus-within:opacity-100"><ArrowUpRight size={17} /></span>
    </Link>
    <div className="flex items-start justify-between gap-3 pt-4">
      <div className="min-w-0"><div className="text-[10px] font-bold tracking-[0.14em] text-ui-muted">NO. {String(index + 1).padStart(2, '0')} <span className="mx-2 opacity-40">/</span> {song.visual_style.toUpperCase()}</div><Link to={`/song/${song.id}`} viewTransition className="font-display mt-2 block truncate text-[18px] font-semibold tracking-[-0.035em] hover:text-lime">{song.title}</Link><p className="mt-1 truncate text-sm text-ui-muted">{song.artist}</p></div>
      <button className={`heart-button ${liked ? 'text-ui-muted' : 'text-ui-muted'}`} onClick={() => void toggleLike(song.id).catch(err => alert(err.message))} aria-label={liked ? 'Unlike song' : 'Like song'}><Heart size={19} fill={liked ? 'currentColor' : 'none'} /><span className="text-[10px]">{(likes[song.id] ?? 0) + (liked && song.user_id === null ? 1 : 0)}</span></button>
    </div>
  </article>
}
