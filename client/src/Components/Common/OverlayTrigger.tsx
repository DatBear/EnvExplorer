import { Placement, autoUpdate, useDismiss, useFloating, useFocus, useHover, useInteractions, useRole, flip, shift, offset } from "@floating-ui/react";
import { PropsWithChildren, ReactElement, useState } from "react"


type OverlayTriggerProps = {
  overlay: ReactElement;
  placement?: Placement;
}

export default function OverlayTrigger({ overlay, placement, children }: PropsWithChildren<OverlayTriggerProps>) {
  const [isOpen, setIsOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    whileElementsMounted: autoUpdate,
    placement: placement ?? 'top',
    middleware: [offset(3), flip(), shift()],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return <>
    <span ref={refs.setReference} {...getReferenceProps()}>
      {children}
    </span>
    {isOpen && <div ref={refs.setFloating} style={{ ...floatingStyles }} {...getFloatingProps()} className="bg-secondary-800 rounded-md max-w-sm border border-teal-800 p-2">
      {overlay}
    </div>}
  </>
}