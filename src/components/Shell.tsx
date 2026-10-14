import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Disc3, Headphones, Home, LayoutDashboard, LogIn, LogOut, Menu, Music2, Plus, Radio, Palette, UserCircle2, Waves, X } from 'lucide-react'
import { Link, NavLink, Outlet, ScrollRestoration, useLocation, useNavigate, useNavigationType } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { isDemo } from '../lib/supabase'

function NavItem({ to, icon: Icon, children }: { to: string; icon: typeof Home; children: ReactNode }) {
  return <NavLink to={to} end={to === '/'} className={({ isActive }) => `side-link ${isActive ? 'side-link-active' : ''}`}><Icon size={17} strokeWidth={1.8} />{children}</NavLink>
}

export function Shell() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigationType = useNavigationType()
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    if (navigationType !== 'POP') mainRef.current?.focus({ preventScroll: true })
  }, [location.key, navigationType])
  return <div className="app-shell">
    <aside className="sidebar">
      <Link to="/" className="font-display logo"><Waves size={28} strokeWidth={3} /><span>SONAR<span className="text-lime">.</span></span></Link>
      <div className="mt-14"><p className="side-kicker">EXPLORE</p><nav className="mt-4 grid gap-1"><NavItem to="/" icon={Home}>Discover</NavItem><NavItem to="/submit" icon={Music2}>Submit a song</NavItem><NavItem to="/library" icon={Headphones}>Your library</NavItem></nav></div>
      <div className="mt-10"><p className="side-kicker">YOUR SPACE</p><nav className="mt-4 grid gap-1"><NavItem to="/account" icon={UserCircle2}>My account</NavItem><NavItem to="/theme" icon={Palette}>Theme Studio</NavItem>{(isDemo || profile?.role === 'admin') && <NavItem to="/admin" icon={LayoutDashboard}>Admin {isDemo ? 'preview' : ''}</NavItem>}</nav></div>
      <div className="mt-auto"><div className="sidebar-promo"><div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-lime/15 text-lime"><Radio size={21} /></div><p className="font-display text-xl font-bold leading-tight">Your music.<br />Your perspective.</p><p className="mt-3 text-[12px] leading-relaxed text-ui-text/50">Give the tracks you love a visual identity.</p><Link to="/submit" className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-lime px-4 py-3 text-xs font-bold text-ui-onprimary">Share a track <Plus size={15} /></Link></div>
        <div className="mt-6 flex items-center gap-3 border-t border-ui-border pt-5"><span className="grid h-9 w-9 place-items-center rounded-full bg-ui-text/10"><Disc3 size={19} /></span><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.email ?? 'Guest listener'}</p><p className="mt-1 text-[11px] text-ui-muted">{isDemo ? 'Demo mode' : user ? 'Signed in' : 'Not signed in'}</p></div>{user ? <button title="Sign out" aria-label="Sign out" onClick={() => void signOut().then(() => navigate('/'))}><LogOut size={18} /></button> : <Link to="/login" title="Sign in"><LogIn size={18} /></Link>}</div>
      </div>
    </aside>
    <div className="app-main">
      <header className="topbar"><div className="flex items-center gap-3"><button className="mobile-toggle" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-site-menu" onClick={() => setMobileOpen(open => !open)}>{mobileOpen ? <X size={21} /> : <Menu size={21} />}</button><Link to="/" className="mobile-logo font-display" onClick={() => setMobileOpen(false)}><Waves size={23} /> SONAR.</Link></div><div className="hidden text-xs font-medium tracking-[0.12em] text-ui-muted sm:block">A DIFFERENT WAY TO FEEL MUSIC</div><div className="flex items-center gap-3"><Link to="/theme" title="Customize site theme" aria-label="Customize site theme" className="top-theme-trigger"><Palette size={18} /></Link><Link to="/submit" className="top-submit"><Plus size={16} /> <span>ADD A SONG</span></Link>{user ? <Link to="/account" className="top-avatar" aria-label="Your account">{(profile?.username || user.email || 'U')[0].toUpperCase()}</Link> : <Link to="/login" className="text-xs font-semibold text-ui-text/70 hover:text-ui-text">Sign in</Link>}</div></header>
      {mobileOpen && <nav id="mobile-site-menu" className="mobile-nav" aria-label="Mobile navigation"><Link onClick={() => setMobileOpen(false)} to="/">Discover</Link><Link onClick={() => setMobileOpen(false)} to="/submit">Submit a song</Link><Link onClick={() => setMobileOpen(false)} to="/library">Your library</Link><Link onClick={() => setMobileOpen(false)} to="/account">My account</Link><Link onClick={() => setMobileOpen(false)} to="/theme">Theme Studio</Link>{(isDemo || profile?.role === 'admin') && <Link onClick={() => setMobileOpen(false)} to="/admin">Admin {isDemo ? 'preview' : ''}</Link>}</nav>}
      {isDemo && <div className="demo-banner">DEMO MODE <span>•</span> Your songs and likes save only in this browser. Connect Supabase for real accounts and shared content.</div>}
      <main ref={mainRef} tabIndex={-1} className="main-content"><div key={location.pathname} className="route-content"><Outlet /></div></main>
      <ScrollRestoration />
      <footer className="flex flex-wrap justify-between gap-2 border-t border-ui-border px-6 py-6 text-[11px] text-ui-muted md:px-10"><span>© 2026 SONAR — MADE FOR MUSIC LOVERS.</span><span>DEMO CONTENT IS FICTIONAL · MUSIC PLAYBACK BY SPOTIFY</span></footer>
    </div>
  </div>
}
