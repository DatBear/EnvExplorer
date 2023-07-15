import clsx from "clsx";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: string;
};

const variants: Record<string, string> = {
  'success': 'bg-primary-800 hover:bg-primary-700',
  'danger': 'bg-red-800 hover:bg-red-700'
}

export default function Button({ className, variant, ...props }: React.PropsWithChildren<ButtonProps>) {
  variant ??= 'success';
  const classes = clsx(className, variants[variant], "p-1 px-2 rounded-md text-white")
  return <button {...props} className={classes}>{props.children}</button>
}