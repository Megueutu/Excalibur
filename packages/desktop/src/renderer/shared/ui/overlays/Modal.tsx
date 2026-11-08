import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
  /** A popup that needs room, such as one with a board in it. */
  wide?: boolean
}

/**
 * A popup. It closes with Escape or a click outside (no close button), the page behind
 * it blurs, and both the backdrop and the sheet animate in and out (see animations.css).
 */
export function Modal({ open, onOpenChange, title, description, children, wide }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="modal-overlay fixed inset-0 z-40 flex overflow-y-auto p-6">
          <Dialog.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            className={`modal-sheet m-auto ${wide ? 'w-(--modal-width-wide)' : 'w-(--modal-width)'} max-w-full surface-page rounded-lg p-8 shadow-2xl outline-none`}
          >
            <Dialog.Title className="text-title">{title}</Dialog.Title>
            <Dialog.Description className="mb-8 mt-1.5 text-body text-muted">{description}</Dialog.Description>
            {children}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
