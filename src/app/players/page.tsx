import { getPlayers } from '@/actions/playerActions';
import PlayerForm from '@/components/PlayerForm';
import PlayerCard from '@/components/PlayerCard';

export default async function PlayersPage() {
  const players = await getPlayers();
  const nextNumber = players.length + 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
      <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
        <div className="w-full lg:w-1/3">
          <div className="sticky top-24">
            <h2 className="text-2xl md:text-3xl font-black mb-6 gradient-text tracking-tighter uppercase italic">Scout Registry</h2>
            <PlayerForm nextNumber={nextNumber} />
          </div>
        </div>
        
        <div className="w-full lg:w-2/3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Registered Prospects ({players.length}/80)</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            {players.map((player: any) => (
              <PlayerCard key={player._id} player={player} />
            ))}
            {players.length === 0 && (
              <div className="col-span-full text-center py-20 glass rounded-2xl border-dashed border-2 border-white/10">
                <p className="text-muted-foreground">No players registered yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
