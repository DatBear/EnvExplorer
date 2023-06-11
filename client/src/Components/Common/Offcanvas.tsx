import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@headlessui/react";
import { useEffect, useState } from "react";

type OffcanvasProps = {
  show: boolean;
  onHide: () => void;
}

export default function Offcanvas({ show, onHide, children }: React.PropsWithChildren<OffcanvasProps>) {
  const [isOpen, setIsOpen] = useState(show);

  useEffect(() => {
    setIsOpen(show);
  }, [show])

  return <Dialog open={isOpen} onClose={onHide} className="z-10 text-white">
    <div className="fixed inset-0 overflow-y-auto bg-black bg-opacity-60">
      <div className="flex min-h-screen justify-start">
        <Dialog.Panel className="w-96 bg-stone-900 p-2">
          {children}
        </Dialog.Panel>
      </div>
    </div>
  </Dialog>
}

type OffcanvasHeaderProps = {
  closeButton?: boolean;
};

Offcanvas.Header = function ({ children }: React.PropsWithChildren<OffcanvasHeaderProps>) {
  return <div className="flex flex-row justify-between">
    {children}
    <button className="p-2"><FontAwesomeIcon icon={faClose} /></button>
  </div>
}

type OffcanvasTitleProps = {
}

Offcanvas.Title = function ({ children }: React.PropsWithChildren<OffcanvasTitleProps>) {
  return <>{children}</>
}


type OffcanvasBodyProps = {

}

Offcanvas.Body = function ({ children }: React.PropsWithChildren<OffcanvasBodyProps>) {
  return <>{children}</>
}