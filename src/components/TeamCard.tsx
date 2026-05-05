'use client'

import { useState } from 'react';
import { Trash2, FileText, Users, Wallet, X, Edit2, Download, ChevronRight, Trophy } from 'lucide-react';
import { deleteTeam, updateTeam } from '@/actions/teamActions';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from './ConfirmModal';

interface TeamCardProps {
  team: any;
  isAdmin: boolean;
}

export default function TeamCard({ team, isAdmin }: TeamCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string>(team.logo || '');

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setLogoPreview(URL.createObjectURL(file));
  }

  function handleEditClose() {
    setShowEdit(false);
    setLogoPreview(team.logo || '');
  }

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteTeam(team._id);
    } catch (error: any) {
      alert(error.message);
      setIsDeleting(false);
    }
  };

  const downloadPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(234, 179, 8); // Amber-500
    doc.text('CHELEOR SUPER LEAGUE S7', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Official Squad: ${team.name.toUpperCase()}`, 105, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Lead Manager: ${team.manager1}`, 20, 50);
    doc.text(`Co-Manager: ${team.manager2}`, 20, 58);
    doc.text(`Available Points: ${team.remainingBudget}`, 140, 50);
    doc.text(`Roster Count: ${team.players.length}/10`, 140, 58);
    
    const tableData = team.players.map((p: any) => [
      p.number,
      p.name,
      p.position,
      p.soldPrice === 0 ? 'FREE' : p.soldPrice
    ]);

    autoTable(doc, {
      startY: 70,
      head: [['#', 'Player Name', 'Position', 'Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [234, 179, 8] },
      styles: { fontStyle: 'bold' }
    });

    doc.save(`${team.name.replace(/\s+/g, '_')}_squad.pdf`);
  };

  const handleEditSubmit = async (formData: FormData) => {
    setLoading(true);
    try {
      const result = await updateTeam(team._id, formData);
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

  return (
    <>
      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Disband Franchise?"
        message={`Confirm the permanent deletion of ${team.name}. All assigned athletes will return to the draft pool.`}
        confirmText="Confirm Deletion"
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
              className="relative glass max-w-md w-full rounded-[3rem] border border-white/10 overflow-hidden"
            >
              <form action={handleEditSubmit} className="p-10 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-black uppercase italic tracking-tighter">Edit Franchise</h3>
                  <button type="button" onClick={handleEditClose} className="p-3 hover:bg-white/5 rounded-full transition-all">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Franchise Name</label>
                    <input
                      name="name"
                      defaultValue={team.name}
                      required
                      className="input-base"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Manager 1</label>
                      <input
                        name="manager1"
                        defaultValue={team.manager1}
                        required
                        className="input-base text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Manager 2</label>
                      <input
                        name="manager2"
                        defaultValue={team.manager2}
                        required
                        className="input-base text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Update Crest</label>
                    <div className="flex items-center gap-6">
                      {logoPreview && (
                        <div className="rounded-2xl overflow-hidden border border-white/10 h-20 w-20 bg-white/5 flex items-center justify-center p-2">
                          <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                        </div>
                      )}
                      <input
                        type="file"
                        name="logo"
                        accept="image/*"
                        onChange={handleLogoChange}
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
                  {loading ? 'Saving Changes...' : 'Update Franchise'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div 
        whileHover={{ y: -8 }}
        onClick={() => setShowDetails(true)}
        className={`glass rounded-[2.5rem] overflow-hidden group relative cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/10 ${isDeleting ? 'opacity-30' : ''}`}
      >
        <div className="p-8 bg-white/3 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 transition-all duration-500">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain" />
              ) : (
                <Trophy className="w-7 h-7 text-slate-700" />
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{team.name}</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.1em]">{team.manager1} & {team.manager2}</p>
            </div>
          </div>
          
          {isAdmin && (
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowEdit(true); }}
                className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-amber-500 hover:text-black transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowConfirm(true); }}
                className="p-2.5 bg-white/5 text-slate-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
        
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Squad Strength</p>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span className="text-xl font-black italic">{team.players.length}/10</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Available Budget</p>
              <div className="flex items-center justify-end gap-2">
                <Wallet className="w-4 h-4 text-amber-500" />
                <span className="text-xl font-black italic text-amber-500">{team.remainingBudget}</span>
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(team.players.length / 10) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" 
            />
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 transition-all group-hover:text-amber-500">
            View Full Roster <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </motion.div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative glass max-w-2xl w-full max-h-[85vh] overflow-hidden rounded-[3rem] border border-white/10 flex flex-col shadow-2xl"
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center bg-white/3">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 p-3">
                    {team.logo ? (
                      <img src={team.logo} className="w-full h-full object-contain" alt="" />
                    ) : (
                      <Trophy className="w-10 h-10 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white leading-none">{team.name}</h2>
                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-amber-500 mt-2">Elite Franchise Profile</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-4 bg-white/5 rounded-full hover:bg-white/10 transition-all active:scale-90">
                  <X className="w-8 h-8" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-10">
                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="bg-white/3 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Managerial Team</p>
                    <p className="text-lg font-black italic">{team.manager1} & {team.manager2}</p>
                  </div>
                  <div className="bg-white/3 p-6 rounded-[2rem] border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-2">Franchise Budget</p>
                    <p className="text-lg font-black italic text-emerald-400">{team.remainingBudget} PTS</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6 px-2">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Official Roster ({team.players.length}/10)</h3>
                  <div className="h-[1px] flex-1 bg-white/5 mx-6" />
                </div>

                <div className="space-y-4">
                  {team.players.map((player: any) => (
                    <div key={player._id} className="group flex items-center justify-between p-5 bg-white/3 rounded-[2rem] border border-white/5 hover:border-amber-500/20 transition-all duration-300">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border border-white/10">
                          <img src={player.photo} className="w-full h-full object-cover transition-all duration-500" alt="" />
                        </div>
                        <div>
                          <p className="font-black uppercase text-base tracking-tight text-white">{player.name}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">
                            <span className={`px-2 py-0.5 rounded-md ${
                              player.position === 'Goalkeeper' ? 'badge-gk' :
                              player.position === 'Defender'   ? 'badge-def' :
                              player.position === 'Midfielder' ? 'badge-mid' : 'badge-fwd'
                            }`}>{player.position}</span>
                             &nbsp;•&nbsp; #{player.number}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black italic tabular-nums leading-none" style={{ color: player.soldPrice === 0 ? '#fbbf24' : 'white' }}>
                          {player.soldPrice === 0 ? 'FREE' : player.soldPrice}
                        </p>
                        <p className="text-[9px] text-slate-500 uppercase font-black mt-2 tracking-widest">Acquired For</p>
                      </div>
                    </div>
                  ))}
                  {team.players.length === 0 && (
                    <div className="text-center py-20 bg-white/3 rounded-[3rem] border border-dashed border-white/5">
                      <p className="text-slate-600 font-black uppercase tracking-widest text-sm">No Assets Acquired</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-10 bg-white/3 border-t border-white/5">
                <button 
                  onClick={downloadPDF}
                  className="btn-primary w-full py-5 rounded-2xl flex items-center justify-center gap-3"
                >
                  <Download className="w-6 h-6" />
                  Generate Squad Report (PDF)
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
