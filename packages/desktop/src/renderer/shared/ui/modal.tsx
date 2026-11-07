import * as Dialog from '@radix-ui/react-dialog'
import type { ReactNode } from 'react'
import { X } from './icons'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  children: ReactNode
}

export function Modal({ open, onOpenChange, title, description, children }: Props) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/60" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[560px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-panel p-6 shadow-2xl">
          <div className="mb-2 flex items-start justify-between">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 text-muted hover:bg-panel-2 hover:text-text" aria-label="Fechar">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-4 text-sm text-muted">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
