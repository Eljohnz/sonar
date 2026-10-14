import { useEffect, useState } from 'react'
import { ArrowUpRight, Disc3, Heart, LayoutDashboard, Shield, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useMusic } from '../context/MusicContext'
import { isDemo, supabase } from '../lib/supabase'
import type { SongStatus } from '../types/music'

export function Admin() {
  const { user, profile, loading } = useAuth()
  const { songs, likes, setStatus } = useMusic()
  const [error, setError] = useState('')
  const [working, setWorking] = useState('')
  const [members, setMembers] = useState<Array<{ id: string; username: string; display_name: string | null; role: string }>>([])
  const [memberCount, setMemberCount] = useState<number | null>(null)
  useEffect(() => {
    if (!supabase || profile?.role !== 'admin') return
    let active = true
    void Promise.all([
      supabase.from('profiles').select('id,username,display_name,role').order('created_at', { ascending: false }).limit(50),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
    ]).then(([people, total]) => {
      if (active) { setMembers(people.data ?? []); setMemberCount(total.count) }
    })
    return () => { active = false }
  }, [profile?.role])
  if (!isDemo && loading) return <div className="empty-state">Loading account...</div>
  if (!isDemo && (!user || profile?.role !== 'admin')) return <div className="mx-auto max-w-lg py-20 text-center"><Shield size={45} className="mx-auto text-lime" /><h1 className="section-title mt-6">Admin access only.</h1><p className="mt-4 text-sm text-ui-muted">Only accounts granted the admin role in Supabase can see this page.</p><Link className="btn-primary mt-7 inline-flex" to="/">Back to discover</Link></div>
  const changeStatus = async (id: string, status: SongStatus) => {
    setError(''); setWorking(id)
    try { await setStatus(id, status) } catch (err) { setError(err instanceof Error ? err.message : 'Could not update song.') } finally { setWorking('') }
  }
  return <><div className="eyebrow"><span className="text-lime">MANAGEMENT</span> / CONTROL ROOM</div><h1 className="font-display mt-3 text-[clamp(38px,5vw,60px)] font-bold tracking-[-0.065em]">THE CONTROL ROOM<span className="text-lime">.</span></h1><p className="mt-3 text-sm text-ui-muted">Platform insights and moderation, all in one place.</p>{isDemo && <div className="mt-6 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-xs leading-6 text-amber-200"><strong>Read-only admin preview.</strong> Real role-based admin access, shared data, and moderation actions require a connected Supabase project and an admin role.</div>}
    <div className="mt-9 grid gap-4 sm:grid-cols-3"><div className="stat-box"><Disc3 className="text-lime" size={21} /><p className="mt-6 text-3xl font-bold">{songs.length}</p><p className="mt-1 text-xs text-ui-muted">Total submissions</p></div><div className="stat-box"><Heart className="text-lime" size={21} /><p className="mt-6 text-3xl font-bold">{Object.values(likes).reduce((a, b) => a + b, 0)}</p><p className="mt-1 text-xs text-ui-muted">Likes (loaded)</p></div><div className="stat-box"><Users className="text-lime" size={21} /><p className="mt-6 text-3xl font-bold">{memberCount ?? '—'}</p><p className="mt-1 text-xs text-ui-muted">Registered users</p></div></div>
    <div className="mt-12 flex items-center gap-3"><LayoutDashboard className="text-lime" size={20} /><h2 className="section-title !mt-0">Song management</h2></div>{error && <p role="alert" className="mt-4 text-xs text-red-300">{error}</p>}
    <div className="mt-5 overflow-x-auto rounded-xl border border-ui-border"><table className="w-full min-w-[620px] border-collapse text-left text-xs"><thead className="bg-ui-input text-[10px] uppercase tracking-[0.12em] text-ui-muted"><tr><th className="p-5">Song</th><th className="p-5">Style</th><th className="p-5">Status</th><th className="p-5">Actions</th></tr></thead><tbody>{songs.map(song => <tr key={song.id} className="border-t border-ui-border"><td className="p-5"><span className="block font-bold text-ui-text">{song.title}</span><span className="mt-1 block text-ui-muted">{song.artist}</span></td><td className="p-5 capitalize text-ui-muted">{song.visual_style}</td><td className="p-5"><span className={`rounded-full px-3 py-1.5 ${song.status === 'published' ? 'bg-lime/10 text-lime' : 'bg-orange-300/10 text-orange-200'}`}>{song.status}</span></td><td className="p-5"><div className="flex items-center gap-4"><Link to={`/song/${song.id}`} title="View song" className="text-ui-muted"><ArrowUpRight size={17} /></Link><button disabled={isDemo || working === song.id} className="font-bold text-lime disabled:opacity-30" onClick={() => void changeStatus(song.id, song.status === 'published' ? 'hidden' : 'published')}>{song.status === 'published' ? 'Hide' : 'Restore'}</button></div></td></tr>)}</tbody></table></div><div className="mt-12 flex items-center gap-3"><Users className="text-lime" size={20} /><h2 className="section-title !mt-0">Community members</h2></div>
    {isDemo ? <div className="empty-state mt-5">Member data will load here after you connect Supabase and register real accounts.</div> : <div className="mt-5 overflow-x-auto rounded-xl border border-ui-border"><table className="w-full min-w-[450px] text-left text-xs"><thead className="bg-ui-input text-[10px] uppercase tracking-[0.12em] text-ui-muted"><tr><th className="p-5">Username</th><th className="p-5">Display name</th><th className="p-5">Role</th></tr></thead><tbody>{members.map(member => <tr key={member.id} className="border-t border-ui-border"><td className="p-5 font-semibold">@{member.username}</td><td className="p-5 text-ui-muted">{member.display_name || '—'}</td><td className="p-5 uppercase tracking-wider text-lime">{member.role}</td></tr>)}</tbody></table></div>}
    <p className="mt-4 text-xs leading-6 text-ui-muted">Members are read-only in this starter. Assign admin roles in the Supabase SQL Editor. Later: add reporting, audit logs, and moderation filters.</p>
  </>
}
