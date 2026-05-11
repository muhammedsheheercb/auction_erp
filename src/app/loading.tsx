export default function Loading() {
  return (
    <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#020617]">

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Football SVG — spinning */}
      <div className="relative mb-10" style={{ animation: 'spin 1.2s linear infinite' }}>
        <svg viewBox="0 0 100 100" width="80" height="80" xmlns="http://www.w3.org/2000/svg">
          {/* Ball base */}
          <circle cx="50" cy="50" r="48" fill="#0f172a" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />

          {/* Pentagon patches */}
          <polygon points="50,18 61,27 57,40 43,40 39,27" fill="#fbbf24" opacity="0.95" />
          <polygon points="22,35 34,35 38,48 28,56 18,48" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />
          <polygon points="78,35 90,48 80,56 70,48 66,35" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />
          <polygon points="30,70 20,60 28,50 42,54 42,68" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />
          <polygon points="70,70 58,68 58,54 72,50 80,60" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />
          <polygon points="50,82 40,72 44,60 56,60 60,72" fill="#1e293b" stroke="#fbbf24" strokeWidth="0.8" opacity="0.9" />

          {/* Seam lines */}
          <line x1="50" y1="40" x2="43" y2="40" stroke="#fbbf24" strokeWidth="0.6" opacity="0.4" />
          <line x1="50" y1="40" x2="57" y2="40" stroke="#fbbf24" strokeWidth="0.6" opacity="0.4" />
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        </svg>

        {/* Glow ring around ball */}
        <div className="absolute inset-0 rounded-full"
          style={{ boxShadow: '0 0 40px 8px rgba(251,191,36,0.15)', animation: 'pulse 1.2s ease-in-out infinite' }} />
      </div>

      {/* Brand */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
          CSL <span className="text-amber-500">S7</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-48 h-0.5 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full"
          style={{ animation: 'progress 1.2s ease-in-out infinite' }} />
      </div>

      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">
        Loading Draft Room
      </p>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 1; }
        }
        @keyframes progress {
          0%   { width: 0%;    margin-left: 0%; }
          50%  { width: 60%;   margin-left: 20%; }
          100% { width: 0%;    margin-left: 100%; }
        }
      `}</style>
    </div>
  );
}
