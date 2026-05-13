import { getTournamentData } from '@/actions/matchActions';
import { isAdmin as checkAdmin } from '@/lib/auth';
import TournamentView from '@/components/TournamentView';

export default async function TournamentPage() {
  const [{ matches, teams }, isAdmin] = await Promise.all([
    getTournamentData(),
    checkAdmin(),
  ]);

  return (
    <div className="pt-24 pb-16 min-h-screen overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-amber-500 mb-2">
            Cheloor Super League · Season 7
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
            Tournament <span className="text-amber-500">Hub</span>
          </h1>
          <p className="text-[10px] sm:text-xs font-black text-slate-500 uppercase tracking-[0.2em] mt-3">
            Standings · Fixtures · Knockout · Top Scorers
          </p>
        </div>
        <TournamentView matches={matches} teams={teams} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
