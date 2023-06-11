import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export default function Button({ className, ...props }: React.PropsWithChildren<ButtonProps>) {
  const classes = clsx(className, "p-1 px-2 rounded-md bg-emerald-800 hover:bg-emerald-700 text-white")
  return <button {...props} className={classes}>{props.children}</button>
}