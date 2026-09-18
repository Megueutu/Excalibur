# Núcleo SDD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure Excalibur's core-agnostic SDD content into `pipeline/`, `reflection/`, and `bootstrap/` top-level folders; adapt spec writing to Obsidian conventions; and add the bootstrap wizard that lets a project decide where its SDD content lives (embedded in the project repo or in a separate sibling repo) instead of living inside Excalibur's `projects/`.

**Architecture:** Pure markdown + one bash script, no runtime dependency beyond Git Bash/WSL. `core/pipeline/` splits into two top-level folders (`pipeline/` keeps implementation-time process, `reflection/` gets the new reasoning-chain content). A new `bootstrap/` folder holds the one-time project-onboarding wizard (`entrypoint.md` + `init.sh`) that a harness adapter runs before `pipeline/` the first time it touches a project. Detection of "already bootstrapped" is convention-based (checks for `.sdd/` in the repo, then for a `../<repo>-sdd` sibling) — no marker file needed.

**Tech Stack:** Markdown, bash (POSIX, Git Bash/WSL only — no PowerShell/cmd fallback).

**Spec:** [docs/superpowers/specs/2026-09-17-nucleo-sdd-design.md](../specs/2026-09-17-nucleo-sdd-design.md)

## Global Constraints

- No `core/` folder after this plan — `pipeline/`, `reflection/`, `bootstrap/`, `harnesses/`, `rules/` are top-level siblings.
- Scripts are bash only. Git Bash (Windows) or native bash (Mac/Linux) is a hard documented dependency — no PowerShell/cmd native support.
- `projects/solaria/.contexto/` is not touched or migrated in this plan — explicitly deferred by the user.
- No `git add`/`commit`/`push` during execution of this plan — the user has instructed not to touch git this session. File creation/editing only.
- Every new markdown file that will be read by an agent must have all internal relative links verified to resolve (via `realpath -m`), matching the standard already used in `harnesses/claude/skills/sdd/SKILL.md` and `rules/`.

---

### Task 1: Restructure `core/` into `pipeline/` and `reflection/`

**Files:**
- Create: `pipeline/entrypoint.md` (moved from `core/pipeline/entrypoint.md`, paths updated)
- Create: `pipeline/review-checklist.md` (moved from `core/pipeline/review-checklist.md`, unchanged content)
- Create: `pipeline/spec-template.md` (placeholder move here — Task 2 rewrites its content for Obsidian)
- Create: `reflection/README.md`
- Create: `reflection/when-to-pause.md` (moved from `core/pipeline/reflection.md`, unchanged content)
- Create: `reflection/reasoning-chain.md`
- Delete: `core/` (entire directory, once the above exist)
- Modify: `harnesses/claude/skills/sdd/SKILL.md:12-19` (paths pointing at `core/pipeline/` and `rules/`)
- Modify: `rules/structure.md` (diagram and table reference `core/pipeline/`)

**Interfaces:**
- Produces: `pipeline/entrypoint.md` referenced by name from `harnesses/claude/skills/sdd/SKILL.md` (Task 4) and `bootstrap/entrypoint.md` (Task 3, as "what runs after bootstrap").
- Produces: `reflection/reasoning-chain.md` and `reflection/when-to-pause.md`, referenced from `pipeline/entrypoint.md` and `bootstrap/entrypoint.md`.

- [ ] **Step 1: Move `review-checklist.md` and `entrypoint.md` verbatim, then fix internal paths**

```bash
mkdir -p pipeline reflection
git mv core/pipeline/review-checklist.md pipeline/review-checklist.md 2>/dev/null || mv core/pipeline/review-checklist.md pipeline/review-checklist.md
mv core/pipeline/entrypoint.md pipeline/entrypoint.md
mv core/pipeline/spec-template.md pipeline/spec-template.md
```

(Use plain `mv`, not `git mv` — no git operations this session.)

- [ ] **Step 2: Update `pipeline/entrypoint.md` section 4 ("Onde os arquivos vivem")**

Replace the paragraph that currently reads:

```markdown
- **Definição do processo** (este pipeline): `core/pipeline/` — compartilhado entre todos os projetos e harnesses.
```

with:

```markdown
- **Definição do processo** (este pipeline): `pipeline/` — compartilhado entre todos os projetos e harnesses. A cadeia de raciocínio usada ao produzir specs vive em `reflection/`, separada deste pipeline.
```

