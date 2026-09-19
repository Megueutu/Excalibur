# Plano de implementação — Excalibur

Checklist derivado de `excalibur-design-doc.md` (23 seções + varredura de gaps). Convenção de numeração conforme a seção 16 do design doc: **numeração hierárquica** (`1.1`, `1.2`…) quando os passos têm dependência de ordem entre si; **lista simples** quando são independentes.

As fases 1–8 seguem a ordem sugerida na seção 11 do design doc (com um ajuste registrado em `IMPLEMENTATION_NOTES.md`). Dentro de cada fase, itens sem dependência entre si aparecem como lista simples.

Legenda: `[ ]` pendente · `[x]` concluído · `[!]` bloqueado (motivo em `IMPLEMENTATION_NOTES.md`)

---

## 1. Fundação do repositório

- [x] 1.1 Reconciliar `main` com `origin/main` e preservar o trabalho local não commitado (branch `pre-impl-snapshot`)
- [x] 1.2 Trocar a licença para MIT (default de trabalho; TODO em aberto → `PENDENCIAS.md`)
- [x] 1.3 Criar `IMPLEMENTATION_PLAN.md`, `IMPLEMENTATION_NOTES.md` e `PENDENCIAS.md`
- [x] 1.4 Reestruturar as pastas raiz para o alvo do design doc (`wizard/`, `pipeline/`, `rules/`, `harnesses/`, `cli/`, `docs/repo/`)
- [x] 1.5 Remover `projects/solaria/` (contexto de negócio — seção 11)
- [x] 1.6 `README.md` raiz reescrito + `README.md` obrigatório em toda pasta principal (seção 18)

## 2. Wizard (renomeação + entrypoint + manifesto)

- [x] 2.1 `wizard/` → `wizard/` (renomeação 1:1, seção 1), atualizando todas as referências
- [x] 2.2 `wizard/manifest.yaml` — 13 perguntas com opções fixas, `default` por pergunta e `review_hint` onde necessário (seções 4, 5, 12, 15, 17)
- [x] 2.3 Pergunta-mestre "personalizar ou usar os padrões" no topo do manifesto (seção 17)
- [x] 2.4 `wizard/init.sh` com o 3º modo `external` (seção 5)
- [x] 2.5 `wizard/entrypoint.md` — fluxo novo, incluindo o passo do agente interpretador pós-manifesto entre os passos 4 e 5 (seção 4)
- [x] 2.6 `wizard/scripts/*.sh` — biblioteca de scripts (`check-gh`, `detect-os`, `detect-stack`, `init-git-repo`, `create-github-repo`, `install-gh`, `record-history`) + `README.md` documentando a decisão `.sh` vs Node (seção 7)

## 3. Pipeline e agentes internos

- [x] 3.1 `pipeline/agents/` com um `.md` por agente (frontmatter `tools:`/`skills:` + corpo Markdown): `orchestrator`, `spec-writer`, `idealizador`, `grill-me`, `review`, `translator` (seção 6)
- [x] 3.2 Persona `guardrail` como Skill nativa em `harnesses/claude/skills/guardrail/` (seção 6)
- [x] 3.3 `pipeline/entrypoint.md` reescrito — 4 camadas (orquestrador → spec → implementar → revisar), classificação alimentada pelas skills de tipo (seções 13, 23)
- [x] 3.4 Estrutura de tarefa com 5 arquivos: `proposal.md`, `spec.md`, `design.md`, `tasks.yaml`, `history.yaml` (seções 15, 16)
- [x] 3.5 `pipeline/review-checklist.md` ampliado — CI/CD, limite de `.md`, `tasks.yaml`, `history.yaml`, Canvas (seções 4, 14, 16)

## 4. Regras globais e por stack

- [x] 4.1 `rules/global/{kiss,yagni,dry,solid}.md` (seção 12)
- [x] 4.2 `rules/stacks/{languages,frameworks,ides}/*.yaml` combináveis (seção 12)
- [x] 4.3 `rules/md-size-limits.yaml` — allowlist de limites, tabela central (seção 14)
- [x] 4.4 `rules/tasks-ordering.yaml` — heurística fixa "com ordem vs. sem ordem" (seção 16)
- [x] 4.5 `rules/naming.md` — convenção de nomenclatura e datas (seção 13)
- [x] 4.6 `rules/interaction.md` — formato `P:`/`R:` como convenção de interação (seção 6)
- [x] 4.7 `rules/writing-md-obsidian.md` — convenções de escrita pra todo `.md` do SDD (seção 10)

## 5. CLI (`cli/`)

- [x] 5.1 `package.json` único na raiz + `cli/bin/excalibur.js` com `mri` + `picocolors` + `@clack/prompts` (seções 9, 20)
- [x] 5.2 `cli/src/lib/` — resolução base+override, build pro caminho lido pelo harness, paths, YAML mínimo (seções 6, 18)
- [x] 5.3 `init` — checagem antes de escrever (padrão `create-vite`, 3 opções) + formulário das 13 perguntas → `.excalibur-answers.yaml` (seções 9, 18)
- [x] 5.4 `update` — regrava `.excalibur/`, nunca toca `.excalibur.custom/`, aplica mapa de migração (seções 18, 22)
- [x] 5.5 `customize <caminho>` + `.excalibur.custom/manifest.yaml` (seção 18)
- [x] 5.6 `check`, `status` (seção 19)
- [x] 5.7 `session <flag>`, `reset` (seção 21)
- [x] 5.8 `clean-history`, `clean`, `kill-my-self` (seções 17, 19)
- [x] 5.9 `.vscode/settings.json` (`files.associations`) + `.vscode/extensions.json` (recomendação de tema de ícone) entregues pelo instalador (seção 18)
- [x] 5.10 `Excalibur` (config raiz, YAML sem extensão) escrito ao fim do init (seção 18)

## 6. Harness Claude — skills

- [x] 6.1 `/excalibur-init` — atalho explícito pro wizard, detecta `.excalibur-answers.yaml` (seções 2, 9)
- [x] 6.2 `sdd` — skill existente atualizada pra nova arquitetura
- [x] 6.3 `/magic-book` — carrega o contexto do SDD numa sessão nova (seção 23)
- [x] 6.4 `/try-gh` — diagnóstico do `gh`, local antes de internet (seção 23)
- [x] 6.5 Skills de tipo de tarefa (Conventional Commits completo: `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `style`, `build`, `ci`, `chore`, `revert`) (seção 23)
- [x] 6.6 `/excalibur-skill-create` — orienta usar o `skill-creator` público antes de criar do zero (seção 3)

## 7. Obsidian e i18n

- [x] 7.1 Canvas do projeto (JSON Canvas) + `rules/canvas-update-checklist.yaml` consultado pelo agente de revisão (seção 16)
- [x] 7.2 Regra de tradução "SDD visível" vs. "Excalibur operacional" no agente `translator` (seção 8)

## 8. Orquestrador, handoff e cache (por último)

- [x] 8.1 `pipeline/handoff-template.md` — `.md` curto com frontmatter (seção 13)
- [x] 8.2 `rules/prompt-cache.md` — estratégia de prefixo estável e até 4 breakpoints (seção 13)
- [x] 8.3 `.excalibur-session.yaml` — 9 diretivas de sessão lidas pelo orquestrador (seção 21)
- [ ] 8.4 Histórico: `history.yaml` por tarefa, script de registro, conversor e as 6 opções de limpeza (seções 15, 17)
