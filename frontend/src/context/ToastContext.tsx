import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3200) => {
    const id = `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, [hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {/* Toast Overlay Container: Centered at top of screen / mobile container */}
      <div 
        aria-live="polite"
        className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col items-center gap-2 pointer-events-none w-full max-w-sm px-4"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-bold w-full backdrop-blur-md transition-all animate-slideDown ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-100 border-emerald-800/80 shadow-emerald-950/20'
                : toast.type === 'error'
                ? 'bg-rose-950/90 text-rose-100 border-rose-800/80 shadow-rose-950/20'
                : 'bg-gray-950/90 text-gray-100 border-gray-800/80 shadow-gray-950/20'
            }`}
          >
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              {toast.type === 'success' && <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
              {toast.type === 'info' && <Info size={18} className="text-blue-400 shrink-0" />}
              <span className="truncate leading-snug">{toast.message}</span>
            </div>
            <button
              type="button"
              onClick={() => hideToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 transition"
              aria-label="알림 닫기"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