- [ ] **Step 3: Write `reflection/when-to-pause.md`**

Copy the full current content of `core/pipeline/reflection.md` verbatim into `reflection/when-to-pause.md` (title, table, all sections — no changes to wording, this is a pure rename/move).

- [ ] **Step 4: Write `reflection/reasoning-chain.md`**

```markdown
# Cadeia de raciocínio padrão — produção de specs

Sequência que o agente segue ao produzir qualquer `spec.md` (tarefas **Feature** ou **Big feature**, ver [pipeline/entrypoint.md](../pipeline/entrypoint.md)). É o padrão gerado pelo Excalibur — um projeto pode sobrescrever com sua própria versão (ver "Override por projeto" abaixo).

## As quatro etapas

1. **Contexto** — o que existe hoje, o que motivou o pedido, o que já foi confirmado com o usuário (grillme, se rodado). Sem isso escrito, não avançar pra próxima etapa.
2. **Hipóteses** — pelo menos duas formas plausíveis de resolver, mesmo que uma pareça óbvia. Anotar o trade-off de cada uma antes de escolher.
3. **Validação** — checar cada hipótese contra o que já existe no repo/projeto (reuso, padrão já estabelecido, ver [when-to-pause.md](when-to-pause.md) pra quando isso não está claro o suficiente pra decidir sozinho). Descartar hipóteses que exigem reinventar algo que já existe.
4. **Decisão** — escolher uma hipótese, registrar por quê as outras foram descartadas. Essa decisão vira a seção "Decisões já fechadas" da spec (ver [pipeline/spec-template.md](../pipeline/spec-template.md)).

## Override por projeto

Se o destino do SDD do projeto (embutido ou repo separado — ver [bootstrap/entrypoint.md](../bootstrap/entrypoint.md)) tiver um `reflection/reasoning-chain.md` próprio, ele prevalece sobre este. Se não tiver, este é o padrão usado.

## Quando não se aplica

Tarefas classificadas como **Fix** não passam por essa cadeia — só pelo processo padrão de `pipeline/entrypoint.md`. A cadeia é pra decisões de design (Feature/Big feature), não pra correções pontuais.
```

- [ ] **Step 5: Write `reflection/README.md`**

```markdown
# reflection/

Conteúdo sobre *como pensar* ao produzir uma spec — separado de `pipeline/`, que é *o que fazer em qual ordem*.

- [reasoning-chain.md](reasoning-chain.md) — cadeia de raciocínio padrão (contexto → hipóteses → validação → decisão) usada ao produzir specs de tarefas Feature/Big feature.
- [when-to-pause.md](when-to-pause.md) — quando parar e perguntar ao usuário em vez de decidir sozinho.
```

- [ ] **Step 6: Delete `core/` and verify it's gone**

```bash
rm -rf core
test ! -d core && echo "OK: core/ removed"
```

Expected: `OK: core/ removed`

- [ ] **Step 7: Verify all new internal links resolve**

```bash
realpath -m pipeline/entrypoint.md
realpath -m reflection/reasoning-chain.md
realpath -m reflection/when-to-pause.md
cd reflection && realpath -m ../pipeline/entrypoint.md && realpath -m ../pipeline/spec-template.md && realpath -m reasoning-chain.md && realpath -m when-to-pause.md && cd ..
```

