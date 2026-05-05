"use client";

import Link from "next/link";
import { Trophy, Users, Play, ArrowRight, Zap, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ── Background Imagery ──────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/80 to-[#020617] z-10" />
        <img
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2093&auto=format&fit=crop"
          alt="Stadium Background"
          className="h-full w-full object-cover opacity-30 scale-105 animate-pulse-slow"
        />
      </div>

      {/* ── Hero Section ────────────────────────────── */}
      <section className="relative z-20 flex min-h-screen flex-col items-center justify-center px-6 pt-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mx-auto max-w-5xl"
        >
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-4 py-1.5 backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-widest text-amber-500">
              Season 7 &nbsp;•&nbsp; Registration Live
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-display mb-6 text-5xl font-extrabold leading-[0.95] tracking-tighter text-white sm:text-7xl md:text-8xl lg:text-9xl">
            BUILD YOUR <br />
            <span className="gradient-text italic">DYNASTY.</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-slate-300 md:text-xl">
            Experience the most immersive ISL-style football draft.
            From player scouting to live bidding, every second counts.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auction"
              className="btn-primary group flex w-full items-center justify-center gap-3 rounded-2xl px-8 py-4 text-base sm:w-auto"
            >
              <Play className="h-5 w-5 fill-current" />
              Enter Draft Room
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/players"
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 sm:w-auto"
            >
              <Users className="h-5 w-5" />
              Scout Players
            </Link>
          </div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="mx-auto mt-16 grid grid-cols-2 sm:flex max-w-2xl divide-x-0 sm:divide-x divide-white/10 rounded-3xl border border-white/5 bg-white/3 p-6 backdrop-blur-xl gap-6 sm:gap-0"
          >
            <div className="flex-1 px-4 border-r border-white/10 sm:border-r-0">
              <div className="text-2xl md:text-3xl font-black text-white">66</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-amber-500/80">Athletes</div>
            </div>
            <div className="flex-1 px-4">
              <div className="text-2xl md:text-3xl font-black text-white">10</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-500/80">Franchises</div>
            </div>
            <div className="flex-1 px-4 col-span-2 sm:col-span-1 border-t border-white/10 pt-4 sm:border-t-0 sm:pt-0">
              <div className="text-2xl md:text-3xl font-black gradient-text">20,000+</div>
              <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-400">Points Cap</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Feature Grid ────────────────────────────── */}
      <section className="relative z-20 mx-auto max-w-6xl px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="font-display text-3xl font-bold text-white sm:text-5xl">Professional Grade ERP</h2>
          <p className="mt-4 text-slate-400">Streamlined management for the elite league.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            {
              icon: <Trophy className="h-6 w-6 text-amber-500" />,
              title: "Squad Management",
              desc: "Manage rosters with ISL-style rules, position quotas, and real-time squad valuation.",
              img: "https://images.unsplash.com/photo-1748111823699-9df50688a94c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            },
            {
              icon: <Zap className="h-6 w-6 text-emerald-400" />,
              title: "Live Bidding Engine",
              desc: "Fast, secure, and transparent auction process with automated budget validation.",
              img: "https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2062&auto=format&fit=crop"
            },
            {
              icon: <Users className="h-6 w-6 text-blue-400" />,
              title: "Scouting Portal",
              desc: "Detailed player profiles with professional stats, scouting reports, and high-res imagery.",
              img: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=2186&auto=format&fit=crop"
            }
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -8 }}
              className="glass group overflow-hidden rounded-3xl"
            >
              <div className="h-48 overflow-hidden">
                <img
                  src={item.img}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="p-8">
                <div className="mb-4 inline-flex rounded-2xl bg-white/5 p-3">
                  {item.icon}
                </div>
                <h3 className="mb-3 text-xl font-bold text-white">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="relative z-20 border-t border-white/5 py-12 px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-4">
            <img src="/images/logo.webp" className="h-10 w-10 opacity-80" alt="Logo" />
            <span className="text-sm font-bold text-slate-400">Cheloor Super League</span>
          </div>
          <div className="flex gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span>2026 Season</span>
            <span>ERP Professional</span>
            <span>Digital Draft</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
