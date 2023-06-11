import clsx from "clsx";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {

};

export default function Input({ className, ...props }: React.PropsWithChildren<InputProps>) {
  const classes = clsx(className, "p-1 px-2 rounded-md bg-inherit outline outline-1 outline-emerald-800 text-white");
  return <input {...props} className={classes} />
}