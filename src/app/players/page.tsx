import { getPlayers } from '@/actions/playerActions';
import PlayerForm from '@/components/PlayerForm';
import PlayerCard from '@/components/PlayerCard';
import { Users } from 'lucide-react';
import { isAdmin as checkAdmin } from '@/lib/auth';
import PlayerDownloadButton from '@/components/PlayerDownloadButton';

export default async function PlayersPage() {
  const players = await getPlayers();
  const nextNumber = players.length + 1;
  const isAdmin = await checkAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="lg:sticky mt-16 lg:top-32">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">Athlete<br /><span className="text-amber-500">Registry</span></h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Manage and enroll scouting prospects</p>
            {isAdmin ? (
              <PlayerForm nextNumber={nextNumber} />
            ) : (
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                  Authentication required to enroll new athletes.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1">
          <div className="flex flex-col mt-0 lg:mt-10 sm:flex-row items-start sm:items-center justify-between mb-10 px-2 gap-4">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3 text-white">
              <Users className="w-8 h-8 text-emerald-500" />
              Draft Registry ({players.length}/80)
            </h2>
            <PlayerDownloadButton players={players} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
            {players.map((player: any) => (
              <PlayerCard key={player._id} player={player} isAdmin={isAdmin} />
            ))}
            {players.length === 0 && (
              <div className="col-span-full py-32 glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
                <Users className="w-16 h-16 text-slate-700 mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">Registry Empty</h3>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">Register the first athlete to begin drafting.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
