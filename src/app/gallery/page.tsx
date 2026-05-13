import { getWinners } from '@/actions/winnerActions';
import WinnerForm from '@/components/WinnerForm';
import WinnersGallery from '@/components/WinnersGallery';
import { isAdmin as checkAdmin } from '@/lib/auth';

export default async function GalleryPage() {
  const winners = await getWinners();
  const isAdmin = await checkAdmin();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="flex flex-col lg:flex-row gap-12 md:gap-16">
        {/* Sidebar */}
        <div className="w-full lg:w-[400px] shrink-0">
          <div className="lg:sticky mt-16 lg:top-32">
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none mb-4">
              Champions<br />
              <span className="text-amber-500">Gallery</span>
            </h1>
            <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-10">
              Immortalizing season champions
            </p>

            {isAdmin ? (
              <WinnerForm />
            ) : (
              <div className="glass p-8 rounded-[2.5rem] border border-white/5 text-center">
                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest leading-relaxed">
                  Admin access required to add champions.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        <div className="flex-1">
          <WinnersGallery winners={winners} isAdmin={isAdmin} />
        </div>
      </div>
    </div>
  );
}
