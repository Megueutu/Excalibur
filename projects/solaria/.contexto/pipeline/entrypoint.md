# Entrypoint — o que fazer ao receber um pedido de implementação

Disparado pela skill `sdd` (`.claude/skills/sdd/SKILL.md`) sempre que o pedido é implementar/corrigir/mudar algo em algum repo — não para perguntas simples, leitura de código, ou dúvidas conceituais.

## 1. Grillme (entrevista) — parar e pedir, não tentar chamar sozinho

`grill-me` tem `disable-model-invocation: true` — **não pode ser chamado via Skill tool de jeito nenhum**, nem em tentativa alternativa. Não tentar `Skill({skill: "grill-me"})`, não tentar replicar a entrevista por conta própria fingindo que é o grill-me.

Passo obrigatório, antes de explorar o repo ou tocar em qualquer arquivo:

1. Parar e pedir explicitamente pro usuário rodar `/grill-me` com a tarefa.
2. Esperar a resposta — não seguir para exploração de código, leitura de repo, ou classificação (passo 2) enquanto isso não acontecer.
3. Só depois que o usuário confirmar que a entrevista terminou (ou disser explicitamente pra pular essa etapa) é que a pipeline continua.

Isso vale mesmo que a tarefa pareça simples o suficiente pra "só seguir" — a decisão de pular a entrevista é do usuário, não uma inferência de que "não precisa".

## 2. Classificar a tarefa

Perguntar (ou inferir com alta confiança e confirmar em uma frase) qual das três:

| Classe | Critério | O que muda no processo |
|---|---|---|
| **Fix** | Bug pontual, comportamento errado com correção óbvia, sem decisão de design em aberto | Sem spec formal. Só o checklist final (ver [review-checklist.md](review-checklist.md)) antes de considerar concluído. |
| **Feature** | Funcionalidade nova ou mudança de comportamento com escopo claro, mas com decisões de design reais (onde entra, como se integra, o que fica de fora) | Spec leve em `.contexto/specs/<repo>/<tarefa>/spec.md` (ver [spec-template.md](spec-template.md)) antes de codar. |
| **Big feature** | Toca múltiplos módulos/repos, tem sequenciamento (fases), ou risco real de retrabalho se a abordagem errada for escolhida | Spec completa com roadmap faseado + checklist de análise por fase. Considerar quebrar em specs por fase se ficar grande demais pra um arquivo só. |

Perguntar diretamente se não estiver claro qual classe — não adivinhar em caso de dúvida real (ver [reflection.md](reflection.md)).

## 3. Análise profunda — quando

Perguntar explicitamente se o usuário quer uma análise profunda antes de implementar (ex.: mapear todos os call sites, ler múltiplos repos relacionados, considerar efeitos colaterais em outros serviços) sempre que a tarefa for **Feature** ou **Big feature**. Em **Fix**, só fazer se o bug não tiver causa óbvia de cara.

## 4. Onde os arquivos vivem

- **Specs e análise da tarefa**: `.contexto/specs/<repo>/<slug-da-tarefa>/` — nunca dentro do repositório sendo trabalhado (mesmo que o repo tenha seu próprio `.sdd/`, como `web-app/.sdd/`). O objetivo é não deixar rastro de planejamento assistido por IA no histórico do repo — ver [git.md](git.md#arquivos-que-nunca-vão-para-o-remoto).
- **Definição do processo** (este pipeline): `.contexto/pipeline/`.
- **Regras sempre-lidas**: apontadas por [orientacoes.md](../orientacoes.md).

## 5. Depois de concluir a implementação

Rodar o [review-checklist.md](review-checklist.md) antes de anunciar a tarefa como pronta — isso vale pras três classes, só muda a profundidade.
