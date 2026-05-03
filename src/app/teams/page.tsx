import { getTeams } from '@/actions/teamActions';
import TeamForm from '@/components/TeamForm';
import { Trophy } from 'lucide-react';
import TeamCard from '@/components/TeamCard';

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <h1 className="text-3xl md:text-4xl font-black gradient-text tracking-tighter mb-2 uppercase italic">Team Center</h1>
            <p className="text-sm text-muted-foreground mb-6 font-medium">Register your squad for Season 7.</p>
            <TeamForm />
          </div>
        </div>
        
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Registered Teams ({teams.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
            {teams.map((team: any) => (
              <TeamCard key={team._id} team={team} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
