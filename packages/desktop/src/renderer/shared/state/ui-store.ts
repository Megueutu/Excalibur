import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { HealthItem } from '@shared/contract'

export type DialogName = 'settings' | 'create-project' | 'incorporate-project' | 'profile-setup' | 'profile-commit' | 'profile-sync'

/** Fixes waiting for the person's yes: they reach outside the machine, so they are never applied on the first click. */
export type PendingFix = { targets: { repoId: string; repoName: string; item: HealthItem }[] }
/** The repositories a new task can go to, and the one chosen first. */
export type NewTaskTarget = { repos: { id: string; name: string }[]; repoId: string }

type UiState = {
  dialog: DialogName | null
  openDialog: (name: DialogName) => void
  closeDialog: () => void

  pendingFix: PendingFix | null
  askFix: (fix: PendingFix | null) => void
  newTask: NewTaskTarget | null
  openNewTask: (target: NewTaskTarget | null) => void

  /** The fixed sidebar shrinks to an icon rail. This is the person's own choice, and it is remembered. */
  sidebarCollapsed: boolean
  /**
   * Set while a project is open, because the project lists its repositories itself. It only closes
   * the sidebar: opening it again clears it, and leaving the project restores the person's choice.
   */
  sidebarForced: boolean
  /** The repository sidebar of a project shrinks to an icon rail. */
  repoNavCollapsed: boolean
  /** The files sidebar (only on the Arquivos tab) shrinks to an icon rail. */
  filesNavCollapsed: boolean
  toggleSidebar: () => void
  /** Of the repository and files sidebars only one is expanded: opening one folds the other. */
  toggleRepoNav: () => void
  toggleFilesNav: () => void
  /** The files sidebar appears with the Arquivos tab and takes the room; leaving the tab gives it back. */
  focusFiles: () => void
  focusRepos: () => void
  /** Collapse every sidebar, or bring back the repository one, to give the content the whole window. */
  toggleFocus: () => void
  enterProject: () => void
  leaveProject: () => void

  /** Groups of the file tree that are folded, by key ("spec" or "spec/auth-refresh-token"). */
  collapsedFileGroups: string[]
  toggleFileGroup: (key: string) => void

  /** The editor the "open in editor" button uses. Remembered. */
  editor: string
  setEditor: (id: string) => void

  /** A short notice at the bottom of the window. */
  toast: { id: number; text: string } | null
  showToast: (text: string) => void
}

/** Whether the sidebar is shown as a rail right now, by choice or because a project is open. */
export const selectSidebarCollapsed = (s: Pick<UiState, 'sidebarCollapsed' | 'sidebarForced'>) => s.sidebarCollapsed || s.sidebarForced

const TOAST_MS = 2400
let toastTimer: ReturnType<typeof setTimeout> | undefined

/**
 * Interface-only state: popups, how the sidebars and the file groups are folded, the chosen editor
 * and the toast. Data lives in the query cache, not here. Only the sidebar choice and the editor are remembered.
 */
export const useUi = create<UiState>()(
  persist(
    (set) => ({
      dialog: null,
      openDialog: (name) => set({ dialog: name }),
      closeDialog: () => set({ dialog: null }),

      pendingFix: null,
      askFix: (fix) => set({ pendingFix: fix }),
      newTask: null,
      openNewTask: (target) => set({ newTask: target }),

      sidebarCollapsed: false,
      sidebarForced: false,
      repoNavCollapsed: false,
      filesNavCollapsed: true,
      toggleSidebar: () => set((s) => (s.sidebarForced ? { sidebarForced: false, sidebarCollapsed: false } : { sidebarCollapsed: !s.sidebarCollapsed })),
      toggleRepoNav: () => set((s) => (s.repoNavCollapsed ? { repoNavCollapsed: false, filesNavCollapsed: true } : { repoNavCollapsed: true })),
      toggleFilesNav: () => set((s) => (s.filesNavCollapsed ? { filesNavCollapsed: false, repoNavCollapsed: true } : { filesNavCollapsed: true })),
      focusFiles: () => set({ filesNavCollapsed: false, repoNavCollapsed: true }),
      focusRepos: () => set({ repoNavCollapsed: false, filesNavCollapsed: true }),
      toggleFocus: () =>
        set((s) => {
          const all = selectSidebarCollapsed(s) && s.repoNavCollapsed && s.filesNavCollapsed
          return all
            ? { sidebarForced: false, sidebarCollapsed: false, repoNavCollapsed: false, filesNavCollapsed: true }
            : { sidebarCollapsed: true, repoNavCollapsed: true, filesNavCollapsed: true }
        }),
      enterProject: () => set({ sidebarForced: true }),
      leaveProject: () => set({ sidebarForced: false }),

      collapsedFileGroups: [],
      toggleFileGroup: (key) => set((s) => ({ collapsedFileGroups: s.collapsedFileGroups.includes(key) ? s.collapsedFileGroups.filter((k) => k !== key) : [...s.collapsedFileGroups, key] })),

      editor: 'vscode',
      setEditor: (id) => set({ editor: id }),

      toast: null,
      showToast: (text) => {
        clearTimeout(toastTimer)
        set({ toast: { id: Date.now(), text } })
        toastTimer = setTimeout(() => set({ toast: null }), TOAST_MS)
      },
    }),
    {
      name: 'excalibur-ui',
      partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed, editor: s.editor }),
    },
  ),
)
