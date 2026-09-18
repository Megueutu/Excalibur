# Adicionando um projeto novo

1. Criar `projects/<nome-do-projeto>/.contexto/`.
2. Escrever um `orientacoes.md` que indexa o que precisa ser lido antes de tocar em qualquer repo desse projeto — seguir o formato de [`projects/solaria/.contexto/orientacoes.md`](../projects/solaria/.contexto/orientacoes.md) como referência, mas o conteúdo é específico do projeto novo (não copiar as regras da Solaria).
3. Adicionar só o que for realmente específico desse projeto/org: convenções de git/commit/PR, inventário de repos, infra, secrets, padrão de código — o que for genérico o suficiente pra valer em qualquer projeto já está em [`core/pipeline/`](../core/pipeline/) e não precisa ser reescrito.
4. Criar `projects/<nome-do-projeto>/.contexto/specs/` vazio (ou com um `README.md` explicando a convenção) — é onde as specs de tarefas desse projeto vão viver, seguindo [`core/pipeline/spec-template.md`](../core/pipeline/spec-template.md).
5. Não referenciar `core/pipeline/` por um caminho hardcoded que assuma a posição de `projects/solaria/` — usar caminho relativo à raiz do Excalibur (`../../../core/pipeline/...` a partir de `.contexto/`) do jeito que `projects/solaria/.contexto/orientacoes.md` já faz.

Não é necessário duplicar nenhum arquivo de `core/pipeline/` — todo projeto novo aponta pro mesmo conteúdo compartilhado.
