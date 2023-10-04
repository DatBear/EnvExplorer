import clsx from "clsx";
import { CSSProperties } from "react";

type TableProps = {
  className?: string;
}
export default function Table({ className, children }: React.PropsWithChildren<TableProps>) {
  const classes = clsx(className, "border border-primary-300 border-opacity-40 p-2 w-full");
  return <table className={classes}>
    {children}
  </table>
}


type ThProps = {
  className?: string;
}
export function Th({ className, children }: React.PropsWithChildren<ThProps>) {
  const classes = clsx(className, "border border-primary-300 border-opacity-40 p-2 wrap");
  return <th className={classes}>{children}</th>
}

type TrProps = {
  className?: string;
}

export function Tr({ children, ...props }: React.PropsWithChildren<TrProps>) {
  return <tr {...props}>{children}</tr>
}

type TdProps = {
  className?: string;
  style?: CSSProperties;
}

export function Td({ className, style, children }: React.PropsWithChildren<TdProps>) {
  const classes = clsx(className, "border border-primary-300 border-opacity-40 p-2 wrap");
  return <td className={classes} style={style}>{children}</td>
}
