import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ConfirmationModal: React.FC = () => {
  const { confirmDialog, closeConfirmation } = useApp();

  if (!confirmDialog.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn no-print">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-full flex-shrink-0 ${confirmDialog.isDangerous ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">{confirmDialog.title}</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{confirmDialog.message}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
            <button
              onClick={closeConfirmation}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmDialog.onConfirm}
              className={`px-5 py-2 text-xs font-bold text-white rounded-lg shadow-sm cursor-pointer transition-colors ${
                confirmDialog.isDangerous
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }`}
            >
              {confirmDialog.confirmLabel || 'Proceed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
