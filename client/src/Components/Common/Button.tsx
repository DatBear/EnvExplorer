import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

export default function Button({ className, ...props }: React.PropsWithChildren<ButtonProps>) {
  const classes = clsx(className, "p-1 px-2 rounded-md bg-primary-800 hover:bg-primary-700 text-white")
  return <button {...props} className={classes}>{props.children}</button>
}