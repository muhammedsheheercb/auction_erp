'use client'

import { useActionState, useEffect, useRef } from 'react';
import { createPlayer } from '@/actions/playerActions';
import { UserPlus, ShieldAlert } from 'lucide-react';

type State = { success?: boolean; error?: string | null };

export default function PlayerForm({ nextNumber }: { nextNumber: number }) {
  const [state, formAction, pending] = useActionState<State, FormData>(createPlayer, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state]);

  return (
    <form
      ref={formRef}
      id="player-form"
      action={formAction}
      className="glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl"
    >
      {/* Header */}
      <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center gap-4 bg-white/3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <UserPlus className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] leading-none mb-2">Scout Registry</p>
          <p className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">Draft Enrollment</p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
            Athlete Full Name
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Cristiano Ronaldo"
            className="input-base"
          />
        </div>

        {/* Position + Number */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              Primary Position
            </label>
            <select
              name="position"
              required
              defaultValue="Goalkeeper"
              className="input-base text-sm"
            >
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
              Auto Scout ID
            </label>
            <input
              name="number"
              type="number"
              value={nextNumber}
              readOnly
              className="input-base border-amber-500/30 text-amber-500 cursor-not-allowed font-black text-lg bg-amber-500/5"
            />
          </div>
        </div>

        {/* Photo */}
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
            Profile Portrait
          </label>
          <div className="relative group">
            <input
              type="file"
              name="photo"
              accept="image/*"
              className="input-base text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400 file:cursor-pointer"
            />
          </div>
          <div className="mt-3 flex items-start gap-2 bg-white/3 p-3 rounded-xl border border-white/5">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-600 shrink-0 mt-0.5" />
            <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest leading-relaxed">
              Optional: If empty, the system will use default scout file <span className="text-amber-500">/{nextNumber}.webp</span>
            </p>
          </div>
        </div>

        {/* Error */}
        {state.error && (
          <div className="text-rose-400 text-[10px] font-black bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-2xl uppercase tracking-widest">
            {state.error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="btn-primary w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] active:scale-95 shadow-2xl shadow-amber-500/20"
        >
          {pending ? 'Processing Enrollment...' : 'Confirm Draft Entry'}
        </button>
      </div>
    </form>
  );
}
