import { getWinners } from '@/actions/winnerActions';
import WinnerForm from '@/components/WinnerForm';
import CubeGallery from '@/components/CubeGallery';
import { isAdmin as checkAdmin } from '@/lib/auth';

export default async function GalleryPage() {
  const winners = await getWinners();
  const isAdmin = await checkAdmin();

  return (
    <div className="relative">
      <CubeGallery winners={winners} isAdmin={isAdmin} />
      
      {isAdmin && (
        <section id="admin-controls" className="relative z-20 bg-[#020617] border-t border-white/10 py-20 px-4">
          <div className="max-w-xl mx-auto">
             <div className="mb-12 text-center">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-4">Admin Controls</h2>
               <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Add a new season champion</p>
             </div>
             <WinnerForm />
          </div>
        </section>
      )}
    </div>
  );
}
