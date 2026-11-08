import { useEffect, useRef, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ProfileFile } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { errorText } from '@/features/projects/hooks'
import { instructionTitle, isGlobal } from '../lib/format'

/** How long to wait after the last keystroke before writing the file. */
const AUTOSAVE_MS = 900

const label = 'mb-1.5 block px-1 text-caption font-semibold text-muted'
const field = 'no-drag h-control w-full rounded-full bg-field px-4 text-body outline-none transition-colors duration-150 placeholder:text-muted hover:bg-hover focus-visible:outline-primary'

type Draft = { description: string; when: string; body: string }

const fromFile = (f: ProfileFile): Draft => ({ description: f.description, when: f.when.toLowerCase() === 'always' ? '' : f.when, body: f.body })

/**
 * One instruction: its title, when the agent reads it and its text. It saves itself a moment after
 * the last keystroke, so there is no Save button to forget; "Guardar versão" in the header is what
 * keeps a version. Remount it (key) to switch to another file.
 */
export function InstructionEditor({ file }: { file: ProfileFile }) {
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const [draft, setDraft] = useState<Draft>(() => fromFile(file))
  const saved = useRef<Draft>(fromFile(file))
  const [state, setState] = useState<'saved' | 'waiting' | 'saving'>('saved')

  const save = useMutation({
    mutationFn: (d: Draft) => api.saveProfileFile(file.rel, d),
    onSuccess: (_r, d) => {
      saved.current = d
      setState('saved')
      void client.invalidateQueries({ queryKey: ['profile'] })
    },
    onError: (error) => {
      setState('waiting')
      toast(errorText(error))
    },
  })

  const dirty = draft.description !== saved.current.description || draft.when !== saved.current.when || draft.body !== saved.current.body
  useEffect(() => {
    if (!dirty) return
    setState('waiting')
    const timer = setTimeout(() => {
      setState('saving')
      save.mutate(draft)
    }, AUTOSAVE_MS)
    return () => clearTimeout(timer)
    // The mutation object changes every render; the draft is what decides when to save.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, dirty])

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }))

  return (
    <div className="surface-card rounded-lg p-6">
      <label className="block">
        <span className={label}>Título</span>
        <input value={draft.description} onChange={(e) => set({ description: e.target.value })} placeholder={instructionTitle(file)} className="no-drag w-full bg-transparent px-1 text-title outline-none placeholder:text-muted" />
      </label>

      <label className="mt-5 block">
        <span className={label}>Quando a IA lê isto</span>
        <input value={draft.when} onChange={(e) => set({ when: e.target.value })} placeholder="Em branco: sempre" className={field} />
        <span className="mt-1.5 block px-1 text-caption text-muted">Diga em uma frase, como "ao fazer um commit". A IA decide pela frase.</span>
      </label>

      <label className="mt-5 block">
        <span className={label}>O que a IA deve fazer</span>
        <textarea
          value={draft.body}
          onChange={(e) => set({ body: e.target.value })}
          aria-label={`Texto de ${file.rel}`}
          rows={Math.min(22, Math.max(8, draft.body.split('\n').length + 1))}
          className="no-drag block w-full resize-y rounded-md bg-field p-4 text-body leading-relaxed outline-none focus-visible:outline-primary"
        />
      </label>

      <p className="mt-3 px-1 text-caption text-muted">
        {state === 'saved' ? 'Salvo.' : state === 'saving' ? 'Salvando…' : 'Salva sozinho em instantes.'} {isGlobal(file) ? 'Vale em todos os projetos.' : `Vale nos projetos que usam o perfil ${file.scope}.`}
      </p>
    </div>
  )
}
