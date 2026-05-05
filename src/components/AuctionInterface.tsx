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
    sub: 'Between the Sticks',
    emoji: '🧤',
    bgFrom: 'from-amber-950/90',
    bgTo: 'to-yellow-900/60',
    border: 'border-yellow-400/60',
    glow: 'shadow-yellow-500/50',
    textColor: 'text-yellow-400',
    animClass: 'anim-gk',
    particles: ['🧤', '✋', '🟡', '⭐'],
  },
  Defender: {
    headline: 'SIGNED!',
    sub: 'Wall of Steel',
    emoji: '🛡️',
    bgFrom: 'from-blue-950/90',
    bgTo: 'to-blue-900/60',
    border: 'border-blue-400/60',
    glow: 'shadow-blue-500/50',
    textColor: 'text-blue-400',
    animClass: 'anim-def',
    particles: ['🛡️', '🔵', '💪', '🏰'],
  },
  Midfielder: {
    headline: 'SIGNED!',
    sub: 'Engine Room',
    emoji: '⚡',
    bgFrom: 'from-purple-950/90',
    bgTo: 'to-violet-900/60',
    border: 'border-purple-400/60',
    glow: 'shadow-purple-500/50',
    textColor: 'text-purple-400',
    animClass: 'anim-mid',
    particles: ['⚡', '🟣', '🌀', '✨'],
  },
  Forward: {
    headline: 'SIGNED!',
    sub: 'Net Buster',
    emoji: '🔥',
    bgFrom: 'from-red-950/90',
    bgTo: 'to-orange-900/60',
    border: 'border-red-400/60',
    glow: 'shadow-red-500/50',
    textColor: 'text-red-400',
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
export default function AuctionInterface({ players, teams }: { players: any[], teams: any[] }) {
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

  // Max a team can bid on a PAID player.
  // GK is free, so GK signings must NOT reduce the mandatory-slot reserve —
  // only non-GK (paid) players count toward the 8-player minimum.
  const calculateMaxBid = (team: any) => {
    const slots = 10 - team.players.length;
    if (slots === 0) return 0;
    const paidCount = team.players.filter((p: any) => p.position !== 'Goalkeeper').length;
    const afterPaidBuy = paidCount + 1;          // +1 for the paid player being signed now
    const stillRequired = Math.max(0, 8 - afterPaidBuy);
    return team.remainingBudget - stillRequired * 500;
  };

  const handleSellClick = (team: any) => {
    if (!selectedPlayer) return;
    // Goalkeepers are always free regardless of the stepper value
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
    <div className="space-y-6 md:space-y-10 relative">
      <ConfirmModal
        isOpen={showBidConfirm}
        onClose={() => setShowBidConfirm(false)}
        onConfirm={executeSale}
        title="Confirm Signing?"
        message={`Assign ${selectedPlayer?.name} to ${pendingBid?.team.name} for ${pendingBid?.price} points?`}
        confirmText="Confirm Deal"
        cancelText="Cancel"
      />
      <ConfirmModal
        isOpen={showUnsoldConfirm}
        onClose={() => setShowUnsoldConfirm(false)}
        onConfirm={executeMarkUnsold}
        title="Mark as Unsold?"
        message={`Are you sure there are no bidders for ${selectedPlayer?.name}?`}
        confirmText="Accept"
        cancelText="Decline"
      />

      {/* ── Position-specific signing overlay ── */}
      <AnimatePresence>
        {signedInfo && cfg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
            className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/80 backdrop-blur-lg"
          >
            <div className="relative flex flex-col items-center w-full max-w-sm md:max-w-lg">
              {/* Particles */}
              {cfg.particles.map((emoji, i) => (
                <Particle key={i} emoji={emoji} index={i} />
              ))}

              {/* Main card */}
              <div className={`${cfg.animClass} relative bg-linear-to-br ${cfg.bgFrom} ${cfg.bgTo} border-2 ${cfg.border} rounded-[2.5rem] overflow-hidden shadow-2xl ${cfg.glow} w-full`}>

                {/* X close icon — top right corner of card */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => { setSignedInfo(null); setSearchNumber(''); }}
                  className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center hover:bg-black/70 active:scale-95 transition-all"
                  aria-label="Close"
                >
                  <X className="w-5 h-5 text-white" />
                </motion.button>

                {/* Player photo — tall, fills card width */}
                <div className="relative h-64 md:h-88 w-full overflow-hidden">
                  <img
                    src={signedInfo.playerPhoto}
                    alt={signedInfo.name}
                    className="w-full h-full object-cover object-top"
                  />
                  {/* dark gradient from bottom */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />

                  {/* position emoji — top left */}
                  <motion.span
                    initial={{ scale: 0, rotate: -30 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 260 }}
                    className="absolute top-4 left-4 text-5xl drop-shadow-lg select-none"
                  >
                    {cfg.emoji}
                  </motion.span>

                  {/* Player name + position — bottom of photo */}
                  <div className="absolute bottom-4 left-5 right-5">
                    <motion.h2
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none text-white drop-shadow-xl"
                    >
                      {signedInfo.name}
                    </motion.h2>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.52 }}
                      className={`text-xs font-black uppercase tracking-widest mt-1 ${cfg.textColor}`}
                    >
                      #{signedInfo.number} · {signedInfo.position}
                    </motion.p>
                  </div>
                </div>

                {/* Info section */}
                <div className="px-6 md:px-8 pt-5 pb-7">
                  {/* SIGNED / GOAL headline */}
                  <motion.h1
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, type: 'spring', stiffness: 220 }}
                    className={`text-6xl md:text-7xl font-black italic tracking-tighter text-center leading-none ${cfg.textColor} mb-1`}
                  >
                    {cfg.headline}
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.48 }}
                    className="text-[11px] font-black text-white/40 uppercase tracking-[0.25em] text-center mb-5"
                  >
                    {cfg.sub}
                  </motion.p>

                  {/* Team + price row */}
                  <motion.div
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl px-4 md:px-5 py-3 md:py-4"
                  >
                    {/* Team logo */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 overflow-hidden">
                      {signedInfo.teamLogo ? (
                        <img
                          src={signedInfo.teamLogo}
                          alt={signedInfo.teamName}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <span className="text-2xl">🏆</span>
                      )}
                    </div>

                    {/* Team name */}
                    <div className="text-left min-w-0 flex-1">
                      <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Signed to</p>
                      <p className="text-base md:text-lg font-black uppercase tracking-tighter leading-tight text-white truncate">
                        {signedInfo.teamName}
                      </p>
                    </div>

                    {/* Price */}
                    <div className={`shrink-0 px-3 py-2 rounded-xl text-xs md:text-sm font-black uppercase tracking-wide ${
                      signedInfo.price === 0
                        ? 'bg-amber-500 text-black'
                        : `border ${cfg.border} ${cfg.textColor} bg-white/10`
                    }`}>
                      {signedInfo.price === 0 ? 'FREE 🧤' : `${signedInfo.price} pts`}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Search ── */}
      <div className="max-w-lg mx-auto px-4">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 w-5 h-5 transition-transform group-focus-within:scale-110" />
          <input
            type="number"
            placeholder="Enter scout number  (1 – 66)"
            value={searchNumber}
            onChange={(e) => {
              const v = e.target.value;
              if (v === '') { setSearchNumber(''); return; }
              const n = parseInt(v);
              if (!isNaN(n)) setSearchNumber(Math.max(1, Math.min(66, n)).toString());
            }}
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl pl-14 pr-4 py-5 focus:outline-none focus:border-green-500 focus:shadow-[0_0_0_3px_rgba(34,197,94,0.15)] transition-all text-2xl font-black uppercase tracking-widest placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 px-2 md:px-4">
        {/* ── Player card ── */}
        <div className="w-full lg:w-100 shrink-0">
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div
                key={selectedPlayer._id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-[2.5rem] overflow-hidden border border-green-500/30 shadow-2xl shadow-green-950/60"
              >
                <div className="relative h-75 md:h-110 w-full">
                  <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-linear-to-t from-[#060b06] via-[#060b06]/10 to-transparent ${
                    selectedPlayer.status === 'sold'   ? 'mix-blend-normal' :
                    selectedPlayer.status === 'unsold' ? 'backdrop-grayscale' : ''
                  }`} />

                  {selectedPlayer.status !== 'available' && (
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <div className={`text-center p-8 rounded-4xl border-2 backdrop-blur-sm ${
                        selectedPlayer.status === 'sold'
                          ? 'bg-green-950/70 border-green-500/60 shadow-xl shadow-green-500/20'
                          : 'bg-red-950/70 border-red-500/60 shadow-xl shadow-red-500/20'
                      }`}>
                        <h4 className={`text-5xl font-black uppercase italic tracking-tighter mb-2 ${
                          selectedPlayer.status === 'sold' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {selectedPlayer.status === 'sold' ? 'SIGNED' : 'UNSOLD'}
                        </h4>
                        {selectedPlayer.status === 'sold' && (
                          <p className="text-base font-bold uppercase tracking-tight text-white/80">
                            to {teams.find(t => t._id === selectedPlayer.team)?.name}
                          </p>
                        )}
                        {selectedPlayer.status === 'unsold' && (
                          <button
                            onClick={handleRecall}
                            className="mt-4 flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black uppercase text-xs hover:bg-green-400 transition-colors mx-auto"
                          >
                            <RefreshCcw className="w-4 h-4" /> Recall to Auction
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="inline-flex items-center gap-2 bg-green-600 text-black text-[10px] font-black px-3 py-1 rounded-full mb-2 uppercase tracking-widest">
                      PROSPECT #{selectedPlayer.number}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter leading-none mb-1 drop-shadow-lg">
                      {selectedPlayer.name}
                    </h2>
                    <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                      selectedPlayer.position === 'Goalkeeper' ? 'badge-gk' :
                      selectedPlayer.position === 'Defender'   ? 'badge-def' :
                      selectedPlayer.position === 'Midfielder' ? 'badge-mid' : 'badge-fwd'
                    }`}>
                      {selectedPlayer.position}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-white/3 space-y-4">
                  {selectedPlayer.status === 'available' ? (
                    <>
                      {isGK && (
                        <div className="flex items-center justify-center gap-2 bg-amber-500/10 border border-amber-500/25 rounded-xl py-2 px-3">
                          <span className="text-base">🧤</span>
                          <span className="text-amber-400 font-black text-[10px] uppercase tracking-widest">Free Signing — Goalkeeper</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between bg-white/4 rounded-xl p-3">
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                          {isGK ? 'Price' : 'Current Bid'}
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            disabled={isGK}
                            onClick={() => {
                              const dec = currentBid > 2000 ? 500 : currentBid > 1000 ? 200 : 100;
                              setCurrentBid(p => Math.max(500, p - dec));
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-red-500/20 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className={`text-3xl font-black italic w-24 text-center tabular-nums select-none ${isGK ? 'text-amber-400' : ''}`}>
                            {isGK ? 'FREE' : currentBid}
                          </span>
                          <button
                            disabled={isGK}
                            onClick={() => {
                              const inc = currentBid >= 2000 ? 500 : currentBid >= 1000 ? 200 : 100;
                              const max = Math.max(...teams.map(calculateMaxBid));
                              setCurrentBid(p => Math.min(p + inc, max));
                            }}
                            className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-green-500/20 disabled:opacity-20 disabled:cursor-not-allowed rounded-lg border border-white/10 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={handleMarkUnsoldClick}
                        className="w-full py-3 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                      >
                        <Ban className="w-3.5 h-3.5" /> No Bidders — Mark Unsold
                      </button>
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                        {selectedPlayer.status === 'sold' ? 'Final Fee' : 'Status'}
                      </span>
                      <span className="text-2xl font-black italic">
                        {selectedPlayer.status === 'sold' ? selectedPlayer.soldPrice : 'UNSOLD'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[2.5rem] h-75 md:h-135 flex flex-col items-center justify-center text-white/30 border border-dashed border-white/10 p-8 text-center">
                <div className="w-16 h-16 bg-white/4 rounded-full flex items-center justify-center mb-5">
                  <Users className="w-8 h-8 text-green-500/30" />
                </div>
                <h3 className="text-base font-black uppercase tracking-widest mb-2">No Prospect Selected</h3>
                <p className="text-sm font-medium text-white/25">Enter a scout number above to open bidding.</p>
              </div>
            )}
          </AnimatePresence>
          {error && (
            <p className="mt-4 text-red-400 text-center bg-red-500/10 border border-red-500/20 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">
              {error}
            </p>
          )}
        </div>

        {/* ── Teams grid ── */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-lg font-black uppercase tracking-tighter">Active Bidders</h2>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Live Budget Tracking</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams
              .filter(team => {
                if (!selectedPlayer || selectedPlayer.status !== 'available') return true;
                // GK is free — only need a free slot
                if (isGK) return team.players.length < 10;
                return calculateMaxBid(team) >= currentBid;
              })
              .map((team) => {
                const maxBid   = calculateMaxBid(team);
                const isFull   = team.players.length >= 10;
                const isSold   = selectedPlayer?.status === 'sold';
                // GK is always affordable (free) as long as there's a slot
                const canBid   = selectedPlayer && !isFull && !isSold && (isGK || maxBid >= currentBid);

                return (
                  <div
                    key={team._id}
                    className={`glass p-5 rounded-[1.75rem] border transition-all duration-200 ${
                      isFull || isSold
                        ? 'opacity-40 grayscale pointer-events-none border-white/5'
                        : 'hover:border-green-500/40 border-white/6'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                        {team.logo
                          ? <img src={team.logo} className="w-7 h-7 object-contain" alt="" />
                          : <Trophy className="w-5 h-5 text-green-500/40" />
                        }
                      </div>
                      <div className="text-right">
                        <div className="text-base font-black text-green-400 flex items-center justify-end gap-1 leading-none">
                          <Wallet className="w-3.5 h-3.5" />{team.remainingBudget}
                        </div>
                        <div className="text-[9px] font-black text-white/30 uppercase mt-0.5 tracking-widest">budget</div>
                      </div>
                    </div>

                    <h3 className="text-base font-black uppercase tracking-tighter leading-tight truncate mb-1">
                      {team.name}
                    </h3>
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-0.5">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className={`w-2 h-2 rounded-full ${i < team.players.length ? 'bg-green-500' : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">
                        {team.players.length}/10
                      </span>
                    </div>

                    <div className="bg-white/4 rounded-lg px-3 py-2 flex justify-between items-center mb-3">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-wide">
                        {isGK ? 'GK Signing' : 'Max bid'}
                      </span>
                      <span className={`text-xs font-black italic ${isGK ? 'text-amber-400' : 'text-yellow-400'}`}>
                        {isGK ? 'FREE 🧤' : maxBid}
                      </span>
                    </div>

                    <button
                      onClick={() => handleSellClick(team)}
                      disabled={!canBid || loading}
                      className={`w-full py-3.5 rounded-xl font-black transition-all uppercase tracking-[0.15em] text-[10px] active:scale-[0.97] ${
                        canBid
                          ? isGK
                            ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-900/40'
                            : 'bg-green-600 hover:bg-green-500 text-black shadow-lg shadow-green-900/40'
                          : 'bg-white/6 text-white/25 cursor-not-allowed'
                      }`}
                    >
                      {isFull ? 'Squad Full' : isSold ? 'Already Signed' : isGK ? '🧤 Sign Free' : 'Place Bid'}
                    </button>
                  </div>
                );
              })}
          </div>

          {teams.length === 0 && (
            <div className="glass rounded-4xl p-16 text-center border border-dashed border-white/10">
              <Trophy className="w-12 h-12 mx-auto mb-4 opacity-10" />
              <p className="text-white/30 font-black uppercase tracking-widest text-sm">No Teams Registered</p>
              <Link href="/teams" className="text-green-500 text-xs font-black uppercase mt-3 inline-block hover:text-green-400 transition-colors">
                Go to Team Center →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
