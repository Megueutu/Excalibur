import { create } from 'zustand'

export type DialogName = 'settings' | 'create-project' | 'incorporate-project' | 'profile-setup'

type UiState = {
  dialog: DialogName | null
  openDialog: (name: DialogName) => void
  closeDialog: () => void
}

/** Interface-only state: which popup is open. Data lives in the query cache, not here. */
export const useUi = create<UiState>((set) => ({
  dialog: null,
  openDialog: (name) => set({ dialog: name }),
  closeDialog: () => set({ dialog: null }),
}))
