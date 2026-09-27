import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4">
        {toasts.map((item) => {
          let bg = 'bg-white border-slate-200 text-slate-800';
          let icon = <Info className="w-5 h-5 text-sky-500 shrink-0" />;

          if (item.type === 'success') {
            bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
            icon = <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
          } else if (item.type === 'error') {
            bg = 'bg-rose-50 border-rose-200 text-rose-900';
            icon = <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
          } else if (item.type === 'warning') {
            bg = 'bg-amber-50 border-amber-200 text-amber-900';
            icon = <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
          }

          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg animate-slide-down transition-all ${bg}`}
            >
              {icon}
              <div className="flex-1 text-sm font-medium leading-relaxed">
                {item.message}
              </div>
              <button
                onClick={() => removeToast(item.id)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition-colors"
                aria-label="Đóng thông báo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
