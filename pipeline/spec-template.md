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
> Perguntas/decisões que ainda não têm resposta — usar [[when-to-pause]] pra decidir se pausa ou segue.

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
