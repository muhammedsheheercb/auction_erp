'use client'

import { useState, useMemo, useTransition } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Target, Swords, Star, Edit3, Trash2, Plus, X,
  ChevronUp, Minus, RotateCcw, Zap, Shield, Medal,
} from 'lucide-react';
import {
  updateMatch, deleteMatch, initializeTournament, resetTournament,
  generateSemiFinals, generateFinals,
} from '@/actions/matchActions';
import ConfirmModal from './ConfirmModal';

// ─── types ────────────────────────────────────────────────────────────────────

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

interface Player { _id: string; name: string; number: number; }
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
  const map = new Map<string, { playerName: string; teamName: string; goals: number }>();
  matches.forEach(m =>
    m.goalScorers.forEach(s => {
      const prev = map.get(s.playerId) ?? { playerName: s.playerName, teamName: s.teamName, goals: 0 };
      map.set(s.playerId, { ...prev, goals: prev.goals + s.goals });
    })
  );
  return [...map.entries()]
    .map(([playerId, d]) => ({ playerId, ...d }))
    .sort((a, b) => b.goals - a.goals);
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

  return (
    <div className="glass rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${stage === 'GROUP_A' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
        <h3 className="text-sm font-black uppercase tracking-widest">{label}</h3>
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-white/5 hover:border-white/10 transition-all overflow-hidden"
    >
      <div className="p-4 sm:p-5">
        {/* Teams row */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
          {/* Home */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">
              <TeamLogo logo={match.homeTeamLogo} name={match.homeTeamName} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-tight max-w-[70px] sm:max-w-[90px]">
              {match.homeTeamName}
            </span>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center gap-1 min-w-[60px] sm:min-w-[80px]">
            {done ? (
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`text-2xl sm:text-3xl font-black tabular-nums ${match.homeScore > match.awayScore ? 'text-white' : 'text-slate-500'}`}>{match.homeScore}</span>
                <span className="text-slate-600 font-black text-lg">–</span>
                <span className={`text-2xl sm:text-3xl font-black tabular-nums ${match.awayScore > match.homeScore ? 'text-white' : 'text-slate-500'}`}>{match.awayScore}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-700 font-black text-base sm:text-lg">VS</span>
              </div>
            )}
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
              done ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-slate-600'
            }`}>
              {done ? 'FT' : 'Upcoming'}
            </span>
          </div>

          {/* Away */}
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center">
              <TeamLogo logo={match.awayTeamLogo} name={match.awayTeamName} />
            </div>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tight leading-tight max-w-[70px] sm:max-w-[90px]">
              {match.awayTeamName}
            </span>
          </div>
        </div>

        {/* Goal scorers */}
        {done && match.goalScorers.length > 0 && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-1.5 justify-center">
            {match.goalScorers.map((s, i) => (
              <span key={i} className="flex items-center gap-1 text-[8px] font-black bg-white/5 px-2 py-1 rounded-full text-slate-400">
                <Target className="w-2.5 h-2.5 text-amber-500" />
                {s.playerName} {s.goals > 1 ? `×${s.goals}` : ''}
                <span className="text-slate-600">· {s.teamName.split(' ')[0]}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="px-4 sm:px-5 pb-4 flex gap-2">
          <button
            onClick={() => onEdit(match)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/10 text-slate-400 hover:text-amber-400 text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 hover:border-amber-500/20"
          >
            <Edit3 className="w-3 h-3" /> Update Score
          </button>
          <button
            onClick={() => onDelete(match)}
            className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-all border border-white/5 hover:border-rose-500/20"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

function KnockoutBracket({ matches }: { matches: Match[] }) {
  const sf1  = matches.find(m => m.stage === 'SEMI_1');
  const sf2  = matches.find(m => m.stage === 'SEMI_2');
  const lf   = matches.find(m => m.stage === 'LOSERS_FINAL');
  const fin  = matches.find(m => m.stage === 'FINAL');

  if (!sf1 && !sf2) {
    return (
      <div className="glass rounded-3xl border border-dashed border-white/5 py-20 flex flex-col items-center text-center">
        <Swords className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
        <p className="text-slate-600 font-black uppercase tracking-widest text-sm">Knockout stage not started</p>
        <p className="text-slate-700 font-bold uppercase text-xs mt-2">Complete the group stage to unlock</p>
      </div>
    );
  }

  const KOMatch = ({ match, label, accent }: { match?: Match; label: string; accent: string }) => (
    <div className={`glass rounded-2xl border border-white/5 overflow-hidden`}>
      <div className={`px-4 py-2 border-b border-white/5 text-[9px] font-black uppercase tracking-widest ${accent}`}>{label}</div>
      {match ? (
        <div className="p-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {match.homeTeamLogo
                ? <img src={match.homeTeamLogo} className="w-8 h-8 object-contain" alt="" />
                : <Trophy className="w-7 h-7 text-slate-600" />}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase leading-tight max-w-[72px] mx-auto">{match.homeTeamName}</p>
          </div>
          <div className="text-center min-w-[56px]">
            {match.status === 'completed' ? (
              <p className="text-xl font-black tabular-nums">
                <span className={match.homeScore > match.awayScore ? 'text-white' : 'text-slate-500'}>{match.homeScore}</span>
                <span className="text-slate-600 mx-1">–</span>
                <span className={match.awayScore > match.homeScore ? 'text-white' : 'text-slate-500'}>{match.awayScore}</span>
              </p>
            ) : (
              <p className="text-slate-600 font-black text-sm">VS</p>
            )}
            <p className={`text-[8px] font-black uppercase tracking-widest mt-1 ${match.status === 'completed' ? 'text-emerald-400' : 'text-slate-600'}`}>
              {match.status === 'completed' ? 'FT' : 'TBD'}
            </p>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-1">
              {match.awayTeamLogo
                ? <img src={match.awayTeamLogo} className="w-8 h-8 object-contain" alt="" />
                : <Trophy className="w-7 h-7 text-slate-600" />}
            </div>
            <p className="text-[9px] sm:text-[10px] font-black uppercase leading-tight max-w-[72px] mx-auto">{match.awayTeamName}</p>
          </div>
        </div>
      ) : (
        <div className="p-6 text-center text-slate-600 text-xs font-black uppercase tracking-widest">TBD</div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KOMatch match={sf1} label="Semi-Final 1" accent="text-amber-400" />
        <KOMatch match={sf2} label="Semi-Final 2" accent="text-amber-400" />
      </div>
      {(lf || fin) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <KOMatch match={lf}  label="3rd Place Match" accent="text-slate-400" />
          <KOMatch match={fin} label="Grand Final 🏆"   accent="text-amber-500" />
        </div>
      )}
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

  function addScorer() {
    if (!newPid) return;
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
                  {scorers.map((s, i) => (
                    <div key={i} className="flex items-center justify-between bg-white/3 rounded-xl px-3 py-2.5 border border-white/5">
                      <div className="flex items-center gap-2">
                        <Target className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="text-xs font-black text-white">{s.playerName}</span>
                        {s.goals > 1 && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-black">×{s.goals}</span>
                        )}
                        <span className="text-[9px] text-slate-500 font-bold truncate max-w-[70px]">· {s.teamName}</span>
                      </div>
                      <button onClick={() => setScorers(prev => prev.filter((_, j) => j !== i))}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest mb-3">No scorers added yet</p>
              )}

              {/* Add scorer form */}
              <div className="bg-white/3 rounded-xl p-3 border border-white/5 space-y-3">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Add Scorer</p>

                {/* Team toggle */}
                <div className="flex gap-2">
                  {(['home', 'away'] as const).map(side => (
                    <button key={side} onClick={() => { setNewSide(side); setNewPid(''); }}
                      className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        newSide === side ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-white/5 text-slate-500 border border-white/5'
                      }`}>
                      {side === 'home' ? match.homeTeamName.split(' ')[0] : match.awayTeamName.split(' ')[0]}
                    </button>
                  ))}
                </div>

                {/* Player select */}
                <select
                  value={newPid}
                  onChange={e => setNewPid(e.target.value)}
                  className="w-full input-base text-sm py-2.5"
                >
                  <option value="">Select player…</option>
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
                    <button onClick={() => setNewGoals(newGoals + 1)} className="text-slate-400 hover:text-white transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button onClick={addScorer} disabled={!newPid}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-emerald-500/20">
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
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
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[500] bg-emerald-500 text-black text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full shadow-2xl">
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
          {tab === 'fixtures' && (
            <div className="space-y-8">
              {!initialized && (
                <div className="glass rounded-3xl border border-dashed border-white/5 py-20 flex flex-col items-center text-center">
                  <Swords className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
                  <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No fixtures yet</p>
                  {isAdmin && <p className="text-slate-700 text-xs font-bold uppercase mt-2">Use "Initialize Tournament" to create fixtures</p>}
                </div>
              )}
              {[
                { key: 'GROUP_A',     label: 'Group A Fixtures',  ms: groupAMatches },
                { key: 'GROUP_B',     label: 'Group B Fixtures',  ms: groupBMatches },
                { key: 'KNOCKOUT',    label: 'Knockout Stage',     ms: knockoutMatches },
              ].filter(s => s.ms.length > 0).map(section => (
                <div key={section.key}>
                  <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-white/5" />
                    {section.label}
                    <div className="h-px flex-1 bg-white/5" />
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {section.ms.map(m => (
                      <MatchCard
                        key={m._id} match={m} isAdmin={isAdmin}
                        onEdit={setEditMatch}
                        onDelete={m => withConfirm('Delete Match', `Delete ${m.homeTeamName} vs ${m.awayTeamName}?`, () => handleDeleteMatch(m))}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* KNOCKOUT */}
          {tab === 'knockout' && (
            <KnockoutBracket matches={knockoutMatches} />
          )}

          {/* TOP SCORERS */}
          {tab === 'scorers' && (
            <div className="glass rounded-2xl sm:rounded-3xl border border-white/5 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-white/5 flex items-center gap-3">
                <Target className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-black uppercase tracking-widest">Top Goal Scorers</h3>
              </div>
              {topScorers.length === 0 ? (
                <div className="py-16 flex flex-col items-center text-center">
                  <Target className="w-10 h-10 text-slate-700 mb-3 opacity-20" />
                  <p className="text-slate-600 font-black uppercase tracking-widest text-xs">No goals recorded yet</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {topScorers.map((s, i) => (
                    <motion.div
                      key={s.playerId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-4 px-4 sm:px-6 py-3 sm:py-4 hover:bg-white/3 transition-colors"
                    >
                      <div className="w-8 text-center shrink-0">
                        {i === 0 ? <Medal className="w-5 h-5 text-amber-400 mx-auto" />
                          : i === 1 ? <Medal className="w-5 h-5 text-slate-400 mx-auto" />
                          : i === 2 ? <Medal className="w-5 h-5 text-amber-700 mx-auto" />
                          : <span className="text-xs font-black text-slate-600">{i + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm font-black uppercase tracking-tight truncate">{s.playerName}</p>
                        <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate">{s.teamName}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Target className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-lg sm:text-xl font-black tabular-nums text-white">{s.goals}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </>
  );
}
