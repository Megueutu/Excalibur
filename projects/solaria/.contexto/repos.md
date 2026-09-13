# Repos da org (GitHub: `Solierrr`)

Projeto estudantil ("Solaria" / plataforma de energia solar). Confirmar detalhes que aqui estão marcados como `(a confirmar)` com o usuário antes de assumir como verdade definitiva.

## Repos "core" — cuidado extra, mudanças mínimas

Nestes, reduzir ao máximo o número de alterações e **nunca implementar o que não foi pedido** (ver [padrao-de-codigo.md](padrao-de-codigo.md)):

- `api-auth` — API de autenticação (Java/Spring). Gera/valida JWT (keystore `.p12` via `JWT_KEYSTORE_BASE64`).
- `api-core` — API principal do domínio (Java/Spring). **Chamada só internamente** — nunca é exposto via Ingress/Kong (diferente de `api-auth`, `api-messenger`, `api-recommendation`, `ai-assistant`, `ai-validation`, que têm Ingress próprio).
- `web-app` — frontend (React + Vite + Tailwind). Ver [frontend-orientacoes.md](frontend-orientacoes.md) para o padrão de código. SPA estática — `VITE_*` são embutidas no bundle em build-time (CI), não há `kubernetes_secret` pra ele.
- `infra-platform` — Terraform que sobe toda a infra GCP (ver [infra.md](infra.md)). Blast radius real (custo de nuvem) — qualquer mudança aqui deve ser cautelosa e nunca rodar `terraform apply`/`destroy` direto (usar `scripts/toggle-nodes.ps1`).
- `ai-assistant` — serviço de agentes de IA (Python). Consome `mcp-database` via protocolo MCP para consultar dados de fornecedores/ofertas/técnicos.

## Repos proibidos — nunca mexer

Qualquer repo com prefixo **`elos-`** (ex.: `elos-backend`) é de outro projeto/escopo (aparenta ser `solaria-interdisciplinar`, disciplina acadêmica separada) e está **fora do escopo desta organização de trabalho** — não tocar, não ler para "aproveitar padrão", não referenciar.

## Inventário completo

| Repo | Stack / propósito | Branch de deploy QA | Observações |
|---|---|---|---|
| `api-auth` | Java/Spring — autenticação/JWT | `qa` | core |
| `api-core` | Java/Spring — domínio principal | `qa` | core; nunca exposto via Kong |
| `api-messenger` | Java/Spring — mensageria (Mongo) | `qa` | |
| `api-recommendation` | Java/Spring — recomendação | `qa` | Swagger condicional a `DOCS_ENABLED`, desligado em prod |
| `mcp-database` (ex-`api-mcp`) | Python — servidor MCP, consulta Postgres "Negócio" (fornecedores/ofertas/técnicos) para o `ai-assistant` | `qa` | não é dono do schema, só consulta; cópia de referência em `docs/schema_negocio.sql` |
| `mcp-billscanner` (ex-`ai-billscanner`) | Python (planejado) — OCR/IA de faturas de energia | `qa` (a confirmar) | ainda não implementado, só README+LICENSE |
| `ai-assistant` | Python — agentes de IA | `qa` | core |
| `ai-validation` | Python/FastAPI | `qa` | Swagger default do FastAPI |
| `ai-accessibility` | Python (a confirmar propósito exato) | `qa` | |
| `web-app` | React/Vite/Tailwind — frontend | `qa` | core; ver [frontend-orientacoes.md](frontend-orientacoes.md) |
| `web-sandbox` | Frontend — sandbox pra testar ferramentas/agentes do `ai-assistant` com interface própria, com diferenciação qa/prod | (a confirmar) | ainda vazio, nada implementado |
| `bff-sandbox` | BFF que serve especificamente o `web-sandbox` | (a confirmar) | ainda vazio, nada implementado |
| `desing-system` | Design system / tokens visuais compartilhados (futuro) | — | ainda vazio, nada implementado |
| `database-console` | Python/SQL — console central de banco (schema real + scripts de seed/runner) | (a confirmar) | tem conteúdo real, não é placeholder |
| `database-rpa` | RPA envolvendo banco de dados (a confirmar detalhes) | `main` | |
| `databricks-analytics` | Databricks — analytics (a confirmar detalhes) | `main` | |
| `databricks-sync` | Python — sincroniza Postgres (`core`+`auth`) → Databricks a cada 4h via GitHub Actions | `main` | ver [cronjobs.md](cronjobs.md) |
| `google-registry` | Integrações/registro de serviços Google (a confirmar detalhes) | `main` | |
| `docs-warehouse` | Repo central de documentação/templates/rulesets da org | `main` | ver estrutura em `github/rulesets`, `github/templates`, `github/workflow`; docs de arquitetura em `architecture/` |
| `infra-platform` | Terraform — GKE, VPC, Kong, cert-manager, Infisical | `main` | core; ver [infra.md](infra.md) |
| `infra-gitops` | Manifests k8s + ArgoCD (GitOps) | `main` | Ingress dos serviços expostos via Kong |
| `infra-gateway` | Gateway de infra (a confirmar detalhes exatos) | `main` | |
| `infra-otel-collector` | Coletor OpenTelemetry (observabilidade) | `main` | logger de `web-app`/serviços tem pendência de migrar pro padrão OTEL |
| `infra-keepalive` (privado) | Serviço de keepalive para os serviços no Render (evita cold-start/sleep do free tier) | (a confirmar) | ainda vazio, nada implementado |
| `mobile-app` | Kotlin/Jetpack Compose — app mobile Android | `main` | |
| `generic-template` | Template-base usado para criar novos repos da org (explica os arquivos `.editorconfig`/`.gitattributes` idênticos nos repos ainda vazios) | — | não é um serviço, é o molde |
| `.github` | Repo especial da org — community health files (`CODE_OF_CONDUCT.md`, etc.) | — | |

## Branch `qa` vs `main`

- Repos **com** branch `qa` (deploy de QA no Render): mergear sempre para `qa`, nunca direto para `main`.
- Repos **sem** branch `qa` (sem deploy de QA — geralmente infra, dados/analytics, ou repos ainda sem ambiente de QA): mergear direto para `main`. Confirmados nessa categoria: `mobile-app`, `databricks-sync`, `google-registry`, `infra-platform`, `infra-gitops`, `infra-otel-collector`, `database-rpa`, `databricks-analytics`, `docs-warehouse`.
- Na dúvida sobre um repo específico, checar se a branch `qa` existe antes de abrir PR (`git ls-remote --heads origin qa` ou `gh api repos/Solierrr/<repo>/branches/qa`).
