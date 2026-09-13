import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Check, Warning, Info, X } from '@phosphor-icons/react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Standalone global trigger for usage outside React components
let globalShowToast: ((message: string, type?: ToastType, duration?: number) => void) | null = null;

export const toast = {
  success: (message: string, duration?: number) => {
    if (globalShowToast) globalShowToast(message, 'success', duration);
    else console.log('[Toast:success]', message);
  },
  error: (message: string, duration?: number) => {
    if (globalShowToast) globalShowToast(message, 'error', duration);
    else console.error('[Toast:error]', message);
  },
  info: (message: string, duration?: number) => {
    if (globalShowToast) globalShowToast(message, 'info', duration);
    else console.log('[Toast:info]', message);
  },
  warning: (message: string, duration?: number) => {
    if (globalShowToast) globalShowToast(message, 'warning', duration);
    else console.warn('[Toast:warning]', message);
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration: number = 4000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type, duration }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  useEffect(() => {
    globalShowToast = showToast;
    return () => {
      globalShowToast = null;
    };
  }, [showToast]);

  const success = useCallback(
    (message: string, duration?: number) => showToast(message, 'success', duration),
    [showToast]
  );
  const error = useCallback(
    (message: string, duration?: number) => showToast(message, 'error', duration),
    [showToast]
  );
  const info = useCallback(
    (message: string, duration?: number) => showToast(message, 'info', duration),
    [showToast]
  );
  const warning = useCallback(
    (message: string, duration?: number) => showToast(message, 'warning', duration),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, success, error, info, warning, removeToast }}>
      {children}

      {/* Floating Accessible Toast Container */}
      <aside
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 sm:bottom-6 inset-x-3 sm:inset-x-auto sm:right-6 z-50 flex flex-col gap-2.5 max-w-full sm:max-w-md pointer-events-none pb-[env(safe-area-inset-bottom)]"
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          return (
            <div
              key={t.id}
              role={isError ? 'alert' : 'status'}
              className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-2xl border shadow-xl text-xs font-sans transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
                isSuccess
                  ? 'bg-[#1F4D3E] text-white border-[#153A2E] shadow-emerald-950/20'
                  : isError
                  ? 'bg-rose-950 text-rose-50 border-rose-800 shadow-rose-950/25'
                  : isWarning
                  ? 'bg-[#EFE2C4] text-[#7A5813] border-[#D8C28A] shadow-amber-950/15'
                  : 'bg-[#FAF7EF] text-[#1E241F] border-[#E3DCC8] shadow-neutral-900/10'
              }`}
            >
              <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                <span className="shrink-0">
                  {isSuccess && <Check size={16} weight="bold" className="text-emerald-300" />}
                  {isError && <Warning size={16} weight="bold" className="text-rose-400" />}
                  {isWarning && <Warning size={16} weight="bold" className="text-[#B8862E]" />}
                  {!isSuccess && !isError && !isWarning && <Info size={16} weight="bold" className="text-[#1F4D3E]" />}
                </span>
                <p className="font-medium leading-relaxed break-words">{t.message}</p>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className={`min-h-[44px] min-w-[44px] -m-2 p-2 inline-flex items-center justify-center rounded-lg transition-colors shrink-0 cursor-pointer ${
                  isSuccess
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : isError
                    ? 'text-rose-200 hover:text-white hover:bg-white/10'
                    : 'text-[#5B5C50] hover:text-[#1E241F] hover:bg-black/5'
                }`}
                aria-label="Dismiss notification"
              >
                <X size={14} weight="bold" />
              </button>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
