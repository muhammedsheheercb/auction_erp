'use client'

import { useActionState, useEffect, useRef } from 'react';
import { createPlayer } from '@/actions/playerActions';
import { UserPlus } from 'lucide-react';

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
      className="glass rounded-2xl overflow-hidden border-l-4 border-l-green-500"
    >
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.07] flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
          <UserPlus className="w-4 h-4 text-green-400" />
        </div>
        <div>
          <p className="text-[10px] font-black text-green-500 uppercase tracking-[0.2em]">Scout Registry</p>
          <p className="text-[11px] text-white/40 font-medium">Register a new prospect</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Name */}
        <div>
          <label className="block text-[10px] font-black text-green-400 uppercase tracking-[0.18em] mb-1.5">
            Player Name
          </label>
          <input
            name="name"
            required
            placeholder="e.g. Cristiano Ronaldo"
            className="input-base"
          />
        </div>

        {/* Position + Number */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-black text-green-400 uppercase tracking-[0.18em] mb-1.5">
              Position
            </label>
            <select
              name="position"
              required
              defaultValue="Goalkeeper"
              className="input-base select-dark"
            >
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
            </select>
            <p className="text-[9px] mt-1 text-amber-400/70 uppercase tracking-wide">🧤 GK = Free signing</p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-green-400 uppercase tracking-[0.18em] mb-1.5">
              Squad No.
            </label>
            <input
              name="number"
              type="number"
              value={nextNumber}
              readOnly
              className="input-base ring-1 ring-green-500/30 text-green-400 cursor-not-allowed font-black text-lg"
            />
            <p className="text-[9px] mt-1 text-white/30 uppercase tracking-wide">Auto-assigned</p>
          </div>
        </div>

        {/* Photo */}
        <div>
          <label className="block text-[10px] font-black text-green-400 uppercase tracking-[0.18em] mb-1.5">
            Photo Upload
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="input-base text-xs file:mr-3 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-black hover:file:bg-green-500 file:cursor-pointer"
          />
          <p className="text-[9px] text-white/30 mt-1 uppercase tracking-wide">
            Leave empty → /images/players/{nextNumber}.webp
          </p>
        </div>

        {/* Error */}
        {state.error && (
          <div className="text-red-400 text-[10px] font-bold bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
            {state.error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-green-600 hover:bg-green-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-black font-black py-4 rounded-xl transition-all shadow-lg shadow-green-900/40 uppercase tracking-[0.15em] text-sm"
        >
          {pending ? 'Registering…' : 'Register Prospect'}
        </button>
      </div>
    </form>
  );
}
