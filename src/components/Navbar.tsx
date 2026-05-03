import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <img src="/images/logo.webp" alt="CSL Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-black gradient-text tracking-tighter uppercase italic">Cheleor SL S7</span>
            </Link>
            <div className="hidden md:block ml-10 flex items-baseline space-x-4">
              <Link href="/auction" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Auction Room
              </Link>
              <Link href="/players" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Players
              </Link>
              <Link href="/teams" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Teams
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Live Auction
            </div>
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    </nav>
  );
}
