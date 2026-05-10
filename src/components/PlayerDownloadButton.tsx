'use client'

import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function PlayerDownloadButton({ players }: { players: any[] }) {
  const [loading, setLoading] = useState(false);

  const getBase64Image = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        try {
          const dataURL = canvas.toDataURL('image/jpeg', 0.8); 
          resolve(dataURL);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  };

  const downloadPlayersPDF = async () => {
    setLoading(true);
    try {
      const doc = new jsPDF('p', 'mm', 'a4');

      const drawPageHeader = async (title: string) => {
        doc.setFillColor(2, 6, 23); // Deep Midnight
        doc.rect(0, 0, 210, 297, 'F');
        
        doc.setDrawColor(251, 191, 36);
        doc.setLineWidth(0.5);
        doc.line(10, 15, 200, 15);

        try {
          const logoData = await getBase64Image('/images/logo.webp');
          doc.addImage(logoData, 'JPEG', 10, 5, 10, 10);
        } catch (e) {}

        doc.setFontSize(20);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('CHELEOR SUPER LEAGUE S7', 105, 12, { align: 'center' });
        
        doc.setFontSize(12);
        doc.setTextColor(251, 191, 36);
        doc.text(`${title.toUpperCase()} REGISTRY`, 105, 22, { align: 'center' });

        doc.setDrawColor(255, 255, 255, 0.1);
        doc.line(10, 26, 200, 26);
      };

      const positionOrder: Record<string, number> = { 'Goalkeeper': 1, 'GK': 1, 'Forward': 2, 'Midfielder': 3, 'Defender': 4 };
      const filteredPlayers = players
        .sort((a, b) => {
          if (positionOrder[a.position] !== positionOrder[b.position]) {
            return positionOrder[a.position] - positionOrder[b.position];
          }
          return a.number - b.number;
        });

      const cardsPerPage = 12;
      const cardWidth = 60; 
      const cardHeight = 62;
      const marginX = 10;
      const marginY = 32;
      const gapX = 5;
      const gapY = 5;
      
      let x = marginX;
      let y = marginY;
      let currentPosition = '';

      for (let i = 0; i < filteredPlayers.length; i++) {
        const p = filteredPlayers[i];
        const pageIndex = i % cardsPerPage;
        
        const isNewPosition = p.position !== currentPosition;
        if (isNewPosition || pageIndex === 0) {
          if (i > 0) doc.addPage();
          currentPosition = p.position;
          await drawPageHeader(p.position);
          x = marginX;
          y = marginY;
        } else if (pageIndex % 3 === 0) {
          x = marginX;
          y += cardHeight + gapY;
        } else {
          x += cardWidth + gapX;
        }

        // --- Professional High-End Card ---
        // Shadow/Border
        doc.setFillColor(30, 41, 59); // slate-800
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'F');
        doc.setDrawColor(251, 191, 36, 0.1);
        doc.roundedRect(x, y, cardWidth, cardHeight, 3, 3, 'D');

        // Top Accent Strip
        const posColor = p.position === 'Forward' ? [239, 68, 68] : p.position === 'Midfielder' ? [168, 85, 247] : [59, 130, 246];
        doc.setFillColor(posColor[0], posColor[1], posColor[2]);
        doc.rect(x + 3, y, 15, 1.5, 'F');

        // Image Section (Left)
        try {
          const imgData = await getBase64Image(p.photo);
          doc.addImage(imgData, 'JPEG', x + 3, y + 6, 25, 35);
        } catch (e) {
          doc.setFillColor(15, 23, 42);
          doc.rect(x + 3, y + 6, 25, 35, 'F');
        }

        // Scout ID (Badge Style)
        doc.setFillColor(251, 191, 36);
        doc.roundedRect(x + cardWidth - 12, y + 3, 9, 6, 1, 1, 'F');
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'bold');
        doc.text(`${p.number}`, x + cardWidth - 7.5, y + 7.2, { align: 'center' });

        // Details Section (Right)
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        const nameLines = doc.splitTextToSize(p.name.toUpperCase(), cardWidth - 32);
        doc.text(nameLines, x + 30, y + 15);

        doc.setFontSize(6);
        doc.setTextColor(148, 163, 184);
        doc.text('POSITION', x + 30, y + 22);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(7);
        doc.text(p.position.toUpperCase(), x + 30, y + 25);

        // Footer Bar
        doc.setFillColor(15, 23, 42);
        doc.roundedRect(x + 2, y + cardHeight - 12, cardWidth - 4, 10, 1.5, 1.5, 'F');
        
        doc.setTextColor(251, 191, 36);
        doc.setFontSize(8);
        doc.text('★★★★★', x + 6, y + cardHeight - 5.5);
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(5);
        doc.text('CSL SEASON 7', x + cardWidth - 6, y + cardHeight - 7, { align: 'right' });
        doc.text('OFFICIAL REGISTRY', x + cardWidth - 6, y + cardHeight - 4, { align: 'right' });
      }

      doc.save(`CSL_S7_Professional_Registry.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate professional PDF.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={downloadPlayersPDF}
      disabled={loading}
      className="flex items-center gap-2 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-amber-500 hover:to-amber-600 hover:text-black border border-white/10 px-6 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all active:scale-95 shadow-2xl disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading ? 'Refining Layout...' : 'Professional Export'}
    </button>
  );
}
