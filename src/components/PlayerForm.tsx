'use client'

import { useState } from 'react';
import { createPlayer } from '@/actions/playerActions';

export default function PlayerForm({ nextNumber }: { nextNumber: number }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await createPlayer(formData);
    setLoading(false);
    
    if (result.success) {
      (document.getElementById('player-form') as HTMLFormElement).reset();
    } else {
      setError(result.error || 'Something went wrong');
    }
  }

  return (
    <form id="player-form" action={handleSubmit} className="glass p-6 rounded-2xl space-y-4 border-l-4 border-l-green-500">
      <div>
        <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Player Name</label>
        <input
          name="name"
          required
          placeholder="e.g. Cristiano Ronaldo"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Position</label>
          <select
            name="position"
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold"
          >
            <option value="Goalkeeper">Goalkeeper</option>
            <option value="Defender">Defender</option>
            <option value="Midfielder">Midfielder</option>
            <option value="Forward">Forward</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Player Number</label>
          <input
            name="number"
            type="number"
            value={nextNumber}
            readOnly
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none ring-2 ring-green-500/50 transition-all font-black text-green-500 cursor-not-allowed"
          />
          <p className="text-[8px] mt-1 text-muted-foreground uppercase">Automatic Assignment</p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Photo Upload</label>
        <div className="relative group">
          <input
            type="file"
            name="photo"
            accept="image/*"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-black hover:file:bg-green-700"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 uppercase">Leave empty for /images/players/{nextNumber}.webp</p>
      </div>
      
      {error && <p className="text-red-500 text-[10px] font-bold bg-red-500/10 p-2 rounded-lg">{error}</p>}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest text-sm"
      >
        {loading ? 'Adding Player...' : 'Register Prospect'}
      </button>
    </form>
  );
}
