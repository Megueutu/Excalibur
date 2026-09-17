# Resumo — integração front↔backend + acesso público ao catálogo (2026-09-16/17)

Resumo de sessão pra retomar em outra máquina. Detalhe completo em [spec.md](spec.md), [endpoints-api-core.md](endpoints-api-core.md) e [pendências](../../../pendencias/web-app-api-core-integration.md).

## Pedido original

Integrar o front (`web-app`) com o backend (`api-core`) pra ele começar a receber dado de verdade, em vez de mock. Depois, um segundo pedido na mesma sessão: usuário deslogado precisa continuar acessando o feed/catálogo normalmente — só ações específicas (contato/mensagem) exigem login.

## Repos tocados — todos só com branch pushada, sem PR aberta e sem merge

| Repo | Branch | Base | Commits |
|---|---|---|---|
| `web-app` | `feature/api-core-integration` | `qa` | 5 |
| `api-auth` | `fix/cors-allowed-origins` | `qa` | 2 |
| `api-core` | `feature/public-catalog-endpoints` | `qa` | 2 |

## O que foi feito, por repo

### `web-app`
1. `chore: rename VITE_API_PERSISTENCE env var to VITE_API_CORE` — env var renomeada (só no front; o nome legado "persistence" no backend virou pendência separada).
2. `feat: point company service at api-core through a single /api base url` — criado `src/shared/http/apiCore.utils.ts` (`API_CORE_URL`), único ponto que monta a URL do `api-core`; `company.service.ts` ajustado pra usar `/api/...` (faltava esse prefixo, nenhuma chamada real batia antes).
3. `feat: attach stored jwt to api requests and handle empty responses` — `src/shared/auth/authToken.utils.ts` (sessão em `localStorage`) + `http.service.ts` passou a anexar `Authorization: Bearer <token>` automaticamente e a tratar respostas `204` (antes quebrava em qualquer endpoint sem corpo, ex.: logout).
4. `feat: implement real login, register, refresh and logout against api-auth` — `access.service.ts` reescrito do zero (antes era só um `throw new Error("Not implemented")`), chamando `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout` de verdade.
5. `feat: wire login and register pages to real auth flow` — `LoginPage.tsx`/`RegisterPage.tsx` chamam os services reais (antes não tinham `onSubmit` nenhum); `Access.tsx` ganhou um prop `error` pra exibir falha de login/cadastro; textos de erro/validação adicionados nos 3 idiomas (`pt-BR`/`en-US`/`es-ES`).

### `api-auth`
1. `fix: allow browser cors requests to the auth endpoints` — **`api-auth` não tinha CORS nenhum configurado**, em lugar nenhum do código. Sem isso, o navegador bloqueava qualquer chamada de login/registro em qualquer ambiente (não só localhost). Replicado o mesmo padrão que o `api-core` já usa (`app.cors.allowed-origins=http://localhost:3000,http://localhost:5173`, hardcoded — mesma limitação que o `api-core` já tinha, não é regressão).
2. `chore: remove unrequested comment from cors config` — ajuste depois da revisão (comentário que não tinha sido pedido).

### `api-core`
1. `feat: allow unauthenticated read access to public catalog endpoints` — `SecurityConfig.java` ganhou `permitAll()` pros GETs de `companies`, `offers`, `models`, `technicians`, `professions`. Antes, **todo** `/api/**` exigia JWT (`anyRequest().authenticated()`), sem nenhuma exceção de leitura.
2. `feat: bypass rbac endpoint check for the public catalog reads` — descoberta importante: existe uma **segunda camada de autorização**, totalmente separada do Spring Security, em `RbacAuthorizationService`/`EndpointAuthorizationInterceptor` (`com.solaria.persistence.security.rbac`). Ela roda depois do Spring Security liberar a request e nega qualquer usuário anônimo por padrão (só tinha uma lista fixa `BOOTSTRAP_ALWAYS_OPEN` com 2 endpoints). Sem mexer nela, os GETs continuavam voltando `403 UNAUTHORIZED_ACCESS` mesmo com o `permitAll()` da camada 1. Adicionei `PUBLIC_READ_ENDPOINTS` seguindo o mesmo padrão já existente no arquivo.

Validado localmente (as duas vezes) rodando os serviços de verdade com banco/redis/keystore reais de QA via Infisical — não só teste unitário. `mvn test` e `vitest` passando nos três repos sem regressão nas falhas pré-existentes (não relacionadas).

## Decisões que fechei com você durante a sessão

- Só leitura (GET) por enquanto; escrita fica pra depois.
- Auth virou pré-requisito técnico pra qualquer chamada real ao `api-core` (todo endpoint exige JWT) — por isso entrou no escopo mesmo não sendo o pedido original.
- `api-auth` e `api-core` são repos "core" — toda mudança neles foi perguntada antes de mexer (CORS, RBAC).
- Primeira feature integrada: `companies` (não `solar-panel`, que não tem endpoint nenhum no backend).
- Acesso direto front→`api-core` aceito (doc antigo dizia que `api-core` nunca era exposto via Kong — na real tem `ingress.yaml`, doc é que estava desatualizado, corrigido).
- JWT fica em `localStorage` (sem BFF, sem cookie httpOnly disponível).
- Endpoints públicos abertos pra todos os 5 recursos pedidos (`companies`, `offers`, `models`, `technicians`, `professions`), mesmo os que o front ainda não integrou — preparando o backend de uma vez.
- Gate de "precisa estar logado" pra contato/mensagem: **não implementado ainda**, fica pra depois (você escolheu adiar).

## Pendências (não bloqueiam, registradas em [pendencias/web-app-api-core-integration.md](../../../pendencias/web-app-api-core-integration.md))

- Endpoints de `solar-panel`/`solar-panel-models` não existem no `api-core`.
- `professionals` (tipo único no front) não bate com o backend (`technicians`/`professions`/`professional-registrations` separados).
- Busca por slug de `companies` impossível hoje — nem client-side, porque o DTO real não devolve `slug`.
- Rename completo "persistence"→"core" no backend (só o env var do front foi renomeado).
- Rename da chave `VITE_API_PERSISTENCE`→`VITE_API_CORE` dentro do Infisical (`/vite` do projeto `web-app`) — ainda não feito, infra compartilhada.
- CORS novo em `api-auth`/`api-core` só cobre `localhost` — falta o domínio real de QA/prod pra funcionar fora de dev local.
- Gate de login pra contato/mensagem no front — não implementado.
- `api-core/RUNNING.md` documenta `--env=dev`, que não existe (só `local`/`qa`/`prod`).

## Docs corrigidos (estavam desatualizados em relação à realidade do código/infra)

- `repos.md`/`infra.md` — `api-core` na real tem `ingress.yaml` no Kong (doc dizia que nunca era exposto).
- `secrets.md` — `extract-env.ps1` existe de novo em `infra-platform/scripts/` (tinha sido revertido, doc não sabia que voltou); ambientes do Infisical são `local`/`qa`/`prod`, não `dev`.
- `frontend-orientacoes.md` — estrutura de diretórios real do `web-app` é `src/{components,pages,routes,shared,utils}` no topo, sem `src/app/`; aliases reais são só `@`/`@@` (`@app`/`@lib` não existem, apesar de descritos antes).
