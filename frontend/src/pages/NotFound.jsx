import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Home } from 'lucide-react';
import GlassCard from '../components/GlassCard';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 transition-colors duration-300">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-pulse-glow"></div>
      
      <div className="w-full max-w-md text-center relative z-10">
        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 mx-auto mb-6 border border-red-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h1 className="text-6xl font-black text-slate-800 dark:text-white tracking-widest">404</h1>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mt-4">Page Not Found</h2>
        <p className="text-xs text-slate-550 dark:text-slate-400 mt-2 max-w-xs mx-auto leading-relaxed">
          The dashboard link you are trying to reach does not exist or has been shifted to another medical ward.
        </p>

        <Link
          to="/login"
          className="inline-flex items-center space-x-2 mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold text-xs shadow-lg shadow-primary-500/25 transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
