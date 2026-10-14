import { useState, type FormEvent } from 'react'
import { ArrowRight, Disc3 } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isDemo } from '../lib/supabase'

export function Auth({ mode }: { mode: 'login' | 'register' }) {
  const { user, signIn, signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  if (user) return <Navigate to="/account" replace />

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setError(''); setMessage('')
    if (isDemo) { setError('Add your Supabase credentials to .env.local and run the SQL schema first. This preview does not fake user accounts.'); return }
    setBusy(true)
    try {
      if (mode === 'register') setMessage(await signUp(email, password, username))
      else { await signIn(email, password); navigate('/account') }
    } catch (err) { setError(err instanceof Error ? err.message : 'Authentication failed.') } finally { setBusy(false) }
  }

  return <div className="mx-auto max-w-md py-8 md:py-14"><div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime/10 text-lime"><Disc3 size={30} /></div><div className="mt-7 text-center"><div className="eyebrow">{mode === 'login' ? 'WELCOME BACK' : 'JOIN THE COMMUNITY'}</div><h1 className="font-display mt-3 text-4xl font-bold tracking-[-0.06em]">{mode === 'login' ? 'FIND YOUR RHYTHM.' : 'MAKE SOME NOISE.'}</h1><p className="mt-3 text-sm text-ui-muted">{mode === 'login' ? 'Sign in to keep sharing what moves you.' : 'Create your space in the music community.'}</p></div>
    <form onSubmit={submit} className="mt-9 space-y-5 rounded-2xl border border-ui-border bg-ui-surface p-7">{mode === 'register' && <div><label className="form-label" htmlFor="username">Username</label><input className="form-input" id="username" minLength={3} maxLength={25} pattern="[A-Za-z0-9_]+" title="Letters, numbers, and underscores only" required value={username} onChange={e => setUsername(e.target.value)} placeholder="yourname" /></div>}<div><label className="form-label" htmlFor="email">Email</label><input className="form-input" id="email" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div><div><label className="form-label" htmlFor="password">Password</label><input className="form-input" id="password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" /></div>
      {error && <p role="alert" className="text-xs leading-6 text-red-300">{error}</p>}{message && <p role="status" className="text-xs leading-6 text-lime">{message}</p>}
      <button disabled={busy} type="submit" className="btn-primary w-full">{busy ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button><p className="text-center text-xs text-ui-muted">{mode === 'login' ? 'New to SONAR?' : 'Already have an account?'} <Link className="font-semibold text-lime" to={mode === 'login' ? '/register' : '/login'}>{mode === 'login' ? 'Create an account' : 'Sign in'}</Link></p>
    </form>{isDemo && <p className="mt-5 text-center text-xs leading-6 text-ui-muted">Accounts are disabled in preview mode until Supabase is connected. You can still test discovery and local song submissions.</p>}</div>
}
