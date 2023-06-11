import clsx from "clsx";
import { CSSProperties } from "react";

export default function Table({ children }: React.PropsWithChildren) {
  return <table className="border border-emerald-300 border-opacity-40 p-2 w-full">
    {children}
  </table>
}

export function Th({ children }: React.PropsWithChildren) {
  return <th className="border border-emerald-400 border-opacity-40 p-2">{children}</th>
}

export function Tr({ children }: React.PropsWithChildren) {
  return <tr>{children}</tr>
}

type TdProps = {
  className?: string;
  style?: CSSProperties;
}

export function Td({ className, style, children }: React.PropsWithChildren<TdProps>) {
  const classes = clsx(className, "border border-emerald-400 border-opacity-40 p-2 wrap");
  return <td className={classes} style={style}>{children}</td>
}
