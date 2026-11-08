import type { RepoKind } from '@shared/contract'
import { Folder } from '@/shared/ui/icons'
import Git from '~icons/simple-icons/git'
import GitHub from '~icons/simple-icons/github'
import type { IconComponent } from './stack-icons'

/** What a repository is. One symbol per kind, so the type reads at a glance. */
export const REPO_KIND: Record<RepoKind, { label: string; description: string; icon: IconComponent }> = {
  github: { label: 'GitHub', description: 'Git com remoto no GitHub', icon: GitHub },
  git: { label: 'Git local', description: 'Git local, sem remoto', icon: Git },
  folder: { label: 'Pasta', description: 'Pasta sem git', icon: Folder },
}
