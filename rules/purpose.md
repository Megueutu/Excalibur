# Propósito do Excalibur

Excalibur é um repositório de apoio pra desenvolvimento com SDD (spec-driven development) — não é código de produto, é o lugar onde vive o *processo* de como implementar coisas em outros repos, mais o contexto específico de cada projeto trabalhado.

Ele existe pra resolver dois problemas:

1. **Manter o planejamento assistido por IA fora dos repos de produto.** Specs, entrevistas (grillme), análises e decisões de design não devem deixar rastro no histórico dos repos sendo trabalhados — ficam no destino de SDD que `bootstrap/` cria pra cada projeto (`.sdd/` embutido ou `<repo>-sdd/` separado), nunca aqui no Excalibur.
2. **Não reamarrar o processo a um harness só.** A metodologia (grillme → classificar → spec → checklist) é a mesma independente de rodar em Claude, Codex, Cursor ou outro agente — só a forma de disparar ela muda por harness.

## O que NÃO é

- Não é onde o código dos projetos vive — cada projeto continua no seu próprio repositório.
- Não é onde as specs em si vivem — isso fica no destino de SDD de cada projeto (ver `bootstrap/entrypoint.md`); aqui vive só o processo e o contexto compartilhado.
- Não é markdown puro — além da documentação do processo, tem `bootstrap/init.sh`, um script bash pequeno que materializa o destino de SDD de um projeto.
- Não é específico de uma organização — a estrutura precisa suportar qualquer projeto novo sem retrabalho. `projects/solaria/` é um resquício legado sendo descontinuado (ver "Legado" em [structure.md](structure.md)), não o caso normal.

Ver [structure.md](structure.md) pra como isso se traduz em pastas.
