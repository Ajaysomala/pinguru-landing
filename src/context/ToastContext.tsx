import React, { createContext, useContext, useState, useCallback } from 'react';

interface ToastContextValue {
  toastMessage: string | null;
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toastMessage: null,
  showToast: () => {},
});

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((current) => (current === message ? null : current));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ toastMessage, showToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
