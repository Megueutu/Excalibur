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
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content onOpenAutoFocus={(e) => e.preventDefault()} className="outline-none fixed left-1/2 top-1/2 z-50 max-h-[86vh] w-[560px] max-w-[92vw] -translate-x-1/2 -translate-y-1/2 overflow-auto rounded-lg bg-bg p-8 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <Dialog.Title className="text-[17px] font-semibold leading-[1.24] tracking-[-0.022em]">{title}</Dialog.Title>
            <Dialog.Close className="-mr-2 -mt-1 rounded-full p-2 text-muted hover:bg-panel hover:text-text" aria-label="Fechar">
              <X size={16} />
            </Dialog.Close>
          </div>
          <Dialog.Description className="mb-6 mt-1 text-sm text-muted">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
