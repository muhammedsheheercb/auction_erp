import { getTeams } from '@/actions/teamActions';
import SquadView from '@/components/SquadView';
import { Users } from 'lucide-react';

export default async function SquadPage() {
  const teams = await getTeams();

  return (
    <div className="pt-24 pb-12 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-amber-500 mb-2 sm:mb-3">
            Cheloor Super League · Season 7
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Team <span className="text-emerald-500">Squads</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-3 sm:mt-4">
            Official Season 7 Line-ups
          </p>
        </div>

        {teams.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-center">
            <Users className="w-20 h-20 text-slate-700 mb-6 opacity-20" />
            <h3 className="text-xl font-black uppercase tracking-widest text-slate-500">No Squads Formed</h3>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-tight mt-2">
              Teams will appear here once they are registered.
            </p>
          </div>
        ) : (
          <SquadView teams={teams} />
        )}
      </div>
    </div>
  );
}
