import React, { useEffect, useRef, useState } from 'react';
import { Activity, ShieldCheck, Sparkles, Cpu, Heart, Building2, CheckCircle2 } from 'lucide-react';

const Hero3DVisual = () => {
  const canvasRef = useRef(null);
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('hospital'); // 'hospital' | 'dna' | 'vitals'

  // 3D Double Helix DNA Animation Canvas
  useEffect(() => {
    if (activeTab !== 'dna') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId;
    let angle = 0;

    const dpr = window.devicePixelRatio || 1;
    const width = 360;
    const height = 240;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const rungs = 24;
    const radius = 64;
    const spacing = 9.5;
    const centerY = height / 2;
    const centerX = width / 2;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      angle += 0.022;

      const points = [];

      for (let i = 0; i < rungs; i++) {
        const y = centerY - ((rungs - 1) * spacing) / 2 + i * spacing;
        const currentAngle = angle + (i * Math.PI) / 6;

        const x1 = Math.cos(currentAngle) * radius;
        const z1 = Math.sin(currentAngle) * radius;

        const x2 = Math.cos(currentAngle + Math.PI) * radius;
        const z2 = Math.sin(currentAngle + Math.PI) * radius;

        points.push({
          y,
          p1: { x: centerX + x1, y, z: z1 },
          p2: { x: centerX + x2, y, z: z2 },
          zAvg: (z1 + z2) / 2,
        });
      }

      points.sort((a, b) => a.zAvg - b.zAvg);

      points.forEach(({ p1, p2 }) => {
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        gradient.addColorStop(0, p1.z > 0 ? 'rgba(6, 182, 212, 0.75)' : 'rgba(6, 182, 212, 0.25)');
        gradient.addColorStop(1, p2.z > 0 ? 'rgba(99, 102, 241, 0.75)' : 'rgba(99, 102, 241, 0.25)');

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.6;
        ctx.stroke();

        const scale1 = (p1.z + radius) / (2 * radius);
        const r1 = 3 + scale1 * 2.8;
        const alpha1 = 0.35 + scale1 * 0.65;
        ctx.beginPath();
        ctx.arc(p1.x, p1.y, r1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha1})`;
        ctx.shadowColor = 'rgba(6, 182, 212, 0.8)';
        ctx.shadowBlur = 10 * scale1;
        ctx.fill();
        ctx.shadowBlur = 0;

        const scale2 = (p2.z + radius) / (2 * radius);
        const r2 = 3 + scale2 * 2.8;
        const alpha2 = 0.35 + scale2 * 0.65;
        ctx.beginPath();
        ctx.arc(p2.x, p2.y, r2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha2})`;
        ctx.shadowColor = 'rgba(99, 102, 241, 0.8)';
        ctx.shadowBlur = 10 * scale2;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeTab]);

  // Interactive 3D Card Hover Tilt
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    setTilt({
      x: -(y / (rect.height / 2)) * 6,
      y: (x / (rect.width / 2)) * 6,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div 
      className="relative w-full max-w-lg mx-auto perspective-[1200px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 3D Glowing Ambient Halo Behind Card */}
      <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/25 via-cyan-500/25 to-teal-500/25 rounded-3xl blur-2xl opacity-80 animate-pulse-glow -z-10 pointer-events-none" />

      {/* Main 3D Card Container */}
      <div
        ref={cardRef}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
          transformStyle: 'preserve-3d',
        }}
        className="relative rounded-3xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/60 dark:border-slate-800/80 shadow-2xl overflow-hidden p-5 sm:p-6"
      >
        {/* Holographic Scanline Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75 animate-scanline pointer-events-none" />

        {/* Card Header with HUD Status & Mode Selector */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-slate-200/60 dark:border-slate-800/60 gap-2">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-black tracking-wider uppercase text-slate-800 dark:text-slate-200">
              Hospital 3D Diagnostic Center
            </span>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setActiveTab('hospital')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'hospital'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🏥 3D Hospital
            </button>
            <button
              onClick={() => setActiveTab('dna')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'dna'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🧬 3D DNA
            </button>
            <button
              onClick={() => setActiveTab('vitals')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                activeTab === 'vitals'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              💓 Live ECG
            </button>
          </div>
        </div>

        {/* 3D Visual Stage */}
        <div className="relative h-[240px] flex items-center justify-center my-3 overflow-hidden rounded-2xl bg-gradient-to-b from-indigo-500/10 via-cyan-500/5 to-transparent border border-indigo-500/20 shadow-inner group">
          
          {/* TAB 1: 3D Hospital / Futuristic Medical Visual Showcase */}
          {activeTab === 'hospital' && (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src="/hospital-hero.jpg"
                alt="3D Futuristic Hospital & Technology"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              {/* High-Tech Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

              {/* Floating Hologram Badges over the Hospital Image */}
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-cyan-500/40 text-[10px] font-bold text-cyan-300 flex items-center space-x-1.5 shadow-lg animate-float-3d">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span>3D AI Surgical Suite</span>
              </div>

              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md border border-emerald-500/40 text-[10px] font-bold text-emerald-300 flex items-center space-x-1 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>24/7 ICU Live</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-[11px] font-bold bg-slate-900/75 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
                <div className="flex items-center space-x-1.5">
                  <Building2 className="w-4 h-4 text-primary-400" />
                  <span>Sandeep Super Specialty Campus</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-extrabold bg-emerald-500/20 px-2 py-0.5 rounded-full">
                  NABH Accredited
                </span>
              </div>
            </div>
          )}

          {/* TAB 2: Real-time 3D DNA Canvas */}
          {activeTab === 'dna' && (
            <div className="relative w-full h-full flex items-center justify-center">
              <canvas
                ref={canvasRef}
                style={{ width: '360px', height: '240px' }}
                className="max-w-full drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-cyan-600 dark:text-cyan-400 flex items-center space-x-1 shadow-sm">
                <Cpu className="w-3 h-3 animate-spin" />
                <span>Molecular Helix: Active</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center space-x-1 shadow-sm">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>60 FPS 3D Render</span>
              </div>
            </div>
          )}

          {/* TAB 3: Live ECG Waveform Animation Stage */}
          {activeTab === 'vitals' && (
            <div className="w-full h-full flex flex-col justify-center px-4 relative">
              <div className="flex items-center justify-between text-[11px] font-extrabold text-slate-500 dark:text-slate-400 mb-2">
                <span className="flex items-center space-x-1 text-rose-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 animate-bounce" />
                  <span>HEART RATE: 72 BPM</span>
                </span>
                <span className="text-emerald-500 font-bold">STABLE SINUS</span>
              </div>

              <div className="relative h-20 w-full overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="ecgGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#ec4899" stopOpacity="1" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.2" />
                    </linearGradient>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <line x1="0" y1="50" x2="500" y2="50" stroke="rgba(148, 163, 184, 0.2)" strokeDasharray="4 4" />
                  
                  <path
                    d="M 0,50 L 100,50 L 120,40 L 130,55 L 140,50 L 155,50 L 165,15 L 175,85 L 185,50 L 200,50 L 210,42 L 225,50 L 320,50 L 335,40 L 345,55 L 355,50 L 370,50 L 380,15 L 390,85 L 400,50 L 415,50 L 425,42 L 440,50 L 500,50"
                    fill="none"
                    stroke="url(#ecgGrad)"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#glow)"
                  />
                </svg>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-200/40 dark:border-slate-800/40 text-[10px] text-center">
                <div>
                  <p className="text-slate-400">SpO2</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">99%</p>
                </div>
                <div>
                  <p className="text-slate-400">Blood Pressure</p>
                  <p className="font-extrabold text-slate-800 dark:text-slate-100">120/80</p>
                </div>
                <div>
                  <p className="text-slate-400">AI Risk Index</p>
                  <p className="font-extrabold text-emerald-500">0.02 (Low)</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Live Diagnostics Key Value Badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-1.5">
          <div className="p-2.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-950/20 border border-indigo-500/10 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Robotic Precision</p>
              <h5 className="font-black text-xs text-slate-800 dark:text-slate-200">99.8% Certified</h5>
            </div>
          </div>

          <div className="p-2.5 rounded-2xl bg-teal-500/5 dark:bg-teal-950/20 border border-teal-500/10 flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-medium">Triage Response</p>
              <h5 className="font-black text-xs text-slate-800 dark:text-slate-200">&lt; 15 Seconds</h5>
            </div>
          </div>
        </div>

        {/* Medical Director / Founder Attribution Pill */}
        <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-800/60 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2">
            <img
              src="/avatar.jpg"
              alt="Medical Director"
              className="w-7 h-7 rounded-full object-cover border border-primary-500/40 shadow-sm"
            />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block leading-tight">Dr. Sandeep</span>
              <span className="text-[9px] text-slate-400">Medical Director & Architect</span>
            </div>
          </div>
          <span className="text-[10px] font-extrabold text-primary-500 bg-primary-500/10 px-2.5 py-0.5 rounded-full">
            Lucknow, UP
          </span>
        </div>
      </div>
    </div>
  );
};

export default Hero3DVisual;
