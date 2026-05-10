'use client'

import { useState } from 'react';
import PlayerCard from './PlayerCard';
import PlayerDownloadButton from './PlayerDownloadButton';
import { Users, Search } from 'lucide-react';

export default function PlayersClientSection({ players, isAdmin }: { players: any[], isAdmin: boolean }) {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? players.filter(p => String(p.number).includes(search.trim()))
    : players;

  return (
    <div className="flex-1">
      <div className="flex flex-col mt-0 lg:mt-10 sm:flex-row items-start sm:items-center justify-between mb-6 px-2 gap-4">
        <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-white">
          <Users className="w-8 h-8 text-emerald-500" />
          Draft Registry ({players.length}/80)
        </h2>
        <PlayerDownloadButton players={players} />
      </div>

      <div className="relative mb-8 px-2 max-w-xs">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400 pointer-events-none z-10" />
        <input
          type="number"
          min="1"
          placeholder="Search by scout number..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-base pl-10 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {filtered.map((player: any) => (
          <PlayerCard key={player._id} player={player} isAdmin={isAdmin} />
        ))}

        {filtered.length === 0 && search.trim() && (
          <div className="col-span-full py-20 glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
            <Search className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
            <h3 className="text-lg font-black uppercase tracking-widest text-slate-500 mb-2">No Match</h3>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">No player with scout number #{search}.</p>
          </div>
        )}

        {players.length === 0 && (
          <div className="col-span-full py-32 glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
            <Users className="w-16 h-16 text-slate-700 mb-6 opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">Registry Empty</h3>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">Register the first athlete to begin drafting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
