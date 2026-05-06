import { getPlayers } from '@/actions/playerActions';
import { getTeams } from '@/actions/teamActions';
import AuctionInterface from '@/components/AuctionInterface';
import { isAdmin as checkAdmin } from '@/lib/auth';

export default async function AuctionPage() {
  const players = await getPlayers();
  const teams = await getTeams();
  const isAdmin = await checkAdmin();

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
      <div className="flex flex-col items-center text-center mb-16 md:mb-24">
        <div className="inline-flex mt-10 items-center gap-2 px-3 py-1 bg-rose-500/10 border border-rose-500/20 rounded-full mb-6">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em]">Live Session Active</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-none">
          Live Auction <span className="text-amber-500">Arena</span>
        </h1>
        <p className="mt-6 text-xs font-black text-slate-500 uppercase tracking-[0.4em] max-w-lg">
          Cheleer Super League Season 7 Draft Room
        </p>
      </div>

      <AuctionInterface players={players} teams={teams} isAdmin={isAdmin} />
    </div>
  );
}
