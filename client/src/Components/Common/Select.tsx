import clsx from "clsx";
import { SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
};

export default function Select({ children, className, ...props }: React.PropsWithChildren<SelectProps>) {
  let classes = clsx(className, "p-1 px-2 rounded-md outline outline-1 outline-primary-800 bg-inherit text-white")
  return <select {...props} className={classes}>{children}</select>
}