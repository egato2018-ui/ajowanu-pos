import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-[#B47805] shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#123F46] shrink-0" />,
  };

  const borders: Record<ToastType, string> = {
    success: 'border-emerald-200 bg-white shadow-md text-emerald-950',
    warning: 'border-[#F2C14E]/60 bg-white shadow-md text-slate-900',
    error: 'border-rose-200 bg-white shadow-md text-rose-950',
    info: 'border-[#123F46]/20 bg-white shadow-md text-slate-900',
  };

  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border ${borders[toast.type]} min-w-[280px] max-w-sm transition-all duration-200 animate-in fade-in slide-in-from-top-2`}>
      <div className="mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        {toast.title && <h5 className="font-bold text-xs tracking-tight">{toast.title}</h5>}
        <p className="text-xs text-slate-700 leading-snug">{toast.message}</p>
      </div>
      <button
        onClick={() => onClose(toast.id)}
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
