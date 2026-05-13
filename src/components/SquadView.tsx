'use client'

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Users, LayoutList, Map } from 'lucide-react';

interface Player {
  _id: string;
  name: string;
  photo: string;
  position: string;
  number: number;
  soldPrice?: number;
}

interface Team {
  _id: string;
  name: string;
  logo?: string;
  manager1: string;
  manager2: string;
  players: Player[];
}

function getPositionStyle(position: string) {
  const pos = position.toLowerCase();
  if (pos === 'goalkeeper' || pos === 'gk')
    return { color: '#fbbf24', border: '#fbbf24', glow: '#fbbf2440', label: 'GK' };
  if (pos === 'defender')
    return { color: '#60a5fa', border: '#60a5fa', glow: '#60a5fa40', label: 'DEF' };
  if (pos === 'midfielder')
    return { color: '#c084fc', border: '#c084fc', glow: '#c084fc40', label: 'MID' };
  return { color: '#f87171', border: '#f87171', glow: '#f8717140', label: 'FWD' };
}

function groupPlayers(players: Player[]) {
  return {
    gk:  players.filter(p => ['goalkeeper', 'gk'].includes(p.position.toLowerCase())),
    def: players.filter(p => p.position.toLowerCase() === 'defender'),
    mid: players.filter(p => p.position.toLowerCase() === 'midfielder'),
    fwd: players.filter(p => p.position.toLowerCase() === 'forward'),
  };
}

function PlayerPin({ player, delay = 0, size = 'md' }: {
  player: Player;
  delay?: number;
  size?: 'sm' | 'md';
}) {
  const style = getPositionStyle(player.position);
  const lastName = player.name.split(' ').pop() || player.name;
  const displayName = lastName.length > 8 ? lastName.slice(0, 8) + '…' : lastName;
  const avatarCls = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10 sm:w-11 sm:h-11';
  const nameCls   = size === 'sm' ? 'text-[7px]' : 'text-[8px] sm:text-[9px]';
  const numCls    = size === 'sm' ? 'text-[6px]' : 'text-[7px]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay, type: 'spring', stiffness: 300, damping: 22 }}
      className="flex flex-col items-center gap-px cursor-default"
    >
      <div
        className={`${avatarCls} rounded-full overflow-hidden border-2 shrink-0`}
        style={{
          borderColor: style.border,
          boxShadow: `0 0 10px ${style.glow}, 0 2px 8px rgba(0,0,0,0.7)`,
        }}
      >
        <img src={player.photo} alt={player.name} className="w-full h-full object-cover" />
      </div>
      <span
        className={`${nameCls} font-black uppercase tracking-wide leading-none text-center`}
        style={{ color: style.color, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
      >
        {displayName}
      </span>
      <span className={`${numCls} font-bold text-white/30 leading-none`}>
        #{player.number}
      </span>
    </motion.div>
  );
}

function PlayerRow({ players, topPct, size }: {
  players: Player[];
  topPct: number;
  size?: 'sm' | 'md';
}) {
  if (!players.length) return null;
  return (
    <>
      {players.map((player, i) => (
        <div
          key={player._id}
          style={{
            position: 'absolute',
            top: `${topPct}%`,
            left: `${((i + 1) / (players.length + 1)) * 100}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
          }}
        >
          <PlayerPin player={player} delay={i * 0.07} size={size} />
        </div>
      ))}
    </>
  );
}

/* Shared pitch internals (grass, SVG lines, players) */
function PitchInner({ players, size }: { players: Player[]; size?: 'sm' | 'md' }) {
  const { gk, def, mid, fwd } = groupPlayers(players);
  return (
    <>
      {/* Grass stripes */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${i * 10}%`, left: 0, right: 0, height: '10%',
            backgroundColor: i % 2 === 0 ? 'rgba(255,255,255,0.028)' : 'transparent',
          }}
        />
      ))}

      {/* Field markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 300" preserveAspectRatio="none">
        <rect x="10" y="10" width="180" height="280" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <line x1="10" y1="150" x2="190" y2="150" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <circle cx="100" cy="150" r="28" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <circle cx="100" cy="150" r="1.5" fill="rgba(255,255,255,0.65)" />
        {/* Top penalty area */}
        <rect x="45" y="10" width="110" height="42" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <rect x="72" y="10" width="56"  height="16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <circle cx="100" cy="37" r="1.5" fill="rgba(255,255,255,0.65)" />
        <path d="M 68 52 A 24 24 0 0 1 132 52" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        {/* Bottom penalty area */}
        <rect x="45" y="248" width="110" height="42" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <rect x="72" y="274" width="56"  height="16" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <circle cx="100" cy="263" r="1.5" fill="rgba(255,255,255,0.65)" />
        <path d="M 68 248 A 24 24 0 0 0 132 248" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        {/* Corner arcs */}
        <path d="M 10 22 A 12 12 0 0 1 22 10"   fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <path d="M 178 10 A 12 12 0 0 1 190 22"  fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <path d="M 10 278 A 12 12 0 0 0 22 290"  fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
        <path d="M 190 278 A 12 12 0 0 1 178 290" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" />
      </svg>

      {/* Players */}
      <PlayerRow players={fwd} topPct={14} size={size} />
      <PlayerRow players={mid} topPct={36} size={size} />
      <PlayerRow players={def} topPct={60} size={size} />
      <PlayerRow players={gk}  topPct={82} size={size} />

      {/* Direction labels */}
      <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none">
        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">▲ attack</span>
      </div>
      <div className="absolute bottom-2 inset-x-0 flex justify-center pointer-events-none">
        <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/20">defend ▼</span>
      </div>
    </>
  );
}

const GRASS = 'linear-gradient(180deg,#165c28 0%,#1a6b2e 20%,#145826 40%,#1a6b2e 60%,#145826 80%,#165c28 100%)';

/* ── Mobile: flat 2-D pitch, no transforms ── */
function MobilePitch({ players }: { players: Player[] }) {
  return (
    <div
      className="relative w-full rounded-xl overflow-hidden"
      style={{ aspectRatio: '2/3', background: GRASS }}
    >
      <PitchInner players={players} size="sm" />
    </div>
  );
}

/* ── Desktop: 3-D perspective tilt ── */
function DesktopPitch({ players }: { players: Player[] }) {
  return (
    <div style={{ perspective: '700px' }}>
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{
          aspectRatio: '2/3',
          background: GRASS,
          transform: 'rotateX(18deg)',
          transformOrigin: '50% 0%',
          boxShadow: '0 50px 100px rgba(0,0,0,0.9)',
        }}
      >
        <PitchInner players={players} size="md" />
      </div>
    </div>
  );
}

