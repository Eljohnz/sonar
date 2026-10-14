import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { demoSongs } from '../data/demo'
import { isDemo, supabase } from '../lib/supabase'
import type { Song, SongInput, SongStatus } from '../types/music'
import { useAuth } from './AuthContext'

type MusicContextValue = {
  songs: Song[]
  likedIds: string[]
  likes: Record<string, number>
  busy: boolean
  error: string | null
  addSong: (input: SongInput) => Promise<void>
  toggleLike: (songId: string) => Promise<void>
  setStatus: (songId: string, status: SongStatus) => Promise<void>
  refresh: () => Promise<void>
}

function initialDemoSongs(): Song[] {
  try {
    const saved = JSON.parse(localStorage.getItem('sonar_songs') || '[]') as Song[]
    return [...saved, ...demoSongs]
  } catch { return demoSongs }
}
function initialLikes(): string[] {
  try { return JSON.parse(localStorage.getItem('sonar_likes') || '[]') as string[] } catch { return [] }
}
const MusicContext = createContext<MusicContextValue | null>(null)

export function MusicProvider({ children }: { children: ReactNode }) {
  const { user, profile } = useAuth()
  const [songs, setSongs] = useState<Song[]>(isDemo ? initialDemoSongs : [])
  const [likes, setLikes] = useState<Record<string, number>>({})
  const [likedIds, setLikedIds] = useState<string[]>(isDemo ? initialLikes : [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!supabase) return
    setBusy(true)
    setError(null)
    const { data, error: queryError } = await supabase.from('songs').select('*').order('created_at', { ascending: false }).limit(100)
    if (queryError) setError(queryError.message)
    else setSongs((data ?? []) as Song[])
    if (data) setLikes(Object.fromEntries(data.map(song => [song.id, song.likes_count ?? 0])))
    if (user) {
      const { data: ownLikes } = await supabase.from('song_likes').select('song_id').eq('user_id', user.id)
      setLikedIds((ownLikes ?? []).map(row => row.song_id))
    } else setLikedIds([])
    setBusy(false)
  }, [user?.id])

  useEffect(() => { void refresh() }, [refresh])
  useEffect(() => {
    if (isDemo) localStorage.setItem('sonar_likes', JSON.stringify(likedIds))
  }, [likedIds])

  const addSong = async (input: SongInput) => {
    if (!supabase) {
      const newSong: Song = { ...input, id: crypto.randomUUID(), user_id: null, status: 'published', created_at: new Date().toISOString() }
      setSongs(current => {
        const all = [newSong, ...current]
        localStorage.setItem('sonar_songs', JSON.stringify(all.filter(song => !song.id.startsWith('demo-'))))
        return all
      })
      return
    }
    if (!user) throw new Error('Please sign in before submitting a song.')
    const { error: insertError } = await supabase.from('songs').insert({ ...input, user_id: user.id, status: 'published' })
    if (insertError) throw insertError
    await refresh()
  }

  const toggleLike = async (songId: string) => {
    const alreadyLiked = likedIds.includes(songId)
    if (!supabase) {
      setLikedIds(current => alreadyLiked ? current.filter(id => id !== songId) : [...current, songId])
      return
    }
    if (!user) throw new Error('Sign in to like songs.')
    const result = alreadyLiked
      ? await supabase.from('song_likes').delete().eq('song_id', songId).eq('user_id', user.id)
      : await supabase.from('song_likes').insert({ song_id: songId, user_id: user.id })
    if (result.error) throw result.error
    setLikedIds(current => alreadyLiked ? current.filter(id => id !== songId) : [...current, songId])
    setLikes(current => ({ ...current, [songId]: Math.max(0, (current[songId] ?? 0) + (alreadyLiked ? -1 : 1)) }))
  }

  const setStatus = async (songId: string, status: SongStatus) => {
    if (!supabase) throw new Error('Admin changes are disabled in demo preview.')
    if (profile?.role !== 'admin') throw new Error('Admin access required.')
    const { error: updateError } = await supabase.from('songs').update({ status }).eq('id', songId)
    if (updateError) throw updateError
    await refresh()
  }

  return <MusicContext.Provider value={{ songs, likes, likedIds, busy, error, addSong, toggleLike, setStatus, refresh }}>{children}</MusicContext.Provider>
}

export function useMusic() {
  const context = useContext(MusicContext)
  if (!context) throw new Error('useMusic must be used inside MusicProvider')
  return context
}
