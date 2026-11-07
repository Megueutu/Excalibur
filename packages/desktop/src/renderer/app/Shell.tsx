import { Outlet, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight } from '@/shared/ui/icons'
import { AddProjectDialog } from '@/features/add-project/AddProjectDialog'
import { SettingsDialog } from '@/features/settings/SettingsDialog'
import { ProfileSetupDialog } from '@/features/user-profile/ProfileSetupDialog'
import { Sidebar } from './Sidebar'

/** The frame around every screen: title bar, sidebar, content, and the popups. */
export function Shell() {
  const navigate = useNavigate()

  return (
    <div className="grid h-full grid-cols-[250px_1fr] grid-rows-[44px_1fr] bg-panel">
      <header className="drag col-span-2 flex items-center gap-3 pl-5" style={{ paddingRight: 'calc(100vw - env(titlebar-area-width, 100vw))' }}>
        <span className="text-sm font-semibold">Excalibur</span>
        <div className="no-drag ml-2 flex gap-1 text-muted">
          <button type="button" aria-label="Voltar" onClick={() => navigate(-1)} className="rounded-full p-1.5 hover:bg-panel-2 hover:text-text">
            <ArrowLeft size={16} />
          </button>
          <button type="button" aria-label="Avançar" onClick={() => navigate(1)} className="rounded-full p-1.5 hover:bg-panel-2 hover:text-text">
            <ArrowRight size={16} />
          </button>
        </div>
      </header>
      <Sidebar />
      <main className="flex min-h-0 flex-col overflow-hidden rounded-tl-lg bg-bg">
        <Outlet />
      </main>
      <SettingsDialog />
      <AddProjectDialog />
      <ProfileSetupDialog />
    </div>
  )
}
