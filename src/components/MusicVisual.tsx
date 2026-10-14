import type { CSSProperties } from 'react'
import type { Song } from '../types/music'
import { getVisualColors } from '../lib/visualColors'

export function EqualizerBars({ count = 23 }: { count?: number }) {
  return <div className="eq-bars" aria-hidden="true">
    {Array.from({ length: count }, (_, i) => <span key={i} style={{ animationDelay: `-${(i * 0.17).toFixed(2)}s`, height: `${18 + (i * 37) % 78}%` }} />)}
  </div>
}

export function MusicVisual({ song, large = false, compact = false }: { song: Song; large?: boolean; compact?: boolean }) {
  const visualClass = `visual ${compact ? 'visual-compact' : ''}`
  if (song.visual_style === 'equalizer') {
    const colors = getVisualColors('equalizer', song.visual_colors)
    const customProperties = { '--visual-bars': colors.bars, '--visual-grid': colors.grid } as CSSProperties
    return <div className={`${visualClass} relative flex flex-col justify-end overflow-hidden ${large ? 'min-h-[330px]' : ''}`} style={{ ...customProperties, backgroundColor: colors.background, color: colors.text }}>
      <div className="visual-grid" />
      <span className={`absolute font-bold tracking-[0.2em] ${compact ? 'left-3 top-3 text-[7px]' : 'left-5 top-5 text-[10px]'}`} style={{ color: colors.grid }}>SONAR / LIVE VISUAL</span>
      <div className={compact ? "absolute inset-x-3 top-[24%] bottom-[22%]" : "absolute inset-x-6 top-[22%] bottom-[20%]"}><EqualizerBars count={compact ? 12 : large ? 36 : 22} /></div>
      <span className={`relative z-10 font-bold uppercase tracking-[0.15em] break-words line-clamp-2 ${compact ? 'px-3 pb-3 text-[9px]' : 'px-5 pb-5 text-xs'}`}>{song.title}</span>
    </div>
  }
  if (song.visual_style === 'vinyl') {
    const colors = getVisualColors('vinyl', song.visual_colors)
    const customProperties = { '--vinyl-record': colors.record, '--vinyl-accent': colors.accent } as CSSProperties
    return <div className={`${visualClass} relative grid place-items-center overflow-hidden ${large ? 'min-h-[330px]' : ''}`} style={{ ...customProperties, color: colors.text, background: `radial-gradient(circle at 30% 20%, ${colors.accent}77, transparent 60%), linear-gradient(145deg, ${colors.background}, color-mix(in srgb, ${colors.background} 55%, #090A10))` }}>
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `repeating-linear-gradient(45deg, transparent 0px, transparent 16px, ${colors.accent} 17px, transparent 18px)` }} />
      <div className="vinyl-record"><div className="vinyl-label" style={song.cover_url ? { backgroundImage: `url("${song.cover_url}")`, backgroundSize: 'cover' } : undefined}><span>{!song.cover_url && 'S'}</span></div></div>
      <div className="absolute right-[11%] top-[14%] h-[46%] w-[9px] origin-top rotate-[-27deg] rounded-full shadow-xl" style={{ backgroundColor: colors.accent }} />
      <span className={`absolute font-bold uppercase tracking-[0.2em] ${compact ? 'bottom-3 left-3 text-[7px]' : 'bottom-5 left-5 text-[10px]'}`}>33⅓ RPM / SIDE A</span>
    </div>
  }
  if (song.visual_style === 'minimal') {
    const colors = getVisualColors('minimal', song.visual_colors, song.minimal_colors)
    return <div className={`${visualClass} relative flex flex-col justify-between overflow-hidden transition-colors duration-200 ${compact ? 'p-3' : 'p-6'} ${large ? 'min-h-[330px]' : ''}`} style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className={`flex justify-between font-bold tracking-[0.15em] ${compact ? 'text-[6px]' : 'text-[10px]'}`}><span>SONAR®</span><span>STEREO / 001</span></div>
      <div>
        <div className={`${compact ? 'mb-2 w-7' : 'mb-3 w-12'} h-[3px]`} style={{ backgroundColor: colors.accent }} />
        <div className={`font-display font-bold uppercase leading-[0.98] tracking-[-0.07em] break-words line-clamp-3 ${compact ? 'text-[clamp(13px,1.45vw,21px)]' : 'text-[clamp(24px,3vw,42px)]'}`}>{song.title}</div>
        <p className={`font-semibold uppercase tracking-[0.12em] break-words line-clamp-2 ${compact ? 'mt-2 text-[7px]' : 'mt-3 text-xs'}`}>{song.artist}</p>
      </div>
      <div className={`flex justify-between border-t font-semibold tracking-wider ${compact ? 'pt-2 text-[6px]' : 'pt-3 text-[10px]'}`} style={{ borderColor: `${colors.text}4D` }}><span>AN AUDIO EXPERIENCE</span><span style={{ color: colors.accent }}>↗</span></div>
    </div>
  }
  const colors = getVisualColors('album', song.visual_colors)
  return <div className={`${visualClass} relative isolate flex flex-col justify-between overflow-hidden ${large ? 'min-h-[330px]' : ''}`} style={{ color: colors.text, background: `radial-gradient(circle at 75% 20%, ${colors.accent}88, transparent 58%), linear-gradient(145deg, ${colors.background}, ${colors.accent})` }}>
    {song.cover_url && <img className="absolute inset-0 -z-10 h-full w-full object-cover" src={song.cover_url} alt={`${song.title} cover art`} loading="lazy" />}
    {song.cover_url && <div className="absolute inset-0 -z-10" style={{ background: `linear-gradient(to top, ${colors.background}F5 0%, ${colors.background}B8 30%, ${colors.background}33 65%, transparent 100%)` }} />}
    {!song.cover_url && <><span className="absolute -right-12 top-6 rotate-[32deg] text-[200px] leading-none font-bold opacity-20" style={{ color: colors.accent }}>✳</span><div className="album-orbit" style={{ '--album-orbit': colors.accent } as CSSProperties} /></>}
    <div className={`${compact ? 'p-3 text-[7px]' : 'p-5 text-[10px]'} font-bold tracking-[0.22em]`}>SONAR RECORDS</div>
    <div className={compact ? "p-3" : "p-5"}><div className="mb-2 h-px w-12" style={{ backgroundColor: colors.accent }} /><div className={`font-display max-w-[95%] font-bold leading-none tracking-[-0.06em] uppercase break-words line-clamp-3 ${compact ? 'text-[clamp(12px,1.35vw,19px)]' : 'text-[clamp(21px,2.8vw,34px)]'}`}>{song.title}</div><p className={`${compact ? 'mt-1 text-[7px]' : 'mt-2 text-[11px]'} font-semibold uppercase tracking-[0.17em] break-words line-clamp-2`}>{song.artist}</p></div>
  </div>
}
