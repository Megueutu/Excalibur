# Adicionando um harness novo

Hoje só [`harnesses/claude/`](../harnesses/claude/) existe e está funcional. Codex e Cursor ainda não têm adapter — este arquivo documenta como construir um quando for a hora, sem ter sido testado ainda em nenhum dos dois.

## Regra geral do adapter

Um adapter de harness **nunca** contém metodologia — só:
1. Quando disparar (o gatilho nativo daquele harness).
2. Um ponteiro pra `core/pipeline/entrypoint.md` e pro `.contexto/orientacoes.md` do projeto em questão.

Se o adapter começar a explicar o processo em vez de apontar pra ele, ele cresceu demais — mover o conteúdo de volta pra `core/pipeline/` se for genérico, ou pra `projects/<project>/.contexto/` se for específico.

Usar [`harnesses/claude/skills/sdd/SKILL.md`](../harnesses/claude/skills/sdd/SKILL.md) como referência de tamanho/formato ao construir os próximos.

## Codex

- Formato nativo: `AGENTS.md` na raiz do repo sendo trabalhado (Codex lê hierarquicamente).
- Como o Excalibur não é o repo sendo trabalhado, o `AGENTS.md` do adapter (`harnesses/codex/AGENTS.md`) serve de modelo a copiar/referenciar no repo do projeto real, ou a colar no `AGENTS.md` desse repo — decidir a mecânica exata (cópia manual vs. referência) quando for implementar, não assumir agora.
- Conteúdo: mesmo gatilho e mesmos ponteiros do adapter Claude, adaptados pro formato de instrução direta que o Codex espera (sem frontmatter de skill).

## Cursor

- Formato nativo: `.cursor/rules/*.mdc` com frontmatter (`description`, `globs`, `alwaysApply`).
- `harnesses/cursor/rules/sdd.mdc` — mesmo gatilho/ponteiros, frontmatter no formato `.mdc`.
- Cursor Rules não tem um equivalente direto a "Skill tool" com invocação sob demanda — checar se `alwaysApply: true` ou um gatilho por glob é a melhor aproximação antes de finalizar.

## Ao terminar um adapter novo

Atualizar este arquivo removendo a ressalva de "não testado" e apontando pro adapter como referência, do jeito que `harnesses/claude/` já é hoje.
