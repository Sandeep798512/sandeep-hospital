import React from 'react';

const GlassCard = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl p-6 transition-all duration-300 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/50 ${
        onClick ? 'cursor-pointer hover:translate-y-[-4px] hover:shadow-xl hover:border-primary-500/40 dark:hover:border-primary-500/40' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default GlassCard;
