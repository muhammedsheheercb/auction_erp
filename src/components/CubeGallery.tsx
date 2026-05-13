"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, X, Crown, Edit, Trash2 } from "lucide-react";
import { deleteWinner } from "@/actions/winnerActions";
import WinnerForm from "./WinnerForm";
import ConfirmModal from "./ConfirmModal";
import "./cube.css";

interface Winner {
  _id: string;
  teamName: string;
  photo: string;
  season: string;
}

export default function CubeGallery({ 
  winners,
  isAdmin
}: { 
  winners: Winner[];
  isAdmin?: boolean;
}) {
  const cubeRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [progress, setProgress] = useState(0);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [faceImgIdx, setFaceImgIdx] = useState<number[]>(new Array(6).fill(-1));
  const [showIntroModal, setShowIntroModal] = useState(false);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const sectionTops = useRef<number[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntroModal(true), 600);
    return () => clearTimeout(timer);
  }, []);

  async function handleDelete() {
    if (!deletingId) return;
    try {
      await deleteWinner(deletingId);
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  }

  const IMAGE_SRCS = useMemo(() => {
    // Add a default intro image at index 0
    return [
      "https://images.unsplash.com/photo-1713711437837-2a0b10631709?q=80&w=2070&auto=format&fit=crop",
      ...winners.map(w => w.photo)
    ];
  }, [winners]);

  const FACE_NAMES = useMemo(() => {
    return [
      "HALL OF GLORY",
      ...winners.map(w => w.teamName)
    ];
  }, [winners]);

  const N = IMAGE_SRCS.length;
  const SWAP_RADIUS = 3;

  const buildStops = (n: number) => {
    const base = [
      { rx: 90, ry: 0 },
      { rx: 0, ry: 0 },
      { rx: 0, ry: -90 },
      { rx: 0, ry: -180 },
      { rx: 0, ry: -270 },
      { rx: -90, ry: -360 }
    ];
    const out = [...base.slice(0, Math.min(n, 6))];
    for (let i = 6; i < n; i++) {
      out.push({ rx: 0, ry: -360 - (i - 6) * 90 });
    }
    return out;
  };

  const STOPS = useMemo(() => buildStops(N), [N]);

  const faceAtStop = (i: number) => {
    if (i < 6) return i;
    return 1 + ((i - 2) % 4);
  };

  const stopIndex = (s: number) => Math.min(N - 1, Math.floor(s * (N - 1)));

  const easeIO = (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const maxScroll = Math.max(1, docH - winH);
      const tgt = Math.max(0, Math.min(1, scrollY / maxScroll));
      setProgress(tgt);

      // Update current section index
      const mid = scrollY + winH * 0.5;
      let idx = 0;
      if (sectionTops.current.length > 0) {
        for (let i = 0; i < sectionTops.current.length; i++) {
          if (mid >= sectionTops.current[i]) idx = i;
        }
      }
      setCurrentIdx(Math.min(idx, N - 1));
    };

    const buildSectionTops = () => {
      if (!scrollContainerRef.current) return;
      const sections = scrollContainerRef.current.querySelectorAll("section");
      sectionTops.current = Array.from(sections).map(
        (s) => s.getBoundingClientRect().top + window.scrollY
      );
      handleScroll(); // Update state after building tops
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", buildSectionTops);
    
    // Use ResizeObserver to detect content changes (like images loading or admin form appearing)
    const ro = new ResizeObserver(buildSectionTops);
    ro.observe(document.body);

    setTimeout(buildSectionTops, 500); // Wait for potential layout shifts

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", buildSectionTops);
      ro.disconnect();
    };
  }, [N]);

  useEffect(() => {
    // Cube transform animation
    if (!cubeRef.current || N < 2) return;
    
    const t = progress * (N - 1);
    const i = Math.min(Math.floor(t), N - 2);
    const f = easeIO(t - i);
    const a = STOPS[i];
    const b = STOPS[i + 1];
    
    if (a && b) {
      const rx = a.rx + (b.rx - a.rx) * f;
      const ry = a.ry + (b.ry - a.ry) * f;
      cubeRef.current.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
    }

    // Face image swapping logic
    const si = stopIndex(progress);
    setFaceImgIdx(prev => {
      const next = [...prev];
      let changed = false;

      // Set current face
      const currentFace = faceAtStop(si);
      if (next[currentFace] !== si) {
        next[currentFace] = si;
        changed = true;
      }

      // Pre-swap nearby faces
      for (let offset = -SWAP_RADIUS; offset <= SWAP_RADIUS; offset++) {
        if (offset === 0) continue;
        const targetSi = si + offset;
        if (targetSi < 0 || targetSi >= N) continue;
        const fIdx = faceAtStop(targetSi);
        if (next[fIdx] !== targetSi) {
          next[fIdx] = targetSi;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [progress, N, STOPS]);

  useEffect(() => {
    // Intersection Observer for reveals
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(
      ".tag, h1, h2, .body-text, .stat-row, .cta, .cta-back, .h-line"
    );
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [winners]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const smoothScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="cube-body" data-theme={theme}>
      {/* ── Intro Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showIntroModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIntroModal(false)}
              className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
            />

            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 24 }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="relative max-w-md w-full rounded-[3rem] overflow-hidden shadow-2xl shadow-black/60 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Hero image */}
              <div className="relative h-70 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1713711437837-2a0b10631709?q=80&w=2070&auto=format&fit=crop"
                  alt="Champions"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />

                {/* Trophy icon badge */}
                <div className="absolute top-5 left-5 flex items-center gap-2 bg-amber-500/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-400/50">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-black">
                    Hall of Fame
                  </span>
                </div>
              </div>

              {/* Quote section */}
              <div className="bg-[#020617] px-8 pb-10 pt-4 border-t border-white/5">
                <div className="text-amber-500/60 text-6xl font-serif leading-none mb-1 -ml-1">"</div>

                <blockquote className="text-base md:text-[17px] font-black italic text-white leading-snug tracking-tight mb-5">
                  No one remembers the team that finished second. Football remembers the champions — so train harder, fight stronger, and play to lift the trophy.
                </blockquote>

                <div className="flex items-center gap-3 mb-7">
                  <div className="h-px flex-1 bg-white/10" />
                  <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] shrink-0">
                    The eternal truth of champions
                  </p>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <button
                  onClick={() => setShowIntroModal(false)}
                  className="w-full py-4 rounded-2xl bg-amber-500 text-black text-[11px] font-black uppercase tracking-[0.25em] active:scale-95 transition-all hover:bg-amber-400"
                >
                  Enter the Hall of Glory
                </button>
              </div>

              {/* Close button */}
              <button
                onClick={() => setShowIntroModal(false)}
                className="absolute top-5 right-5 p-2 bg-black/50 text-white rounded-full hover:bg-black/80 transition-all backdrop-blur-sm border border-white/10 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div id="scene">
        <div id="cube" ref={cubeRef}>
          <div className="face" data-face="top" data-i="0">
            {faceImgIdx[0] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[0]]} alt="" />}
            <span className="face-ph">TOP</span>
          </div>
          <div className="face" data-face="front" data-i="1">
            {faceImgIdx[1] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[1]]} alt="" />}
            <span className="face-ph">FRONT</span>
          </div>
          <div className="face" data-face="right" data-i="2">
            {faceImgIdx[2] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[2]]} alt="" />}
            <span className="face-ph">RIGHT</span>
          </div>
          <div className="face" data-face="back" data-i="3">
            {faceImgIdx[3] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[3]]} alt="" />}
            <span className="face-ph">BACK</span>
          </div>
          <div className="face" data-face="left" data-i="4">
            {faceImgIdx[4] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[4]]} alt="" />}
            <span className="face-ph">LEFT</span>
          </div>
          <div className="face" data-face="bottom" data-i="5">
            {faceImgIdx[5] !== -1 && <img src={IMAGE_SRCS[faceImgIdx[5]]} alt="" />}
            <span className="face-ph">BOTTOM</span>
          </div>
        </div>
      </div>

      <div id="hud">
        <div id="hud_pct">{Math.round(progress * 100).toString().padStart(3, "0")}%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress * 100}%` }}></div>
        </div>
        <div className="scene-label" id="scene_name">{FACE_NAMES[currentIdx]}</div>
      </div>

      <button id="theme_toggle" onClick={toggleTheme} aria-label="Toggle light/dark mode">
        <svg className="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
        <svg className="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
        </svg>
      </button>

      <div id="scene_strip">
        {IMAGE_SRCS.map((_, i) => (
          <a
            key={i}
            href={`#s${i}`}
            className={`scene-dot ${currentIdx === i ? "active" : ""}`}
            onClick={(e) => smoothScrollTo(e, `s${i}`)}
          ></a>
        ))}
      </div>

      <div id="face_caption">
        <div id="face_caption_num">{(currentIdx + 1).toString().padStart(2, "0")}</div>
        <div id="face_caption_name">{FACE_NAMES[currentIdx]}</div>
      </div>

      <div id="scroll_container" ref={scrollContainerRef}>
        {/* Intro Section */}
        <section id="s0" className="cube-section">
          <div className="text-card">
            <div className="tag">Gallery — Champions</div>
            <h1>HALL<br/>OF<br/>GLORY</h1>
            <p className="body-text">
              Witness the legends of the Cheloor Super League.
              Each face of the cube holds a story of victory,
              dedication, and the ultimate pursuit of excellence.
              Scroll to explore the champions.
            </p>
            <div className="cta-row">
              <a className="cta" href="#s1" onClick={(e) => smoothScrollTo(e, "s1")}>
                Explore
                <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M1 6h10M6 1l5 5-5 5" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        {/* Winner Sections */}
        {winners.map((winner, i) => (
          <section key={winner._id} id={`s${i + 1}`} className="cube-section">
            <div className={`text-card ${(i + 1) % 2 === 0 ? "right" : ""}`}>
              <div className="h-line"></div>
              
              {/* Admin Actions Overlay */}
              {isAdmin && (
                <div className={`flex items-center gap-2 mb-6 ${ (i + 1) % 2 === 0 ? "justify-end" : "justify-start"}`}>
                  <button
                    onClick={() => setEditingWinner(winner)}
                    className="p-2.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-xl hover:bg-amber-500 hover:text-black transition-all active:scale-90"
                    title="Edit Champion"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setDeletingId(winner._id);
                      setShowDeleteModal(true);
                    }}
                    disabled={deletingId === winner._id}
                    className="p-2.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90 disabled:opacity-50"
                    title="Delete Champion"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="tag">{winner.season} — Champion</div>
              <h2>{winner.teamName.split(' ').map((word, idx) => <span key={idx}>{word}<br/></span>)}</h2>
              <p className="body-text">
                Celebrating the monumental victory of {winner.teamName}.
                A season defined by grit and glory.
              </p>
              <div className="cta-row">
                <a className="cta-back" href={`#s${i}`} onClick={(e) => smoothScrollTo(e, `s${i}`)}>
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M11 6H1M6 11L1 6l5-5" />
                  </svg>
                  Back
                </a>
                <a className="cta" href={`#s${i + 2 === N ? "0" : `s${i + 2}`}`} onClick={(e) => smoothScrollTo(e, i + 2 === N ? "s0" : `s${i + 2}`)}>
                  {i + 2 === N ? "Restart" : "Next"}
                  <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 6h10M6 1l5 5-5 5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* ── Edit Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {editingWinner && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingWinner(null)}
              className="absolute inset-0 bg-[#020617]/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setEditingWinner(null)}
                className="absolute -top-4 -right-4 p-3 bg-slate-800 text-white rounded-full hover:bg-slate-700 transition-all shadow-2xl z-20"
              >
                <X className="w-5 h-5" />
              </button>
              <WinnerForm 
                winner={editingWinner} 
                onSuccess={() => setTimeout(() => setEditingWinner(null), 1500)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Delete Modal ─────────────────────────── */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setDeletingId(null);
        }}
        onConfirm={handleDelete}
        title="Delete Champion?"
        message="Are you sure you want to remove this champion from the Hall of Glory? This action cannot be undone."
        confirmText="Remove"
        cancelText="Keep"
      />

      <div id="credit">
        <a href="#" target="_blank" rel="noopener">CSL GALLERY</a>
      </div>
    </div>
  );
}
