import React, { useState, useCallback, createContext, useContext, useRef } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: <CheckCircle2 size={17} className="text-emerald-500 flex-shrink-0" />,
  error:   <XCircle     size={17} className="text-red-500 flex-shrink-0" />,
  warning: <AlertTriangle size={17} className="text-amber-500 flex-shrink-0" />,
  info:    <Info        size={17} className="text-blue-500 flex-shrink-0" />,
};

const BORDER = {
  success: 'border-l-emerald-400',
  error:   'border-l-red-400',
  warning: 'border-l-amber-400',
  info:    'border-l-blue-400',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++idRef.current;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
    return id;
  }, []);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 bg-white border border-fiori-borderLight border-l-4 ${BORDER[t.type] || BORDER.info} rounded-lg shadow-lg px-4 py-3 min-w-[280px] max-w-sm animate-[slideIn_0.2s_ease]`}
            style={{ animation: 'slideIn 0.2s ease' }}
          >
            {ICONS[t.type] || ICONS.info}
            <p className="flex-1 text-xs font-semibold text-fiori-textDark leading-snug">{t.message}</p>
            <button onClick={() => dismiss(t.id)} className="text-fiori-textMuted hover:text-fiori-textDark transition-colors ml-1">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** useToast() → returns toast(message, type?, duration?) */
export function useToast() {
  return useContext(ToastContext);
}
