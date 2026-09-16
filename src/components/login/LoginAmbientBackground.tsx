import React from 'react';
import { motion } from 'motion/react';

interface LoginAmbientBackgroundProps {
  mouseX: number;
  mouseY: number;
}

export const LoginAmbientBackground: React.FC<LoginAmbientBackgroundProps> = ({ mouseX, mouseY }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0 bg-[#FAF7F2]">
      
      {/* 1. Base Subtle Paper Grain Texture */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.038] mix-blend-multiply"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="ajowanu-paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#ajowanu-paper-texture)" />
      </svg>

      {/* 2. Architectural Luxury Gradients & Volumetric Ambient Lights */}
      {/* Top-Left: Warm Terracotta & Amber Sunbeam */}
      <motion.div 
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.22, 0.28, 0.22]
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-[15%] -left-[10%] w-[65vw] h-[65vw] max-w-[950px] max-h-[950px] rounded-full blur-[130px] transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(216, 92, 58, 0.30) 0%, rgba(242, 193, 78, 0.20) 45%, rgba(250, 247, 242, 0) 75%)',
          transform: `translate3d(${mouseX * 30}px, ${mouseY * 30}px, 0)`,
        }}
      />

      {/* Bottom-Right: Deep Oceanic Teal & Indigo Depth */}
      <motion.div 
        animate={{ 
          scale: [1, 1.06, 1],
          opacity: [0.18, 0.25, 0.18]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        className="absolute -bottom-[20%] -right-[12%] w-[70vw] h-[70vw] max-w-[1000px] max-h-[1000px] rounded-full blur-[140px] transition-transform duration-1000 ease-out"
        style={{
          background: 'radial-gradient(circle, rgba(18, 63, 70, 0.28) 0%, rgba(30, 92, 102, 0.16) 45%, rgba(250, 247, 242, 0) 75%)',
          transform: `translate3d(${-mouseX * 32}px, ${-mouseY * 32}px, 0)`,
        }}
      />

      {/* Center-Top: Soft Golden Skylight (Lifts the brand header) */}
      <div 
        className="absolute top-[5%] left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[110px] opacity-40"
        style={{
          background: 'radial-gradient(ellipse, rgba(242, 193, 78, 0.35) 0%, rgba(216, 92, 58, 0.12) 50%, rgba(250, 247, 242, 0) 80%)',
        }}
      />

      {/* Central Radiance: Soft Warm Cushion behind the Terminal */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[620px] rounded-full blur-[100px] opacity-85"
        style={{
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(248, 243, 235, 0.75) 50%, rgba(250, 247, 242, 0) 80%)',
        }}
      />

      {/* 3. Flowing Harmonic Wave Ribbons (Guilloche & Topographic Craftsmanship) */}
      <svg 
        className="absolute inset-0 w-full h-full opacity-[0.25]"
        viewBox="0 0 1440 900" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="wave-warm-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D85C3A" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#F2C14E" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#123F46" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="wave-teal-grad" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#123F46" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#2A6B74" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#D85C3A" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Harmonic flowing ribbons */}
        <motion.path 
          animate={{ d: [
            "M -100 250 C 250 180, 500 380, 850 260 C 1150 160, 1350 320, 1600 240",
            "M -100 260 C 260 200, 510 360, 860 270 C 1160 180, 1360 300, 1600 250",
            "M -100 250 C 250 180, 500 380, 850 260 C 1150 160, 1350 320, 1600 240"
          ]}}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          d="M -100 250 C 250 180, 500 380, 850 260 C 1150 160, 1350 320, 1600 240" 
          stroke="url(#wave-warm-grad)" 
          strokeWidth="1.5" 
          fill="none" 
        />

        <motion.path 
          animate={{ d: [
            "M -100 320 C 300 240, 600 460, 950 340 C 1220 230, 1400 400, 1600 310",
            "M -100 310 C 290 260, 590 440, 940 330 C 1230 250, 1410 380, 1600 320",
            "M -100 320 C 300 240, 600 460, 950 340 C 1220 230, 1400 400, 1600 310"
          ]}}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          d="M -100 320 C 300 240, 600 460, 950 340 C 1220 230, 1400 400, 1600 310" 
          stroke="url(#wave-warm-grad)" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          fill="none" 
        />

        <motion.path 
          animate={{ d: [
            "M -100 680 C 350 590, 650 780, 1050 630 C 1300 520, 1480 670, 1600 600",
            "M -100 670 C 360 610, 660 760, 1060 640 C 1310 540, 1490 650, 1600 610",
            "M -100 680 C 350 590, 650 780, 1050 630 C 1300 520, 1480 670, 1600 600"
          ]}}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          d="M -100 680 C 350 590, 650 780, 1050 630 C 1300 520, 1480 670, 1600 600" 
          stroke="url(#wave-teal-grad)" 
          strokeWidth="1.5" 
          fill="none" 
        />

        <motion.path 
          animate={{ d: [
            "M -100 740 C 400 660, 720 840, 1100 700 C 1350 600, 1500 740, 1600 680",
            "M -100 730 C 390 680, 710 820, 1090 710 C 1340 620, 1510 720, 1600 690",
            "M -100 740 C 400 660, 720 840, 1100 700 C 1350 600, 1500 740, 1600 680"
          ]}}
          transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          d="M -100 740 C 400 660, 720 840, 1100 700 C 1350 600, 1500 740, 1600 680" 
          stroke="url(#wave-teal-grad)" 
          strokeWidth="1" 
          strokeDasharray="6 6"
          fill="none" 
        />
      </svg>

      {/* 4. Precision Orbital Concentric Calibration Rings */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(-50%, -50%) translate3d(${mouseX * 18}px, ${mouseY * 18}px, 0)`,
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: 'linear' }}
          className="w-[820px] h-[820px] relative opacity-[0.28]"
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border border-dashed border-[#123F46]/35" />
          
          {/* Mid Golden Ring */}
          <div className="absolute inset-20 rounded-full border border-[#D85C3A]/30" />
          
          {/* Inner Precision Ring */}
          <div className="absolute inset-40 rounded-full border border-[#123F46]/25" />

          {/* Floating Orbiting Satellite Nodes */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-[#D85C3A] shadow-[0_0_14px_rgba(216,92,58,0.7)]" />
            <div className="absolute w-7 h-7 rounded-full border border-[#D85C3A]/40 animate-ping" />
          </div>

          <div className="absolute bottom-24 right-20 w-3 h-3 rounded-full bg-[#F2C14E] shadow-[0_0_12px_rgba(242,193,78,0.8)]" />
          
          <div className="absolute left-12 top-1/3 w-2.5 h-2.5 rounded-full bg-[#123F46] shadow-[0_0_10px_rgba(18,63,70,0.5)]" />
        </motion.div>
      </div>

      {/* 5. Refined Classical Corner Registration Marks (Elegant, Non-Robotic) */}
      <div className="absolute top-6 left-8 flex items-center gap-2.5 text-slate-400 font-bold text-[11px] tracking-wider uppercase">
        <div className="w-2 h-2 rounded-sm bg-[#D85C3A]/60" />
        <span className="text-slate-500 font-semibold tracking-widest text-[10px]">AJOWANU COMMERCE OS</span>
      </div>

      <div className="absolute top-6 right-8 flex items-center gap-2 text-slate-400 font-bold text-[10px] tracking-wider uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-slate-500 font-semibold tracking-widest">TERMINAL SÉCURISÉ // EN SERVICE</span>
      </div>

      {/* 6. Subtle Watermark Monogram Crest in Center Background */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-1 opacity-[0.035] pointer-events-none transition-transform duration-500"
        style={{
          transform: `translate(-50%, -50%) translate3d(${mouseX * 12}px, ${mouseY * 12}px, 0)`,
        }}
      >
        <div className="w-[420px] h-[420px] rounded-full border-12 border-[#123F46] flex items-center justify-center">
          <span className="text-[220px] font-black text-[#123F46] tracking-tighter select-none font-sans">
            A
          </span>
        </div>
      </div>

    </div>
  );
};
