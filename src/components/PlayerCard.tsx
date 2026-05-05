'use client'

import { Trash2, Edit2 } from 'lucide-react';
import { deletePlayer, updatePlayer } from '@/actions/playerActions';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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
        title="Release Player?"
        message={`Are you sure you want to remove ${player.name} from the registry?`}
        confirmText="Accept"
        cancelText="Decline"
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass max-w-md w-full rounded-[3rem] border-2 border-green-500/30 overflow-hidden"
            >
              <form action={handleEditSubmit} className="p-8 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Edit Player</h3>
                  <button type="button" onClick={handleEditClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase text-green-500 mb-1">Player Name</label>
                  <input
                    name="name"
                    defaultValue={player.name}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-green-500 mb-1">Position</label>
                    <select
                      name="position"
                      defaultValue={player.position}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs font-bold"
                    >
                      <option value="Goalkeeper">Goalkeeper</option>
                      <option value="Defender">Defender</option>
                      <option value="Midfielder">Midfielder</option>
                      <option value="Forward">Forward</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-green-500 mb-1">Number</label>
                    <input
                      name="number"
                      type="number"
                      defaultValue={player.number}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-green-500 mb-1">Update Photo</label>
                  <div className="mb-2 rounded-xl overflow-hidden border border-white/10 h-36 w-full">
                    <img
                      src={photoPreview}
                      alt="Current photo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-xs font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-green-600 file:text-black"
                  />
                  <p className="text-[9px] text-muted-foreground mt-1 uppercase">Leave empty to keep current photo</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? 'Saving...' : 'Save Player Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className={`glass rounded-2xl overflow-hidden card-hover group border-b-4 border-b-green-600 relative ${isDeleting ? 'opacity-50 grayscale' : ''}`}>
        <div className="relative h-48 w-full bg-secondary overflow-hidden">
          <img
            src={player.photo}
            alt={player.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {/* Actions Overlay */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <button 
              onClick={() => setShowEdit(true)}
              className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-xl"
              title="Edit Player"
            >
              <Edit2 className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setShowConfirm(true)}
              className="p-3 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-xl"
              title="Delete Player"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          <div className="absolute top-2 right-2 bg-green-600 text-black text-[10px] font-black px-2 py-1 rounded shadow-lg italic">
            #{player.number}
          </div>
          <div className={`absolute top-2 left-2 text-[8px] uppercase font-black px-2 py-0.5 rounded shadow-lg ${
            player.status === 'available' ? 'bg-green-500 text-black' : 
            player.status === 'sold' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
          }`}>
            {player.status === 'available' ? 'Draftable' : player.status}
          </div>
        </div>
        <div className="p-4 bg-white/5">
          <h3 className="text-md font-black truncate uppercase tracking-tighter italic">{player.name}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-green-400 font-bold uppercase tracking-widest">{player.position}</span>
            <span className="text-xs font-black text-white bg-white/10 px-2 py-0.5 rounded">B: {player.basePrice}</span>
          </div>
        </div>
      </div>
    </>
  );
}
