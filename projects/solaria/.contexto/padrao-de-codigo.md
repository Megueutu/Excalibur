# Padrão de Código — Geral (todos os repos)

Este arquivo é o padrão geral, independente de stack. Para regras específicas de frontend (React/Vite), ver [frontend-orientacoes.md](frontend-orientacoes.md). Para regras de Git/GitHub, ver [orientacoes.md](orientacoes.md).

## 1. Princípio central: mínimo retrabalho

- Antes de implementar qualquer coisa, entender o que já existe no repo (arquivos, funções, componentes, services) e reaproveitar — nunca recriar algo que já resolve o problema.
- Evitar criar código novo quando dá para usar o que já existe (lib já instalada, util já escrito, endpoint já exposto, componente já pronto).
- Não introduzir abstrações, camadas ou "generalizações" que não foram pedidas — resolver exatamente o problema pedido, do jeito mais direto possível.
- Seguir o padrão de código já existente no projeto (nomenclatura, estrutura de pastas, estilo de formatação) em vez de impor um estilo próprio.
- Mudanças cirúrgicas: alterar só o necessário para a tarefa. Isso vale para qualquer repo, mas é regra dura nos repos "core" (ver [repos.md](repos.md)) — nesses, zero implementação além do que foi pedido.

## 2. Nunca subir nada com marca de IA

- Nenhum commit, PR, comentário de código ou arquivo deve conter atribuição de IA — sem `Co-Authored-By: Claude` (ou qualquer variação), sem menção a "Claude", "Anthropic", "AI-generated" em mensagens de commit, corpo de PR ou comentários.
- O autor do commit é sempre a identidade git configurada localmente pelo usuário. Nunca a identidade do assistente.
- Isso não é só estilo: os rulesets de `main`/`qa` de vários repos têm `require_extra_approval_for_unattributed_changes` ativo — um commit atribuído a IA/bot pode disparar aprovação extra ou ficar bloqueado (ver [rulesets.md](rulesets.md)).
- Nunca commitar artefatos de desenvolvimento assistido por IA (`.claude`, `.sdd`, `docs/specs`, `specs`) — ver detalhes em [orientacoes.md](orientacoes.md).

## 3. Escopo de ação

- Nunca mergear para `main` automaticamente. Por padrão: só subir a branch. Abrir PR e/ou mergear apenas se o usuário pedir explicitamente.
- Perguntar antes de agir quando o escopo for ambíguo — principalmente em infraestrutura com custo real (GCP) ou em repos que exigem cuidado extra.
- Nunca mexer em repositórios com prefixo `elos-` (ex.: `elos-backend`) — não fazem parte do escopo desta organização/contexto.
- Ler [orientacoes.md](orientacoes.md) (e o `CONTRIBUTING.md` do repo, se existir) antes de tocar em qualquer repo pela primeira vez numa sessão.
