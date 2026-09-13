# Pull Requests

## Título
- Segue o padrão de commit (`tipo: descrição`), mas descrevendo a PR como um todo, não o último commit.
- Descrição do título 100% em inglês, minúsculo — igual regra de commit em [commits.md](commits.md).
- ✅ `feat: add keepalive workflow for render services`
- ❌ `Feat: Add Keepalive Workflow`, `feat(infra): add keepalive...`

## Corpo
- Em português, preenchido com o template do repositório (quando existir).
- **Sem `**negrito**`** — nada de markdown bold no corpo da PR. Escrever como texto corrido/tópicos simples, não como um relatório com seções em negrito — isso é o que mais entrega uma PR escrita por IA.
- Sem menção a IA/assistente em nenhuma parte (título, corpo, ou commits que a compõem) — ver [padrao-de-codigo.md](padrao-de-codigo.md#2-nunca-subir-nada-com-marca-de-ia).

## Não abrir PR duplicada pra mesma tarefa

Antes de abrir uma PR, checar se já existe uma aberta pra mesma branch/tarefa (`gh pr list --head <branch>`). Se existir, continuar empurrando commits pra branch existente — a PR se atualiza sozinha. Só abrir uma PR nova quando for, de fato, uma tarefa/branch diferente.

## Quando abrir PR / mergear

Por padrão, não abrir PR nem mergear sozinho — ver [git.md](git.md#escopo-de-pushprmerge). Só fazer isso se o usuário pedir explicitamente para aquela tarefa.
