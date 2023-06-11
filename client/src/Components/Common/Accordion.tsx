import { faChevronRight, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Disclosure } from "@headlessui/react"
import { Props } from "@headlessui/react/dist/types";
import clsx from "clsx";
import { ElementType, MutableRefObject } from "react";


type AccordionProps<TTag extends ElementType> = Props<TTag, AccordionRenderPropArg> & {
  defaultOpen?: boolean;
}

type AccordionRenderPropArg = {
  open: boolean
  close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void
}

export default function Accordion<TTag extends ElementType>({ defaultOpen, children }: AccordionProps<TTag>) {
  return <Disclosure defaultOpen={defaultOpen} as="div">
    {children}
  </Disclosure>
}

type AccordionButtonProps = {
  open: boolean;
}

Accordion.Button = function ({ open, children }: React.PropsWithChildren<AccordionButtonProps>) {
  return <Disclosure.Button className={clsx(open ? "text-emerald-300" : "text-gray-400", "w-full flex flex-row gap-2 items-center px-4 pt-4 text-left")} as="button">
    {!open && <FontAwesomeIcon icon={faChevronRight} className="-ml-1" size="sm" />}
    {open && <FontAwesomeIcon icon={faChevronDown} className="-ml-1" size="sm" />}
    <span className="pl-2">{children}</span>
  </Disclosure.Button>
}

Accordion.Panel = function ({ children }: React.PropsWithChildren) {
  return <Disclosure.Panel className="mx-4 px-1 py-3 border-emerald-800 border-l-2 w-full text-white"><div className="px-5">{children}</div></Disclosure.Panel>
}