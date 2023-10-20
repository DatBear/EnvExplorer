import clsx from "clsx";
import { TextareaHTMLAttributes } from "react";



type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
};

export default function TextArea({ className, ...props }: React.PropsWithChildren<TextareaProps>) {
  const classes = clsx(className, "p-1 px-2 rounded-md bg-inherit outline outline-1 outline-primary-800 text-white w-full");
  return <textarea {...props} className={classes} />
}