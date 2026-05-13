'use client'

export default function TournamentError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-rose-400 mb-4">Failed to load tournament</h2>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-8">A server error occurred. Check your connection and try again.</p>
      <button onClick={reset} className="px-6 py-3 bg-amber-500 text-black font-black uppercase tracking-widest text-xs rounded-full hover:bg-amber-400 transition-colors">
        Try again
      </button>
    </div>
  );
}
