import React from 'react';
import { AlertTriangle, CheckCircle, Info, X, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none no-print">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
          error: <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white text-slate-900',
          error: 'border-rose-200 bg-white text-slate-900',
          warning: 'border-amber-200 bg-white text-slate-900',
          info: 'border-sky-200 bg-white text-slate-900',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl shadow-lg border text-xs font-medium transition-all animate-slideUp ${borders[toast.type]}`}
          >
            <div className="flex items-center gap-2.5">
              {icons[toast.type]}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
