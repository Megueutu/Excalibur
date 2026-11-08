import type { Catalog, FileClass, HealthItem, RepoDetail, RepoFile, Task } from '@shared/contract'

/** Sample per-repository data for the prototype: tasks, health, files and how files link. */

const UPDATE: HealthItem = {
  id: 'update',
  label: 'Atualizar o Excalibur de 0.8.0 para 0.9.0',
  detail: 'Regenera os arquivos do harness. Seus overrides não são tocados.',
  action: 'Atualizar',
  previewable: true,
}
const PROFILE: HealthItem = {
  id: 'profile',
  label: 'Perfil do usuário desatualizado',
  detail: 'O repositório do perfil mudou desde o último sync.',
  action: 'Sincronizar',
  previewable: true,
}

const file = (id: string, cls: FileClass, title: string, tokens: number, alwaysRead: boolean, group: string | null = null, meta: RepoFile['meta'] = null, module: string | null = null): RepoFile => ({ id, class: cls, title, group, tokens, alwaysRead, meta, path: `~/${id}`, module })

const CONTEXT = [
  file('context/overview.md', 'context', 'Visão geral', 0.9, true),
  file('context/architecture.md', 'context', 'Arquitetura', 1.6, true),
  file('context/conventions.md', 'context', 'Convenções', 0.8, true),
  file('context/glossary.md', 'context', 'Glossário', 0.5, true),
  file('context/user-profile.md', 'profile', 'Índice do perfil', 1.2, true),
  file('context/decisions.md', 'context', 'Decisões', 1.1, true, null, null, 'decisions'),
  file('context/assumptions.md', 'context', 'Suposições', 0.9, true, null, null, 'assumptions'),
]

function specFiles(task: Task, dependsOn: string[]): RepoFile[] {
  const base = `specs/${task.slug}`
  const meta = { status: task.spec, updated: '2026-11-04', commit: task.spec === 'draft' ? null : 'a3f9c2e', dependsOn, drift: task.drift }
  return [
    file(`${base}/proposal.md`, 'spec', 'proposal', 0.6, false, task.slug),
    file(`${base}/spec.md`, 'spec', 'spec', 1.8, false, task.slug, meta),
    file(`${base}/design.md`, 'spec', 'design', 1.2, false, task.slug),
    file(`${base}/tasks.yaml`, 'spec', 'tasks', 0.5, false, task.slug),
  ]
}

type Build = { tasks: Task[]; health: HealthItem[]; decisions?: string[]; reports?: string[]; frameworkTokens?: number }

function build({ tasks, health, decisions = [], reports = [], frameworkTokens = 6.1 }: Build): RepoDetail {
  const specs = tasks.flatMap((t, i) => specFiles(t, i > 0 ? [`specs/${tasks[0]!.slug}/spec.md`, 'context/architecture.md'] : ['context/architecture.md']))
  const dec = decisions.map((d, i) => file(`decisions/${String(i + 1).padStart(4, '0')}-${d}.md`, 'decision', `${String(i + 1).padStart(4, '0')} · ${d.replaceAll('-', ' ')}`, 0.6, false))
  const rep = reports.map((r) => file(`reports/${r}.md`, 'report', r.replaceAll('-', ' '), 1.4, false))
  const files = [...CONTEXT, ...specs, ...dec, ...rep]

  const links: [string, string][] = [
    ['context/architecture.md', 'context/overview.md'],
    ['context/conventions.md', 'context/overview.md'],
    ['context/architecture.md', 'context/conventions.md'],
    ['context/user-profile.md', 'context/conventions.md'],
  ]
  tasks.forEach((t, i) => {
    const b = `specs/${t.slug}`
    links.push([`${b}/spec.md`, `${b}/proposal.md`], [`${b}/design.md`, `${b}/spec.md`], [`${b}/tasks.yaml`, `${b}/spec.md`], [`${b}/spec.md`, 'context/architecture.md'], [`${b}/spec.md`, 'context/glossary.md'])
    if (i > 0) links.push([`${b}/spec.md`, `specs/${tasks[0]!.slug}/spec.md`])
  })
  dec.forEach((d, i) => {
    links.push([d.id, 'context/architecture.md'])
    if (tasks[i]) links.push([d.id, `specs/${tasks[i]!.slug}/spec.md`])
  })
  rep.forEach((r, i) => {
    if (tasks[0]) links.push([r.id, `specs/${tasks[0].slug}/spec.md`])
    if (dec[i]) links.push([r.id, dec[i]!.id])
  })
  return { tasks, health, files, links, frameworkTokens, settings: { workMode: 'deep', modules: ['decisions'] } }
}

const task = (slug: string, status: Task['status'], stepsDone: number, stepsTotal: number, spec: Task['spec'], drift: string | null = null): Task => ({ slug, status, stepsDone, stepsTotal, spec, drift })

