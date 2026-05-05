'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, ShieldAlert } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Accept',
  cancelText = 'Decline'
}: ConfirmModalProps) {
  const isDanger = title.toLowerCase().includes('delete') || title.toLowerCase().includes('disband') || title.toLowerCase().includes('reset');

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#020617]/90 backdrop-blur-2xl"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className={`relative glass max-w-md w-full rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl ${
              isDanger ? 'shadow-rose-500/10' : 'shadow-amber-500/10'
            }`}
          >
            <div className="p-6 md:p-10 text-center">
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center mx-auto mb-6 border ${
                isDanger ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
              }`}>
                {isDanger ? <AlertTriangle className="w-8 h-8 md:w-10 md:h-10" /> : <ShieldAlert className="w-8 h-8 md:w-10 md:h-10" />}
              </div>
              
              <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-3 text-white leading-none px-4">
                {title}
              </h3>
              
              <p className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8 md:mb-10 leading-relaxed max-w-[90%] md:max-w-[80%] mx-auto">
                {message}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] bg-white/5 border border-white/10 text-slate-400 hover:bg-white/10 hover:text-white transition-all active:scale-95 order-2 sm:order-1"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-black transition-all active:scale-95 shadow-2xl order-1 sm:order-2 ${
                    isDanger ? 'bg-rose-500 hover:bg-rose-400 shadow-rose-500/20' : 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/20'
                  }`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
            
            <button 
              onClick={onClose} 
              className="absolute top-6 right-6 p-2 text-slate-500 hover:text-white transition-colors rounded-full hover:bg-white/5"
            >
              <X className="w-6 h-6" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
