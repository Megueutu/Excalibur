# Propósito do Excalibur

Excalibur é um repositório de apoio pra desenvolvimento com SDD (spec-driven development) — não é código de produto, é o lugar onde vive o *processo* de como implementar coisas em outros repos, mais o contexto específico de cada projeto trabalhado.

Ele existe pra resolver dois problemas:

1. **Manter o planejamento assistido por IA fora dos repos de produto.** Specs, entrevistas (grillme), análises e decisões de design não devem deixar rastro no histórico dos repos sendo trabalhados — ficam aqui.
2. **Não reamarrar o processo a um harness só.** A metodologia (grillme → classificar → spec → checklist) é a mesma independente de rodar em Claude, Codex, Cursor ou outro agente — só a forma de disparar ela muda por harness.

## O que NÃO é

- Não é onde o código dos projetos vive — cada projeto continua no seu próprio repositório.
- Não é uma ferramenta ou script — é markdown puro, lido por agentes de IA.
- Não é específico de uma organização — hoje só tem o projeto `solaria` (org Solierrr), mas a estrutura precisa suportar qualquer projeto novo sem retrabalho.

Ver [structure.md](structure.md) pra como isso se traduz em pastas.
