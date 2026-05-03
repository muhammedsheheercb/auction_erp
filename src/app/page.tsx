import Link from 'next/link';
import { Trophy, Users, Play, ShieldCheck } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16 max-w-4xl">
        <div className="flex justify-center mb-8">
          <img src="/images/logo.webp" alt="CSL Logo" className="w-24 h-24 md:w-32 md:h-32 object-contain animate-pulse" />
        </div>
        <div className="inline-block px-4 py-1.5 mb-6 text-[10px] md:text-sm font-black tracking-[0.3em] text-green-400 uppercase bg-green-400/10 border border-green-400/20 rounded-full">
          SEASON 7 • OFFICIAL DRAFT
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 gradient-text tracking-tighter italic leading-none">
          CHELEOR <br /> SUPER LEAGUE
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium px-4">
          The ultimate ISL-style football draft. Strategize, bid, and assemble your elite squad for the most anticipated season yet.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4 px-6">
          <Link 
            href="/auction" 
            className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-black px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black transition-all shadow-2xl shadow-green-500/20 uppercase tracking-widest italic w-full sm:w-auto"
          >
            <Play className="w-5 h-5 fill-current" />
            Enter Draft
          </Link>
          <Link 
            href="/teams" 
            className="flex items-center justify-center gap-2 glass hover:bg-white/10 text-white px-8 md:px-10 py-4 md:py-5 rounded-2xl font-black transition-all uppercase tracking-widest w-full sm:w-auto"
          >
            <Trophy className="w-5 h-5" />
            Manage Teams
          </Link>
        </div>
      </div>

      {/* Stats/Features - Mobile Friendly Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-6xl w-full px-4">
        <div className="glass p-8 md:p-10 rounded-[2.5rem] card-hover border-b-8 border-b-green-600">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 border border-green-500/30">
            <Trophy className="w-6 h-6 md:w-7 md:h-7 text-green-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-3 uppercase tracking-tighter">Elite Teams</h3>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Create and manage custom team rosters with detailed manager oversight.</p>
        </div>
        
        <div className="glass p-8 md:p-10 rounded-[2.5rem] card-hover border-b-8 border-b-yellow-500">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-yellow-500/20 rounded-2xl flex items-center justify-center mb-6 border border-yellow-500/30">
            <Users className="w-6 h-6 md:w-7 md:h-7 text-yellow-500" />
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-3 uppercase tracking-tighter">Player Pool</h3>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Scout from 66 registered prospects, each with unique positions and stats.</p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[2.5rem] card-hover border-b-8 border-b-green-400">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-green-400/20 rounded-2xl flex items-center justify-center mb-6 border border-green-400/30">
            <Play className="w-6 h-6 md:w-7 md:h-7 text-green-400" />
          </div>
          <h3 className="text-xl md:text-2xl font-black mb-3 uppercase tracking-tighter">Live Draft</h3>
          <p className="text-sm md:text-base text-muted-foreground font-medium">Real-time bidding system with automated max-bid safety limits.</p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="mt-20 text-center">
        <div className="flex items-center justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all">
          {/* Mock logos or text */}
          <span className="font-black text-2xl">IPL STYLE</span>
          <span className="font-black text-2xl">ERP PRO</span>
          <span className="font-black text-2xl">DRAFT 2026</span>
        </div>
      </div>
    </div>
  );
}
