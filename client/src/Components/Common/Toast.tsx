import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import icon from '../../Images/icon.png';
import { faX } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";

type ToastProps = {
  autohide?: boolean;
  duration?: number;
  onClose: () => void;
  textColor: string;
  message: string;
}

export default function Toast({ autohide, duration, onClose, textColor, message }: ToastProps) {
  useEffect(() => {
    if (!autohide || !duration) return;

    var timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [autohide, duration, onClose]);

  return <div className="bg-zinc-800 rounded-md border border-emerald-800 shadow">
    <div className="flex flex-row gap-5 items-center justify-between border-b border-stone-400 p-3">
      <div className="flex flex-row gap-1 align-middle items-center">
        <img src={icon} className="rounded mr-2" style={{ width: '20px', height: '20px' }} alt="Sweet EnvExplorer logo" />
        <span className="text-stone-400">EnvExplorer</span>
      </div>
      <FontAwesomeIcon icon={faX} className="text-stone-400 px-2 -mx-2" onClick={onClose} />
    </div>
    <div className="max-w-sm p-3">
      <span className={textColor}>{message}</span>
    </div>
  </div>
}