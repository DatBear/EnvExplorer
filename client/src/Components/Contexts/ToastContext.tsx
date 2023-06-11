import { nanoid } from "nanoid";
import React, { createContext, useCallback, useState } from "react";
import icon from '../../Images/icon.png';
import Toast from "../Common/Toast";

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

const textColors: Record<ToastVariant, string> = {
  ['success']: 'text-green-500',
  ['danger']: 'text-red-500',
  ['light']: 'text-white'
}

const ToastContext = createContext<ToastContextType | null>(null);

export default ToastContext;

export function ToastContextProvider({ children }: React.PropsWithChildren) {
  const [toasts, setToasts] = useState<Required<ToastOptions>[]>([]);

  const addToast = (opt: ToastOptions) => {
    const toast: Required<ToastOptions> = {
      ...opt,
      id: nanoid(),
      show: opt.show ?? true,
      duration: opt.duration ?? opt.textColor === 'danger' ? 10000 : 3000,
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
    setToasts(t => [...t.filter(x => x.id !== id)]);
  }

  return (
    <ToastContext.Provider value={{ addToast, addErrorToast }}>

      <div className="fixed flex flex-col align-bottom z-10 items-end right-0 top-0 p-3 gap-4">
        {toasts.map(x => {
          return <Toast key={x.id} {...x} onClose={() => removeToast(x.id!)} textColor={textColors[x.textColor]} />
        })}
      </div>
      {children}
    </ToastContext.Provider>
  );
};

export function useToasts() {
  return React.useContext(ToastContext)!;
}