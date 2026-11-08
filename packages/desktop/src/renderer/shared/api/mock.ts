import type { ExcaliburApi, FoundRepo, Project, Repo, UserProfile } from '@shared/contract'
import { CATALOG, DETAILS, sampleBody } from './mock-detail'

/** Sample data for the prototype. Nothing here is read from disk. */

type Extra = Pick<Repo, 'kind' | 'stack'> & Partial<Pick<Repo, 'isHub' | 'frameworkVersion' | 'remote' | 'branch' | 'uncommitted'>>

const repo = (name: string, path: string, snapshot: Repo['snapshot'], extra: Extra): Repo => ({
  id: name,
  name,
  path,
  snapshot,
  isHub: false,
  frameworkVersion: '0.9.0',
  remote: extra.kind === 'github' ? `Megueutu/${name}` : null,
  branch: extra.kind === 'folder' ? null : 'main',
  uncommitted: 0,
  ...extra,
})

const inter: Project = {
  id: 'inter',
  name: 'Inter',
  path: '~/Inter',
  mode: 'public',
  workMode: 'deep',
  modules: ['decisions', 'assumptions'],
  profiles: ['global', 'work'],
  repos: [
    repo('VersioSpec', '~/Inter/VersioSpec', 'fresh', { kind: 'github', stack: ['markdown'], isHub: true }),
    repo('api-core', '~/Inter/api-core', 'stale', { kind: 'github', stack: ['typescript', 'nestjs', 'docker'], frameworkVersion: '0.8.0' }),
    repo('web-app', '~/Inter/web-app', 'fresh', { kind: 'github', stack: ['typescript', 'react', 'vite', 'tailwindcss'], uncommitted: 2, branch: 'feat/login' }),
    repo('mobile-app', '~/Inter/mobile-app', 'stale', { kind: 'git', stack: ['kotlin'], frameworkVersion: '0.8.0' }),
  ],
}

const profile: UserProfile = {
  repoPath: '~/my-profile',
  branch: 'main',
  uncommitted: 2,
  remote: 'Megueutu/my-profile',
  files: [
    {
      rel: 'global/commits.md',
      scope: 'global',
      when: 'when committing',
      description: 'commit and branch rules',
      body: '# Commits\n\n- write messages in english\n- conventional commits, lowercase\n- no ai attribution',
    },
    {
      rel: 'global/conversation.md',
      scope: 'global',
      when: 'always',
      description: 'how I want the agent to talk to me',
      body: '- answer in the language I write in\n- lead with the result, then the detail',
    },
    {
      rel: 'global/writing.md',
      scope: 'global',
      when: 'when writing documentation or long text',
      description: 'how I want documents and notes written',
      body: '- plain words over jargon\n- say what something is for before how it works',
    },
    {
      rel: 'profiles/work/review.md',
      scope: 'work',
      when: 'when reviewing',
      description: 'review depth for work projects',
      body: '- be strict\n- check failure modes before style',
    },
  ],
}

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 80))
}

const SCAN: FoundRepo[] = [
  { path: '~/Inter/VersioSpec', name: 'VersioSpec', kind: 'github', stack: ['markdown'], configured: true, registered: true },
  { path: '~/Inter/api-core', name: 'api-core', kind: 'github', stack: ['typescript', 'nestjs', 'docker'], configured: true, registered: true },
  { path: '~/Inter/web-app', name: 'web-app', kind: 'github', stack: ['typescript', 'react', 'vite', 'tailwindcss'], configured: true, registered: false },
  { path: '~/Inter/rascunhos', name: 'rascunhos', kind: 'folder', stack: ['markdown'], configured: false, registered: false },
]

export const mockApi: ExcaliburApi = {
  getRepoDetail: (repoId) => wait(DETAILS[repoId] ?? { tasks: [], health: [], files: [], links: [], frameworkTokens: 0 }),
  readFile: (repoId, fileId) => wait(sampleBody(repoId, fileId)),
  openPath: async (path) => console.info('[prototype] open', path),
  openInEditor: async (editorId, path) => console.info('[prototype] open in', editorId, path),
  pickFolder: () => wait('~/Inter'),
  scanFolder: () => wait(SCAN),
  addRepos: async (paths) => console.info('[prototype] add', paths),
  runFix: (_repoId, fixId, preview) => wait({ summary: `${preview ? 'Exemplo: mudaria' : 'Exemplo: aplicou'} "${fixId}". Nada foi gravado.` }),
  getSettings: () => wait({ configPath: '~/.excalibur/config.yaml', registryPath: '~/.excalibur/projects.yaml', frameworkVersion: '0.9.0', gh: 'ready', snapshotDefault: 'ignored' }),
  setSnapshotDefault: async (value) => console.info('[prototype] snapshot default', value),
  createProject: async (input) => ({ path: `${input.folder}/${input.name}` }),
  resumeTask: async (repoId, slug) => console.info('[prototype] resume', repoId, slug),
  removeMissingRepo: async (path) => console.info('[prototype] remove', path),
  saveProfileFile: async (rel) => console.info('[prototype] save', rel),
  commitProfile: () => wait({ summary: 'Exemplo: commit feito. Nada foi gravado.' }),
  linkProfile: async (folder, mode) => console.info('[prototype] link profile', mode, folder),
  createTask: (_repoId, slug) => wait({ path: `~/Inter/specs/${slug}` }),
  getCatalog: () => wait(CATALOG),
  listProjects: () => wait({ projects: [inter], standalone: [
      repo('excalibur', '~/Excalibur', 'fresh', { kind: 'github', stack: ['javascript', 'nodejs'] }),
      repo('anotacoes', '~/anotacoes', 'fresh', { kind: 'folder', stack: ['markdown'] }),
    ] }),
  getProfile: () => wait(profile),
  listAttention: () =>
    wait([
      { id: 'profile', text: 'api-core e mobile-app estão com o perfil desatualizado', action: 'Sincronizar', kind: 'fix', fixId: 'profile', repos: [{ id: 'api-core', name: 'api-core' }, { id: 'mobile-app', name: 'mobile-app' }] },
      { id: 'profile-when', text: 'O perfil tem 1 arquivo sem a chave when', action: 'Abrir', kind: 'profile', repos: [] },
      { id: 'gone:old-api', text: 'old-api não existe mais', action: 'Remover', kind: 'remove', repos: [], path: '~/Inter/old-api' },
    ]),
}
