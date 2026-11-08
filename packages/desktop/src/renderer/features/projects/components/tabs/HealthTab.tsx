import { useQueryClient } from '@tanstack/react-query'
import type { Repo, RepoDetail } from '@shared/contract'
import { CheckCircle } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { HealthRow } from '../HealthRow'
import { useUi } from '@/shared/state/ui-store'

export function HealthTab({ repo, detail }: { repo: Repo; detail: RepoDetail }) {
  const client = useQueryClient()
  const toast = useUi((s) => s.showToast)
  const recheck = async () => {
    await client.invalidateQueries({ queryKey: ['repo-detail', repo.id] })
    toast('Verificado de novo')
  }
  return (
    <>
      {detail.health.length ? (
        <div className="flex flex-col gap-1.5">
          {detail.health.map((h) => (
            <HealthRow key={h.id} item={h} repoId={repo.id} repoName={repo.name} />
          ))}
        </div>
      ) : (
        <div className="surface-control flex items-center gap-3 rounded-md p-5 text-body text-muted">
          <CheckCircle className="size-5.5 text-ok" />
          Tudo em ordem: versão atual, perfil em dia, specs sem erro.
        </div>
      )}
      <p className="mt-4 flex items-center gap-3 text-caption text-muted">
        <Button size="sm" onClick={recheck}>
          Verificar de novo
        </Button>
      </p>
    </>
  )
}
