import clsx from "clsx";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  type?: string;
  label?: string;
};

export default function Checkbox({ type, label, className, ...props }: React.PropsWithChildren<InputProps>) {
  type ??= "checkbox";
  const hasLabel = label && label !== "";
  const classes = clsx(className, "p-1 px-2 rounded-md accent-primary-800");
  if (!hasLabel) {
    return <input {...props} className={classes} />
  }

  return <label className="flex flex-row gap-2"><input {...props} className={classes} type={type} />{label}</label>
}