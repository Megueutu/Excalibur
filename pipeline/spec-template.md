# Template — `projects/<project>/.contexto/specs/<repo>/<tarefa>/spec.md`

Copiar essa estrutura ao criar a spec de uma tarefa **Feature** ou **Big feature** (ver critério em [entrypoint.md](entrypoint.md)). Não preencher seções que não se aplicam — não é formulário obrigatório campo a campo, é estrutura de referência.

```markdown
# <nome curto da tarefa>

## Contexto
O que motivou isso, o que existe hoje, o que está sendo pedido — resumo do que saiu da entrevista (grillme).

## Decisões já fechadas
Lista do que foi confirmado com o usuário e não precisa ser reaberto.

## Em aberto
Perguntas/decisões que ainda não têm resposta — usar [reflection.md](reflection.md) pra decidir se pausa ou segue.

## Roadmap
1. Passo 1 — o que, onde (arquivo/módulo), critério de "pronto".
2. Passo 2 — ...

(Big feature: agrupar passos em fases, cada fase com seu próprio checklist de "pronto".)

## Checklist de análise geral
- [ ] Reuso checado antes de criar código novo (padrao-de-codigo.md)
- [ ] Escopo mínimo — nada implementado além do pedido
- [ ] Regras de commit/PR aplicáveis identificadas (commits.md / pr.md)
- [ ] Repo é "core"? Se sim, mudança mínima confirmada (repos.md)
- [ ] Nenhum comentário de código sem pedido explícito
```
