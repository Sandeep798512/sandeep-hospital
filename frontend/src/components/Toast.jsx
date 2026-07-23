import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-emerald-50/90 dark:bg-emerald-950/40 border-emerald-500/30',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
    error: {
      bg: 'bg-red-50/90 dark:bg-red-950/40 border-red-500/30',
      icon: <AlertCircle className="w-5 h-5 text-red-500" />,
    },
    info: {
      bg: 'bg-primary-50/90 dark:bg-primary-950/40 border-primary-500/30',
      icon: <Info className="w-5 h-5 text-primary-500" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center p-4 border rounded-xl shadow-glass backdrop-blur-md transition-all duration-300 fade-in ${config.bg}`}>
      <div className="flex-shrink-0 mr-3">{config.icon}</div>
      <div className="mr-8 text-sm font-medium text-slate-800 dark:text-slate-200">
        {message}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
