import { Heart, Music2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SongCard } from '../components/SongCard'
import { useMusic } from '../context/MusicContext'

export function Library() {
  const { songs, likedIds } = useMusic()
  const saved = songs.filter(song => likedIds.includes(song.id) && song.status === 'published')
  return <><div className="eyebrow"><span className="text-lime">YOUR SPACE</span> / LIBRARY</div><h1 className="font-display mt-3 text-5xl font-bold tracking-[-0.07em]">YOUR LIBRARY<span className="text-lime">.</span></h1><p className="mt-3 text-sm text-ui-muted">Your liked sounds, all in one place.</p>{saved.length ? <div className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-2 xl:grid-cols-3">{saved.map((song, index) => <SongCard key={song.id} song={song} index={index} />)}</div> : <div className="empty-state mt-10"><Heart size={30} className="mx-auto mb-4 text-lime" />No liked songs yet. <Link to="/" className="text-lime">Explore songs</Link> to start your collection.</div>}<div className="mt-10 flex items-center gap-2 text-xs text-ui-muted"><Music2 size={15} /> New features such as custom playlists and user collections can come in V2.</div></>
}
