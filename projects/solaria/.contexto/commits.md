# Commits

- Atômicos e bem distribuídos — nunca agrupar múltiplas mudanças não relacionadas em um único commit, nem fazer commits redundantes.
- Cada commit representa uma unidade lógica de mudança (ex: uma feature, um fix, uma tarefa de CI).
- Padrão obrigatório da mensagem: `{pattern}: {message}`
  - ✅ Correto: `feat: implementing user auth flow`, `fix: solving null pointer on login`, `ci: push for staging deploy`
  - ❌ Incorreto: `feat(main): implementando...`, `feature implementando...`, `Fix: Solving...`
- Sem escopo entre parênteses (`feat(x):` não é permitido).
- Mensagens sempre em inglês, sempre em full lowercase (inclusive o pattern e a primeira palavra da mensagem).
- Nunca incluir identidade de IA nos commits — nem como `author`, nem como `Co-Authored-By`, nem em qualquer trailer. O commit deve refletir exclusivamente a identidade do usuário configurada no git local. Regra absoluta — ver o incidente em [rulesets.md](rulesets.md#incidente-commit-com-atribuição-de-ia).
