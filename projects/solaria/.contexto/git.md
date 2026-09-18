# Git — branches, push, merge, PR

> Regras de commit em [commits.md](commits.md). Regras de PR (título/corpo/duplicidade) em [pr.md](pr.md). Este arquivo cobre branches e o que sobe ou não pro remoto.

## Branches
- Sempre em inglês, lowercase, sem espaços ou caracteres especiais.
- Padrão: `tipo/descricao-curta` (ex: `feature/i18n`, `fix/solving-login-bug`, `ci/deploy-pipeline`).
- **Merge para `qa`** nos repos que têm branch `qa` (deploy no Render) — nunca diretamente para `main`.
- **Merge direto para `main`** nos repos que não têm branch `qa` — ver lista em [repos.md](repos.md#branch-qa-vs-main).

## Escopo de push/PR/merge
- Por padrão: **só subir a branch**. Não abrir PR, não mergear, a menos que o usuário peça explicitamente.
- Nunca fazer force-push numa branch protegida sem confirmação explícita do usuário — e nunca contornar a proteção do repositório (ex.: desabilitar ruleset) para conseguir forçar, sem que o próprio usuário peça.
- Não abrir uma PR nova a cada iteração da mesma tarefa — ver [pr.md](pr.md#não-abrir-pr-duplicada-pra-mesma-tarefa).

## Bypass de proteção (main/qa) — informativo, não é padrão automático

Rulesets variam por repo (ver [rulesets.md](rulesets.md)) — checar sempre antes de assumir. Padrão observado em `api-core`/`web-app`:

- **`main`**: bypass de admin é `pull_request` — mesmo como admin, **ainda é obrigatório abrir PR**; o bypass só libera a exigência de aprovação/review, não a exigência de PR em si.
- **`qa`**: bypass de admin é `always` — nesse caso dá pra dar push direto sem PR.
- **`infra-platform`** hoje não tem `main-protection` nenhum (removido no incidente documentado em [rulesets.md](rulesets.md#incidente-commit-com-atribuição-de-ia)) — push direto na `main` já é possível lá sem precisar de bypass.

Isso é informação, não um comportamento padrão: usar bypass pra pular PR em `main`/`qa` só quando o usuário pedir explicitamente para aquele repo/tarefa (ex.: chore repetitivo em vários repos) — não assumir por conta própria.

## Arquivos que nunca vão para o remoto
Nunca commitar ou dar push em arquivos relacionados ao desenvolvimento assistido por IA:
- `.sdd`
- `.claude`
- `docs/specs`
- `specs`

Garantir que esses caminhos estejam sempre no `.gitignore` do projeto. Specs/planos de tarefas deste próprio sistema de SDD vivem em `.contexto/specs/` (fora de qualquer repo, nunca versionados) — ver [pipeline/entrypoint.md](../../../pipeline/entrypoint.md).