export const DETAILS: Record<string, RepoDetail> = {
  VersioSpec: build({ tasks: [], health: [], reports: ['2026-11-04-sessao'] }),
  'api-core': build({
    tasks: [
      task('auth-refresh-token', 'in-progress', 3, 7, 'in_progress'),
      task('rate-limit', 'paused', 1, 4, 'in_progress', '6 commits depois da última atualização da spec'),
    ],
    health: [UPDATE, PROFILE, { id: 'orphan', label: '1 customização órfã em .overrides', detail: 'agents/reviewer.yaml já não existe no pacote.', action: 'Revisar', previewable: false }],
    decisions: ['usar-jwt', 'redis-para-rate-limit'],
    reports: ['2026-11-04-sessao', 'benchmark-de-autenticacao'],
  }),
  'web-app': build({
    tasks: [task('login-flow', 'in-progress', 5, 6, 'in_progress'), task('dark-mode', 'done', 4, 4, 'done')],
    health: [],
    decisions: ['estado-com-zustand'],
  }),
  'mobile-app': build({
    tasks: [task('push-notifications', 'in-progress', 0, 5, 'draft')],
    health: [UPDATE, PROFILE, { id: 'remote', label: 'Sem remoto no GitHub', detail: 'O repositório só existe nesta máquina.', action: 'Criar remoto', previewable: false }],
  }),
  excalibur: build({ tasks: [task('perfil-do-usuario', 'done', 6, 6, 'done')], health: [], decisions: ['core-em-pacote-proprio'] }),
  anotacoes: build({ tasks: [], health: [] }),
}

export const CATALOG: Catalog = {
  editors: [
    { id: 'vscode', label: 'VS Code' },
    { id: 'cursor', label: 'Cursor' },
    { id: 'intellij', label: 'IntelliJ IDEA' },
    { id: 'webstorm', label: 'WebStorm' },
    { id: 'zed', label: 'Zed' },
    { id: 'sublime', label: 'Sublime Text' },
  ],
  modes: ['deep', 'ant-brain', 'vibecode'],
  modules: [
    { id: 'checkpoint', tokens: 0.2, estimate: 103, description: 'Save a task as compact state', family: 'registro', agents: [], skills: ['checkpoint', 'resume'], contextFiles: 0 },
    { id: 'decisions', tokens: 0.1, estimate: 59, description: 'Record each consequential choice', family: 'registro', agents: [], skills: ['decision-log'], contextFiles: 0 },
    { id: 'assumptions', tokens: 0.1, estimate: 48, description: 'List what was assumed', family: 'registro', agents: [], skills: ['assumption-log'], contextFiles: 0 },
    { id: 'commit-craft', tokens: 0.1, estimate: 53, description: 'Atomic commits in the project convention', family: 'git', agents: [], skills: ['commit-craft'], contextFiles: 0 },
    { id: 'pr-herald', tokens: 0.2, estimate: 117, description: 'Draft a pull request description', family: 'git', agents: ['herald'], skills: ['pr-draft'], contextFiles: 0 },
    { id: 'release-notes', tokens: 0.2, estimate: 129, description: 'Draft release notes', family: 'git', agents: ['changelogger'], skills: ['release-notes'], contextFiles: 0 },
    { id: 'privacy-scan', tokens: 0.2, estimate: 138, description: 'Sniff for personal data', family: 'seguranca', agents: ['piihound'], skills: ['privacy-scan'], contextFiles: 0 },
    { id: 'dependency-watch', tokens: 0.2, estimate: 130, description: 'Audit dependencies', family: 'seguranca', agents: ['lockwatch'], skills: ['dependency-watch'], contextFiles: 0 },
    { id: 'blast-radius', tokens: 0.2, estimate: 120, description: 'Map who depends on a change', family: 'analise', agents: ['surveyor'], skills: ['blast-radius'], contextFiles: 0 },
    { id: 'token-diet', tokens: 0.2, estimate: 129, description: 'Propose context cuts', family: 'analise', agents: ['trimmer'], skills: ['token-diet'], contextFiles: 0 },
    { id: 'graphify', tokens: 0.1, estimate: 61, description: 'Index material as a graph', family: 'analise', agents: [], skills: ['graph-index'], contextFiles: 0 },
    { id: 'obsidian', tokens: 0.2, estimate: 172, description: 'Open the SDD as an Obsidian vault', family: 'analise', agents: [], skills: [], contextFiles: 1 },
  ],
  contextLimit: 20,
  baseTokens: 6.9,
}

const BODIES: Record<string, string> = {
  'specs/auth-refresh-token/spec.md': `# Spec: refresh token

O cliente renova a sessão sem pedir a senha de novo.

## Comportamento

- Access token vale 15 minutos
- Refresh token vale 7 dias e gira a cada uso
- Reuso de um refresh token já usado revoga a família inteira

## Depende de

[arquitetura](../../context/architecture.md) · [decisão 0001](../../decisions/0001-usar-jwt.md)`,
  'context/architecture.md': `# Arquitetura

A API é um serviço NestJS atrás de um gateway. A autenticação fica no módulo \`auth\`; o limite de taxa, num middleware.

## Camadas

- Controllers finos
- Serviços com a regra
- Repositórios por agregado

Veja as [convenções](conventions.md) e a [visão geral](overview.md).`,
  'decisions/0001-usar-jwt.md': `# 0001 · Usar JWT

**Status:** aceita

Usamos JWT assinado para o access token, porque o gateway já valida a assinatura sem consultar o banco.

## Consequências

- Revogação imediata exige lista de bloqueio
- Tokens curtos, com refresh`,
}

/** The text of a file. Real files come from disk later; the prototype writes a short stand-in. */
export function sampleBody(repoId: string, fileId: string): string {
  const known = BODIES[fileId]
  if (known) return known
  const title = DETAILS[repoId]?.files.find((f) => f.id === fileId)?.title ?? fileId
  return `# ${title}\n\nTexto de exemplo. No app, aparece aqui o conteúdo de \`${fileId}\`.`
}
