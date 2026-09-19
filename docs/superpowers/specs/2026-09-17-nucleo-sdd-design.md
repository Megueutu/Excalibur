# Núcleo SDD — design

## Contexto

O Excalibur hoje (estado anterior a este design) tem `core/pipeline/` (metodologia de implementação: entrypoint, classificação fix/feature/big feature, spec-template, review-checklist) e `projects/solaria/.contexto/` (contexto específico da Solaria, incluindo specs já escritas).

O usuário quer expandir o Excalibur pra vários subsistemas independentes:
1. Núcleo SDD (este design) — pipeline de implementação + cadeia de reflexão + specs adaptadas pro Obsidian + bootstrap de projeto novo.
2. Distribuição de skills/scripts prontos pros projetos + ferramentas de criação de skill/agente.
3. `rules/` mais amplo (transversal aos dois núcleos).

Este documento cobre só o núcleo 1.

## Decisões já fechadas

- **`core/` deixa de existir.** `pipeline/`, `reflection/`, `bootstrap/`, `harnesses/`, `rules/` viram pastas irmãs na raiz.
- **`pipeline/`** mantém o escopo atual (processo de implementação assumindo que o SDD do projeto já existe): `entrypoint.md`, `spec-template.md`, `review-checklist.md`. `reflection.md` sai daqui.
- **`reflection/` é conteúdo novo, não só uma renomeação.** Contém:
  - `reasoning-chain.md` — cadeia de raciocínio padrão (contexto → hipóteses → validação → decisão) aplicada pelo agente ao produzir qualquer spec. É o padrão gerado pelo Excalibur; o usuário pode sobrescrever depois (mecanismo de override ainda não desenhado — ver "Em aberto").
  - `when-to-pause.md` — conteúdo que hoje é `reflection.md` (quando parar e perguntar em vez de decidir sozinho).
  - `README.md` — índice.
- **`projects/` como conceito de "dado vivo dentro do Excalibur" deixa de existir daqui pra frente.** Specs e contexto de um projeto passam a morar fora do Excalibur: embutidos no próprio repo do projeto (ex.: `.sdd/`, `docs/`, `specs/`) ou num repo separado (ex.: `{nome-do-repo}-sdd`), escolhido no momento do bootstrap.
  - `projects/solaria/.contexto/` **fica como está por enquanto** — migração é tarefa separada, decidida depois.
- **`bootstrap/`** é o processo novo de criar o SDD de um projeto do zero (distinto de `pipeline/`, que assume que o SDD já existe). Contém:
  - `entrypoint.md` — fluxo de perguntas: onde materializar (embutido vs. repo separado), adaptar projeto existente vs. começar do zero, presets (ex.: como lidar com GitHub — múltiplas opções predefinidas + "especificar").
  - `init.sh` — script que materializa a estrutura escolhida, chamado pelo agente depois das respostas do wizard.
- **Specs adaptadas pro Obsidian**, sem pasta própria: `rules/writing-specs-obsidian.md` cobre frontmatter/propriedades, wikilinks, convenção de estrutura de vault (pastas/templates) e callouts; `pipeline/spec-template.md` é reescrito nesse formato.
- **Scripts em shell (bash), sem fallback pra PowerShell/cmd nativo.** Git Bash/WSL documentado como dependência obrigatória em `rules/`.
- **Adapter do Claude (`harnesses/claude/skills/sdd/SKILL.md`) ganha uma checagem nova**: antes de tudo, verificar se o projeto já tem destino de SDD definido. Se não, disparar `bootstrap/entrypoint.md` primeiro; se sim, seguir pro `pipeline/entrypoint.md` como hoje.

## Em aberto

- **Mecanismo de override da `reasoning-chain.md` por projeto** — não foi desenhado ainda (opções levantadas: arquivo próprio no destino do SDD sobrescrevendo o padrão, presets múltiplos, etc.). Decidir quando o `bootstrap/entrypoint.md` for escrito em detalhe, já que o wizard provavelmente é o lugar natural pra perguntar isso.
- **Conteúdo exato dos presets de `bootstrap/` (ex.: opções de GitHub)** — não fechado, fica pra quando `bootstrap/entrypoint.md` for escrito.
- **Como o `bootstrap/init.sh` detecta "projeto já tem destino de SDD definido"** (pra decidir se roda bootstrap ou pipeline) — mecanismo concreto (arquivo marcador? convenção de nome?) não desenhado ainda.
- **Migração de `projects/solaria/.contexto/` pro novo modelo** — adiada, tratar como tarefa separada.

## Roadmap

1. Reestruturar diretórios: mover `core/pipeline/*` pra `pipeline/` (raiz), extrair reflexão pra `reflection/` (`when-to-pause.md` a partir do `reflection.md` atual + `reasoning-chain.md` novo + `README.md`), remover `core/`.
2. Escrever `rules/writing-specs-obsidian.md` e reescrever `pipeline/spec-template.md` no formato Obsidian (frontmatter, wikilinks, callouts).
3. Criar `bootstrap/entrypoint.md` (fluxo de perguntas do wizard) e `bootstrap/init.sh` (materialização), resolvendo os itens em aberto acima durante a escrita.
4. Atualizar `harnesses/claude/skills/sdd/SKILL.md` com a checagem de bootstrap-vs-pipeline e os novos caminhos (`pipeline/`, `reflection/`, `bootstrap/` em vez de `core/pipeline/`).
5. Atualizar `rules/structure.md` e `rules/adding-a-project.md` (ou substituir por algo equivalente, já que `projects/` como conceito muda) pra refletir a arquitetura nova.

## Checklist de análise geral

- [x] Reuso checado — pipeline/entrypoint/reflection/spec-template existentes foram a base, não recriados do zero.
- [x] Escopo mínimo — este design cobre só o núcleo SDD; distribuição de skills/scripts/ferramentas fica pro outro núcleo, decidido separadamente.
- [ ] Regras de commit/PR aplicáveis — N/A neste documento (nenhum commit será feito; usuário pediu explicitamente pra não mexer em git nesta sessão).
- [x] Nenhuma migração de dado vivo (solaria) feita sem decisão explícita — adiada por pedido do usuário.
