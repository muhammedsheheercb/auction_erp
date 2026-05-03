import { getPlayers } from '@/actions/playerActions';
import { getTeams } from '@/actions/teamActions';
import AuctionInterface from '@/components/AuctionInterface';

export default async function AuctionPage() {
  const players = await getPlayers();
  const teams = await getTeams();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-4xl font-extrabold mb-10 text-center gradient-text">LIVE AUCTION ROOM</h1>
      
      <AuctionInterface players={players} teams={teams} />
    </div>
  );
}
