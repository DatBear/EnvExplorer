import { Dialog } from "@headlessui/react";
import { PropsWithChildren, useEffect, useState } from "react";
import Button from "./Button";
import clsx from "clsx";


type ModalProps = {
  show: boolean;
  onHide: () => void;
  centered?: boolean;
  size?: string;
}

export default function Modal({ show, onHide, centered, size, children }: PropsWithChildren<ModalProps>) {
  const [isOpen, setIsOpen] = useState(show);

  useEffect(() => {
    setIsOpen(show);
  }, [show]);

  const sizeClasses: { [idx: string]: string } = {
    xl: "w-full max-w-4xl"
  }
  const classes = clsx("bg-stone-800 text-white border-emerald-800 border rounded-xl", size && sizeClasses[size]);
  return <Dialog open={isOpen} onClose={onHide} className="z-10">
    <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-60">
      <div className="flex min-h-full items-center justify-center p-4">
        <Dialog.Panel className={classes}>
          {children}
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
}

type ModalHeaderProps = {
  closeButton?: boolean;
}

Modal.Header = function ({ closeButton, children }: React.PropsWithChildren<ModalHeaderProps>) {
  return <Dialog.Title as="div" className="border-b border-stone-600 py-2 text-emerald-200 px-3">
    <h1 className="text-lg">{children}</h1>
  </Dialog.Title>
}

Modal.Body = function ({ children }: React.PropsWithChildren) {
  return <div className="p-3">{children}</div>
}

Modal.Footer = function ({ children }: React.PropsWithChildren) {
  return <div className="p-3 border-t border-stone-600 flex flex-row gap-3 justify-end">{children}</div>
}
