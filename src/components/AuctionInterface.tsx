'use client'

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sellPlayer } from '@/actions/teamActions';
import { updatePlayerStatus } from '@/actions/playerActions';
import { Search, Trophy, Users, Wallet, Ban, RefreshCcw, Plus, Minus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

/* ── Position-specific signing config ──────────────────────── */
type Position = 'Goalkeeper' | 'Defender' | 'Midfielder' | 'Forward';

const SIGN_CONFIG: Record<Position, {
  headline: string;
  sub: string;
  emoji: string;
  bgFrom: string;
  bgTo: string;
  border: string;
  glow: string;
  textColor: string;
  animClass: string;
  particles: string[];
}> = {
  Goalkeeper: {
    headline: 'SIGNED!',
    sub: 'THE GUARDIAN',
    emoji: '🧤',
    bgFrom: 'from-amber-950/90',
    bgTo: 'to-amber-900/60',
    border: 'border-amber-400/60',
    glow: 'shadow-amber-500/30',
    textColor: 'text-amber-400',
    animClass: 'anim-gk',
    particles: ['🧤', '✋', '🟡', '⭐'],
  },
  Defender: {
    headline: 'SIGNED!',
    sub: 'THE DEFENDER',
    emoji: '🛡️',
    bgFrom: 'from-blue-950/90',
    bgTo: 'to-blue-900/60',
    border: 'border-blue-400/60',
    glow: 'shadow-blue-500/30',
    textColor: 'text-blue-400',
    animClass: 'anim-def',
    particles: ['🛡️', '🔵', '💪', '🏰'],
  },
  Midfielder: {
    headline: 'SIGNED!',
    sub: 'THE MAESTRO',
    emoji: '⚡',
    bgFrom: 'from-emerald-950/90',
    bgTo: 'to-emerald-900/60',
    border: 'border-emerald-400/60',
    glow: 'shadow-emerald-500/30',
    textColor: 'text-emerald-400',
    animClass: 'anim-mid',
    particles: ['⚡', '🟢', '🌀', '✨'],
  },
  Forward: {
    headline: 'SIGNED!',
    sub: 'THE STRIKER',
    emoji: '🔥',
    bgFrom: 'from-rose-950/90',
    bgTo: 'to-rose-900/60',
    border: 'border-rose-400/60',
    glow: 'shadow-rose-500/30',
    textColor: 'text-rose-400',
    animClass: 'anim-fwd',
    particles: ['🔥', '⚽', '🎯', '💥', '🏆'],
  },
};

/* ── Particle component ─────────────────────────────────────── */
function Particle({ emoji, index }: { emoji: string; index: number }) {
  const angle = (index / 5) * 360 + Math.random() * 40;
  const dist  = 160 + Math.random() * 120;
  const x = Math.cos((angle * Math.PI) / 180) * dist;
  const y = Math.sin((angle * Math.PI) / 180) * dist;

  return (
    <motion.div
      className="absolute text-3xl pointer-events-none select-none"
      style={{ top: '50%', left: '50%' }}
      initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
      animate={{ x, y, scale: [0, 1.4, 0.8], opacity: [1, 1, 0] }}
      transition={{ duration: 1.2, delay: 0.25 + index * 0.06, ease: 'easeOut' }}
    >
      {emoji}
    </motion.div>
  );
}

/* ── Main component ─────────────────────────────────────────── */
export default function AuctionInterface({ players, teams, isAdmin }: { players: any[], teams: any[], isAdmin: boolean }) {
  const [searchNumber, setSearchNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signedInfo, setSignedInfo] = useState<{
    name: string;
    number: number;
    position: Position;
    playerPhoto: string;
    teamName: string;
    teamLogo: string;
    price: number;
  } | null>(null);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [showUnsoldConfirm, setShowUnsoldConfirm] = useState(false);
  const [pendingBid, setPendingBid] = useState<{ team: any; price: number } | null>(null);
  const [currentBid, setCurrentBid] = useState(500);

  const selectedPlayer = useMemo(() => {
    if (!searchNumber) return null;
    return players.find(p => p.number === parseInt(searchNumber));
  }, [searchNumber, players]);

  useEffect(() => {
    if (selectedPlayer?.status === 'available') {
      setCurrentBid(selectedPlayer.position === 'Goalkeeper' ? 0 : 500);
    }
  }, [selectedPlayer?._id]);

  const isGK = selectedPlayer?.position === 'Goalkeeper';

  const calculateMaxBid = (team: any) => {
    const slots = 9 - team.players.length;
    if (slots === 0) return 0;
    const paidCount = team.players.filter((p: any) => p.position !== 'Goalkeeper').length;
    const afterPaidBuy = paidCount + 1;
    const stillRequired = Math.max(0, 8 - afterPaidBuy);
    return team.remainingBudget - stillRequired * 500;
  };

  const handleSellClick = (team: any) => {
    if (!selectedPlayer) return;
    const price = selectedPlayer.position === 'Goalkeeper' ? 0 : currentBid;
    setPendingBid({ team, price });
    setShowBidConfirm(true);
  };

  const handleMarkUnsoldClick = () => {
    if (!selectedPlayer) return;
    setShowUnsoldConfirm(true);
  };

  const executeMarkUnsold = async () => {
    if (!selectedPlayer) return;
    setLoading(true);
    try {
      await updatePlayerStatus(selectedPlayer._id, 'unsold');
      setSearchNumber('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecall = async () => {
    if (!selectedPlayer) return;
    setLoading(true);
    try {
      await updatePlayerStatus(selectedPlayer._id, 'available');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const executeSale = async () => {
    if (!selectedPlayer || !pendingBid) return;
    setLoading(true);
    setError(null);
    try {
      const res = await sellPlayer(selectedPlayer._id, pendingBid.team._id, pendingBid.price);
      if (res.success) {
        setSignedInfo({
          name: selectedPlayer.name,
          number: selectedPlayer.number,
          position: selectedPlayer.position as Position,
          playerPhoto: selectedPlayer.photo,
          teamName: pendingBid.team.name,
          teamLogo: pendingBid.team.logo || '',
          price: pendingBid.price,
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPendingBid(null);
    }
  };

  const cfg = signedInfo ? (SIGN_CONFIG[signedInfo.position] ?? SIGN_CONFIG.Forward) : null;

  return (
    <div className="space-y-8 md:space-y-12 relative">
      <ConfirmModal
        isOpen={showBidConfirm}
        onClose={() => setShowBidConfirm(false)}
        onConfirm={executeSale}
        title="Confirm Deal?"
        message={`Assign ${selectedPlayer?.name} to ${pendingBid?.team.name} for ${pendingBid?.price} points?`}
        confirmText="Finalize Signing"
        cancelText="Cancel"
      />
      <ConfirmModal
        isOpen={showUnsoldConfirm}
        onClose={() => setShowUnsoldConfirm(false)}
        onConfirm={executeMarkUnsold}
        title="No Bidders?"
        message={`Confirm that ${selectedPlayer?.name} has no interest and will be marked UNSOLD?`}
        confirmText="Confirm Unsold"
        cancelText="Back"
      />

      {/* ── Position-specific signing overlay ── */}
      <AnimatePresence>
        {signedInfo && cfg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#020617]/90 backdrop-blur-2xl"
          >
            <div className="relative flex flex-col items-center w-full max-w-sm md:max-w-lg">
              {/* Particles */}
              {cfg.particles.map((emoji, i) => (
                <Particle key={i} emoji={emoji} index={i} />
              ))}

              {/* Main card */}
              <div className={`${cfg.animClass} relative bg-gradient-to-br ${cfg.bgFrom} ${cfg.bgTo} border-2 ${cfg.border} rounded-[3rem] overflow-hidden shadow-2xl ${cfg.glow} w-full`}>
                <button
                  onClick={() => { setSignedInfo(null); setSearchNumber(''); }}
                  className="absolute top-4 right-4 md:top-6 md:right-6 z-20 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center hover:bg-black/60 active:scale-95 transition-all border border-white/10"
                >
                  <X className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </button>

                <div className="relative h-56 md:h-80 w-full overflow-hidden">
                  <img
                    src={signedInfo.playerPhoto}
                    alt={signedInfo.name}
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

                    <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
                    className="absolute top-4 left-4 md:top-6 md:left-6 text-4xl md:text-6xl drop-shadow-2xl"
                  >
                    {cfg.emoji}
                  </motion.span>

                  <div className="absolute bottom-4 left-6 right-6 md:bottom-6 md:left-8 md:right-8">
                    <motion.h2
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl md:text-5xl font-black uppercase italic tracking-tighter leading-none text-white"
                    >
                      {signedInfo.name}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.52 }}
                      className={`text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mt-2 ${cfg.textColor}`}
                    >
                      #{signedInfo.number} · {signedInfo.position}
                    </motion.p>
                  </div>
                </div>

                <div className="px-6 md:px-8 pt-4 md:pt-6 pb-8 md:pb-10">
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className={`text-4xl md:text-8xl font-black italic tracking-tighter text-center leading-none ${cfg.textColor} mb-2`}
                  >
                    {cfg.headline}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.48 }}
                    className="text-[9px] md:text-xs font-black text-white/40 uppercase tracking-[0.3em] text-center mb-6 md:mb-8"
                  >
                    {cfg.sub}
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 md:gap-4 bg-white/5 border border-white/10 rounded-2xl md:rounded-[2rem] p-4 md:p-5"
                  >
                    <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {signedInfo.teamLogo ? (
                        <img src={signedInfo.teamLogo} alt="" className="w-full h-full object-contain p-2" />
                      ) : (
                        <Trophy className="w-5 h-5 md:w-8 md:h-8 text-amber-500" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-widest truncate">Joining</p>
                      <p className="text-sm md:text-xl font-black uppercase tracking-tighter text-white truncate">{signedInfo.teamName}</p>
                    </div>

                    <div className={`px-3 md:px-5 py-2 md:py-3 rounded-xl md:rounded-2xl text-[10px] md:text-base font-black uppercase tracking-wider shrink-0 ${
                      signedInfo.price === 0 ? 'bg-amber-500 text-black' : 'bg-white/10 text-white border border-white/10'
                    }`}>
                      {signedInfo.price === 0 ? 'FREE' : `${signedInfo.price} PTS`}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search ── */}
      <div className="max-w-xl mx-auto px-4">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <Search className="h-5 w-5 md:h-6 md:w-6 text-amber-500 group-focus-within:text-amber-400 transition-colors" />
          </div>
          <input
            type="number"
            placeholder="ENTER SCOUT ID (1 - 80)"
            value={searchNumber}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') { setSearchNumber(''); return; }
              const n = parseInt(v);
              if (!isNaN(n)) setSearchNumber(Math.max(1, Math.min(80, n)).toString());
            }}
            className="w-full bg-[#0f172a] border-2 border-white/5 rounded-3xl pl-12 md:pl-16 pr-6 py-4 md:py-6 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-lg md:text-3xl font-black uppercase tracking-widest placeholder:text-slate-600 shadow-2xl"
          />
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 md:gap-8 px-4">
        {/* ── Player card ── */}
        <div className="w-full xl:w-[400px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div
                key={selectedPlayer._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl"
              >
                <div className="relative h-96 md:h-[500px] w-full">
                  <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent ${
                    selectedPlayer.status === 'sold' ? '' : selectedPlayer.status === 'unsold' ? '' : ''
                  }`} />

                  {selectedPlayer.status !== 'available' && (
                    <div className="absolute inset-0 flex items-center justify-center p-8">
                      <div className={`text-center p-10 rounded-[3rem] border-2 backdrop-blur-xl ${
                        selectedPlayer.status === 'sold'
                          ? 'bg-emerald-500/10 border-emerald-500/30 shadow-2xl shadow-emerald-500/10'
                          : 'bg-rose-500/10 border-rose-500/30 shadow-2xl shadow-rose-500/10'
                      }`}>
                        <h4 className={`text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-4 ${
                          selectedPlayer.status === 'sold' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {selectedPlayer.status === 'sold' ? 'SIGNED' : 'UNSOLD'}
                        </h4>
                        {selectedPlayer.status === 'sold' && (
                          <p className="text-lg font-bold uppercase tracking-tight text-white/80">
                            TO {teams.find(t => t._id === selectedPlayer.team)?.name}
                          </p>
                        )}
                        {selectedPlayer.status === 'unsold' && (
                          <button
                            onClick={handleRecall}
                            className="mt-6 flex items-center gap-3 bg-white text-black px-8 py-3 rounded-full font-black uppercase text-xs hover:bg-amber-400 transition-all mx-auto shadow-xl"
                          >
                            <RefreshCcw className="w-4 h-4" /> Recall to Auction
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-10 left-10 right-10">
                    <div className="inline-flex items-center gap-2 bg-amber-500 text-black text-[11px] font-black px-4 py-1.5 rounded-full mb-4 uppercase tracking-[0.2em]">
                      PROSPECT #{selectedPlayer.number}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-3 text-white">
                      {selectedPlayer.name}
                    </h2>
                    <span className={`inline-block text-[11px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-lg ${
                      selectedPlayer.position === 'Goalkeeper' ? 'badge-gk' :
                      selectedPlayer.position === 'Defender'   ? 'badge-def' :
                      selectedPlayer.position === 'Midfielder' ? 'badge-mid' : 'badge-fwd'
                    }`}>
                      {selectedPlayer.position}
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {selectedPlayer.status === 'available' ? (
                    <>
                      {isGK && (
                        <div className="flex items-center justify-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl py-3 px-4">
                          <span className="text-xl">🧤</span>
                          <span className="text-amber-400 font-black text-[11px] uppercase tracking-[0.2em]">Mandatory GK — Free Signing</span>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row items-center justify-between bg-white/5 border border-white/5 rounded-2xl p-4 md:p-6 gap-4">
                        <span className="text-[10px] md:text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                          {isGK ? 'COST' : 'CURRENT BID'}
                        </span>
                        <div className="flex items-center gap-4 md:gap-6">
                          <button
                            disabled={isGK}
                            onClick={() => {
                              const dec = currentBid > 2000 ? 500 : currentBid > 1000 ? 200 : 100;
                              setCurrentBid(p => Math.max(500, p - dec));
                            }}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-rose-500/20 disabled:opacity-10 rounded-lg md:rounded-xl border border-white/10 transition-all active:scale-90"
                          >
                            <Minus className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                          <span className={`text-2xl md:text-5xl font-black italic tabular-nums w-16 md:w-28 text-center ${isGK ? 'text-amber-400' : 'text-white'}`}>
                            {isGK ? '0' : currentBid}
                          </span>
                          <button
                            disabled={isGK}
                            onClick={() => {
                              const inc = currentBid >= 2000 ? 500 : currentBid >= 1000 ? 200 : 100;
                              const max = Math.max(...teams.map(calculateMaxBid));
                              setCurrentBid(p => Math.min(p + inc, max));
                            }}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-white/5 hover:bg-emerald-500/20 disabled:opacity-10 rounded-lg md:rounded-xl border border-white/10 transition-all active:scale-90"
                          >
                            <Plus className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={handleMarkUnsoldClick}
                          className="w-full py-4 border-2 border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] transition-all flex items-center justify-center gap-3"
                        >
                          <Ban className="w-4 h-4" /> No Interest — Mark Unsold
                        </button>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-4 border-t border-white/10">
                      <span className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        {selectedPlayer.status === 'sold' ? 'ACQUISITION FEE' : 'FINAL STATUS'}
                      </span>
                      <span className="text-4xl font-black italic text-white">
                        {selectedPlayer.status === 'sold' ? `${selectedPlayer.soldPrice} PTS` : 'UNSOLD'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[3rem] h-[650px] flex flex-col items-center justify-center p-12 text-center border-dashed border-white/10">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-8 rotate-12">
                  <Users className="w-10 h-10 text-slate-700" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-4">No Data</h3>
                <p className="text-sm font-bold text-slate-600 leading-relaxed uppercase">Enter a scout number to begin the draft process.</p>
              </div>
            )}
          </AnimatePresence>
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 text-rose-400 text-center bg-rose-500/10 border border-rose-500/20 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest">
              {error}
            </motion.p>
          )}
        </div>

        {/* ── Teams grid ── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter">Franchise Hub</h2>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Budget Sync</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {teams
              .filter(team => {
                if (!selectedPlayer || selectedPlayer.status !== 'available') return true;
                if (isGK) return team.players.length < 9;
                return calculateMaxBid(team) >= currentBid;
              })
              .map((team) => {
                const maxBid   = calculateMaxBid(team);
                const isFull   = team.players.length >= 9;
                const isSold   = selectedPlayer?.status === 'sold';
                const canBid   = selectedPlayer && !isFull && !isSold && (isGK || maxBid >= currentBid);

                return (
                  <motion.div
                    key={team._id}
                    whileHover={{ y: -5 }}
                    className={`glass p-4 rounded-[2rem] border transition-all duration-300 ${
                      isFull || isSold
                        ? 'opacity-30 border-white/5'
                        : 'hover:border-amber-500/40 border-white/10'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {team.logo
                          ? <img src={team.logo} className="w-10 h-10 object-contain" alt="" />
                          : <Trophy className="w-6 h-6 text-slate-700" />
                        }
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-emerald-400 flex items-center justify-end gap-1.5 tabular-nums">
                          <Wallet className="w-4 h-4" />{team.remainingBudget}
                        </div>
                        <div className="text-[9px] font-black text-slate-500 uppercase mt-1 tracking-[0.2em]">AVAIL. PTS</div>
                      </div>
                    </div>

                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight truncate mb-1 text-white">
                      {team.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex-1 flex gap-1">
                        {[...Array(9)].map((_, i) => (
                          <div key={i} className={`flex-1 h-1 rounded-full ${i < team.players.length ? 'bg-emerald-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase">
                        {team.players.length}/9
                      </span>
                    </div>

                    <div className="bg-white/5 rounded-xl px-3 py-2 flex justify-between items-center mb-4 border border-white/5">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {isGK ? 'GK QUOTA' : 'BID CAP'}
                      </span>
                      <span className={`text-base font-black italic tabular-nums ${isGK ? 'text-amber-400' : 'text-amber-500'}`}>
                        {isGK ? 'SLOT OPEN' : maxBid}
                      </span>
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleSellClick(team)}
                        disabled={!canBid || loading}
                        className={`w-full py-3 rounded-xl font-black transition-all uppercase tracking-[0.2em] text-[10px] active:scale-95 shadow-xl ${
                          canBid
                            ? isGK
                              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/20'
                            : 'bg-white/5 text-slate-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {isFull ? 'SQUAD FULL' : isSold ? 'SOLD' : isGK ? 'SIGN FREE' : 'PLACE BID'}
                      </button>
                    )}
                    {!isAdmin && (
                      <div className="w-full py-3 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] text-center border border-white/5 bg-white/3 text-slate-600">
                        View Only Mode
                      </div>
                    )}
                  </motion.div>
                );
              })}
          </div>

          {teams.length === 0 && (
            <div className="glass rounded-[3rem] p-20 text-center border-dashed border-white/10">
              <Trophy className="w-16 h-16 mx-auto mb-6 opacity-5" />
              <p className="text-slate-600 font-black uppercase tracking-widest">No Franchises Detected</p>
              <Link href="/teams" className="text-amber-500 text-xs font-black uppercase mt-4 inline-block hover:text-amber-400 transition-all">
                Initialize Teams →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
