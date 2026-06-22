import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full sm:w-auto">
        {toasts.map((toast) => {
          let bgColor = 'bg-white';
          let textColor = 'text-slate-800';
          let icon = null;

          switch (toast.type) {
            case 'success':
              bgColor = 'bg-orange-50 border-l-4 border-orange-500';
              icon = <CheckCircle className="text-orange-500 w-5 h-5 shrink-0" />;
              break;
            case 'error':
              bgColor = 'bg-rose-50 border-l-4 border-rose-500';
              icon = <XCircle className="text-rose-500 w-5 h-5 shrink-0" />;
              break;
            case 'warning':
              bgColor = 'bg-amber-50 border-l-4 border-amber-500';
              icon = <AlertCircle className="text-amber-500 w-5 h-5 shrink-0" />;
              break;
            default:
              bgColor = 'bg-blue-50 border-l-4 border-blue-500';
              icon = <AlertCircle className="text-blue-500 w-5 h-5 shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              className={`flex items-center justify-between p-4 rounded-r-xl shadow-lg border border-slate-100 animate-slide-in transition-all ${bgColor}`}
            >
              <div className="flex items-center gap-3">
                {icon}
                <p className={`text-sm font-medium ${textColor}`}>{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-4 p-1 rounded-full hover:bg-slate-200/50 text-slate-400 hover:text-slate-600 transition"
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

export const useToast = () => useContext(ToastContext);
export default ToastContext;
