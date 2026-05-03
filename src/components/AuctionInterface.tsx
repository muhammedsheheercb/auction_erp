'use client'

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { sellPlayer } from '@/actions/teamActions';
import { updatePlayerStatus } from '@/actions/playerActions';
import { Search, Trophy, Users, Wallet, X, Gavel, Ban, RefreshCcw, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from './ConfirmModal';

export default function AuctionInterface({ players, teams }: { players: any[], teams: any[] }) {
  const [searchNumber, setSearchNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoal, setShowGoal] = useState(false);
  const [showBidConfirm, setShowBidConfirm] = useState(false);
  const [showUnsoldConfirm, setShowUnsoldConfirm] = useState(false);
  const [pendingBid, setPendingBid] = useState<{ team: any, price: number } | null>(null);
  const [currentBid, setCurrentBid] = useState(500);

  const selectedPlayer = useMemo(() => {
    if (!searchNumber) return null;
    return players.find(p => p.number === parseInt(searchNumber));
  }, [searchNumber, players]);

  useEffect(() => {
    if (selectedPlayer && selectedPlayer.status === 'available') {
      setCurrentBid(500);
    }
  }, [selectedPlayer?._id]);

  const calculateMaxBid = (team: any) => {
    const slotsRemaining = 9 - team.players.length;
    if (slotsRemaining === 0) return 0;
    return team.remainingBudget - ((slotsRemaining - 1) * 500);
  };

  const handleSellClick = (team: any) => {
    if (!selectedPlayer) return;
    setPendingBid({ team, price: currentBid });
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
        setShowGoal(true);
        setTimeout(() => {
          setShowGoal(false);
          setSearchNumber('');
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setPendingBid(null);
    }
  };

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

      <AnimatePresence>
        {showGoal && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none bg-black/60 backdrop-blur-sm"
          >
            <div className="text-center">
              <motion.div 
                animate={{ rotate: [0, -5, 5, -5, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="bg-green-600 text-black font-black text-6xl md:text-9xl px-12 md:px-20 py-6 md:py-10 rounded-full shadow-[0_0_100px_rgba(34,197,94,0.6)] border-8 border-white mb-4"
              >
                GOAL!!!
              </motion.div>
              <div className="text-white font-black text-2xl md:text-4xl uppercase italic tracking-tighter drop-shadow-lg">
                Player Signed!
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Section */}
      <div className="max-w-lg mx-auto px-4">
        <div className="relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500 w-6 h-6 group-focus-within:scale-110 transition-transform" />
          <input
            type="number"
            placeholder="ENTER SCOUT NUMBER (1-66)"
            value={searchNumber}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '') {
                setSearchNumber('');
                return;
              }
              const num = parseInt(val);
              if (!isNaN(num)) {
                setSearchNumber(Math.max(1, Math.min(66, num)).toString());
              }
            }}
            className="w-full bg-white/5 border-2 border-white/10 rounded-2xl pl-14 pr-4 py-5 focus:outline-none focus:border-green-500 transition-all text-2xl font-black uppercase tracking-widest placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 md:gap-12 px-2 md:px-4">
        {/* Selected Player Card */}
        <div className="w-full lg:w-[400px] shrink-0">
          <AnimatePresence mode="wait">
            {selectedPlayer ? (
              <motion.div
                key={selectedPlayer._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass rounded-[2.5rem] overflow-hidden border-2 border-green-500/50 shadow-2xl shadow-green-500/10"
              >
                <div className="relative h-[300px] md:h-[450px] w-full">
                  <img src={selectedPlayer.photo} alt={selectedPlayer.name} className="w-full h-full object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t from-[#050a05] via-[#050a05]/20 to-transparent ${selectedPlayer.status === 'sold' ? 'bg-red-900/40 backdrop-grayscale' : selectedPlayer.status === 'unsold' ? 'bg-gray-900/60 backdrop-blur-sm' : ''}`} />
                  
                  {/* Status Overlay for Sold/Unsold */}
                  {selectedPlayer.status !== 'available' && (
                    <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                      <div className={`p-8 rounded-[2rem] border-2 shadow-2xl ${selectedPlayer.status === 'sold' ? 'bg-green-600/20 border-green-500 shadow-green-500/20' : 'bg-red-600/20 border-red-500 shadow-red-500/20'}`}>
                        <h4 className={`text-5xl font-black uppercase italic tracking-tighter mb-2 ${selectedPlayer.status === 'sold' ? 'text-green-500' : 'text-red-500'}`}>
                          {selectedPlayer.status === 'sold' ? 'SIGNED' : 'UNSOLD'}
                        </h4>
                        {selectedPlayer.status === 'sold' && (
                          <p className="text-xl font-bold uppercase tracking-tight text-white">
                            TO {teams.find(t => t._id === selectedPlayer.team)?.name}
                          </p>
                        )}
                        {selectedPlayer.status === 'unsold' && (
                          <button 
                            onClick={handleRecall}
                            className="mt-4 flex items-center gap-2 bg-white text-black px-6 py-2 rounded-full font-black uppercase text-xs hover:bg-green-500 transition-colors mx-auto"
                          >
                            <RefreshCcw className="w-4 h-4" /> Recall to Auction
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-8 left-8 right-8">
                    <div className="bg-green-600 text-black text-[10px] font-black px-4 py-1.5 rounded-full mb-3 w-fit uppercase tracking-widest">
                      PROSPECT #{selectedPlayer.number}
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none mb-1">{selectedPlayer.name}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-green-400 font-black uppercase text-sm tracking-widest">{selectedPlayer.position}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-white/5 space-y-4">
                  {selectedPlayer.status === 'available' ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Current Bidding</span>
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => {
                              let decrement = 100;
                              if (currentBid > 2000) decrement = 500;
                              else if (currentBid > 1000) decrement = 200;
                              setCurrentBid(prev => Math.max(500, prev - decrement));
                            }}
                            className="p-2 bg-white/5 hover:bg-red-500/20 rounded-lg transition-colors border border-white/10"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          
                          <div className="text-4xl font-black text-white italic w-32 text-center select-none">
                            {currentBid}
                          </div>

                          <button 
                            onClick={() => {
                              let increment = 100;
                              if (currentBid >= 2000) increment = 500;
                              else if (currentBid >= 1000) increment = 200;
                              
                              const absoluteMax = Math.max(...teams.map(t => calculateMaxBid(t)));
                              setCurrentBid(prev => Math.min(prev + increment, absoluteMax));
                            }}
                            className="p-2 bg-white/5 hover:bg-green-500/20 rounded-lg transition-colors border border-white/10"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={handleMarkUnsoldClick}
                        className="w-full py-3 border-2 border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" /> No Bidders - Mark Unsold
                      </button>
                    </>
                  ) : (
                    <div className="flex justify-between items-center py-2 border-t border-white/5">
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {selectedPlayer.status === 'sold' ? 'Final Fee' : 'Status'}
                      </span>
                      <span className="text-2xl font-black italic text-white">
                        {selectedPlayer.status === 'sold' ? selectedPlayer.soldPrice : 'UNSOLD'}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <div className="glass rounded-[2.5rem] h-[300px] md:h-[550px] flex flex-col items-center justify-center text-muted-foreground border-dashed border-2 border-white/10 p-8 text-center">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                  <Users className="w-10 h-10 opacity-20 text-green-500" />
                </div>
                <h3 className="text-lg font-black uppercase tracking-widest mb-2 text-white/40">No Prospect Selected</h3>
                <p className="text-sm font-medium">Enter a scout number above to view details and open bidding.</p>
              </div>
            )}
          </AnimatePresence>
          {error && <p className="mt-4 text-red-500 text-center bg-red-500/10 py-3 rounded-2xl text-xs font-black uppercase tracking-widest">{error}</p>}
        </div>

        {/* Teams Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6 px-2">
            <h2 className="text-xl font-black uppercase tracking-tighter">Active Bidders</h2>
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Live Budget Tracking
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {teams
              .filter(team => {
                if (!selectedPlayer || selectedPlayer.status !== 'available') return true;
                return calculateMaxBid(team) >= currentBid;
              })
              .map((team) => {
                const maxBid = calculateMaxBid(team);
                const isFull = team.players.length >= 9;
                const isPlayerSold = selectedPlayer?.status === 'sold';
                
                return (
                  <div key={team._id} className={`glass p-6 rounded-[2rem] border-2 transition-all ${isFull || isPlayerSold ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-green-500 border-white/5'}`}>
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0">
                        {team.logo ? (
                          <img src={team.logo} className="w-8 h-8 object-contain" alt="" />
                        ) : (
                          <Trophy className="w-6 h-6 text-green-500/50" />
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-green-400 flex items-center justify-end gap-1 leading-none">
                          <Wallet className="w-4 h-4" />
                          {team.remainingBudget}
                        </div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase mt-1 tracking-widest">Available</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-tight truncate">
                        {team.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex -space-x-2">
                          {[...Array(9)].map((_, i) => (
                            <div key={i} className={`w-3 h-3 rounded-full border border-[#050a05] ${i < team.players.length ? 'bg-green-500' : 'bg-white/10'}`} />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                          {team.players.length}/9
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white/5 rounded-xl p-3 mb-4 flex justify-between items-center">
                    <span className="text-[9px] font-black text-muted-foreground uppercase">Bid Limit</span>
                    <span className="text-xs font-black text-yellow-500 uppercase italic">{maxBid}</span>
                  </div>

                  <button
                    onClick={() => handleSellClick(team)}
                    disabled={!selectedPlayer || loading || isFull || maxBid < 500 || isPlayerSold}
                    className={`w-full py-4 rounded-2xl font-black transition-all uppercase tracking-[0.2em] text-[10px] ${
                      selectedPlayer && !isFull && maxBid >= 500 && !isPlayerSold
                        ? 'bg-green-600 hover:bg-green-700 text-black shadow-lg shadow-green-500/30'
                        : 'bg-white/10 text-muted-foreground'
                    }`}
                  >
                    {isFull ? 'Squad Full' : isPlayerSold ? 'Signed' : 'Place Bid'}
                  </button>
                </div>
              );
            })}
          </div>
          {teams.length === 0 && (
            <div className="glass rounded-[2rem] p-20 text-center border-dashed border-2 border-white/10">
              <Trophy className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground font-black uppercase tracking-widest">No Teams Registered</p>
              <Link href="/teams" className="text-green-500 text-xs font-black uppercase mt-4 inline-block hover:underline">Go to Team Center</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
