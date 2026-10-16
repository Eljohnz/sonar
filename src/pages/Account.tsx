import { ArrowRight, Music2, UserCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import { isDemo } from '../lib/supabase'
import { LocalSubmissions } from './LocalSubmissions'

export function Account() {
  const { user, profile } = useAuth()
  const { songs } = useMusic()
  const mine = songs.filter(song => song.user_id === user?.id && !!user)
  if (isDemo) return <LocalSubmissions />
  if (!user) return <div className="mx-auto max-w-lg py-16 text-center"><UserCircle2 size={42} className="mx-auto text-lime" /><h1 className="section-title mt-6">Your own space awaits.</h1><p className="mt-3 text-sm text-ui-muted">{isDemo ? 'Profiles appear here after Supabase is connected.' : 'Sign in to see your profile and submissions.'}</p><Link to="/login" className="btn-primary mt-7 inline-flex">Sign in <ArrowRight size={16} /></Link></div>
  return <><div className="eyebrow"><span className="text-lime">PROFILE</span> / YOUR SPACE</div><div className="mt-9 flex flex-wrap items-center gap-5"><div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-ui-surface to-lime/40 font-display text-4xl font-bold">{(profile?.username || user.email || 'U')[0].toUpperCase()}</div><div><h1 className="font-display text-4xl font-bold tracking-[-0.06em]">{profile?.display_name || profile?.username || 'Music lover'}</h1><p className="mt-2 text-sm text-ui-muted">{user.email}</p><p className="mt-2 text-xs uppercase tracking-widest text-lime">{profile?.role || 'user'} account</p></div></div><div className="mt-10 rounded-2xl border border-ui-border bg-ui-surface p-7"><div className="flex items-center justify-between"><div><p className="text-3xl font-bold">{mine.length}</p><p className="mt-1 text-xs text-ui-muted">Your submissions</p></div><Music2 className="text-lime" size={28} /></div></div><h2 className="section-title mt-12">Your songs</h2>{mine.length ? <div className="mt-5 space-y-3">{mine.map(song => <Link key={song.id} to={`/song/${song.id}`} className="flex justify-between gap-3 rounded-xl border border-ui-border bg-ui-text/5 p-5 text-sm hover:border-lime/30"><span>{song.title} <span className="text-ui-muted">— {song.artist}</span></span><span className="text-lime">{song.status}</span></Link>)}</div> : <div className="empty-state mt-5">You haven't posted a song. <Link className="text-lime" to="/submit">Submit your first track</Link>.</div>}</>
}
