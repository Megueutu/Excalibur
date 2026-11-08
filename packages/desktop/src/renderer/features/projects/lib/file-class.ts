import type { FileClass } from '@shared/contract'
import { FileText, Notebook, Report, Scale, User } from '@/shared/ui/icons'
import type { IconComponent } from './stack-icons'

export type GraphShape = 'square' | 'circle' | 'diamond' | 'triangle' | 'ring'

/**
 * The kinds of file a repository holds. Each has one icon in the tree and one shape in the
 * graph, so a kind is recognizable in both without color.
 */
export const FILE_CLASS: Record<FileClass, { label: string; icon: IconComponent; shape: GraphShape }> = {
  context: { label: 'Contexto', icon: Notebook, shape: 'square' },
  profile: { label: 'Perfil do usuário', icon: User, shape: 'ring' },
  spec: { label: 'Specs', icon: FileText, shape: 'circle' },
  decision: { label: 'Decisões', icon: Scale, shape: 'diamond' },
  report: { label: 'Relatórios', icon: Report, shape: 'triangle' },
}

/** Display order: what the agent always reads first, then what it opens on demand. */
export const FILE_CLASS_ORDER: FileClass[] = ['context', 'profile', 'spec', 'decision', 'report']

/** The file's own name, with its extension: "specs/a/spec.md" is "spec.md". */
export function fileName(id: string): string {
  return (id.split('/').pop() ?? id).replace(/^(repo|sdd):/, '')
}
