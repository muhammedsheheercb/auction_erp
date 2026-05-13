'use client'

import { useState, useMemo, useTransition, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Target, Swords, Star, Edit3, Trash2, Plus, X,
  ChevronUp, Minus, RotateCcw, Zap, Shield, Medal, Download,
} from 'lucide-react';
import { toPng } from 'html-to-image';
import {
  updateMatch, deleteMatch, initializeTournament, resetTournament,
  resetAndInitializeTournament, generateSemiFinals, generateFinals,
} from '@/actions/matchActions';
import ConfirmModal from './ConfirmModal';

// ─── types ────────────────────────────────────────────────────────────────────

type TeamSlotInfo = { name: string; logo?: string; isLabel?: boolean };

interface GoalScorer {
  _id?: string;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  goals: number;
}

interface Match {
  _id: string;
  stage: 'GROUP_A' | 'GROUP_B' | 'SEMI_1' | 'SEMI_2' | 'LOSERS_FINAL' | 'FINAL';
  matchNumber: number;
  day?: number;
  homeTeam: string;
  homeTeamName: string;
  homeTeamLogo: string;
  awayTeam: string;
  awayTeamName: string;
  awayTeamLogo: string;
  homeScore: number;
  awayScore: number;
  status: 'upcoming' | 'completed';
  goalScorers: GoalScorer[];
}

interface Player { _id: string; name: string; number: number; photo?: string; }
interface Team { _id: string; name: string; logo: string; players: Player[]; }

interface Props {
  matches: Match[];
  teams: Team[];
  isAdmin: boolean;
}

// ─── constants ────────────────────────────────────────────────────────────────

const GROUP_A_KEYWORDS = ['majestic', 'hermanos', 'decano', 'storm tuskers'];
const isGroupA = (name: string) =>
  GROUP_A_KEYWORDS.some(k => name.toLowerCase().includes(k));

const STAGE_LABEL: Record<string, string> = {
  GROUP_A: 'Group A',
  GROUP_B: 'Group B',
  SEMI_1: 'Semi-Final 1',
  SEMI_2: 'Semi-Final 2',
  LOSERS_FINAL: "3rd Place",
  FINAL: 'Grand Final',
};

// ─── helpers ──────────────────────────────────────────────────────────────────

function calcStandings(teamIds: string[], teamMap: Map<string, Team>, matches: Match[], stage: string) {
  return teamIds
    .map(id => {
      const team = teamMap.get(id)!;
      let W = 0, D = 0, L = 0, GF = 0, GA = 0;
      matches
        .filter(m => m.stage === stage && m.status === 'completed' &&
          (m.homeTeam === id || m.awayTeam === id))
        .forEach(m => {
          const home = m.homeTeam === id;
          const gs = home ? m.homeScore : m.awayScore;
          const gc = home ? m.awayScore : m.homeScore;
          GF += gs; GA += gc;
          if (gs > gc) W++; else if (gs === gc) D++; else L++;
        });
      return { id, team, P: W + D + L, W, D, L, GF, GA, GD: GF - GA, Pts: W * 3 + D };
    })
    .sort((a, b) => b.Pts - a.Pts || b.GD - a.GD || b.GF - a.GF);
}

function calcTopScorers(matches: Match[]) {
  const map = new Map<string, { playerName: string; teamName: string; teamId: string; goals: number }>();
  matches.forEach(m =>
    m.goalScorers.forEach(s => {
      const prev = map.get(s.playerId) ?? { playerName: s.playerName, teamName: s.teamName, teamId: s.teamId, goals: 0 };
      map.set(s.playerId, { ...prev, goals: prev.goals + s.goals });
    })
  );
  return [...map.entries()]
    .map(([playerId, d]) => ({ playerId, ...d }))
    .sort((a, b) => b.goals - a.goals);
}

// ─── download helpers ─────────────────────────────────────────────────────────

async function downloadAsImage(el: HTMLElement, filename: string) {
  // Temporarily inject !important overrides so backdrop-filter (glass class)
  // doesn't bleed the live page sidebar into the captured image.
  const overrideStyle = document.createElement('style');
  overrideStyle.textContent = `
    .glass, .glass-light {
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
    }
    .glass       { background: rgba(15,23,42,0.98) !important; }
    .glass-light { background: rgba(10,15,28,0.98) !important; }
    *::-webkit-scrollbar { display: none !important; }
    * { scrollbar-width: none !important; }
  `;
  document.head.appendChild(overrideStyle);

  // Temporarily expand overflow-x-auto so the full table width is captured
  const scrollEl = el.querySelector<HTMLElement>('.overflow-x-auto');
  const prevOverflow = scrollEl?.style.overflow ?? '';
  if (scrollEl) scrollEl.style.overflow = 'visible';

  const fullWidth  = scrollEl ? Math.max(el.offsetWidth, scrollEl.scrollWidth) : el.offsetWidth;
  const fullHeight = el.scrollHeight;

  try {
    const dataUrl = await toPng(el, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: '#080d18',
      width:  fullWidth,
      height: fullHeight,
      style: { borderRadius: '16px' },
      filter: (node) => !(node instanceof HTMLElement && node.dataset.dlIgnore === 'true'),
    });
    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    document.head.removeChild(overrideStyle);
    if (scrollEl) scrollEl.style.overflow = prevOverflow;
  }
}

