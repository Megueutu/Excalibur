# .contexto

Pasta local (não versionada, não é um repositório git) com o contexto de trabalho da org `Solierrr`. Não tem relação com o "repositório pro Render" (esse é o `infra-keepalive`, ver [repos.md](repos.md)).

O gatilho automático desse sistema é o adapter SDD do harness em uso, em [`harnesses/`](../../../harnesses/) (ex.: Claude usa [`harnesses/claude/skills/sdd/SKILL.md`](../../../harnesses/claude/skills/sdd/SKILL.md)) — dispara antes de qualquer implementação. Ler [orientacoes.md](orientacoes.md) primeiro; ele indexa o resto.

## Sempre lidos
- [orientacoes.md](orientacoes.md) — índice do que ler antes de tocar em qualquer repo.
- [observacoes.md](observacoes.md) — trabalho em múltiplas máquinas, sincronizar antes de começar.
- [git.md](git.md) — branches, push/PR/merge, bypass de proteção, o que nunca vai pro remoto.
- [commits.md](commits.md) — formato de mensagem de commit.
- [pr.md](pr.md) — título/corpo de PR, não duplicar PR pra mesma tarefa.
- [padrao-de-codigo.md](padrao-de-codigo.md) — padrão de código geral (mínimo retrabalho, reuso, nunca subir marca de IA).
- [frontend-orientacoes.md](frontend-orientacoes.md) — padrão de código específico do `web-app` (React/Vite/Tailwind).

## Pipeline de implementação (SDD)
- [prompt-inicial.md](prompt-inicial.md) — prompt pra abrir uma sessão nova e acionar a pipeline.
- [core/pipeline/entrypoint.md](../../../core/pipeline/entrypoint.md) — grillme, classificação fix/feature/big feature, onde ficam spec e análise. Compartilhado entre todos os projetos e harnesses.
- [core/pipeline/reflection.md](../../../core/pipeline/reflection.md) — quando parar e perguntar em vez de decidir sozinho.
- [core/pipeline/review-checklist.md](../../../core/pipeline/review-checklist.md) — checklist final antes de considerar a tarefa concluída.
- [core/pipeline/spec-template.md](../../../core/pipeline/spec-template.md) — template usado em `specs/<repo>/<tarefa>/spec.md`.
- [specs/](specs/) — specs de tarefas em andamento/concluídas, uma pasta por repo/tarefa. Nunca refletido no repositório sendo trabalhado.

## Contexto da org
- [repos.md](repos.md) — inventário de todos os repos, repos "core" (cuidado extra), repos proibidos (`elos-*`), branch `qa` vs `main`.
- [infra.md](infra.md) — GCP/GKE/Terraform/ArgoCD/Kong, filosofia de infra efêmera, Render/keepalive.
- [secrets.md](secrets.md) — Infisical: estrutura de pastas, como Terraform/GitHub Actions consomem.
- [rulesets.md](rulesets.md) — proteção de branch por repo, incidente de commit com atribuição de IA.
- [cronjobs.md](cronjobs.md) — jobs agendados via GitHub Actions.

Vários pontos aqui estão marcados `(a confirmar)` — foram inferidos de sessões anteriores ou da API do GitHub, não confirmados diretamente pelo usuário. Preencher/corrigir conforme surgir contexto novo.
