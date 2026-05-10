'use client'

export default function TeamsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 flex flex-col items-center justify-center text-center">
      <h2 className="text-2xl font-black uppercase tracking-tighter text-red-400 mb-4">Failed to load franchises</h2>
      <p className="text-sm font-bold text-slate-500 uppercase tracking-tight mb-8">A server error occurred. Check your connection and try again.</p>
      <button
        onClick={reset}
        className="px-6 py-3 bg-emerald-600 text-white font-black uppercase tracking-widest text-xs rounded-full hover:bg-emerald-500 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
