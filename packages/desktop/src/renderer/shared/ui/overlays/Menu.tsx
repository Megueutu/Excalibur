import * as Dropdown from '@radix-ui/react-dropdown-menu'
import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** A menu that opens from a control. Radix handles focus, keyboard and dismissal; this only dresses it. */
export const Menu = Dropdown.Root
export const MenuTrigger = Dropdown.Trigger

export function MenuContent({ children, align = 'end' }: { children: ReactNode; align?: 'start' | 'end' }) {
  return (
    <Dropdown.Portal>
      <Dropdown.Content align={align} sideOffset={6} className="menu-sheet surface-page z-50 min-w-56 rounded-lg p-1.5 shadow-2xl outline-none">
        {children}
      </Dropdown.Content>
    </Dropdown.Portal>
  )
}

type ItemProps = { icon?: ReactNode; children: ReactNode; onSelect: () => void; checked?: boolean }

export function MenuItem({ icon, children, onSelect, checked }: ItemProps) {
  return (
    <Dropdown.Item
      onSelect={onSelect}
      className={cn('no-drag flex h-control cursor-pointer items-center gap-3 rounded-md px-3 text-body outline-none transition-colors duration-100 data-[highlighted]:bg-hover', checked && 'font-semibold')}
    >
      {icon ? <span className="flex size-4 shrink-0 items-center justify-center text-muted">{icon}</span> : null}
      <span className="flex-1">{children}</span>
      {checked ? <span className="size-1.5 rounded-full bg-primary" /> : null}
    </Dropdown.Item>
  )
}

export function MenuSeparator() {
  return <Dropdown.Separator className="my-1.5 h-px bg-selected" />
}
