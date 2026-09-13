# GitHub Rulesets

Não há ruleset a nível de organização (a API `orgs/Solierrr/rulesets` não retornou nada com o escopo de token atual — pode exigir `admin:org`, ou pode simplesmente não existir nenhum a nível de org). Os rulesets encontrados são **por repositório**. Padrão observado em `api-core` e `web-app` (repos "completos"):

## `main-protection` (branch default)

- Bloqueia `deletion` e `non_fast_forward` (ou seja: **sem force-push, sem deletar a branch**).
- Exige Pull Request: 1 aprovação, `dismiss_stale_reviews_on_push: true`, `require_code_owner_review: true`.
- `require_extra_approval_for_unattributed_changes: true` — **isso é o gatilho relevante para commits/PRs de IA**: mudanças "não atribuídas" (bot/IA) exigem aprovação extra. É provavelmente por causa dessa regra que um force-push para remover um commit de IA foi bloqueado numa sessão anterior (ver incidente abaixo).
- Copilot code review automático (`review_on_push: true`).
- `code_quality` check obrigatório (severidade `errors`).
- Status checks obrigatórios: `test`, `quality`.

## `qa-protection` (branch `qa`)

- Mesmas restrições de deleção/force-push que `main-protection`.
- PR exigido, mas **0 aprovações obrigatórias** (`required_approving_review_count: 0`) — mais leve que `main`, mas ainda passa por PR.
- Mesmo `require_extra_approval_for_unattributed_changes: true`.
- Admin da org pode sempre bypassar (`bypass_mode: always`) — em `main-protection` o bypass só vale via pull request.

## `Code Quality Copilot`

- Aplica em qualquer branch não-default: exige Copilot code review em todo push, inclusive em PRs draft.

## Estado atual conhecido (pode mudar — reconferir antes de assumir)

- `api-core`, `web-app`: os 3 rulesets ativos (`main-protection`, `qa-protection`, `Code Quality Copilot`).
- `infra-platform`: **só `Code Quality Copilot` ativo hoje** — `main-protection` foi removido pelo usuário (ver incidente abaixo) e ainda não foi recriado.

Para checar o estado de um repo específico: `gh api repos/Solierrr/<repo>/rulesets`.

## Incidente: commit com atribuição de IA {#incidente-commit-com-atribuição-de-ia}

Em `infra-platform`, um commit (`extract-env.ps1`, PR #45) foi mergeado com trailer `Co-authored-by: Claude Sonnet 5`. O usuário pediu para removê-lo do histórico:

1. Tentativa de `reset --hard` + `force-push` em `main` foi **bloqueada pelo ruleset** (`main-protection` ativo na época, bloqueando `non_fast_forward`).
2. Tentativa alternativa (PR de revert) foi rejeitada pelo usuário — não queria nenhum rastro do commit, nem um revert visível no histórico.
3. O usuário **removeu manualmente o ruleset** no GitHub e pediu para refazer o force-push — dessa vez funcionou, e o commit sumiu completamente do histórico remoto.

**Lição aplicada em todas as sessões desde então:** nunca incluir atribuição de IA em nenhum commit/PR, para não gerar esse tipo de situação (ver [padrao-de-codigo.md](padrao-de-codigo.md#2-nunca-subir-nada-com-marca-de-ia) e [orientacoes.md](orientacoes.md)). O usuário foi enfático: não quer nenhuma marca do assistente nos repositórios.
