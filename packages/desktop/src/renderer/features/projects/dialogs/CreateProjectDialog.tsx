import { useEffect, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { CreateProjectInputSchema } from '@shared/contract'
import { api } from '@/shared/api'
import { useUi } from '@/shared/state/ui-store'
import { FolderWithFiles } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { Stepper } from '@/shared/ui/primitives/Stepper'
import { Modal } from '@/shared/ui/overlays/Modal'
import { errorText, useCatalog } from '../hooks'
import { layoutRepos, slug, START_MODULES, STEP_TITLE, STEPS, type Draft, type Layout } from './create-project/model'
import { StepProject } from './create-project/StepProject'
import { StepRepos } from './create-project/StepRepos'
import { StepReview } from './create-project/StepReview'
import { StepSnapIns } from './create-project/StepSnapIns'

/**
 * Make a project in four steps: its name and folder, its repositories, its snap-ins, then a review.
 * It makes the folders, runs git init and Excalibur's own init in each repository, and switches the
 * snap-ins on. Nothing is sent anywhere: the GitHub remote is a separate, confirmed step.
 */
export function CreateProjectDialog() {
  const open = useUi((s) => s.dialog === 'create-project')
  const close = useUi((s) => s.closeDialog)
  const toast = useUi((s) => s.showToast)
  const client = useQueryClient()
  const { data: catalog } = useCatalog()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [folder, setFolder] = useState<string | null>(null)
  const [layout, setLayout] = useState<Layout>('two')
  const [repos, setRepos] = useState<Draft[]>(() => layoutRepos('two', ''))
  const [modules, setModules] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setStep(1)
      setName('')
      setFolder(null)
      setLayout('two')
      setRepos(layoutRepos('two', ''))
    }
  }, [open])

  // Start with the usual two, once the catalog says which exist.
  useEffect(() => {
    if (open && catalog) setModules(START_MODULES.filter((id) => catalog.modules.some((m) => m.id === id)))
  }, [open, catalog])

  const changeName = (next: string) => {
    setName(next)
    // A single repository takes the project's own name.
    if (layout === 'one') setRepos(layoutRepos('one', next))
  }
  const editRepos = (next: Draft[]) => {
    setRepos(next)
    setLayout('custom')
  }

  const input = { name: slug(name), folder: folder ?? '', repos: repos.map((r) => ({ ...r, name: r.name.trim() })), modules }
  const duplicated = new Set(repos.map((r) => r.name.trim().toLowerCase())).size !== repos.length
  const valid = CreateProjectInputSchema.safeParse(input).success
  /** Whether the person may go on from this step. */
  const ready = step === 1 ? !!slug(name) && !!folder : step === 2 ? valid && !duplicated : true

  const create = useMutation({
    mutationFn: () => api.createProject(input),
    onSuccess: async (result) => {
      await client.invalidateQueries()
      close()
      toast(`Projeto criado em ${result.path}`)
    },
  })

  const last = step === STEPS.length

  return (
    <Modal wide open={open} onOpenChange={(o) => !o && close()} icon={<FolderWithFiles />} title="Criar projeto" description={`${STEP_TITLE[step - 1]} · passo ${step} de ${STEPS.length}`}>
      <Stepper steps={STEPS} current={step} />

      <div key={step} className="mt-6 min-h-88">
        {step === 1 ? (
          <StepProject
            name={name}
            onName={changeName}
            folder={folder}
            onPickFolder={async () => {
              const picked = await api.pickFolder()
              if (picked) setFolder(picked)
            }}
          />
        ) : step === 2 ? (
          <>
            <StepRepos
              projectName={name}
              layout={layout}
              onLayout={(next, list) => {
                setLayout(next)
                setRepos(list)
              }}
              repos={repos}
              onRepos={editRepos}
            />
            {duplicated ? <p className="mt-3 px-1 text-body text-warn">Dois repositórios com o mesmo nome.</p> : null}
          </>
        ) : step === 3 ? (
          catalog ? (
            <StepSnapIns catalog={catalog} modules={modules} onModules={setModules} />
          ) : null
        ) : (
          <StepReview folder={folder ?? ''} name={name} repos={input.repos} modules={modules} catalog={catalog} />
        )}
      </div>

      {create.isError ? <p className="mt-4 px-1 text-body text-warn">{errorText(create.error)}</p> : null}
      <div className="mt-8 flex justify-between gap-3">
        <Button onClick={step === 1 ? close : () => setStep(step - 1)}>{step === 1 ? 'Cancelar' : 'Voltar'}</Button>
        <Button variant="primary" disabled={!ready || create.isPending} onClick={last ? () => create.mutate() : () => setStep(step + 1)}>
          {last ? (create.isPending ? 'Criando…' : 'Criar projeto') : 'Próximo'}
        </Button>
      </div>
    </Modal>
  )
}
