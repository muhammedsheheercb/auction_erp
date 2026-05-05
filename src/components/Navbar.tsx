'use client'

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Users, Trophy, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { name: 'Auction', href: '/auction', icon: Play },
    { name: 'Players', href: '/players', icon: Users },
    { name: 'Teams', href: '/teams', icon: Trophy },
  ];

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-5xl">
        <div className="glass rounded-2xl border border-white/10 px-4 md:px-6 py-3 shadow-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-8">
              <Link href="/" className="flex items-center gap-2 md:gap-3 group shrink-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 blur-md rounded-full group-hover:bg-amber-500/40 transition-all" />
                  <img src="/images/logo.webp" alt="CSL Logo" className="relative w-8 h-8 md:w-9 md:h-9 object-contain" />
                </div>
                <span className="text-base md:text-lg font-black tracking-tight text-white uppercase italic">
                  CSL <span className="text-amber-500">S7</span>
                </span>
              </Link>
              
              {/* Desktop Links */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.name}
                    href={link.href} 
                    className="text-slate-400 hover:text-white px-4 py-2 rounded-xl text-[13px] font-bold uppercase tracking-wider transition-all hover:bg-white/5"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 leading-none">Status</span>
                  <span className="text-[11px] font-bold text-emerald-400 leading-none mt-1">Live Room</span>
                </div>
                <div className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </div>
              </div>

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setIsOpen(true)}
                className="md:hidden p-2.5 bg-white/5 text-white rounded-xl hover:bg-white/10 transition-all active:scale-95 border border-white/10"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[200] bg-[#020617]/80 backdrop-blur-md md:hidden"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[201] w-[280px] bg-[#0f172a] border-l border-white/10 shadow-2xl md:hidden flex flex-col"
            >
              <div className="p-8 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-3">
                  <img src="/images/logo.webp" alt="CSL Logo" className="w-8 h-8 object-contain" />
                  <span className="text-base font-black italic text-white">CSL S7</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-6 space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                >
                  <Home className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
                  <span className="text-sm font-black uppercase tracking-widest">Dashboard</span>
                </Link>
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-4 px-4 py-4 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-white transition-all group"
                    >
                      <Icon className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
                      <span className="text-sm font-black uppercase tracking-widest">{link.name}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="p-8 border-t border-white/5">
                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                  <div className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </div>
                  <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Auction System Online</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
