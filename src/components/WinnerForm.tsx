"use client";

import { useState, useRef, useEffect } from "react";
import { createWinner, updateWinner } from "@/actions/winnerActions";
import { Crown, Save, Plus } from "lucide-react";

interface Winner {
  _id: string;
  teamName: string;
  photo: string;
  season: string;
}

export default function WinnerForm({ 
  winner, 
  onSuccess 
}: { 
  winner?: Winner; 
  onSuccess?: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = winner 
        ? await updateWinner(winner._id, formData)
        : await createWinner(formData);

      if (result.success) {
        if (!winner) formRef.current?.reset();
        setSuccess(true);
        if (onSuccess) onSuccess();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || "Something went wrong");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      ref={formRef}
      action={handleSubmit}
      className={`glass rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl ${winner ? 'p-0' : ''}`}
    >
      <div className="px-8 pt-8 pb-6 border-b border-white/5 flex items-center gap-4 bg-white/3">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
          <Crown className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.3em] leading-none mb-2">
            Champions Registry
          </p>
          <p className="text-xl font-black uppercase italic tracking-tighter text-white leading-none">
            {winner ? 'Edit Champion' : 'Add Champion'}
          </p>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6">
        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
            Team Name
          </label>
          <input
            name="teamName"
            required
            defaultValue={winner?.teamName}
            placeholder="e.g. Cheloor Strikers"
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
            Season
          </label>
          <input
            name="season"
            required
            defaultValue={winner?.season}
            placeholder="e.g. Season 7 / 2024"
            className="input-base"
          />
        </div>

        <div>
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">
            Team Photo {winner && '(Leave empty to keep current)'}
          </label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            required={!winner}
            className="input-base text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-amber-500 file:text-black hover:file:bg-amber-400 file:cursor-pointer"
          />
        </div>

        {error && (
          <div className="text-rose-400 text-[10px] font-black bg-rose-500/10 border border-rose-500/20 px-4 py-3 rounded-2xl uppercase tracking-widest">
            {error}
          </div>
        )}

        {success && (
          <div className="text-emerald-400 text-[10px] font-black bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-2xl uppercase tracking-widest">
            {winner ? 'Champion updated!' : 'Champion added to the gallery!'}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.25em] active:scale-95 shadow-2xl shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              {winner ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {winner ? "Update Champion" : "Add to Hall of Glory"}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
