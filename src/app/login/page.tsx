'use client'

import { useActionState } from 'react';
import { adminLogin } from '@/actions/authActions';
import { Trophy, Lock, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(adminLogin, null);

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Background with Football Aesthetic */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/40 via-[#020617]/90 to-[#020617] z-10" />
        <img
          src="https://images.unsplash.com/photo-1551952237-954a0e68786c?q=80&w=2070&auto=format&fit=crop"
          alt="Football Stadium"
          className="h-full w-full object-cover scale-105 animate-pulse-slow"
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-20 w-full max-w-[440px]"
      >
        <div className="glass rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 blur-[100px] rounded-full" />

          <div className="relative z-10">
            <div className="flex flex-col items-center text-center mb-10">
              <motion.div
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-20 h-20 bg-amber-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-amber-500/20 rotate-3 transition-transform"
              >
                <Lock className="w-10 h-10 text-black" />
              </motion.div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none mb-4">
                Admin <span className="text-amber-500">Access</span>
              </h1>
              <p className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Cheloor Super League ERP</p>
            </div>

            <form action={formAction} className="space-y-6">
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-amber-500 group-focus-within:text-amber-400 transition-colors" />
                  </div>
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="ENTER ADMIN TOKEN"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl pl-14 pr-6 py-5 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all text-sm font-black tracking-[0.3em] placeholder:text-slate-600 placeholder:tracking-normal"
                  />
                </div>

                {state?.error && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl text-[10px] font-black text-rose-400 uppercase tracking-widest text-center"
                  >
                    {state.error}
                  </motion.div>
                )}
              </div>

              <button
                disabled={pending}
                className="btn-primary w-full py-6 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl shadow-amber-500/10 group overflow-hidden relative"
              >
                <span className="relative z-10 text-[11px] font-black uppercase tracking-[0.3em]">
                  {pending ? 'Verifying...' : 'Authorize Login'}
                </span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </form>

            <div className="mt-12 pt-8 border-t border-white/5 text-center">
              <Link href="/" className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-3 h-3 rotate-180" /> Back to Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div className="mt-8 text-center">
          <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.4em]">
            Elite Draft ERP &nbsp;•&nbsp; S7 Official
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import Link from 'next/link';