function FootballPitch({ players }: { players: Player[] }) {
  return (
    <div className="w-full max-w-sm mx-auto">
      {/* Mobile flat */}
      <div className="sm:hidden">
        <MobilePitch players={players} />
      </div>
      {/* Desktop 3-D */}
      <div className="hidden sm:block">
        <DesktopPitch players={players} />
        <div
          className="w-4/5 mx-auto h-5"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, transparent 70%)',
            marginTop: '-2px',
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
export default function SquadView({ teams }: { teams: Team[] }) {
  const [activeIdx, setActiveIdx]   = useState(0);
  const [mobileView, setMobileView] = useState<'pitch' | 'roster'>('pitch');
  const team = teams[activeIdx];

  useEffect(() => { setMobileView('pitch'); }, [activeIdx]);

  return (
    <div className="flex flex-col gap-4 sm:gap-8">

      {/* ── Team tabs ──────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {teams.map((t, i) => (
          <button
            key={t._id}
            onClick={() => setActiveIdx(i)}
            className={`shrink-0 flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-3 rounded-xl border transition-all duration-300 text-[11px] sm:text-sm font-black uppercase tracking-tight ${
              i === activeIdx
                ? 'glass border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
                : 'border-white/5 bg-white/3 text-slate-500 hover:text-white hover:border-white/10'
            }`}
          >
            {t.logo ? (
              <img src={t.logo} alt={t.name} className="w-4 h-4 object-contain shrink-0" />
            ) : (
              <Trophy className={`w-3.5 h-3.5 shrink-0 ${i === activeIdx ? 'text-amber-500' : 'text-slate-600'}`} />
            )}
            <span className="max-w-20 truncate">{t.name}</span>
            <span className={`text-[8px] px-1 py-0.5 rounded font-black shrink-0 ${
              i === activeIdx ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-slate-600'
            }`}>
              {t.players.length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Mobile pitch / roster toggle ─────────── */}
      <div className="flex sm:hidden rounded-xl overflow-hidden border border-white/10 p-1 gap-1 bg-white/3">
        <button
          onClick={() => setMobileView('pitch')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            mobileView === 'pitch'
              ? 'bg-emerald-500/20 text-emerald-400'
              : 'text-slate-500'
          }`}
        >
          <Map className="w-3.5 h-3.5" />
          Formation
        </button>
        <button
          onClick={() => setMobileView('roster')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${
            mobileView === 'roster'
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-slate-500'
          }`}
        >
          <LayoutList className="w-3.5 h-3.5" />
          Roster
        </button>
      </div>

      {/* ── Main content ─────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={team._id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-[minmax(0,340px)_1fr] lg:grid-cols-[360px_1fr] gap-6 sm:gap-8 lg:gap-10"
        >

          {/* Pitch */}
          <div className={mobileView === 'roster' ? 'hidden sm:block' : 'block'}>
            <FootballPitch players={team.players} />
          </div>

          {/* Squad panel */}
          <div className={`flex flex-col gap-3 sm:gap-5 ${mobileView === 'pitch' ? 'hidden sm:flex' : 'flex'}`}>

            {/* Team header */}
            <div className="glass rounded-2xl p-4 sm:p-6 border border-white/5 flex items-center gap-3 sm:gap-5">
              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center p-1.5 shrink-0">
                {team.logo ? (
                  <img src={team.logo} alt={team.name} className="w-full h-full object-contain" />
                ) : (
                  <Trophy className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-2xl font-black italic uppercase tracking-tighter leading-none truncate">
                  {team.name}
                </h2>
                <p className="text-[9px] sm:text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1 truncate">
                  {team.manager1} · {team.manager2}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl sm:text-3xl font-black italic text-emerald-400 leading-none">
                  {team.players.length}
                </p>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-0.5">Players</p>
              </div>
            </div>

            {/* Position legend */}
            <div className="flex gap-2 flex-wrap">
              {[
                { label: 'GK',  color: '#fbbf24', bg: 'rgba(245,158,11,0.12)'  },
                { label: 'DEF', color: '#60a5fa', bg: 'rgba(59,130,246,0.12)'  },
                { label: 'MID', color: '#c084fc', bg: 'rgba(168,85,247,0.12)'  },
                { label: 'FWD', color: '#f87171', bg: 'rgba(239,68,68,0.12)'   },
              ].map(pos => (
                <div
                  key={pos.label}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest"
                  style={{ backgroundColor: pos.bg, color: pos.color }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pos.color }} />
                  {pos.label}
                </div>
              ))}
            </div>

            {/* Player cards */}
            {team.players.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                {team.players.map((player, i) => {
                  const style = getPositionStyle(player.position);
                  return (
                    <motion.div
                      key={player._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass rounded-2xl p-3 sm:p-4 border border-white/5 hover:border-white/10 transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden border-2 shrink-0"
                          style={{ borderColor: `${style.border}35` }}
                        >
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black uppercase text-xs sm:text-sm tracking-tight text-white truncate leading-none">
                            {player.name}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span
                              className="text-[7px] sm:text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wide"
                              style={{ backgroundColor: style.glow, color: style.color }}
                            >
                              {style.label}
                            </span>
                            <span className="text-[9px] text-slate-500 font-bold">#{player.number}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p
                            className="text-xs sm:text-sm font-black italic tabular-nums leading-none"
                            style={{ color: player.soldPrice === 0 ? '#fbbf24' : 'white' }}
                          >
                            {player.soldPrice === 0 ? 'FREE' : player.soldPrice}
                          </p>
                          <p className="text-[7px] text-slate-600 uppercase font-black tracking-widest mt-1">pts</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-3xl border border-dashed border-white/5 py-16 flex flex-col items-center justify-center text-center">
                <Users className="w-10 h-10 text-slate-700 mb-3 opacity-20" />
                <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No Players Signed</p>
                <p className="text-slate-700 font-bold uppercase tracking-tight text-[10px] mt-1.5">Players appear after the auction</p>
              </div>
            )}
          </div>

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
