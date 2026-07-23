import React from 'react';

const Loader = ({ fullPage = false }) => {
  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      {/* Premium glowing spinner */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-primary-500/20"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-accent-cyan border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-primary-600/10 rounded-full blur-xs"></div>
      </div>
      <p className="text-sm font-medium tracking-wider text-slate-500 dark:text-slate-400 animate-pulse">
        SANDEEP HOSPITAL
      </p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};

export default Loader;
