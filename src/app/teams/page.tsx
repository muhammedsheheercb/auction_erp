import { getTeams } from '@/actions/teamActions';
import TeamForm from '@/components/TeamForm';
import { Trophy } from 'lucide-react';
import TeamCard from '@/components/TeamCard';

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="lg:sticky lg:top-32">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">Franchise<br /><span className="text-emerald-500">Center</span></h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">Authorize and manage Season 7 participants</p>
            <TeamForm />
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between mb-10 px-2">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic flex items-center gap-3">
              <Trophy className="w-8 h-8 text-amber-500" />
              Authorized Franchises ({teams.length})
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {teams.map((team: any) => (
              <TeamCard key={team._id} team={team} />
            ))}
            {teams.length === 0 && (
              <div className="col-span-full py-32 glass rounded-[3rem] border-dashed border-white/10 flex flex-col items-center justify-center text-center px-10">
                <Trophy className="w-16 h-16 text-slate-700 mb-6 opacity-20" />
                <h3 className="text-xl font-black uppercase tracking-widest text-slate-500 mb-2">No Franchises Detected</h3>
                <p className="text-sm font-bold text-slate-600 uppercase tracking-tight">Register a team to begin the Season 7 draft.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
