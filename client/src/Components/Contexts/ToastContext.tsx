import { nanoid } from "nanoid";
import React, { createContext, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";

type ToastContextType = {
  addToast: (opt: ToastOptions) => void;
  clearToasts: () => void;
}

type ToastOptions = {
  id?: string;
  message: string;
  show?: boolean;
  duration?: number;
  textColor?: ToastVariant;
  autohide?: boolean;
}

type ToastVariant = 'success' | 'danger' | 'light' | string;

const ToastContext = createContext<ToastContextType | null>(null);

export default ToastContext;

export function ToastContextProvider({ children } : React.PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastOptions[]>([]);

  const addToast = (opt: ToastOptions) => {
    const toast : ToastOptions = {
      ...opt, 
      id: nanoid(),
      show: opt.show ?? true,
      duration: opt.duration ?? opt.textColor === 'danger' ? 10000 : 2000,
      autohide: opt.autohide ?? true,
      textColor: opt.textColor ?? 'dark'
    };
    setToasts([...toasts, toast]);
  }

  const clearToasts = () => {
    setToasts([]);
  }

  const removeToast = (id: string) => {
    const remainingToasts = toasts.filter(x => x.id !== id);
    setToasts(remainingToasts);
  }

  return (
    <ToastContext.Provider value={{addToast, clearToasts}}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(x => {
          return <Toast key={x.id} id={x.id} autohide={x.autohide} delay={x.duration} onClose={() => removeToast(x.id!)}>
            <Toast.Header>
              <img src="/img/icon.png" className="rounded me-2" style={{width: '20px', height: '20px' }} alt="Sweet EnvExplorer logo lookin fly" />
              <span className="me-auto">EnvExplorer</span>
            </Toast.Header>
            <Toast.Body><span className={"text-"+x.textColor}>{x.message}</span></Toast.Body>
          </Toast>
        })}
      </ToastContainer>      
    </ToastContext.Provider>
  );
};

export function useToasts() {
  return React.useContext(ToastContext)!;
}