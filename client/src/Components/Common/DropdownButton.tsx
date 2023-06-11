import { faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Menu } from "@headlessui/react";
import Environment from "../../Data/Environment";
import { ButtonHTMLAttributes, ReactElement } from "react";

type DropdownButtonProps = {
  title: ReactElement | string;
}

export default function DropdownButton({ title, children }: React.PropsWithChildren<DropdownButtonProps>) {
  return <Menu as="div" className="relative">
    <Menu.Button className="inline-flex justify-center items-center bg-emerald-800 rounded-md p-1 px-2 w-max">
      {title} <FontAwesomeIcon icon={faChevronDown} className="pl-2" />
    </Menu.Button>
    <Menu.Items className="absolute right-0 mt-2 rounded-md bg-white shadow-lg cursor-pointer overflow-hidden w-max z-10">
      {children}
    </Menu.Items>
  </Menu>
}

export function Dropdown() {
  throw new Error("this is only meant as a namespace");
}

type DropdownItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {

};

Dropdown.Item = function ({ children, ...props }: React.PropsWithChildren<DropdownItemProps>) {
  return <Menu.Item as="button" {...props} className="w-full hover:bg-emerald-700 hover:text-white flex text-stone-900 px-2 py-2 text-sm">{children}</Menu.Item>
}