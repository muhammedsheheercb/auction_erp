'use client'

import { useState } from 'react';
import { Trash2, FileText, Users, Wallet, X, Edit2, Download } from 'lucide-react';
import { deleteTeam, updateTeam } from '@/actions/teamActions';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import ConfirmModal from './ConfirmModal';

interface TeamCardProps {
  team: any;
}

export default function TeamCard({ team }: TeamCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [loading, setLoading] = useState(false);

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
    doc.setTextColor(22, 163, 74);
    doc.text('CHELEOR SUPER LEAGUE S7', 105, 20, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Team Summary: ${team.name.toUpperCase()}`, 105, 35, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Manager 1: ${team.manager1}`, 20, 50);
    doc.text(`Manager 2: ${team.manager2}`, 20, 58);
    doc.text(`Remaining Budget: ${team.remainingBudget}`, 140, 50);
    doc.text(`Total Players: ${team.players.length}/9`, 140, 58);
    
    const tableData = team.players.map((p: any) => [
      p.number,
      p.name,
      p.position,
      p.soldPrice
    ]);
    
    autoTable(doc, {
      startY: 70,
      head: [['#', 'Player Name', 'Position', 'Price']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [22, 163, 74] },
      styles: { fontStyle: 'bold' }
    });
    
    doc.save(`${team.name}_squad.pdf`);
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
        title="Disband Team?"
        message={`Are you sure you want to delete ${team.name}? All signed players will be released back into the draft.`}
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
              onClick={() => setShowEdit(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass max-w-md w-full rounded-[3rem] border-2 border-blue-500/30 overflow-hidden"
            >
              <form action={handleEditSubmit} className="p-8 space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Edit Team</h3>
                  <button type="button" onClick={() => setShowEdit(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase text-blue-500 mb-1">Team Name</label>
                  <input
                    name="name"
                    defaultValue={team.name}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-blue-500 mb-1">Manager 1</label>
                    <input
                      name="manager1"
                      defaultValue={team.manager1}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black uppercase text-blue-500 mb-1">Manager 2</label>
                    <input
                      name="manager2"
                      defaultValue={team.manager2}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-blue-500 mb-1">Update Logo</label>
                  <input
                    type="file"
                    name="logo"
                    accept="image/*"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-xs font-bold file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:bg-blue-600 file:text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-500/20 uppercase tracking-widest text-xs mt-4"
                >
                  {loading ? 'Saving Changes...' : 'Save Team Changes'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div 
        onClick={() => setShowDetails(true)}
        className={`glass rounded-[2rem] overflow-hidden card-hover border-t-4 border-t-green-500 group relative cursor-pointer ${isDeleting ? 'opacity-50 grayscale' : ''}`}
      >
        <div className="p-6 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shrink-0 group-hover:scale-110 transition-transform">
              {team.logo ? (
                <img src={team.logo} alt={team.name} className="w-8 h-8 object-contain" />
              ) : (
                <FileText className="w-6 h-6 text-green-500/50" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold uppercase tracking-tighter">{team.name}</h3>
              <p className="text-[10px] text-muted-foreground uppercase font-black">{team.manager1} & {team.manager2}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowEdit(true);
              }}
              className="p-2 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              title="Edit Team"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowConfirm(true);
              }}
              className="p-2 bg-red-600/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              title="Delete Team"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-bold">
                <Users className="w-3 h-3 text-green-500" /> {team.players.length}/9 Players
              </span>
            </div>
            <span className="text-sm text-green-400 flex items-center gap-1 font-black">
              <Wallet className="w-3 h-3" /> {team.remainingBudget}
            </span>
          </div>
          
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-600 rounded-full transition-all duration-1000" 
              style={{ width: `${(team.players.length / 9) * 100}%` }}
            />
          </div>
          
          <p className="text-[9px] text-center mt-3 text-muted-foreground uppercase font-black tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Click to view full squad
          </p>
        </div>
      </div>

      {/* Details Modal */}
      <AnimatePresence>
        {showDetails && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDetails(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative glass max-w-2xl w-full max-h-[80vh] overflow-hidden rounded-[3rem] border-2 border-green-500/30 flex flex-col"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center bg-green-500/5">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                    <img src={team.logo} className="w-10 h-10 object-contain" alt="" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{team.name}</h2>
                    <p className="text-sm text-green-500 font-bold uppercase mt-1">Season 7 Squad</p>
                  </div>
                </div>
                <button onClick={() => setShowDetails(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Managers</p>
                    <p className="text-sm font-bold">{team.manager1} & {team.manager2}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-muted-foreground uppercase font-black mb-1">Budget Left</p>
                    <p className="text-sm font-bold text-green-400">{team.remainingBudget}</p>
                  </div>
                </div>

                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4 px-2">Signed Players ({team.players.length})</h3>
                <div className="space-y-3">
                  {team.players.map((player: any) => (
                    <div key={player._id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-green-500/20 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary border border-white/10">
                          <img src={player.photo} className="w-full h-full object-cover" alt="" />
                        </div>
                        <div>
                          <p className="font-black uppercase text-sm tracking-tight">{player.name}</p>
                          <p className="text-[10px] text-green-500 font-bold uppercase">{player.position} • #{player.number}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-black text-white leading-none italic">{player.soldPrice}</p>
                        <p className="text-[8px] text-muted-foreground uppercase font-black mt-1">Points</p>
                      </div>
                    </div>
                  ))}
                  {team.players.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground italic text-sm">
                      No players signed yet.
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-white/5 border-t border-white/10">
                <button 
                  onClick={downloadPDF}
                  className="w-full bg-green-600 hover:bg-green-700 text-black font-black py-4 rounded-2xl transition-all shadow-xl shadow-green-500/20 flex items-center justify-center gap-2 uppercase tracking-widest text-sm"
                >
                  <Download className="w-5 h-5" />
                  Download Squad List PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
