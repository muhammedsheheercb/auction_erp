'use client'

import { useState, useRef } from 'react';
import { createTeam, deleteAllTeams } from '@/actions/teamActions';
import { Trophy, ShieldAlert, Trash2 } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

export default function TeamForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await createTeam(formData);
      if (result.success) {
        formRef.current?.reset();
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const handleDeleteAll = async () => {
    setLoading(true);
    try {
      await deleteAllTeams();
      setShowResetConfirm(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleDeleteAll}
        title="Nuclear Reset?"
        message="This will permanently DELETE ALL franchises and release every athlete back into the draft pool. This action cannot be reversed."
        confirmText="Confirm Global Reset"
        cancelText="Abort"
      />

      <form ref={formRef} id="team-form" action={handleSubmit} className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center gap-4 bg-white/3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6 text-emerald-500" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] leading-none mb-2">Franchise Hub</p>
            <p className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Register New Team</p>
          </div>
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="p-3 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 border border-rose-500/20"
            title="Global Reset"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Franchise Name</label>
              <input
                name="name"
                required
                placeholder="e.g. Cheloor Strikers"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Official Crest</label>
              <input
                type="file"
                name="logo"
                accept="image/*"
                className="input-base text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-emerald-500 file:text-black hover:file:bg-emerald-400 file:cursor-pointer"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Primary Manager</label>
              <input
                name="manager1"
                required
                placeholder="Full Name"
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Secondary Manager</label>
              <input
                name="manager2"
                required
                placeholder="Full Name"
                className="input-base"
              />
            </div>
          </div>

          <div className="flex items-start gap-3 bg-white/3 p-4 rounded-2xl border border-white/5">
            <ShieldAlert className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
              New franchises start with a standard budget of <span className="text-emerald-400 italic">25,000 PTS</span>. Budget updates automatically upon scout acquisitions.
            </p>
          </div>
          
          {error && (
            <div className="text-rose-400 text-[10px] font-black bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-2xl uppercase tracking-widest">
              {error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] active:scale-95 shadow-2xl shadow-emerald-500/20"
          >
            {loading ? 'Finalizing Registry...' : 'Authorize Franchise'}
          </button>
        </div>
      </form>
    </div>
  );
}
