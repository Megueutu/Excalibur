import { useEffect, type CSSProperties } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { selectSidebarCollapsed, useUi } from '@/shared/state/ui-store'
import { ArrowLeft, ArrowRight, SidebarToggle } from '@/shared/ui/icons'
import { CreateProjectDialog } from '@/features/projects/dialogs/CreateProjectDialog'
import { IncorporateProjectDialog } from '@/features/projects/dialogs/IncorporateProjectDialog'
import { SettingsDialog } from '@/features/settings/dialogs/SettingsDialog'
import { ConfirmFixDialog } from '@/features/projects/dialogs/ConfirmFixDialog'
import { NewTaskDialog } from '@/features/projects/dialogs/NewTaskDialog'
import { ProfileCommitDialog } from '@/features/user-profile/dialogs/ProfileCommitDialog'
import { ProfileSetupDialog } from '@/features/user-profile/dialogs/ProfileSetupDialog'
import { usingSampleData } from '@/shared/api'
import { Badge } from '@/shared/ui/primitives/Badge'
import { Toast } from '@/shared/ui/overlays/Toast'
import { Sidebar } from './Sidebar'

const navButton = 'rounded-full p-1.5 transition-colors duration-150 hover:bg-hover hover:text-ink'

/** Ctrl or Cmd + B folds the sidebar, + Shift + B the repository list, + Shift + E the files, + \ folds them all. */
function useLayoutShortcuts() {
  const { toggleSidebar, toggleRepoNav, toggleFilesNav, toggleFocus } = useUi.getState()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return
      if (e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault()
        toggleFilesNav()
      } else if (e.key.toLowerCase() === 'b') {
        e.preventDefault()
        if (e.shiftKey) toggleRepoNav()
        else toggleSidebar()
      } else if (e.key === '\\') {
        e.preventDefault()
        toggleFocus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleSidebar, toggleRepoNav, toggleFilesNav, toggleFocus])
}

/** The frame around every screen: title bar, sidebar, content sheet, and the popups. */
export function Shell() {
  const navigate = useNavigate()
  const collapsed = useUi(selectSidebarCollapsed)
  const toggleSidebar = useUi((s) => s.toggleSidebar)
  useLayoutShortcuts()

  const frame = { '--sidebar-w': collapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)' } as CSSProperties

  return (
    <div
      style={frame}
      className="grid h-full grid-cols-[var(--sidebar-w)_1fr] grid-rows-[var(--titlebar-height)_1fr] bg-frame transition-[grid-template-columns] duration-200 ease-out"
    >
      <header className="drag col-span-2 flex items-center gap-3 pl-5" style={{ paddingRight: 'calc(100vw - env(titlebar-area-width, 100vw))' }}>
        <span className="text-heading">Excalibur</span>
        {usingSampleData ? <Badge title="Sem a ponte do Electron: as telas mostram dados de exemplo">dados de exemplo</Badge> : null}
        <div className="no-drag ml-2 flex gap-1 text-muted">
          <button type="button" aria-label="Voltar" onClick={() => navigate(-1)} className={navButton}>
            <ArrowLeft className="size-4" />
          </button>
          <button type="button" aria-label="Avançar" onClick={() => navigate(1)} className={navButton}>
            <ArrowRight className="size-4" />
          </button>
          <button
            type="button"
            aria-label={collapsed ? 'Expandir a barra lateral' : 'Recolher a barra lateral'}
            title={collapsed ? 'Expandir a barra lateral (Ctrl+B)' : 'Recolher a barra lateral (Ctrl+B)'}
            onClick={toggleSidebar}
            className={navButton}
          >
            <SidebarToggle className="size-4" />
          </button>
        </div>
      </header>
      <Sidebar />
      <main className="surface-page flex min-h-0 min-w-0 flex-col overflow-hidden rounded-tl-lg">
        <Outlet />
      </main>
      <SettingsDialog />
      <CreateProjectDialog />
      <IncorporateProjectDialog />
      <ProfileSetupDialog />
      <ProfileCommitDialog />
      <NewTaskDialog />
      <ConfirmFixDialog />
      <Toast />
    </div>
  )
}
