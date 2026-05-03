'use client'

import { useState } from 'react';
import { createTeam, deleteAllTeams } from '@/actions/teamActions';

export default function TeamForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const result = await createTeam(formData);
      if (result.success) {
        (document.getElementById('team-form') as HTMLFormElement).reset();
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
    if (!confirm('Are you sure you want to delete ALL teams? This will also reset all players to available.')) return;
    setLoading(true);
    try {
      await deleteAllTeams();
      alert('All teams deleted and players reset.');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form id="team-form" action={handleSubmit} className="glass p-6 rounded-3xl space-y-4 border-l-4 border-l-green-500">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Team Name</label>
            <input
              name="name"
              required
              placeholder="e.g. Cheloor Strikers"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Team Logo</label>
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-black hover:file:bg-green-700"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Manager 1</label>
            <input
              name="manager1"
              required
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-black text-green-500 uppercase tracking-widest mb-1">Manager 2</label>
            <input
              name="manager2"
              required
              placeholder="Full Name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            />
          </div>
        </div>
        
        {error && <p className="text-red-500 text-xs font-bold bg-red-500/10 p-2 rounded-lg">{error}</p>}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-800/50 text-black font-black py-4 rounded-xl transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest"
        >
          {loading ? 'Creating...' : 'Register Team'}
        </button>
      </form>
    </div>
  );
}