Expected: every path prints an existing file (no "No such file" errors — `realpath -m` doesn't error on missing files by itself, so also run `test -f <path>` for each printed path and confirm all return success).

- [ ] **Step 8: Update `harnesses/claude/skills/sdd/SKILL.md`**

Replace:
```markdown
   - `core/pipeline/entrypoint.md` — processo completo (grillme, classificação, onde ficam spec/análise).
```
with:
```markdown
   - `pipeline/entrypoint.md` — processo completo (grillme, classificação, onde ficam spec/análise).
   - `reflection/reasoning-chain.md` — cadeia de raciocínio a seguir ao escrever a spec.
```

And replace the "Referências" section's:
```markdown
- Metodologia (compartilhada, não editar aqui): [`core/pipeline/`](../../../../core/pipeline/)
```
with:
```markdown
- Metodologia (compartilhada, não editar aqui): [`pipeline/`](../../../../pipeline/) e [`reflection/`](../../../../reflection/)
```

- [ ] **Step 9: Verify links from `harnesses/claude/skills/sdd/SKILL.md` resolve**

```bash
realpath -m harnesses/claude/skills/sdd/../../../../pipeline/entrypoint.md
realpath -m harnesses/claude/skills/sdd/../../../../reflection/
test -f "$(realpath -m harnesses/claude/skills/sdd/../../../../pipeline/entrypoint.md)" && echo OK
```

Expected: `OK`

---

### Task 2: Obsidian-adapt spec writing

**Files:**
- Create: `rules/writing-specs-obsidian.md`
- Modify: `pipeline/spec-template.md` (full rewrite — Obsidian-native format)

**Interfaces:**
- Consumes: `pipeline/spec-template.md` path from Task 1 (already moved, currently still has the old markdown-only content — this task replaces that content).
- Produces: `rules/writing-specs-obsidian.md`, referenced from `pipeline/spec-template.md` and from `rules/structure.md` (Task 5).

- [ ] **Step 1: Write `rules/writing-specs-obsidian.md`**

```markdown
# Escrevendo specs pro Obsidian

Toda spec produzida pelo `pipeline/spec-template.md` segue estas convenções, pra ser lida confortavelmente num vault Obsidian (graph view, backlinks, properties, Templater).

## Frontmatter / Properties

Todo `spec.md` começa com YAML frontmatter:

```yaml
---
status: em-andamento   # em-andamento | concluida | pausada
projeto: <nome-do-projeto>
tarefa: <slug-da-tarefa>
classe: feature         # fix | feature | big-feature
criada: YYYY-MM-DD
---
```

`status` e `classe` são os campos que mais valem a pena filtrar/consultar depois (ex. via Dataview, se o vault tiver o plugin) — manter atualizados, não só na criação.

## Wikilinks

Referências a outras notas do mesmo destino de SDD (outra spec, uma nota de decisão, uma nota de contexto do projeto) usam `[[nome-da-nota]]`, não link relativo de markdown (`[nome](../caminho.md)`). Isso é o que alimenta o graph view e os backlinks do Obsidian.

Links pra fora do vault (ex.: pra este repositório Excalibur, pra um arquivo de código) continuam como link markdown normal — wikilink é só entre notas do mesmo vault.

## Estrutura de vault

O destino do SDD de um projeto (ver [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)) segue:

```
<destino>/
  specs/
    <repo>/<tarefa>/spec.md
  Templates/
    spec-template.md      cópia do pipeline/spec-template.md, usada por Templater/QuickAdd
```

A pasta `Templates/` existe pra permitir criar uma spec nova de dentro do próprio Obsidian (comando "Insert Template" ou QuickAdd), sem depender do agente de IA pra copiar o template manualmente.

## Callouts

Seções que merecem destaque visual usam callout em vez de só um header:

- Decisão fechada: `> [!note] Decisão`
- Risco ou pendência bloqueante: `> [!warning] Em aberto`
- Algo que já deu errado uma vez e não deve se repetir: `> [!danger] Cuidado`

Exemplo:

```markdown
> [!warning] Em aberto
> Mecanismo de override da reasoning-chain ainda não testado neste projeto.
```
```

- [ ] **Step 2: Rewrite `pipeline/spec-template.md`**

```markdown
# Template — spec de tarefa

Copiar essa estrutura ao criar a spec de uma tarefa **Feature** ou **Big feature** (ver critério em [entrypoint.md](entrypoint.md)). Segue as convenções de [rules/writing-specs-obsidian.md](../rules/writing-specs-obsidian.md) — frontmatter, wikilinks, callouts. Não preencher seções que não se aplicam — não é formulário obrigatório campo a campo, é estrutura de referência.

```markdown
---
status: em-andamento
projeto: <nome-do-projeto>
tarefa: <slug-da-tarefa>
classe: feature
criada: YYYY-MM-DD
---

# <nome curto da tarefa>

## Contexto
O que motivou isso, o que existe hoje, o que está sendo pedido — resumo do que saiu da entrevista (grillme) e da etapa "Contexto" da [[reasoning-chain]].

> [!note] Decisão
> Lista do que foi confirmado com o usuário e não precisa ser reaberto (saída da etapa "Decisão" da [[reasoning-chain]]).

> [!warning] Em aberto
> Perguntas/decisões que ainda não têm resposta — usar [when-to-pause.md](../reflection/when-to-pause.md) pra decidir se pausa ou segue.

## Roadmap
1. Passo 1 — o que, onde (arquivo/módulo), critério de "pronto".
2. Passo 2 — ...

(Big feature: agrupar passos em fases, cada fase com seu próprio checklist de "pronto".)

## Checklist de análise geral
- [ ] Reuso checado antes de criar código novo
- [ ] Escopo mínimo — nada implementado além do pedido
- [ ] Regras de commit/PR aplicáveis identificadas
- [ ] Nenhum comentário de código sem pedido explícito
```
```

- [ ] **Step 3: Verify links from the new files resolve**

```bash
test -f rules/writing-specs-obsidian.md && echo "rules OK"
realpath -m pipeline/../rules/writing-specs-obsidian.md
test -f "$(realpath -m pipeline/../rules/writing-specs-obsidian.md)" && echo "link from pipeline/ OK"
realpath -m rules/../bootstrap/entrypoint.md
```

Expected: `rules OK`, `link from pipeline/ OK`. The last command's target (`bootstrap/entrypoint.md`) won't exist yet — that's expected until Task 3 runs; don't `test -f` it here.

---

### Task 3: `bootstrap/` — project onboarding wizard

**Files:**
- Create: `bootstrap/entrypoint.md`
- Create: `bootstrap/init.sh`
- Create: `bootstrap/presets/github/conservador.md`
- Create: `bootstrap/presets/github/direto.md`

**Interfaces:**
- Consumes: `pipeline/entrypoint.md`, `reflection/reasoning-chain.md`, `pipeline/spec-template.md`, `rules/writing-specs-obsidian.md` (all from Tasks 1–2, referenced by path from `bootstrap/entrypoint.md`).
- Produces: `bootstrap/init.sh` — a callable script with signature documented below, invoked by the harness adapter (Task 4).

**`init.sh` contract** (documented here since Task 4 depends on it):
```
Usage: bootstrap/init.sh <mode> <target-path> [project-name]
  mode: "embedded" | "separate"
  target-path: path to the project repo (embedded) or path to the project repo's parent dir (separate)
  project-name: required only when mode=separate — becomes "<project-name>-sdd"
Exit codes: 0 = created, 1 = bad args, 2 = destination already exists
```

- [ ] **Step 1: Write `bootstrap/presets/github/conservador.md`**

```markdown
# Preset GitHub — Conservador

- Nunca mergear pra `main` automaticamente. Por padrão: só subir a branch.
- Abrir PR e/ou mergear apenas se o usuário pedir explicitamente.
- Perguntar antes de agir quando o escopo for ambíguo.
- Toda mudança passa por PR, mesmo que pequena.
```

- [ ] **Step 2: Write `bootstrap/presets/github/direto.md`**

```markdown
# Preset GitHub — Direto

- Commitar e dar push direto na branch de trabalho sem abrir PR, a menos que o usuário peça.
- Nunca merge automático pra `main`/`qa` — isso é sempre manual do usuário.
- Ainda assim, nunca commitar sem o usuário ter pedido a tarefa.
```

- [ ] **Step 3: Write `bootstrap/entrypoint.md`**

```markdown
# Bootstrap — criando o SDD de um projeto novo

Roda uma única vez por projeto, antes de qualquer tarefa de implementação (`pipeline/entrypoint.md`) poder começar. Disparado pelo adapter do harness (ver `harnesses/<harness>/`) quando ele não encontra um destino de SDD já configurado pro projeto (ver "Detecção" abaixo).

## 1. Perguntar: adaptar projeto existente ou começar do zero?

- **Adaptar existente**: o projeto já tem código, possivelmente já tem alguma documentação/processo — vamos ler o que existe (`README.md`, `CONTRIBUTING.md`, etc.) antes de propor a estrutura, em vez de simplesmente sobrescrever.
- **Do zero**: projeto novo ou sem processo definido ainda — ir direto pra pergunta 2.

## 2. Perguntar: onde materializar o SDD?

| Opção | Onde fica | Quando faz sentido |
|---|---|---|
| **Embutido** | `.sdd/` na raiz do próprio repo do projeto | Time já ok com rastro de planejamento assistido por IA versionado junto do código. |
| **Separado** | Repo irmão `<nome-do-repo>-sdd`, fora do repo do projeto | Quer manter o histórico do repo de produto livre de artefatos de IA (ver o princípio em `padrao-de-codigo.md`, quando existir pro projeto). |

## 3. Preset de GitHub

Perguntar como lidar com git/GitHub nesse projeto:
- **Opção A** — [`presets/github/conservador.md`](presets/github/conservador.md): nunca mergear sozinho, sempre PR.
- **Opção B** — [`presets/github/direto.md`](presets/github/direto.md): push direto na branch, PR só se pedido.
- **Opção C — Especificar**: usuário descreve as regras em texto livre; o texto vira `git.md` no destino, no lugar de um preset.

## 4. Rodar o script

Com as três respostas em mãos, chamar:

```bash
bootstrap/init.sh <embedded|separate> <target-path> [project-name]
```

Isso cria a estrutura de destino (specs/, Templates/, reflection/, o preset de GitHub escolhido copiado como `git.md`) — ver contrato completo do script no plano de implementação ou no cabeçalho de `init.sh`.

## 5. Depois de rodar

Seguir direto pra [`pipeline/entrypoint.md`](../pipeline/entrypoint.md) com a primeira tarefa real do projeto — o bootstrap só prepara o destino, não implementa nada.

## Detecção (pros harness adapters)

Antes de disparar este wizard, checar se o projeto já tem destino de SDD:
1. Existe `.sdd/` na raiz do repo do projeto? → já bootstrapado, modo embutido.
2. Existe `../<nome-do-repo>-sdd/` (pasta irmã do repo)? → já bootstrapado, modo separado.
3. Nenhum dos dois → disparar este wizard.
```

- [ ] **Step 4: Write `bootstrap/init.sh`**

```bash
#!/usr/bin/env bash
# bootstrap/init.sh — materializes the SDD destination for a project.
# Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]
# Requires: bash (Git Bash on Windows, native on Mac/Linux). No PowerShell/cmd support.
set -euo pipefail

MODE="${1:-}"
TARGET_PATH="${2:-}"
PROJECT_NAME="${3:-}"

if [[ "$MODE" != "embedded" && "$MODE" != "separate" ]]; then
  echo "Usage: bootstrap/init.sh <embedded|separate> <target-path> [project-name]" >&2
  exit 1
fi

if [[ -z "$TARGET_PATH" ]]; then
  echo "Error: target-path is required" >&2
  exit 1
fi

if [[ "$MODE" == "separate" && -z "$PROJECT_NAME" ]]; then
  echo "Error: project-name is required when mode=separate" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
EXCALIBUR_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [[ "$MODE" == "embedded" ]]; then
  DEST="$TARGET_PATH/.sdd"
else
  DEST="$TARGET_PATH/${PROJECT_NAME}-sdd"
fi

if [[ -e "$DEST" ]]; then
  echo "Error: destination already exists: $DEST" >&2
  exit 2
fi

mkdir -p "$DEST/specs" "$DEST/Templates" "$DEST/reflection"
cp "$EXCALIBUR_ROOT/pipeline/spec-template.md" "$DEST/Templates/spec-template.md"
cp "$EXCALIBUR_ROOT/reflection/reasoning-chain.md" "$DEST/reflection/reasoning-chain.md"

echo "Created SDD destination at: $DEST"
echo "Next: copy the chosen GitHub preset from bootstrap/presets/github/ to $DEST/git.md"
```

- [ ] **Step 5: Make the script executable and verify syntax**

```bash
chmod +x bootstrap/init.sh
bash -n bootstrap/init.sh && echo "syntax OK"
```

Expected: `syntax OK`

- [ ] **Step 6: Dry-run the script against a scratch directory (embedded mode)**

```bash
SCRATCH="$(mktemp -d)"
mkdir -p "$SCRATCH/fake-repo"
bootstrap/init.sh embedded "$SCRATCH/fake-repo"
test -d "$SCRATCH/fake-repo/.sdd/specs" && test -d "$SCRATCH/fake-repo/.sdd/Templates" && echo "embedded OK"
test -f "$SCRATCH/fake-repo/.sdd/Templates/spec-template.md" && echo "template copied OK"
rm -rf "$SCRATCH"
```

Expected: `embedded OK` and `template copied OK`

- [ ] **Step 7: Dry-run the script against a scratch directory (separate mode)**

```bash
SCRATCH="$(mktemp -d)"
bootstrap/init.sh separate "$SCRATCH" meu-projeto
test -d "$SCRATCH/meu-projeto-sdd/specs" && echo "separate OK"
rm -rf "$SCRATCH"
```

Expected: `separate OK`

- [ ] **Step 8: Verify error handling**

```bash
bootstrap/init.sh bad-mode /tmp/x; echo "exit code: $?"
bootstrap/init.sh separate /tmp/x; echo "exit code: $?"
```

Expected: first line prints usage + `exit code: 1`; second line prints the missing-project-name error + `exit code: 1`

---

### Task 4: Update Claude harness adapter with bootstrap-vs-pipeline check

**Files:**
- Modify: `harnesses/claude/skills/sdd/SKILL.md`

**Interfaces:**
- Consumes: `bootstrap/entrypoint.md` (Task 3), `pipeline/entrypoint.md` (Task 1).

- [ ] **Step 1: Replace the "O que fazer" section**

Replace:
```markdown
## O que fazer

1. Identificar qual projeto está sendo trabalhado (pasta em `projects/<project>/`). Se não houver uma pasta ainda, ver [`rules/adding-a-project.md`](../../../../rules/adding-a-project.md) antes de continuar.
2. Ler, nesta ordem:
   - `core/pipeline/entrypoint.md` — processo completo (grillme, classificação, onde ficam spec/análise).
   - `projects/<project>/.contexto/orientacoes.md` — regras sempre-lidas específicas do projeto.
3. Seguir o processo descrito em `core/pipeline/entrypoint.md` estritamente, incluindo parar pra pedir `/grill-me` antes de qualquer exploração de código.
```

with:
```markdown
## O que fazer

1. Identificar o repo do projeto sendo trabalhado. Checar se ele já tem um destino de SDD (ver "Detecção" em [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detecção-pros-harness-adapters)):
   - Sem destino ainda → seguir [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md) primeiro. Não pular pra implementação antes disso.
   - Já tem destino → seguir direto pro passo 2.
2. Ler, nesta ordem:
   - [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) — processo completo (grillme, classificação, onde ficam spec/análise).
   - `orientacoes.md` (ou equivalente) dentro do destino de SDD do projeto (`.sdd/` embutido ou `<repo>-sdd/` separado).
3. Seguir o processo descrito em [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) estritamente, incluindo parar pra pedir `/grill-me` antes de qualquer exploração de código.
```

- [ ] **Step 2: Update the "Referências" section**

Replace:
```markdown
## Referências

- Metodologia (compartilhada, não editar aqui): [`pipeline/`](../../../../pipeline/) e [`reflection/`](../../../../reflection/)
- Regras do projeto atual: `projects/<project>/.contexto/`
- Como este repo é organizado: [`rules/structure.md`](../../../../rules/structure.md)
```
with:
```markdown
## Referências

- Metodologia (compartilhada, não editar aqui): [`pipeline/`](../../../../pipeline/) e [`reflection/`](../../../../reflection/)
- Onboarding de projeto novo: [`bootstrap/`](../../../../bootstrap/)
- Regras do projeto atual: dentro do destino de SDD dele (`.sdd/` ou `<repo>-sdd/`)
- Como este repo é organizado: [`rules/structure.md`](../../../../rules/structure.md)
```

(Note: this second replacement's "before" text already reflects Task 1 Step 8's edit — apply this on top of that, not from the original pre-Task-1 file.)

- [ ] **Step 3: Verify links resolve**

```bash
realpath -m harnesses/claude/skills/sdd/../../../../bootstrap/entrypoint.md
test -f "$(realpath -m harnesses/claude/skills/sdd/../../../../bootstrap/entrypoint.md)" && echo OK
```

Expected: `OK`

---

### Task 5: Update `rules/` to match the new architecture

**Files:**
- Modify: `rules/structure.md` (full rewrite of the tree diagram and table)
- Delete: `rules/adding-a-project.md` (concept no longer applies — projects aren't added to Excalibur anymore)
- Create: `rules/adding-a-harness.md` — update references from `core/pipeline/` to `pipeline/`/`reflection/`

**Interfaces:**
- Consumes: final directory layout from Tasks 1–3.

- [ ] **Step 1: Rewrite `rules/structure.md`**

```markdown
# Estrutura do repositório

```
Excalibur/
  rules/            regras sobre o próprio Excalibur (este arquivo e os vizinhos dele)
  pipeline/          metodologia de implementação, harness-agnóstica e projeto-agnóstica
  reflection/         cadeia de raciocínio e regras de quando parar/perguntar
  bootstrap/          wizard de onboarding: cria o destino de SDD de um projeto novo
  harnesses/
    <harness>/         adapter fino do harness — só "quando disparar" + ponteiro pro resto
  projects/
    solaria/.contexto/   contexto legado da Solaria — não usar como referência de projeto novo, ver nota abaixo
```

## Camadas e onde cada coisa vive

| Camada | Onde | Regra pra decidir se algo entra aqui |
|---|---|---|
| `rules/` | raiz | Regras sobre como usar/manter o Excalibur em si, incluindo como escrever skills, specs (Obsidian) e scripts. |
| `pipeline/` | raiz | Processo de implementação assumindo que o SDD do projeto já existe (grillme, classificação, spec, checklist). |
| `reflection/` | raiz | Como pensar ao produzir uma spec — cadeia de raciocínio padrão e quando parar/perguntar. Não é "o que fazer", é "como decidir". |
| `bootstrap/` | raiz | Onboarding de projeto novo — roda uma vez, decide onde o SDD do projeto vai morar. |
| `harnesses/<harness>/` | raiz | Só o adapter (gatilho + ponteiro). Nunca duplicar conteúdo de `pipeline/`/`reflection/`/`bootstrap/`. |
| `projects/` | raiz | **Legado.** Projetos não vivem mais dentro do Excalibur — `bootstrap/` materializa o SDD deles embutido no próprio repo ou num repo separado. `projects/solaria/` continua aqui até ser migrado (tarefa futura). |

## Por que a metodologia foi dividida em `pipeline/` e `reflection/`

`pipeline/` é sequência de processo ("primeiro grillme, depois classificar, depois spec"). `reflection/` é sobre como pensar em cada etapa dessa sequência ("qual cadeia de raciocínio seguir ao escrever a spec", "quando essa decisão é grande demais pra tomar sozinho") — são preocupações diferentes o suficiente pra não viverem no mesmo lugar.

Ver [adding-a-harness.md](adding-a-harness.md) pra como estender a camada de harnesses. Onboarding de projeto novo agora é [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md), não mais um arquivo em `rules/`.
```

- [ ] **Step 2: Delete `rules/adding-a-project.md`**

```bash
rm rules/adding-a-project.md
```

- [ ] **Step 3: Update `rules/adding-a-harness.md` references**

Replace every occurrence of `core/pipeline/entrypoint.md` with `pipeline/entrypoint.md`, and add `reflection/` to the list of things an adapter must point to. Specifically, replace:
```markdown
2. Um ponteiro pra `core/pipeline/entrypoint.md` e pro `.contexto/orientacoes.md` do projeto em questão.
```
with:
```markdown
2. Um ponteiro pra `pipeline/entrypoint.md`, `reflection/`, e (se o projeto ainda não tiver destino de SDD) pra `bootstrap/entrypoint.md`.
```

- [ ] **Step 4: Verify no remaining references to `core/`, `projects/<project>`, or the deleted `adding-a-project.md`**

```bash
grep -rn "core/pipeline\|core/reflection" --include="*.md" . || echo "no core/ references found"
grep -rln "adding-a-project.md" --include="*.md" . || echo "no dangling references to adding-a-project.md"
```

Expected: both commands print their "no ... found" message (grep finding nothing exits non-zero, so the `||` branch runs).

- [ ] **Step 5: Full link-integrity pass over the whole repo**

```bash
find . -not -path "./.git*" -name "*.md" | while read -r f; do
  dir="$(dirname "$f")"
  grep -oE '\]\(([^)#]+)\)' "$f" | sed -E 's/^\]\(//; s/\)$//' | while read -r link; do
    case "$link" in http*|https*) continue ;; esac
    target="$(cd "$dir" 2>/dev/null && realpath -m "$link" 2>/dev/null)"
    [[ -n "$target" && -e "$target" ]] || echo "BROKEN: $f -> $link"
  done
done
echo "link check done"
```

Expected: no `BROKEN:` lines before `link check done` (any that appear must be fixed before considering the task complete — re-run this step after each fix).

---

## Final Verification

- [ ] Run Task 5 Step 5's full link-integrity pass one more time from the repo root — zero `BROKEN:` lines.
- [ ] Run `find . -not -path "./.git*" -type f | sort` and confirm: no `core/` directory, `pipeline/`, `reflection/`, `bootstrap/` all present at top level, `rules/adding-a-project.md` absent, `projects/solaria/.contexto/` unchanged from before this plan (diff its file list against the pre-plan listing if unsure).
- [ ] Run `git status --short` and confirm nothing is staged or committed (only working-tree modifications, per the Global Constraints "no git" rule).
