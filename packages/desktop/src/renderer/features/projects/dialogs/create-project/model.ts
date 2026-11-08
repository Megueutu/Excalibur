import type { RepoKind } from '@shared/contract'

export type Draft = { name: string; kind: RepoKind; hub: boolean }

/** The ready-made arrangements of repositories, and "custom" for the person's own list. */
export type Layout = 'one' | 'two' | 'custom'

export const STEPS = ['Projeto', 'Repositórios', 'Snap-ins', 'Revisar']

export const STEP_TITLE = ['Dê um nome ao projeto', 'Onde fica cada parte?', 'O que encaixar?', 'Tudo certo?']

/** Snap-ins a new project starts with. */
export const START_MODULES = ['decisions', 'commit-craft']

/** A name made safe for a folder: lowercase letters, digits and hyphens, without accents. */
export function slug(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** The repositories each ready-made arrangement starts with. */
export function layoutRepos(layout: Exclude<Layout, 'custom'>, projectName: string): Draft[] {
  if (layout === 'one') return [{ name: slug(projectName) || 'projeto', kind: 'git', hub: false }]
  return [
    { name: 'contexto', kind: 'git', hub: true },
    { name: 'codigo', kind: 'git', hub: false },
  ]
}
