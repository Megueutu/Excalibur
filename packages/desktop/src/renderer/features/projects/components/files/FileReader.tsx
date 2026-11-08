import type { ReactNode } from 'react'
import Markdown, { type Components } from 'react-markdown'
import type { RepoDetail, RepoFile } from '@shared/contract'
import { openPath } from '@/shared/lib/use-open-path'
import { Graph } from '@/shared/ui/icons'
import { Button } from '@/shared/ui/primitives/Button'
import { Chip } from '@/shared/ui/primitives/Chip'
import { PathLink } from '@/shared/ui/primitives/PathLink'
import { Pill } from '@/shared/ui/primitives/Pill'
import { formatTokens } from '../../lib/context'
import { FILE_CLASS, fileName } from '../../lib/file-class'
import { SPEC_STATUS } from '../../lib/task-status'
import { OpenInEditor } from '../OpenInEditor'
import { useRepoFile } from '../../hooks'

/** Resolve a relative path against the file that contains it. Returns a file id or null. */
function resolvePath(from: string, target: string, known: Set<string>): string | null {
  if (/^[a-z]+:/i.test(target)) return null
  if (known.has(target)) return target
  const parts = from.split('/').slice(0, -1)
  for (const part of target.split('#')[0]!.split('/')) {
    if (part === '..') parts.pop()
    else if (part !== '.' && part !== '') parts.push(part)
  }
  const id = parts.join('/')
  return known.has(id) ? id : null
}

const looksLikePath = (text: string) => !/\s/.test(text) && (text.includes('/') || /\.[a-z]{1,5}$/i.test(text))

const dateFormat = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

function Property({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="pt-0.5 text-caption text-muted">{label}</dt>
      <dd className="min-w-0 text-body">{children}</dd>
    </>
  )
}

function fileLabel(f: RepoFile) {
  return f.group ? `${f.group} · ${fileName(f.id)}` : fileName(f.id)
}

type Props = {
  repoId: string
  detail: RepoDetail
  fileId: string
  onOpen: (id: string) => void
  /** Offered in the reader view, to jump to the same file in the graph. */
  onShowInGraph?: () => void
}

/** The selected file: its path, the text, and a side column with what the file is and what it links to. */
export function FileReader({ repoId, detail, fileId, onOpen, onShowInGraph }: Props) {
  const { data: text } = useRepoFile(repoId, fileId)
  const file = detail.files.find((f) => f.id === fileId)
  if (!file) return null

  const known = new Set(detail.files.map((f) => f.id))
  const byId = (id: string) => detail.files.find((f) => f.id === id)
  const neighbors = detail.links.filter((l) => l.includes(fileId)).map(([a, b]) => (a === fileId ? b : a))
  const { icon: Icon, label } = FILE_CLASS[file.class]
  const meta = file.meta

  const components: Components = {
    h1: (p) => <h1 className="mb-4 text-title" {...p} />,
    h2: (p) => <h2 className="mb-2 mt-6 text-heading" {...p} />,
    p: (p) => <p className="mb-3" {...p} />,
    ul: (p) => <ul className="mb-3 flex list-disc flex-col gap-1 pl-5" {...p} />,
    strong: (p) => <strong className="font-semibold" {...p} />,
    code: ({ children }) => {
      const value = String(children)
      if (!looksLikePath(value)) return <code className="rounded-xs bg-field px-1.5 py-0.5 font-mono text-caption">{children}</code>
      const target = resolvePath(fileId, value, known)
      return <PathLink path={value} onOpen={() => (target ? onOpen(target) : openPath(value))} />
    },
    a: ({ href = '', children }) => {
      const target = resolvePath(fileId, href, known)
      return target ? (
        <a role="link" tabIndex={0} onClick={() => onOpen(target)} onKeyDown={(e) => e.key === 'Enter' && onOpen(target)} className="cursor-pointer text-primary hover:underline">
          {children}
        </a>
      ) : (
        <span className="text-primary">{children}</span>
      )
    },
  }

  return (
    <article className="surface-control @container rounded-md">
      <header className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3 p-6 pb-0">
        <div className="min-w-0">
          <h3 className="truncate text-title">{fileName(file.id)}</h3>
          <p className="mt-2">
            <PathLink path={file.path} onOpen={() => openPath(file.path)} />
          </p>
        </div>
        <div className="flex items-center gap-2">
          {onShowInGraph ? (
            <Button size="sm" onClick={onShowInGraph}>
              <Graph className="size-3.5" /> Ver no grafo
            </Button>
          ) : null}
          <OpenInEditor path={file.path} />
        </div>
      </header>

      <div className="grid gap-8 p-6 @3xl:grid-cols-[minmax(0,1fr)_15rem]">
        <div className="min-w-0 max-w-[68ch] select-text leading-relaxed">
          <Markdown components={components}>{text ?? ''}</Markdown>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="surface-card rounded-md p-4">
            <h4 className="mb-3 text-caption font-semibold text-muted">Sobre o arquivo</h4>
            <dl className="grid grid-cols-[auto_minmax(0,1fr)] items-baseline gap-x-4 gap-y-2.5">
              <Property label="Tipo">
                <span className="inline-flex items-center gap-1.5">
                  <Icon className="size-3.5 text-muted" />
                  {label}
                </span>
              </Property>
              <Property label="Lido">{file.alwaysRead ? 'sempre' : 'sob demanda'}</Property>
              <Property label="Custo">{formatTokens(file.tokens)}</Property>
              {meta ? (
                <>
                  <Property label="Status">
                    <Pill tone={SPEC_STATUS[meta.status].tone}>{SPEC_STATUS[meta.status].label}</Pill>
                  </Property>
                  <Property label="Atualizada">{dateFormat.format(new Date(meta.updated))}</Property>
                  <Property label="Commit">{meta.commit ? <PathLink path={meta.commit} onOpen={() => openPath(meta.commit!)} /> : <span className="text-muted">sem commit</span>}</Property>
                  <Property label="Frescor">{meta.drift ? <Pill tone="warn">{meta.drift}</Pill> : <Pill tone="ok">Em dia</Pill>}</Property>
                </>
              ) : null}
            </dl>
          </section>

          {meta?.dependsOn.length ? (
            <section>
              <h4 className="mb-2 px-1 text-caption font-semibold text-muted">Depende de</h4>
              <div className="flex flex-wrap gap-1.5">
                {meta.dependsOn.map((id) => {
                  const f = byId(id)
                  return f ? (
                    <Chip key={id} onClick={() => onOpen(id)}>
                      {fileLabel(f)}
                    </Chip>
                  ) : null
                })}
              </div>
            </section>
          ) : null}

          {neighbors.length ? (
            <section>
              <h4 className="mb-2 px-1 text-caption font-semibold text-muted">Ligações · {neighbors.length}</h4>
              <div className="flex flex-wrap gap-1.5">
                {neighbors.map((id) => {
                  const f = byId(id)
                  if (!f) return null
                  const NIcon = FILE_CLASS[f.class].icon
                  return (
                    <Chip key={id} onClick={() => onOpen(id)}>
                      <NIcon className="size-3.5 text-muted" />
                      {fileLabel(f)}
                    </Chip>
                  )
                })}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </article>
  )
}
