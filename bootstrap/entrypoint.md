# Bootstrap — criando o SDD de um projeto novo

Roda uma única vez por projeto, antes de qualquer tarefa de implementação (`pipeline/entrypoint.md`) poder começar. Disparado pelo adapter do harness (ver `harnesses/<harness>/`) quando ele não encontra um destino de SDD já configurado pro projeto (ver "Detecção" abaixo).

## 1. Perguntar: adaptar projeto existente ou começar do zero?

- **Adaptar existente**: o projeto já tem código, possivelmente já tem alguma documentação/processo — vamos ler o que existe (`README.md`, `CONTRIBUTING.md`, etc.) antes de propor a estrutura, em vez de simplesmente sobrescrever.
- **Do zero**: projeto novo ou sem processo definido ainda — ir direto pra pergunta 2.

## 2. Perguntar: onde materializar o SDD?

| Opção | Onde fica | Quando faz sentido |
|---|---|---|
| **Embutido** | `.sdd/` na raiz do próprio repo do projeto | Time já ok com rastro de planejamento assistido por IA versionado junto do código. |
| **Separado** | Repo irmão `<nome-do-repo>-sdd`, fora do repo do projeto | Quer manter o histórico do repo de produto livre de artefatos de IA (ver o princípio em `padrao-de-codigo.md`, quando existir pro projeto). |

## 3. Preset de GitHub

Perguntar como lidar com git/GitHub nesse projeto:
- **Opção A** — [`presets/github/conservador.md`](presets/github/conservador.md): nunca mergear sozinho, sempre PR.
- **Opção B** — [`presets/github/direto.md`](presets/github/direto.md): push direto na branch, PR só se pedido.
- **Opção C — Especificar**: usuário descreve as regras em texto livre; o texto vira `git.md` no destino, no lugar de um preset.

## 4. Rodar o script

Com as três respostas em mãos, chamar:

```bash
bootstrap/init.sh <embedded|separate> <target-path> [project-name]
```

Isso cria a estrutura de destino (specs/, Templates/, reflection/, o preset de GitHub escolhido copiado como `git.md`) — ver contrato completo do script no plano de implementação ou no cabeçalho de `init.sh`.

## 5. Depois de rodar

Seguir direto pra [`pipeline/entrypoint.md`](../pipeline/entrypoint.md) com a primeira tarefa real do projeto — o bootstrap só prepara o destino, não implementa nada.

## Detecção (pros harness adapters)

Antes de disparar este wizard, checar se o projeto já tem destino de SDD:
1. Existe `.sdd/` na raiz do repo do projeto? → já bootstrapado, modo embutido.
2. Existe `../<nome-do-repo>-sdd/` (pasta irmã do repo)? → já bootstrapado, modo separado.
3. Nenhum dos dois → disparar este wizard.
