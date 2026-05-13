"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Star, Crown, Trash2 } from "lucide-react";
import { deleteWinner } from "@/actions/winnerActions";

interface Winner {
  _id: string;
  teamName: string;
  photo: string;
  season: string;
}

export default function WinnersGallery({
  winners,
  isAdmin,
}: {
  winners: Winner[];
  isAdmin: boolean;
}) {
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntroModal(true), 400);
    return () => clearTimeout(timer);
  }, []);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await deleteWinner(id);
    } finally {
      setDeleting(null);
    }
  }

  return (
    <>
      {/* ── Intro Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showIntroModal && (
          <div className="fixed inset-0 z-300 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntroModal(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative max-w-md w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image */}
              <div className="relative h-70 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1713711437837-2a0b10631709?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  alt="Champions"
                  className="w-full h-full object-cover"
                />
                {/* Bottom gradient fade into quote section */}
                <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-[#020617]/40 to-transparent" />

                {/* Trophy icon badge */}
                <div className="absolute top-5 left-5 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400/50">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-black">
                    Hall of Fame
                  </span>
                </div>
              </div>

              {/* Quote section */}
              <div className="bg-[#020617] px-8 pb-10 pt-4 border-t border-white/5">
                {/* Opening quote mark */}
                <div className="text-amber-500/60 text-6xl font-serif leading-none mb-1 -ml-1">"</div>

                <blockquote className="text-base md:text-[17px] font-black italic text-white leading-snug tracking-tight mb-5">
                  No one remembers the team that finished second. Football remembers the champions — so train harder, fight stronger, and play to lift the trophy.
                </blockquote>

                <div className="flex items-center gap-3 mb-7">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] shrink-0">
                    The eternal truth of champions
                  </p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={() => setShowIntroModal(false)}
                  className="w-full py-4 rounded-2xl btn-primary text-[11px] font-black uppercase tracking-[0.25em] active:scale-95"
                >
                  Enter the Hall of Fame
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowIntroModal(false)}
                className="absolute top-5 right-5 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all backdrop-blur-sm border border-white/10 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Gallery header ─────────────────────────────────── */}
      <div className="flex items-center gap-3 mt-0 lg:mt-10 mb-10 px-2">
        <Trophy className="w-8 h-8 text-amber-500" />
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic">
          Hall of Champions ({winners.length})
        </h2>
      </div>

      {/* ── Gallery grid ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
        {winners.map((winner) => (
          <motion.div
            key={winner._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[2.5rem] overflow-hidden border border-white/10 group relative"
          >
            {/* Photo */}
            <div className="relative h-52 overflow-hidden bg-slate-900">
              <img
                src={winner.photo}
                alt={winner.teamName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#020617] via-transparent to-transparent" />

              {/* Champion badge */}
              <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400/50">
                <Crown className="w-3 h-3 text-black" />
                <span className="text-[9px] font-black uppercase tracking-widest text-black">
                  Champion
                </span>
              </div>

              {/* Admin delete */}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(winner._id)}
                  disabled={deleting === winner._id}
                  className="absolute top-4 right-4 p-2 bg-rose-500/80 text-white rounded-xl hover:bg-rose-500 transition-all active:scale-90 backdrop-blur-sm opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Card info */}
            <div className="p-6">
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] mb-1">
                {winner.season}
              </p>
              <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">
                {winner.teamName}
              </h3>
              <div className="flex items-center gap-1 mt-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3 h-3 text-amber-500 fill-amber-500" />
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {winners.length === 0 && (
          <div className="col-span-full py-32 glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
            <Trophy className="w-16 h-16 text-slate-700 mb-6 opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">
              No Champions Yet
            </h3>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">
              The glory wall awaits its first champion.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