function DownloadBtn({ elRef, filename, className = '' }: {
  elRef: React.RefObject<HTMLDivElement | null>;
  filename: string;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);
  async function handle() {
    if (!elRef.current || loading) return;
    setLoading(true);
    try { await downloadAsImage(elRef.current, filename); }
    finally { setLoading(false); }
  }
  return (
    <button
      onClick={handle}
      disabled={loading}
      data-dl-ignore="true"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-500 hover:text-white border border-white/5 hover:border-white/10 transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-40 ${className}`}
    >
      <Download className={`w-3 h-3 ${loading ? 'animate-bounce' : ''}`} />
      {loading ? 'Saving…' : 'Save'}
    </button>
  );
}

// ─── sub-components ───────────────────────────────────────────────────────────

function TeamLogo({ logo, name, size = 'sm' }: { logo: string; name: string; size?: 'sm' | 'md' }) {
  const cls = size === 'md' ? 'w-10 h-10 sm:w-12 sm:h-12' : 'w-7 h-7 sm:w-8 sm:h-8';
  return logo
    ? <img src={logo} alt={name} className={`${cls} object-contain`} />
    : <Trophy className={`${cls} text-slate-600`} />;
}

function StandingsTable({ stage, label, matches, teams, teamMap, highlight }: {
  stage: string; label: string; matches: Match[];
  teams: Team[]; teamMap: Map<string, Team>; highlight?: string[];
}) {
  const teamIds = teams.filter(t =>
    stage === 'GROUP_A' ? isGroupA(t.name) : !isGroupA(t.name)
  ).map(t => t._id);

  const rows = calcStandings(teamIds, teamMap, matches, stage);
  const dlRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={dlRef} className="glass rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${stage === 'GROUP_A' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        <h3 className="text-sm font-black uppercase tracking-widest flex-1">{label}</h3>
        <DownloadBtn elRef={dlRef} filename={`standings-${label.toLowerCase().replace(/\s+/g, '-')}`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[420px]">
          <thead>
            <tr className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-500 border-b border-white/5">
              <th className="text-left px-4 sm:px-6 py-3">#</th>
              <th className="text-left px-2 py-3">Team</th>
              <th className="px-2 py-3 text-center">P</th>
              <th className="px-2 py-3 text-center">W</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">L</th>
              <th className="px-2 py-3 text-center">GF</th>
              <th className="px-2 py-3 text-center">GA</th>
              <th className="px-2 py-3 text-center">GD</th>
              <th className="px-2 sm:px-4 py-3 text-center">Pts</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const qualified = i < 2;
              return (
                <tr
                  key={row.id}
                  className={`border-b border-white/5 last:border-0 transition-colors ${
                    qualified ? 'bg-emerald-500/5' : ''
                  }`}
                >
                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-black ${qualified ? 'text-emerald-400' : 'text-slate-500'}`}>{i + 1}</span>
                      {qualified && <ChevronUp className="w-3 h-3 text-emerald-500" />}
                    </div>
                  </td>
                  <td className="px-2 py-3 sm:py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 shrink-0 flex items-center justify-center">
                        {row.team?.logo
                          ? <img src={row.team.logo} className="w-6 h-6 object-contain" alt="" />
                          : <Trophy className="w-4 h-4 text-slate-700" />}
                      </div>
                      <span className="text-xs sm:text-sm font-black uppercase tracking-tight truncate max-w-[100px] sm:max-w-none">
                        {row.team?.name}
                      </span>
                    </div>
                  </td>
                  {[row.P, row.W, row.D, row.L, row.GF, row.GA].map((v, j) => (
                    <td key={j} className="px-2 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-slate-400">{v}</td>
                  ))}
                  <td className="px-2 py-3 sm:py-4 text-center">
                    <span className={`text-xs sm:text-sm font-black ${row.GD > 0 ? 'text-emerald-400' : row.GD < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {row.GD > 0 ? `+${row.GD}` : row.GD}
                    </span>
                  </td>
                  <td className="px-2 sm:px-4 py-3 sm:py-4 text-center">
                    <span className={`text-sm sm:text-base font-black ${qualified ? 'text-white' : 'text-slate-400'}`}>{row.Pts}</span>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan={10} className="text-center py-8 text-slate-600 text-xs font-black uppercase tracking-widest">No data yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 sm:px-6 py-3 border-t border-white/5 flex items-center gap-2">
        <ChevronUp className="w-3 h-3 text-emerald-500" />
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Top 2 advance to Semi-Finals</span>
      </div>
    </div>
  );
}

function MatchCard({ match, isAdmin, onEdit, onDelete }: {
  match: Match; isAdmin: boolean;
  onEdit: (m: Match) => void; onDelete: (m: Match) => void;
}) {
  const done = match.status === 'completed';
  const dlRef = useRef<HTMLDivElement>(null);
  const filename = `match-${match.homeTeamName}-vs-${match.awayTeamName}`
    .toLowerCase().replace(/\s+/g, '-');

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden flex flex-col h-full"
    >
      {/* Capturable content — grows to fill equal card height */}
      <div ref={dlRef} className="p-3 sm:p-4 flex-1 flex flex-col">
        {/* CSL 7 header */}
        <div className="flex items-center justify-center gap-1.5 pb-2.5 mb-2.5 border-b border-white/5 shrink-0">
          <img src="/images/logo.webp" alt="CSL 7" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
          <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">CSL 7</span>
        </div>

        {/* Teams row — flex-1 so it fills remaining space evenly across cards */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-1.5 sm:gap-3 flex-1">
          {/* Home */}
          <div className="flex flex-col items-center gap-1 text-center min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              {match.homeTeamLogo
                ? <img src={match.homeTeamLogo} alt={match.homeTeamName} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                : <Trophy className="w-6 h-6 text-slate-600" />}
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-2 w-full">
              {match.homeTeamName}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 shrink-0 w-12 sm:w-16">
            {done ? (
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${match.homeScore > match.awayScore ? 'text-white' : 'text-slate-500'}`}>{match.homeScore}</span>
                <span className="text-slate-600 font-black text-sm leading-none">–</span>
                <span className={`text-xl sm:text-2xl font-black tabular-nums leading-none ${match.awayScore > match.homeScore ? 'text-white' : 'text-slate-500'}`}>{match.awayScore}</span>
              </div>
            ) : (
              <span className="text-slate-700 font-black text-sm sm:text-base leading-none">VS</span>
            )}
            <span className={`text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full whitespace-nowrap ${
              done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-600'
            }`}>
              {done ? 'FT' : 'Soon'}
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-1 text-center min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shrink-0">
              {match.awayTeamLogo
                ? <img src={match.awayTeamLogo} alt={match.awayTeamName} className="w-8 h-8 sm:w-10 sm:h-10 object-contain" />
                : <Trophy className="w-6 h-6 text-slate-600" />}
            </div>
            <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-tight leading-tight line-clamp-2 w-full">
              {match.awayTeamName}
            </span>
          </div>
        </div>

        {/* Goal scorers */}
        {done && match.goalScorers.length > 0 && (() => {
          const homeSide = match.goalScorers.filter(s => s.teamId === match.homeTeam);
          const awaySide = match.goalScorers.filter(s => s.teamId === match.awayTeam);
          return (
            <div className="mt-2.5 pt-2.5 border-t border-white/5 grid grid-cols-2 gap-1 shrink-0">
              {[homeSide, awaySide].map((list, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1">
                  {list.map((s, i) => (
                    <div key={i} className="flex items-center gap-0.5 text-[7px] sm:text-[8px] font-black text-slate-300 text-center flex-wrap justify-center">
                      <span>⚽</span>
                      <span className="break-all">{s.playerName}</span>
                      {s.goals > 1 && <span className="text-amber-400">×{s.goals}</span>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })()}
      </div>

      {/* Footer — always pinned to card bottom */}
      <div className="px-3 sm:px-4 pb-3 flex gap-1.5 shrink-0 mt-auto">
        <DownloadBtn elRef={dlRef} filename={filename} className="shrink-0" />
        {isAdmin && (
          <>
            <button
              onClick={() => onEdit(match)}
              className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-amber-500/20 min-h-[36px]"
            >
              <Edit3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> Update
            </button>
            <button
              onClick={() => onDelete(match)}
              className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all border border-white/5 hover:border-rose-500/20 min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}

function FixtureSection({ label, fileKey, matches, isAdmin, onEdit, onDelete, cols }: {
  label: string; fileKey: string; matches: Match[]; isAdmin: boolean;
  onEdit: (m: Match) => void; onDelete: (m: Match) => void; cols?: 2;
}) {
  const dlRef = useRef<HTMLDivElement>(null);
  const gridCls = cols === 2
    ? 'grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3 p-1 items-stretch'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-1 items-stretch';
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className="h-px flex-1 bg-white/5" />
        <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">{label}</span>
        <div className="h-px flex-1 bg-white/5" />
        <DownloadBtn elRef={dlRef} filename={`fixtures-${fileKey.toLowerCase()}`} />
      </div>
      <div ref={dlRef} className={gridCls}>
        {matches.map(m => (
          <MatchCard
            key={m._id} match={m} isAdmin={isAdmin}
            onEdit={onEdit} onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

function BracketMatchCard({ label, accent, homeSlot, awaySlot, match }: {
  label: string; accent: string;
  homeSlot: TeamSlotInfo; awaySlot: TeamSlotInfo; match?: Match;
}) {
  const done = match?.status === 'completed';
  const homeWon = done && match!.homeScore > match!.awayScore;
  const awayWon = done && match!.awayScore > match!.homeScore;

  const TeamRow = ({ slot, score, won }: { slot: TeamSlotInfo; score?: number; won?: boolean }) => (
    <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${won ? 'bg-amber-500/10' : 'bg-white/3'}`}>
      <div className="w-8 h-8 shrink-0 flex items-center justify-center">
        {!slot.isLabel && slot.logo
          ? <img src={slot.logo} alt={slot.name} className="w-8 h-8 object-contain" />
          : <div className="w-7 h-7 rounded-full border border-white/10 flex items-center justify-center bg-white/5">
              <Trophy className="w-3.5 h-3.5 text-slate-600" />
            </div>}
      </div>
      <span className={`flex-1 text-[10px] sm:text-xs font-black uppercase leading-tight ${slot.isLabel ? 'text-slate-500 italic' : won ? 'text-white' : 'text-slate-300'}`}>
        {slot.name}
      </span>
      {done && score !== undefined && (
        <span className={`text-lg font-black tabular-nums ${won ? 'text-white' : 'text-slate-600'}`}>{score}</span>
      )}
      {won && <span className="ml-1 text-[7px] font-black text-amber-400 uppercase bg-amber-500/15 px-1.5 py-0.5 rounded-full">W</span>}
    </div>
  );

  return (
    <div className="glass rounded-2xl border border-white/5 overflow-hidden">
      <div className={`px-4 py-2.5 border-b border-white/5 ${accent}`}>
        <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
      </div>
      <div className="p-3 space-y-1.5">
        <TeamRow slot={homeSlot} score={match?.homeScore} won={homeWon} />
        <div className="flex items-center gap-2 px-2">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-[8px] font-black uppercase tracking-widest text-slate-700">vs</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>
        <TeamRow slot={awaySlot} score={match?.awayScore} won={awayWon} />
      </div>
      <div className="px-3 pb-3">
        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
          done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-600'
        }`}>
          {done ? 'Full Time' : 'Upcoming'}
        </span>
      </div>
    </div>
  );
}

function KnockoutBracket({ allMatches, teams, teamMap }: {
  allMatches: Match[]; teams: Team[]; teamMap: Map<string, Team>;
}) {
  const groupAMs = allMatches.filter(m => m.stage === 'GROUP_A');
  const groupBMs = allMatches.filter(m => m.stage === 'GROUP_B');
  const sf1 = allMatches.find(m => m.stage === 'SEMI_1');
  const sf2 = allMatches.find(m => m.stage === 'SEMI_2');
  const lf  = allMatches.find(m => m.stage === 'LOSERS_FINAL');
  const fin = allMatches.find(m => m.stage === 'FINAL');

  const groupAIds = teams.filter(t =>  isGroupA(t.name)).map(t => t._id);
  const groupBIds = teams.filter(t => !isGroupA(t.name)).map(t => t._id);
  const standA = calcStandings(groupAIds, teamMap, groupAMs, 'GROUP_A');
  const standB = calcStandings(groupBIds, teamMap, groupBMs, 'GROUP_B');

  const groupStageDone =
    groupAMs.length > 0 && groupBMs.length > 0 &&
    [...groupAMs, ...groupBMs].every(m => m.status === 'completed');

  const a1 = groupStageDone ? (standA[0]?.team ?? null) : null;
  const a2 = groupStageDone ? (standA[1]?.team ?? null) : null;
  const b1 = groupStageDone ? (standB[0]?.team ?? null) : null;
  const b2 = groupStageDone ? (standB[1]?.team ?? null) : null;

  function mkSlot(fromMatch: { name: string; logo: string } | null, fromTeam: Team | null, label: string): TeamSlotInfo {
    if (fromMatch) return { name: fromMatch.name, logo: fromMatch.logo };
    if (fromTeam)  return { name: fromTeam.name,  logo: fromTeam.logo  };
    return { name: label, isLabel: true };
  }
  function getWinner(m?: Match): { name: string; logo: string } | null {
    if (!m || m.status !== 'completed') return null;
    return m.homeScore > m.awayScore
      ? { name: m.homeTeamName, logo: m.homeTeamLogo }
      : { name: m.awayTeamName, logo: m.awayTeamLogo };
  }
  function getLoser(m?: Match): { name: string; logo: string } | null {
    if (!m || m.status !== 'completed') return null;
    return m.homeScore > m.awayScore
      ? { name: m.awayTeamName, logo: m.awayTeamLogo }
      : { name: m.homeTeamName, logo: m.homeTeamLogo };
  }

  const sf1Home = mkSlot(sf1 ? { name: sf1.homeTeamName, logo: sf1.homeTeamLogo } : null, a1, 'Group A · 1st');
  const sf1Away = mkSlot(sf1 ? { name: sf1.awayTeamName, logo: sf1.awayTeamLogo } : null, b2, 'Group B · 2nd');
  const sf2Home = mkSlot(sf2 ? { name: sf2.homeTeamName, logo: sf2.homeTeamLogo } : null, b1, 'Group B · 1st');
  const sf2Away = mkSlot(sf2 ? { name: sf2.awayTeamName, logo: sf2.awayTeamLogo } : null, a2, 'Group A · 2nd');

  const finHome = mkSlot(fin ? { name: fin.homeTeamName, logo: fin.homeTeamLogo } : getWinner(sf1), null, 'SF1 · Winner');
  const finAway = mkSlot(fin ? { name: fin.awayTeamName, logo: fin.awayTeamLogo } : getWinner(sf2), null, 'SF2 · Winner');
  const lfHome  = mkSlot(lf  ? { name: lf.homeTeamName,  logo: lf.homeTeamLogo  } : getLoser(sf1),  null, 'SF1 · Loser');
  const lfAway  = mkSlot(lf  ? { name: lf.awayTeamName,  logo: lf.awayTeamLogo  } : getLoser(sf2),  null, 'SF2 · Loser');

  const BracketDivider = ({ label }: { label: string }) => (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-white/5" />
      <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-white/5" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {!groupStageDone && (
        <div className="flex items-center gap-2.5 px-4 py-3 glass rounded-2xl border border-amber-500/10 bg-amber-500/5">
          <Swords className="w-3.5 h-3.5 text-amber-500/60 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">
            Group stage in progress — semi-final teams will be confirmed once all group matches finish
          </p>
        </div>
      )}
      {groupStageDone && !sf1 && (
        <div className="flex items-center gap-2.5 px-4 py-3 glass rounded-2xl border border-emerald-500/10 bg-emerald-500/5">
          <ChevronUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            Group stage complete — generate semi-finals to begin Day 2 knockout
          </p>
        </div>
      )}

      <BracketDivider label="Semi-Finals · Day 2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <BracketMatchCard label="Semi-Final 1" accent="text-amber-400" match={sf1} homeSlot={sf1Home} awaySlot={sf1Away} />
        <BracketMatchCard label="Semi-Final 2" accent="text-amber-400" match={sf2} homeSlot={sf2Home} awaySlot={sf2Away} />
      </div>

      {/* Flow connectors */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <div className="w-px h-4 bg-slate-700/60" />
          <span className="text-[7px] font-black uppercase tracking-wider text-slate-700">Loser → 3rd Place</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 pt-1">
          <div className="w-px h-4 bg-amber-500/30" />
          <span className="text-[7px] font-black uppercase tracking-wider text-amber-600/50">Winner → Final</span>
        </div>
      </div>

      <BracketDivider label="Finals · Day 2" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <BracketMatchCard label="3rd Place Match" accent="text-slate-400" match={lf}  homeSlot={lfHome}  awaySlot={lfAway}  />
        <BracketMatchCard label="Grand Final 🏆"  accent="text-amber-500" match={fin} homeSlot={finHome} awaySlot={finAway} />
      </div>
    </div>
  );
}

// ─── score edit modal ─────────────────────────────────────────────────────────

function ScoreModal({ match, teams, onClose, onSave }: {
  match: Match;
  teams: Team[];
  onClose: () => void;
  onSave: (data: { homeScore: number; awayScore: number; status: 'upcoming' | 'completed'; goalScorers: GoalScorer[] }) => void;
}) {
  const [homeScore, setHomeScore] = useState(match.homeScore);
  const [awayScore, setAwayScore] = useState(match.awayScore);
  const [scorers, setScorers] = useState<GoalScorer[]>(match.goalScorers.map(s => ({ ...s })));
  const [newSide, setNewSide]   = useState<'home' | 'away'>('home');
  const [newPid,  setNewPid]    = useState('');
  const [newGoals, setNewGoals] = useState(1);
  const [showConfirm, setShowConfirm] = useState(false);

  const homeTeam = teams.find(t => t._id === match.homeTeam);
  const awayTeam = teams.find(t => t._id === match.awayTeam);
  const activePlayers = (newSide === 'home' ? homeTeam : awayTeam)?.players ?? [];

  const homeAssigned = scorers.filter(s => s.teamId === match.homeTeam).reduce((sum, s) => sum + s.goals, 0);
  const awayAssigned = scorers.filter(s => s.teamId === match.awayTeam).reduce((sum, s) => sum + s.goals, 0);
  const activeAssigned = newSide === 'home' ? homeAssigned : awayAssigned;
  const activeScore   = newSide === 'home' ? homeScore : awayScore;
  const remaining     = activeScore - activeAssigned;

  function addScorer() {
    if (!newPid || newGoals > remaining) return;
    const player = activePlayers.find(p => p._id === newPid);
    if (!player) return;
    const team = newSide === 'home' ? homeTeam! : awayTeam!;
    setScorers(prev => [...prev, {
      playerId: player._id, playerName: player.name,
      teamId: team._id, teamName: team.name, goals: newGoals,
    }]);
    setNewPid(''); setNewGoals(1);
  }

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => onSave({ homeScore, awayScore, status: 'completed', goalScorers: scorers })}
        title="Confirm Score Update"
        message={`Save ${match.homeTeamName} ${homeScore} – ${awayScore} ${match.awayTeamName}?`}
        confirmText="Save Score"
        cancelText="Cancel"
      />

      <div className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center p-0 sm:p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl" />

        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
          className="relative glass w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 pt-5 pb-4 border-b border-white/5 flex items-center justify-between shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-black uppercase italic tracking-tighter">Update Match</h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-0.5">
                {STAGE_LABEL[match.stage]}
              </p>
            </div>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5 text-slate-400 hover:text-white transition-all">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5 space-y-6">
            {/* Score inputs */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 truncate">{match.homeTeamName}</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setHomeScore(Math.max(0, homeScore - 1))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-3xl font-black tabular-nums w-10 text-center">{homeScore}</span>
                  <button onClick={() => setHomeScore(homeScore + 1)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <span className="text-slate-600 font-black text-xl">–</span>

              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-2 truncate">{match.awayTeamName}</p>
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => setAwayScore(Math.max(0, awayScore - 1))}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-3xl font-black tabular-nums w-10 text-center">{awayScore}</span>
                  <button onClick={() => setAwayScore(awayScore + 1)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all">
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Goal scorers list */}
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-3">Goal Scorers</p>
              {scorers.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {scorers.map((s, i) => {
                    const isHome = s.teamId === match.homeTeam;
                    const logo   = isHome ? match.homeTeamLogo : match.awayTeamLogo;
                    return (
                      <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
                        <div className="flex items-center gap-2">
                          {logo
                            ? <img src={logo} alt={s.teamName} className="w-4 h-4 object-contain shrink-0" />
                            : <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          <span className="text-xs font-black text-white">{s.playerName}</span>
                          {s.goals > 1 && (
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">×{s.goals}</span>
                          )}
                        </div>
                        <button onClick={() => setScorers(prev => prev.filter((_, j) => j !== i))}
                          className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-3">No scorers added yet</p>
              )}

              {/* Add scorer form */}
              <div className="bg-white/3 rounded-xl p-3 border border-white/5 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Add Scorer</p>

                {/* Team toggle with goal progress */}
                <div className="flex gap-2">
                  {(['home', 'away'] as const).map(side => {
                    const logo      = side === 'home' ? match.homeTeamLogo : match.awayTeamLogo;
                    const name      = side === 'home' ? match.homeTeamName : match.awayTeamName;
                    const score     = side === 'home' ? homeScore : awayScore;
                    const assigned  = side === 'home' ? homeAssigned : awayAssigned;
                    const full      = assigned >= score;
                    return (
                      <button key={side} onClick={() => { setNewSide(side); setNewPid(''); setNewGoals(1); }}
                        className={`flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                          newSide === side ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                        }`}>
                        <div className="flex items-center gap-1.5">
                          {logo && <img src={logo} alt={name} className="w-4 h-4 object-contain" />}
                          <span className="truncate max-w-15">{name.split(' ')[0]}</span>
                        </div>
                        <span className={`text-[8px] font-black ${full ? 'text-emerald-400' : 'text-slate-600'}`}>
                          {assigned}/{score} ⚽
                        </span>
                      </button>
                    );
                  })}
                </div>

                {remaining <= 0 ? (
                  <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest text-center py-1">
                    All {newSide === 'home' ? homeScore : awayScore} goal{(newSide === 'home' ? homeScore : awayScore) !== 1 ? 's' : ''} assigned ✓
                  </p>
                ) : (
                  <>
                    {/* Player select */}
                    <select
                      value={newPid}
                      onChange={e => setNewPid(e.target.value)}
                      className="w-full input-base text-sm py-2.5"
                    >
                      <option value="">Select player… ({remaining} goal{remaining !== 1 ? 's' : ''} left)</option>
                      {activePlayers.map(p => (
                        <option key={p._id} value={p._id}>#{p.number} {p.name}</option>
                      ))}
                    </select>

                    {/* Goals + add button */}
                    <div className="flex gap-2">
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2 border border-white/5">
                        <button onClick={() => setNewGoals(Math.max(1, newGoals - 1))} className="text-slate-400 hover:text-white transition-colors">
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-black w-5 text-center tabular-nums">{newGoals}</span>
                        <button onClick={() => setNewGoals(Math.min(remaining, newGoals + 1))} className="text-slate-400 hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button onClick={addScorer} disabled={!newPid || newGoals > remaining}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-500/20">
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 sm:px-6 py-4 border-t border-white/5 shrink-0">
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full btn-primary py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" /> Save Match Result
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

type Tab = 'standings' | 'fixtures' | 'knockout' | 'scorers';

export default function TournamentView({ matches, teams, isAdmin }: Props) {
  const [tab, setTab]           = useState<Tab>('standings');
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [confirm, setConfirm]   = useState<{ title: string; message: string; action: () => void } | null>(null);
  const [toast, setToast]       = useState('');
  const [isPending, startTrans] = useTransition();

  const initialized = matches.some(m => m.stage === 'GROUP_A' || m.stage === 'GROUP_B');
  const hasSemis    = matches.some(m => m.stage === 'SEMI_1' || m.stage === 'SEMI_2');
  const hasFinals   = matches.some(m => m.stage === 'FINAL');

  const teamMap = useMemo(() => new Map(teams.map(t => [t._id, t])), [teams]);

  const groupAMatches = matches.filter(m => m.stage === 'GROUP_A');
  const groupBMatches = matches.filter(m => m.stage === 'GROUP_B');
  const knockoutMatches = matches.filter(m => ['SEMI_1', 'SEMI_2', 'LOSERS_FINAL', 'FINAL'].includes(m.stage));

  const topScorers = useMemo(() => calcTopScorers(matches), [matches]);

  const playerPhotoMap = useMemo(() => {
    const map = new Map<string, string>();
    teams.forEach(t => t.players.forEach(p => { if (p.photo) map.set(p._id, p.photo); }));
    return map;
  }, [teams]);

  const scorersDlRef = useRef<HTMLDivElement>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  function withConfirm(title: string, message: string, action: () => void) {
    setConfirm({ title, message, action });
  }

  async function handleUpdateMatch(data: Parameters<typeof updateMatch>[1]) {
    if (!editMatch) return;
    startTrans(async () => {
      await updateMatch(editMatch._id, data);
      setEditMatch(null);
      showToast('Match result saved');
    });
  }

  async function handleDeleteMatch(match: Match) {
    startTrans(async () => {
      await deleteMatch(match._id);
      showToast('Match deleted');
    });
  }

  async function handleInit() {
    startTrans(async () => {
      const res = await initializeTournament();
      if (!res.success) showToast(res.error ?? 'Error');
      else showToast('Tournament initialized');
    });
  }

  async function handleReset() {
    startTrans(async () => {
      await resetTournament();
      showToast('Tournament reset');
    });
  }

  async function handleResetAndInit() {
    startTrans(async () => {
      const res = await resetAndInitializeTournament();
      if (!res.success) showToast(res.error ?? 'Error');
      else showToast('Group stage reset & initialized');
    });
  }

  async function handleGenSemis() {
    startTrans(async () => {
      const res = await generateSemiFinals();
      if (!res.success) showToast(res.error ?? 'Error');
      else showToast('Semi-finals created');
    });
  }

  async function handleGenFinals() {
    startTrans(async () => {
      const res = await generateFinals();
      if (!res.success) showToast(res.error ?? 'Error');
      else showToast('Finals created');
    });
  }

  const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'standings', label: 'Standings', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'fixtures',  label: 'Fixtures',  icon: <Swords className="w-3.5 h-3.5" /> },
    { id: 'knockout',  label: 'Knockout',  icon: <Shield className="w-3.5 h-3.5" /> },
    { id: 'scorers',   label: 'Scorers',   icon: <Target className="w-3.5 h-3.5" /> },
  ];

  return (
    <>
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-500 bg-emerald-500 text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full shadow-2xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      {confirm && (
        <ConfirmModal
          isOpen={!!confirm}
          onClose={() => setConfirm(null)}
          onConfirm={confirm.action}
          title={confirm.title}
          message={confirm.message}
          confirmText="Confirm"
          cancelText="Cancel"
        />
      )}

      {/* Score edit modal */}
      <AnimatePresence>
        {editMatch && (
          <ScoreModal
            match={editMatch}
            teams={teams}
            onClose={() => setEditMatch(null)}
            onSave={handleUpdateMatch}
          />
        )}
      </AnimatePresence>

      {/* ── Admin controls ── */}
      {isAdmin && (
        <div className="flex flex-wrap gap-2 mb-6">
          {!initialized && (
            <button
              onClick={() => withConfirm('Initialize Tournament', 'Create all group stage fixtures from current teams?', handleInit)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl btn-primary text-[11px] font-black uppercase tracking-widest disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" /> Initialize Tournament
            </button>
          )}
          <button
            onClick={() => withConfirm(
              'Reset & Initialize Group Stage',
              'Delete ALL matches and recreate group stage fixtures? Day 1: each team plays 2 matches. Day 2: each team plays 1 balance match.',
              handleResetAndInit
            )}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-black uppercase tracking-widest hover:bg-violet-500/20 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset & Initialize
          </button>
          {initialized && !hasSemis && (
            <button
              onClick={() => withConfirm('Generate Semi-Finals', 'Create semi-finals from current group standings?', handleGenSemis)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all disabled:opacity-50"
            >
              <Star className="w-3.5 h-3.5" /> Generate Semi-Finals
            </button>
          )}
          {hasSemis && !hasFinals && (
            <button
              onClick={() => withConfirm('Generate Finals', 'Create final & 3rd place match from semi-final results?', handleGenFinals)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[11px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all disabled:opacity-50"
            >
              <Trophy className="w-3.5 h-3.5" /> Generate Finals
            </button>
          )}
          {initialized && (
            <button
              onClick={() => withConfirm('Reset Tournament', 'Delete ALL matches? This cannot be undone.', handleReset)}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[11px] font-black uppercase tracking-widest hover:bg-rose-500/20 transition-all disabled:opacity-50 ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1.5 sm:gap-2 mb-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 pb-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-black uppercase tracking-widest transition-all border ${
              tab === t.id
                ? 'glass border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
                : 'border-white/5 bg-white/3 text-slate-500 hover:text-white hover:border-white/10'
            }`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >

          {/* STANDINGS */}
          {tab === 'standings' && (
            <div className="space-y-6">
              <StandingsTable
                stage="GROUP_A" label="Group A"
                matches={groupAMatches} teams={teams} teamMap={teamMap}
              />
              <StandingsTable
                stage="GROUP_B" label="Group B"
                matches={groupBMatches} teams={teams} teamMap={teamMap}
              />
            </div>
          )}

          {/* FIXTURES */}
          {tab === 'fixtures' && (() => {
            const gADay1 = groupAMatches.filter(m => (m.day ?? 1) === 1);
            const gADay2 = groupAMatches.filter(m => (m.day ?? 1) === 2);
            const gBDay1 = groupBMatches.filter(m => (m.day ?? 1) === 1);
            const gBDay2 = groupBMatches.filter(m => (m.day ?? 1) === 2);

            const semiMs   = knockoutMatches.filter(m => m.stage === 'SEMI_1' || m.stage === 'SEMI_2');
            const finalsMs = knockoutMatches.filter(m => m.stage === 'LOSERS_FINAL' || m.stage === 'FINAL');

            const hasDay2Group = gADay2.length > 0 || gBDay2.length > 0;
            const hasDay2 = hasDay2Group || knockoutMatches.length > 0;

            const onDel = (m: Match) =>
              withConfirm('Delete Match', `Delete ${m.homeTeamName} vs ${m.awayTeamName}?`, () => handleDeleteMatch(m));

            const DayHeader = ({ day, label }: { day: string; label: string }) => (
              <div className="flex items-center gap-4">
                <div className="glass rounded-2xl px-4 py-2.5 border border-white/10 shrink-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Day {day}</p>
                  <p className="text-sm font-black uppercase tracking-tight text-white leading-tight">{label}</p>
                </div>
                <div className="h-px flex-1 bg-white/5" />
              </div>
            );

            return (
              <div className="space-y-10">
                {!initialized && (
                  <div className="glass rounded-3xl border border-dashed border-white/5 py-20 flex flex-col items-center text-center">
                    <Swords className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
                    <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No fixtures yet</p>
                    {isAdmin && <p className="text-slate-700 text-xs font-bold uppercase mt-2">Use "Initialize Tournament" to create fixtures</p>}
                  </div>
                )}

                {/* Day 1 — Group Stage (matches 1-2 per group) */}
                {(gADay1.length > 0 || gBDay1.length > 0) && (
                  <div className="space-y-6">
                    <DayHeader day="1" label="Group Stage" />
                    {gADay1.length > 0 && (
                      <FixtureSection label="Group A" fileKey="GROUP_A_D1" matches={gADay1}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} cols={2} />
                    )}
                    {gBDay1.length > 0 && (
                      <FixtureSection label="Group B" fileKey="GROUP_B_D1" matches={gBDay1}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} cols={2} />
                    )}
                  </div>
                )}

                {/* Day 2 — Remaining group matches + Knockout */}
                {hasDay2 && (
                  <div className="space-y-6">
                    <DayHeader day="2" label="Finals Day" />

                    {/* Remaining group matches */}
                    {gADay2.length > 0 && (
                      <FixtureSection label="Group A" fileKey="GROUP_A_D2" matches={gADay2}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} />
                    )}
                    {gBDay2.length > 0 && (
                      <FixtureSection label="Group B" fileKey="GROUP_B_D2" matches={gBDay2}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} />
                    )}

                    {/* Knockout */}
                    {semiMs.length > 0 && (
                      <FixtureSection label="Semi-Finals" fileKey="SEMIFINALS" matches={semiMs}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} />
                    )}
                    {finalsMs.length > 0 && (
                      <FixtureSection label="Finals" fileKey="FINALS" matches={finalsMs}
                        isAdmin={isAdmin} onEdit={setEditMatch} onDelete={onDel} />
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* KNOCKOUT */}
          {tab === 'knockout' && (
            <KnockoutBracket allMatches={matches} teams={teams} teamMap={teamMap} />
          )}

          {/* TOP SCORERS */}
          {tab === 'scorers' && (
            <div ref={scorersDlRef} className="glass rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <Target className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-widest flex-1">Top Goal Scorers</h3>
                <DownloadBtn elRef={scorersDlRef} filename="top-scorers" />
              </div>
              {topScorers.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <Target className="w-10 h-10 text-slate-700 mb-3 opacity-20" />
                  <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No goals recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topScorers.map((s, i) => {
                    const photo   = playerPhotoMap.get(s.playerId);
                    const team    = teamMap.get(s.teamId);
                    const teamLogo = team?.logo;
                    return (
                      <motion.div
                        key={s.playerId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/3 transition-colors"
                      >
                        {/* Rank */}
                        <div className="w-7 text-center shrink-0">
                          {i === 0 ? <Medal className="w-5 h-5 text-amber-400 mx-auto" />
                            : i === 1 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                            : i === 2 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" />
                            : <span className="text-xs font-black text-slate-600">{i + 1}</span>}
                        </div>

                        {/* Player photo */}
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/10 shrink-0 bg-white/5">
                          {photo
                            ? <img src={photo} alt={s.playerName} className="w-full h-full object-cover" />
                            : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-black uppercase">
                                {s.playerName.charAt(0)}
                              </div>}
                        </div>

                        {/* Name + team */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-black uppercase tracking-tight truncate">{s.playerName}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            {teamLogo
                              ? <img src={teamLogo} alt={s.teamName} className="w-3.5 h-3.5 object-contain shrink-0" />
                              : <Trophy className="w-3 h-3 text-slate-600 shrink-0" />}
                            <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">{s.teamName}</p>
                          </div>
                        </div>

                        {/* Goal count */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-base sm:text-lg">⚽</span>
                          <span className="text-lg sm:text-xl font-black tabular-nums text-white">{s.goals}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </>
  );
}
