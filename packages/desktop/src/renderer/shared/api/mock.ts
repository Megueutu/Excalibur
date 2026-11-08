import type { ExcaliburApi, Project, Repo, UserProfile } from '@shared/contract'

/** Sample data for the prototype. Nothing here is read from disk. */

type Extra = Pick<Repo, 'kind' | 'stack'> & Partial<Pick<Repo, 'isHub' | 'frameworkVersion' | 'remote' | 'branch'>>

const repo = (name: string, path: string, snapshot: Repo['snapshot'], extra: Extra): Repo => ({
  id: name,
  name,
  path,
  snapshot,
  isHub: false,
  frameworkVersion: '0.9.0',
  remote: extra.kind === 'github' ? `Megueutu/${name}` : null,
  branch: extra.kind === 'folder' ? null : 'main',
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
    repo('web-app', '~/Inter/web-app', 'fresh', { kind: 'github', stack: ['typescript', 'react', 'vite', 'tailwindcss'] }),
    repo('mobile-app', '~/Inter/mobile-app', 'stale', { kind: 'git', stack: ['kotlin'], frameworkVersion: '0.8.0' }),
  ],
}

const profile: UserProfile = {
  repoPath: '~/my-profile',
  branch: 'main',
  uncommitted: 2,
  remote: 'private',
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

export const mockApi: ExcaliburApi = {
  listProjects: () => wait({ projects: [inter], standalone: [
      repo('excalibur', '~/Excalibur', 'fresh', { kind: 'github', stack: ['javascript', 'nodedotjs'] }),
      repo('anotacoes', '~/anotacoes', 'fresh', { kind: 'folder', stack: ['markdown'] }),
    ] }),
  getProfile: () => wait(profile),
  listAttention: () =>
    wait([
      { id: 'stale', text: 'api-core e mobile-app estão com o perfil desatualizado', action: 'Sincronizar' },
      { id: 'when', text: 'O perfil tem 1 arquivo sem a chave when', action: 'Abrir' },
      { id: 'gone', text: 'old-api não existe mais', action: 'Remover' },
    ]),
}
