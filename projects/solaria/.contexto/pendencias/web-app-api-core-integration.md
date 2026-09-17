# Pendências abertas na integração web-app ↔ api-core (2026-09-16)

Levantadas durante a spec [api-core-integration](../specs/web-app/api-core-integration/spec.md). Nenhuma delas bloqueia a integração inicial (auth + companies) — ficam registradas aqui pra não se perder.

## Rename "persistence" → "core" no backend

Só o env var do front (`VITE_API_PERSISTENCE` → `VITE_API_CORE`) entrou no escopo da integração inicial. Falta, se/quando o usuário quiser:

- `api-core`: artifactId/name Maven (`pom.xml`), pacote Java `com.solaria.persistence` (dezenas de arquivos: controllers, config, dto, service), classes `PersistenceApplication`/`PersistenceApplicationTests`, `sonar-project.properties` (`Solierrr_api-persistence`), `ARCHITECTURE.md`, `README.md`.
- `api-auth`: classes `PersistenceServiceTokenClient`/`PersistenceUserClient` (pacote `integration/persistence/`), env vars `PERSISTENCE_BASE_URL`/`SERVICE_CLIENT_SECRET`, menções em `ARCHITECTURE.md`/`README.md`/`RUNNING.md`.
- `infra-gitops`: `services/api-auth/deployment.yaml` (env var `PERSISTENCE_BASE_URL` + comentário referenciando `app.integration.persistence.base-url`).

Nota: no `api-core`, esse rename **já foi feito na branch `main`** (commit `8a20e41`, "chore: rename artifact and app name from persistence to core (#40)"), mas **ainda não chegou na `qa`** (branch de deploy) — checar se/quando isso é promovido antes de assumir que já está resolvido.

## Rename da chave no Infisical

`VITE_API_PERSISTENCE` continua sendo o nome da chave na pasta `/vite` do projeto `web-app` no Infisical (QA confirmado, `infisical export --env=qa --path=/vite`). O código do front vai passar a ler `VITE_API_CORE` — alguém precisa adicionar/renomear essa chave no Infisical (ambientes `local`/`qa`/`prod`) pra não quebrar o build. Infra compartilhada — não mexido nesta tarefa sem o usuário decidir quando.

## Endpoints ausentes no api-core

- **`solar-panel`/`solar-panel-models`**: o front (`web-app/src/features/solar-panel/solarPanel.service.ts`) espera `/solar-panels` (com busca por slug) e `/solar-panel-models` (CRUD). Nada disso existe no `api-core` — os recursos mais próximos são `/api/models` e `/api/offers`, com formato provavelmente diferente. Decidir: mapear pra esses recursos genéricos (remodelando DTOs) ou criar endpoints novos dedicados no backend.
- **`professionals`**: o front trata como um recurso único; o backend divide em `/api/technicians`, `/api/professions`, `/api/professional-registrations`, `/api/professional-reviews`. Decidir o mapeamento antes de integrar essa feature.
- **Busca por slug**: nenhum resource do `api-core` tem endpoint de busca por slug (só `id`, e `cnpj` no caso de companies). Pior do que parecia: nem dá pra contornar buscando a lista e filtrando no cliente, porque o `CompanyResponseDTO` realmente usado por `CompanyController` (`com.solaria.persistence.dto.response.CompanyResponseDTO`) **não devolve o campo `slug`** — só existe uma versão com `slug` num worktree de agente antigo (`.claude/worktrees/`), não na fonte real. `company.service.ts.getCompanyBySlug()` ficou apontando pro endpoint antigo (`/companies/slug/{slug}`, que não existe) — precisa de endpoint dedicado no backend (ou incluir `slug` no DTO existente) antes de dar pra integrar essa busca de verdade.

## CORS do api-auth só cobre localhost

O fix de CORS em `api-auth` (`SecurityConfig.kt`) replicou exatamente o padrão já usado em `api-core`: `app.cors.allowed-origins=http://localhost:3000,http://localhost:5173`, hardcoded direto no `application.properties`, sem variável de ambiente por deploy. Ou seja, o front rodando em QA/prod (fora de localhost) ainda não consegue chamar `api-auth` de verdade — falta saber a origem real do `web-app` publicado (ex: `web.solaria.com` ou domínio de preview) pra adicionar à lista, tanto em `api-auth` quanto em `api-core` (que já tem essa mesma limitação, não é coisa nova desta tarefa).

## Docs do api-core

`api-core/RUNNING.md` documenta `infisical run --env=dev ...`, mas o Infisical só tem os ambientes `local`/`qa`/`prod` (confirmado em `infra-platform/scripts/extract-env.ps1`, `ValidateSet("local", "qa", "prod")`) — `dev` não existe e o comando do jeito que está documentado falharia. Não corrigido aqui por ser doc de um repo "core" fora do escopo desta tarefa.
