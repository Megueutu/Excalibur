import { useUi } from '@/shared/state/ui-store'

/** The latest notice, at the bottom of the window. It leaves by itself. */
export function Toast() {
  const toast = useUi((s) => s.toast)
  if (!toast) return null
  return (
    <div key={toast.id} role="status" className="toast pointer-events-none fixed bottom-8 left-1/2 z-50 rounded-full bg-ink px-5 py-2.5 text-body font-semibold text-page shadow-2xl">
      {toast.text}
    </div>
  )
}
