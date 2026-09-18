# Git — convenções do Excalibur

Regras de commit pro próprio repositório Excalibur (não confundir com as regras de git que o Excalibur *gera* pra outros projetos via `bootstrap/presets/github/` — essas são independentes e específicas de cada projeto).

## Mensagens de commit

- Padrão obrigatório: `{pattern}: {message}`
  - Correto: `feat: add bootstrap wizard entrypoint`, `fix: correct broken link in structure.md`, `docs: update rules for obsidian specs`
  - Incorreto: `feat(bootstrap): add wizard`, `Feature: add wizard`, `Fix: correct link`
- Sem escopo entre parênteses.
- Sempre em inglês, sempre em lowercase completo (inclusive o pattern e a primeira palavra da mensagem).
- Atômicos: um commit por unidade lógica de mudança — nunca agrupar mudanças não relacionadas, nunca commit redundante.

## Atribuição de IA

Diferente dos projetos que o Excalibur ajuda a criar SDDs (onde a regra costuma ser nunca incluir atribuição de IA — ver preset de GitHub escolhido em cada projeto), commits **no próprio Excalibur podem levar atribuição de IA normalmente** (`Co-Authored-By`, etc.) — é um repo de tooling/apoio, não um repo de produto sujeito a ruleset de organização.

## Escopo de ação

- Só commitar — nunca dar push, abrir PR ou mergear sem pedido explícito do usuário.
- Perguntar antes de agir quando o escopo de uma mudança for ambíguo.
