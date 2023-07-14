import { OptionHTMLAttributes } from "react";

type OptionProps = OptionHTMLAttributes<HTMLOptionElement> & {
};

export default function Option({ children, ...props }: React.PropsWithChildren<OptionProps>) {
  return <option {...props} className="bg-secondary-black text-white">{children}</option>
}