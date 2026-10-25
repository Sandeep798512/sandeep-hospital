import React, { useEffect, useRef } from 'react';

const Background3D = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current.targetX = (e.clientX - width / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - height / 2) * 0.05;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Particles / Connected Neural Constellation
    const particleCount = Math.min(width < 768 ? 30 : 55, 60);
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 800 + 100, // Depth
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1.2,
        color: i % 3 === 0 ? 'rgba(99, 102, 241, ' : (i % 3 === 1 ? 'rgba(6, 182, 212, ' : 'rgba(20, 184, 166, ')
      });
    }

    const focalLength = 400;

    const render = () => {
      // Smooth mouse interpolation
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2 + mouseRef.current.x;
      const cy = height / 2 + mouseRef.current.y;

      // Update & project particles in 3D
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Wrap around 3D box
        if (p.z <= 50) p.z = 900;
        if (p.z > 900) p.z = 50;
        if (p.x < -width) p.x = width;
        if (p.x > width) p.x = -width;
        if (p.y < -height) p.y = height;
        if (p.y > height) p.y = -height;

        const scale = focalLength / (focalLength + p.z);
        const projX = cx + p.x * scale;
        const projY = cy + p.y * scale;
        const alpha = Math.min(Math.max((1 - p.z / 900) * 0.8, 0.1), 0.75);

        projected.push({
          x: projX,
          y: projY,
          scale,
          alpha,
          color: p.color,
          radius: p.radius * scale * 1.5,
        });

        // Draw particle
        ctx.beginPath();
        ctx.arc(projX, projY, Math.max(p.radius * scale * 1.5, 0.8), 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${alpha})`;
        ctx.shadowColor = p.color + '0.8)';
        ctx.shadowBlur = 8 * scale;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw 3D connecting filaments
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            const lineAlpha = (1 - dist / 120) * Math.min(p1.alpha, p2.alpha) * 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(99, 102, 241, ${lineAlpha})`;
            ctx.lineWidth = 0.75 * p1.scale;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 select-none">
      {/* 3D Medical Visual Backdrop with glowing perspective */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 dark:opacity-25 mix-blend-luminosity dark:mix-blend-screen scale-105 animate-float-3d transition-opacity duration-700"
        style={{
          backgroundImage: `url('/hero-3d-bg.jpg')`,
        }}
      />

      {/* Cybernetic Gradient Lighting Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/30 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute top-1/3 -right-32 w-[480px] h-[480px] bg-cyan-500/15 dark:bg-teal-500/20 rounded-full blur-[140px] animate-float-3d-reverse" />
      <div className="absolute bottom-10 left-1/3 w-[520px] h-[360px] bg-primary-600/10 dark:bg-purple-600/15 rounded-full blur-[160px]" />

      {/* Interactive 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 dark:opacity-85"
      />

      {/* High-Tech Vignette & Grid Mask to blend seamlessly with dark/light themes */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50/90 dark:to-slate-950/95" />
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-slate-50/60 dark:to-slate-950/70" />
    </div>
  );
};

export default Background3D;
