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

      const drawPageHeader = async () => {
        doc.setFillColor(2, 6, 23);
        doc.rect(0, 0, 210, 297, 'F');

        doc.setDrawColor(251, 191, 36);
        doc.setLineWidth(0.5);
        doc.line(10, 14, 200, 14);

        try {
          const logoData = await getBase64Image('/images/logo.webp');
          doc.addImage(logoData, 'JPEG', 10, 4, 9, 9);
        } catch (e) {}

        doc.setFontSize(15);
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.text('CHELEOR SUPER LEAGUE S7', 105, 11, { align: 'center' });

        doc.setDrawColor(30, 41, 59);
        doc.setLineWidth(0.3);
        doc.line(10, 17, 200, 17);
      };

      // 4 cols × 4 rows = 16 per page
      const cols = 4;
      const marginX = 9;
      const marginY = 20;
      const gapX = 4;
      const gapY = 4;
      const cardWidth = (210 - 2 * marginX - (cols - 1) * gapX) / cols; // 45mm
      const cardHeight = 56;
      const cardsPerPage = cols * 4;

      const positionGroups: Array<{ key: string; label: string }> = [
        { key: 'Forward',    label: 'FORWARDS'     },
        { key: 'Midfielder', label: 'MIDFIELDERS'  },
        { key: 'Defender',   label: 'DEFENDERS'    },
        { key: 'GK',         label: 'GOALKEEPERS'  },
      ];

      let isFirstPage = true;

      for (const { key, label } of positionGroups) {
        const group = players.filter(p => p.position === key);
        if (group.length === 0) continue;

        for (let i = 0; i < group.length; i++) {
          const pageIndex = i % cardsPerPage;
          const col = pageIndex % cols;
          const row = Math.floor(pageIndex / cols);

          if (pageIndex === 0) {
            if (!isFirstPage) doc.addPage();
            isFirstPage = false;
            await drawPageHeader();
          }

          const x = marginX + col * (cardWidth + gapX);
          const y = marginY + row * (cardHeight + gapY);

          try {
            const imgData = await getBase64Image(group[i].photo);
            doc.addImage(imgData, 'JPEG', x, y, cardWidth, cardHeight);
          } catch (e) {
            doc.setFillColor(30, 41, 59);
            doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
          }

          // Scout ID badge
          doc.setFillColor(251, 191, 36);
          doc.roundedRect(x + cardWidth - 9, y + 2, 7, 4.5, 1, 1, 'F');
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(6);
          doc.setFont('helvetica', 'bold');
          doc.text(`${group[i].number}`, x + cardWidth - 5.5, y + 5, { align: 'center' });
        }

        // Position label below the last row on the last page of this group
        const lastPageIndex = (group.length - 1) % cardsPerPage;
        const lastRow = Math.floor(lastPageIndex / cols);
        const labelY = marginY + (lastRow + 1) * (cardHeight + gapY) + 3;

        doc.setDrawColor(251, 191, 36);
        doc.setLineWidth(0.4);
        doc.line(marginX, labelY, 210 - marginX, labelY);

        doc.setFontSize(10);
        doc.setTextColor(251, 191, 36);
        doc.setFont('helvetica', 'bold');
        doc.text(
          `${label}  —  ${group.length} PLAYER${group.length !== 1 ? 'S' : ''}`,
          105,
          labelY + 6,
          { align: 'center' }
        );
      }

      doc.save('CSL_S7_Professional_Registry.pdf');
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
