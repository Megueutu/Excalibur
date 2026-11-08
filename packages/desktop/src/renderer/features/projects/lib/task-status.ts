import type { SpecMeta, Task } from '@shared/contract'

type Tone = 'ok' | 'warn' | 'info' | 'muted'

/** The state of a task, in words, with the tone and the progress-bar color that go with it. */
export const TASK_STATUS: Record<Task['status'], { label: string; tone: Tone; bar: 'primary' | 'ok' | 'muted'; action: string }> = {
  'in-progress': { label: 'Em andamento', tone: 'info', bar: 'primary', action: 'Abrir spec' },
  paused: { label: 'Pausada', tone: 'muted', bar: 'muted', action: 'Retomar' },
  done: { label: 'Concluída', tone: 'ok', bar: 'ok', action: 'Ver' },
}

/** The state of a spec, as its frontmatter reports it. */
export const SPEC_STATUS: Record<SpecMeta['status'], { label: string; tone: Tone }> = {
  draft: { label: 'Rascunho', tone: 'muted' },
  in_progress: { label: 'Em andamento', tone: 'info' },
  done: { label: 'Concluída', tone: 'ok' },
}
