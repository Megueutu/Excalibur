# specs/

Uma pasta por repo, uma subpasta por tarefa: `specs/<repo>/<slug-da-tarefa>/spec.md` (template em [pipeline/spec-template.md](../../../../pipeline/spec-template.md)). Só existe para tarefas classificadas como **Feature** ou **Big feature** (ver [pipeline/entrypoint.md](../../../../pipeline/entrypoint.md)) — **Fix** não gera spec.

Nunca refletir isso dentro do repositório sendo trabalhado (nem em `<repo>/.sdd/`, nem em `<repo>/.claude/`) — o objetivo desse diretório inteiro é manter planejamento/spec fora do histórico versionado de qualquer repo da org.
