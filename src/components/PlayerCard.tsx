'use client'

import { Trash2, Edit2, ChevronRight, X } from 'lucide-react';
import { deletePlayer, updatePlayer } from '@/actions/playerActions';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';

interface PlayerCardProps {
  player: {
    _id: string;
    name: string;
    photo: string;
    position: string;
    number: number;
    status: string;
    basePrice: number;
  };
}

export default function PlayerCard({ player }: PlayerCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>(player.photo);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  }

  function handleEditClose() {
    setShowEdit(false);
    setPhotoPreview(player.photo);
  }

  const handleEditSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await updatePlayer(player._id, formData);
      if (result.success) {
        setShowEdit(false);
      } else {
        alert(result.error);
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deletePlayer(player._id);
    } catch (error: any) {
      alert(error.message);
      setIsDeleting(false);
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Release Athlete?"
        message={`Confirm the removal of ${player.name} from the Season 7 draft registry.`}
        confirmText="Confirm Removal"
        cancelText="Cancel"
      />

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleEditClose}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative glass max-w-md w-full rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl"
            >
              <form action={handleEditSubmit} className="p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Edit Athlete</h3>
                  <button type="button" onClick={handleEditClose} className="p-3 hover:bg-white/5 rounded-full transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Athlete Name</label>
                    <input
                      name="name"
                      defaultValue={player.name}
                      required
                      className="input-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Position</label>
                      <select name="position" defaultValue={player.position} className="input-base text-sm">
                        <option value="Goalkeeper">Goalkeeper</option>
                        <option value="Defender">Defender</option>
                        <option value="Midfielder">Midfielder</option>
                        <option value="Forward">Forward</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Scout ID</label>
                      <input
                        name="number"
                        type="number"
                        defaultValue={player.number}
                        required
                        className="input-base text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Profile Image</label>
                    <div className="flex items-center gap-6">
                      <div className="rounded-2xl overflow-hidden border border-white/10 h-24 w-20 bg-white/5 flex items-center justify-center">
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <input
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="text-xs font-bold file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-amber-500 file:text-black file:hover:bg-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] mt-4"
                >
                  {loading ? 'Processing...' : 'Save Profile Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        whileHover={{ y: -8 }}
        className={`glass rounded-[2.5rem] overflow-hidden group relative transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 ${isDeleting ? 'opacity-30' : ''}`}
      >
        <div className="relative h-64 w-full bg-slate-900 overflow-hidden">
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
          />
          
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

          {/* Actions Overlay */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3">
            <button 
              onClick={() => setShowEdit(true)}
              className="p-3 bg-white/10 text-white rounded-full hover:bg-amber-500 hover:text-black transition-all shadow-xl active:scale-90"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowConfirm(true)}
              className="p-3 bg-white/10 text-white rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-xl active:scale-90"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-4 right-4 bg-amber-500 text-black text-[11px] font-black px-3 py-1 rounded-full shadow-2xl italic tracking-tighter">
            #{player.number}
          </div>

          <div className={`absolute top-4 left-4 text-[9px] uppercase font-black px-3 py-1 rounded-full shadow-2xl tracking-[0.15em] border border-white/10 backdrop-blur-md ${
            player.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 
            player.status === 'sold' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
          }`}>
            {player.status === 'available' ? 'Draft Eligible' : player.status}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="text-xl font-black truncate uppercase tracking-tighter italic text-white leading-tight">{player.name}</h3>
            <div className="text-right shrink-0">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Base Value</p>
              <p className="text-sm font-black italic text-amber-500">{player.basePrice} pts</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-white/5 pt-4">
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${
              player.position === 'Goalkeeper' ? 'badge-gk' :
              player.position === 'Defender'   ? 'badge-def' :
              player.position === 'Midfielder' ? 'badge-mid' : 'badge-fwd'
            }`}>{player.position}</span>
            
            <div className="flex items-center gap-1 text-[9px] font-black text-slate-500 group-hover:text-amber-500 transition-colors uppercase tracking-widest">
              Review Profile <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
