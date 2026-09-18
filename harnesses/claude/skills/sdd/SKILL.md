---
name: sdd
description: Use before implementing, fixing, or changing anything in any project tracked by this Excalibur SDD setup — before writing code, opening a branch, or touching files as part of a task. Not for read-only questions, explanations, or exploring code with no change intended. Runs the grillme interview, classifies the task (fix/feature/big feature), and decides whether a spec is needed — keeping all planning out of the repo being worked on.
---

# SDD (Claude adapter)

Este arquivo é o adapter Claude do processo SDD deste Excalibur. Ele não contém a metodologia em si — só o suficiente pra disparar no momento certo e apontar pro conteúdo compartilhado.

## Quando disparar

Sempre que o pedido for implementar, corrigir ou mudar algo em algum repo/projeto — não para perguntas simples, leitura de código, ou dúvidas conceituais.

## O que fazer

1. Identificar o repo do projeto sendo trabalhado. Checar se ele já tem um destino de SDD (ver "Detecção" em [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md#detecção-pros-harness-adapters)):
   - Sem destino ainda → seguir [`bootstrap/entrypoint.md`](../../../../bootstrap/entrypoint.md) primeiro. Não pular pra implementação antes disso.
   - Já tem destino → seguir direto pro passo 2.
2. Ler, nesta ordem:
   - [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) — processo completo (grillme, classificação, onde ficam spec/análise).
   - [`reflection/reasoning-chain.md`](../../../../reflection/reasoning-chain.md) — cadeia de raciocínio a seguir ao escrever a spec.
   - `orientacoes.md` (ou equivalente, se existir) dentro do destino de SDD do projeto (`.sdd/` embutido ou `<repo>-sdd/` separado).
3. Seguir o processo descrito em [`pipeline/entrypoint.md`](../../../../pipeline/entrypoint.md) estritamente, incluindo parar pra pedir `/grill-me` antes de qualquer exploração de código.

## Referências

- Metodologia (compartilhada, não editar aqui): [`pipeline/`](../../../../pipeline/) e [`reflection/`](../../../../reflection/)
- Onboarding de projeto novo: [`bootstrap/`](../../../../bootstrap/)
- Regras do projeto atual: dentro do destino de SDD dele (`.sdd/` ou `<repo>-sdd/`)
- Como este repo é organizado: [`rules/structure.md`](../../../../rules/structure.md)
