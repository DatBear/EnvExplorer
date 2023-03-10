import { nanoid } from "nanoid";
import React, { createContext, useCallback, useState } from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import icon from '../../Images/icon.png';

type ToastContextType = {
  addToast: (opt: ToastOptions) => void;
  addErrorToast: (err: any) => void;
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

export function ToastContextProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<Required<ToastOptions>[]>([]);

  const addToast = (opt: ToastOptions) => {
    const toast: Required<ToastOptions> = {
      ...opt,
      id: nanoid(),
      show: opt.show ?? true,
      duration: opt.duration ?? opt.textColor === 'danger' ? 10000 : 2000,
      autohide: opt.autohide ?? true,
      textColor: opt.textColor ?? 'light'
    };
    setToasts([...toasts, toast]);
  }

  const addErrorToast = useCallback((err: any) => {
    addToast({
      message: 'Error: ' + err.toString().replaceAll(/^Error: /g, ''),
      textColor: 'danger'
    });
  }, [addToast]);

  const removeToast = (id: string) => {
    setToasts([...toasts.filter(x => x.id !== id)]);
  }

  return (
    <ToastContext.Provider value={{ addToast, addErrorToast }}>
      {children}
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(x => {
          return <Toast key={x.id} id={x.id} autohide={x.autohide} delay={x.duration} onClose={() => removeToast(x.id!)}>
            <Toast.Header>
              <img src={icon} className="rounded me-2" style={{ width: '20px', height: '20px' }} alt="Sweet EnvExplorer logo lookin fly" />
              <span className="me-auto">EnvExplorer</span>
            </Toast.Header>
            <Toast.Body><span className={"text-" + x.textColor}>{x.message}</span></Toast.Body>
          </Toast>
        })}
      </ToastContainer>
    </ToastContext.Provider>
  );
};

export function useToasts() {
  return React.useContext(ToastContext)!;
}