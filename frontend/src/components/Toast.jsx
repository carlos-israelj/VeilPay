import { useState, useEffect } from 'react';

let toastId = 0;
const toastListeners = new Set();

export const toast = {
  success: (message, duration = 4000) => {
    const id = toastId++;
    toastListeners.forEach(listener =>
      listener({ id, message, type: 'success', duration })
    );
  },
  error: (message, duration = 5000) => {
    const id = toastId++;
    toastListeners.forEach(listener =>
      listener({ id, message, type: 'error', duration })
    );
  },
  info: (message, duration = 4000) => {
    const id = toastId++;
    toastListeners.forEach(listener =>
      listener({ id, message, type: 'info', duration })
    );
  }
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (toast) => {
      setToasts(prev => [...prev, toast]);

      // Auto remove after duration
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toast.id));
      }, toast.duration);
    };

    toastListeners.add(listener);
    return () => toastListeners.delete(listener);
  }, []);

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="fixed bottom-0 right-0 p-4 z-[9999] flex flex-col gap-3 max-w-md pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`crypto-toast ${toast.type} pointer-events-auto`}
          onClick={() => removeToast(toast.id)}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              {toast.type === 'success' && (
                <div className="w-5 h-5 border border-[#00ff88] flex items-center justify-center text-[#00ff88]">
                  ✓
                </div>
              )}
              {toast.type === 'error' && (
                <div className="w-5 h-5 border border-red-400 flex items-center justify-center text-red-400">
                  ✕
                </div>
              )}
              {toast.type === 'info' && (
                <div className="w-5 h-5 border border-[#00ff88]/60 flex items-center justify-center text-[#00ff88]/60">
                  i
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm ${
                toast.type === 'success' ? 'text-[#00ff88]' :
                toast.type === 'error' ? 'text-red-400' :
                'text-[#00ff88]/80'
              }`}>
                {toast.message}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeToast(toast.id);
              }}
              className="flex-shrink-0 text-gray-500 hover:text-white transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
