# Cadeia de raciocínio padrão — produção de specs

Sequência que o agente segue ao produzir qualquer `spec.md` (tarefas **Feature** ou **Big feature**, ver [pipeline/entrypoint.md](../pipeline/entrypoint.md)). É o padrão gerado pelo Excalibur — um projeto pode sobrescrever com sua própria versão (ver "Override por projeto" abaixo).

## As quatro etapas

1. **Contexto** — o que existe hoje, o que motivou o pedido, o que já foi confirmado com o usuário (grillme, se rodado). Sem isso escrito, não avançar pra próxima etapa.
2. **Hipóteses** — pelo menos duas formas plausíveis de resolver, mesmo que uma pareça óbvia. Anotar o trade-off de cada uma antes de escolher.
3. **Validação** — checar cada hipótese contra o que já existe no repo/projeto (reuso, padrão já estabelecido, ver [when-to-pause.md](when-to-pause.md) pra quando isso não está claro o suficiente pra decidir sozinho). Descartar hipóteses que exigem reinventar algo que já existe.
4. **Decisão** — escolher uma hipótese, registrar por quê as outras foram descartadas. Essa decisão vira a seção "Decisões já fechadas" da spec (ver [pipeline/spec-template.md](../pipeline/spec-template.md)).

## Override por projeto

Se o destino do SDD do projeto (embutido ou repo separado — ver [bootstrap/entrypoint.md](../bootstrap/entrypoint.md)) tiver um `reflection/reasoning-chain.md` próprio, ele prevalece sobre este. Se não tiver, este é o padrão usado.

## Quando não se aplica

Tarefas classificadas como **Fix** não passam por essa cadeia — só pelo processo padrão de `pipeline/entrypoint.md`. A cadeia é pra decisões de design (Feature/Big feature), não pra correções pontuais.
