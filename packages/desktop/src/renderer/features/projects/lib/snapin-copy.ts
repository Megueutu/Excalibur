import type { Catalog } from '@shared/contract'

type Module = Catalog['modules'][number]

/** What the person reads for each snap-in the framework ships. A snap-in of their own has no entry and falls back to its id and its own description. */
const COPY: Record<string, { name: string; description: string }> = {
  checkpoint: { name: 'Checkpoint', description: 'Guarda o estado de uma tarefa longa para retomar de uma página, em vez de reler toda a conversa.' },
  decisions: { name: 'Decisões', description: 'Registra cada escolha importante com o motivo, para poder revisar ou desfazer depois.' },
  assumptions: { name: 'Suposições', description: 'Lista o que foi assumido em vez de perguntado e mostra no fim da tarefa.' },
  'commit-craft': { name: 'Commits', description: 'Planeja commits atômicos, com mensagens no padrão do próprio projeto.' },
  'pr-herald': { name: 'Pull requests', description: 'Escreve a descrição do pull request a partir do diff, da spec e do histórico.' },
  'release-notes': { name: 'Versões', description: 'Monta o changelog e sugere o próximo número de versão a partir dos commits.' },
  'privacy-scan': { name: 'Privacidade', description: 'Procura dados pessoais (CPF, e-mail, telefone, cartão) antes de um push, sem expor os valores.' },
  'dependency-watch': { name: 'Dependências', description: 'Audita vulnerabilidades e versões arriscadas com a ferramenta da própria stack.' },
  'blast-radius': { name: 'Impacto', description: 'Mostra quem depende do que vai mudar, antes de renomear ou apagar algo.' },
  'token-diet': { name: 'Dieta de tokens', description: 'Propõe cortes no que o agente lê em toda sessão, do maior ganho para o menor risco.' },
  graphify: { name: 'Grafo', description: 'Indexa material grande como um grafo para achar onde cada fato mora.' },
  obsidian: { name: 'Obsidian', description: 'Abre a pasta de specs como um cofre do Obsidian, com links e um canvas do projeto.' },
}

export const FAMILY_LABEL: Record<string, string> = {
  registro: 'Registro',
  git: 'Git',
  seguranca: 'Segurança',
  analise: 'Análise e economia',
}

/** The order of the families on the shelf; a snap-in of an unknown family goes last. */
const FAMILY_ORDER = Object.keys(FAMILY_LABEL)

/** The snap-ins grouped by family, so the colors sit together on the shelf. */
export function onShelf(modules: Module[]): Module[] {
  const rank = (m: Module) => {
    const i = FAMILY_ORDER.indexOf(m.family ?? '')
    return i === -1 ? FAMILY_ORDER.length : i
  }
  return [...modules].sort((a, b) => rank(a) - rank(b))
}

export const snapinName = (m: Module) => COPY[m.id]?.name ?? m.id
export const snapinDescription = (m: Module) => COPY[m.id]?.description ?? m.description

/** The css variable that holds the family's color. */
export const familyColor = (m: Module) => `var(--family-${m.family && m.family in FAMILY_LABEL ? m.family : 'other'})`

/** What a snap-in brings, in words: "1 agente: herald · 1 skill". */
export function snapinParts(m: Module): string[] {
  const parts: string[] = []
  if (m.agents.length) parts.push(`${m.agents.length} ${m.agents.length === 1 ? 'agente' : 'agentes'}: ${m.agents.join(', ')}`)
  if (m.skills.length) parts.push(`${m.skills.length} ${m.skills.length === 1 ? 'skill' : 'skills'}: ${m.skills.join(', ')}`)
  if (m.contextFiles) parts.push(`${m.contextFiles} ${m.contextFiles === 1 ? 'arquivo' : 'arquivos'} de contexto fixo`)
  return parts
}

/** Ready-made sets for the creation step; each keeps only the snap-ins that exist on this machine. */
const PRESET_IDS: Record<string, string[]> = {
  Essencial: ['decisions', 'commit-craft'],
  'Git em dia': ['commit-craft', 'pr-herald', 'release-notes'],
  'Economia de tokens': ['checkpoint', 'token-diet', 'blast-radius'],
  Seguro: ['privacy-scan', 'dependency-watch'],
}

export function presetsFor(catalog: Catalog): { label: string; ids: string[] }[] {
  const have = new Set(catalog.modules.map((m) => m.id))
  const sets = Object.entries(PRESET_IDS)
    .map(([label, ids]) => ({ label, ids: ids.filter((id) => have.has(id)) }))
    .filter((p) => p.ids.length)
  return [...sets, { label: 'Tudo', ids: catalog.modules.map((m) => m.id) }, { label: 'Nenhum', ids: [] }]
}
