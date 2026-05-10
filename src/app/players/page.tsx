import { getPlayers } from '@/actions/playerActions';
import PlayerForm from '@/components/PlayerForm';
import { isAdmin as checkAdmin } from '@/lib/auth';
import PlayersClientSection from '@/components/PlayersClientSection';

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

        <PlayersClientSection players={players} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
