# Integração do front (web-app) com o backend (api-core + api-auth)

## Contexto

O `web-app` tem uma camada de services pronta (`*.service.ts` + `httpJson`) mas roda 100% sobre mock (`VITE_MOCKS=ALWAYS` por padrão, `FALLBACK` em QA). Nenhuma chamada real bate no backend hoje, por três motivos concretos, confirmados testando contra o `api-core` de QA (`https://api-core-cqfn.onrender.com`, via OpenAPI `/v3/api-docs`) e lendo `SecurityConfig.java`:

- falta o prefixo `/api` nas URLs montadas pelo front (`${API}/companies/...` vs rota real `/api/companies/...`);
- `httpJson` nunca envia `Authorization`, e todo `/api/**` exige JWT válido (`anyRequest().authenticated()` em `SecurityConfig.java`, só `/dev/login`, `/v3/api-docs` e `/swagger-ui/**` são `permitAll`);
- o login/registro do front é falso (`LoginPage.tsx` fabrica um usuário local; `access.service.ts.register()` lança `Not implemented`) — não existe fluxo real contra `api-auth`.

Pedido original: integrar o front com o `api-core` pra ele começar a receber dado de verdade. Entrevista (grillme) expandiu o escopo pra incluir autenticação real (pré-requisito técnico, já que os endpoints exigem JWT) e alguns achados de infra que viram pendência documentada em vez de trabalho desta tarefa.

## Decisões já fechadas

- **Direção**: só leitura por enquanto (GET), integrando tela por tela, removendo o mock de cada tela ao integrá-la (sem fallback silencioso).
- **Auth entra no escopo**: login, registro, refresh e logout reais, contra `api-auth` (`/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/logout`). `/auth/firebase` e `/auth/firebase/link` ficam de fora — não há nenhuma UI de login social hoje no front. Forgot-password continua mockado — não existe endpoint correspondente em `api-auth` e a regra do usuário é não fazer feature nova lá, só fix.
- **`api-auth` é intocável nesta tarefa** — zero mudança lá sem avisar antes; preferir fix a feature se algo precisar mudar.
- **Acesso direto front → api-core**: aceito pra QA/local. Existe de fato um `ingress.yaml` de Kong pro `api-core` em `infra-gitops`, contradizendo o doc `.contexto/repos.md`/`infra.md` que diz "nunca exposto" — doc está desatualizado, não a infra; vai ser corrigido como parte desta tarefa (só o doc, não a infra).
- **Ambiente usado para desenvolver/testar**: QA, via Infisical (`infisical export --env=qa --path=/vite --path=/service-urls --format=dotenv --projectId=2296d19c-5f3b-41e1-afa3-fcde39966a71`, ou `infra-platform/scripts/extract-env.ps1 -s web-app -e qa`). Já extraído uma vez nesta sessão pra `web-app/.env` (gitignored).
- **Rename `VITE_API_PERSISTENCE` → `VITE_API_CORE`**: escopo limitado ao `web-app` (env var + usos no código). Rename do nome legado "persistence" no backend (artifact Maven, pacote `com.solaria.persistence`, classes/env vars em `api-auth`/`infra-gitops`) fica registrado como pendência, fora desta tarefa — não mexer em `api-core`/`api-auth`/`infra-gitops` pra isso.
- **Primeira feature integrada**: `companies` (não `solar-panel` — sem nenhum endpoint correspondente no `api-core` hoje; vira pendência documentada).
- **Busca por slug**: `api-core` não tem endpoint de busca por slug (só `id` e, pra companies, `cnpj`). A ideia original era contornar buscando a lista via `GET /api/companies` e filtrando por slug no cliente — só que `CompanyResponseDTO` (a versão realmente usada por `CompanyController`, em `com.solaria.persistence.dto.response`, não a versão com `slug` que existe só num worktree de agente antigo em `.claude/worktrees/`) **não devolve `slug` nenhum**. Ou seja, nem o filtro client-side é viável hoje. `getCompanyBySlug` ficou como estava (chamando o endpoint inexistente `/companies/slug/{slug}`, com o prefixo `/api` mas sem mudança de abordagem) — vira pendência de verdade, não um workaround implementado. Ver [pendências](../../../pendencias/web-app-api-core-integration.md).
- **Armazenamento do JWT**: `localStorage` (sem BFF, sem cookie httpOnly disponível nesse fluxo).
- **Documentação nova em `Excalibur`** (`.contexto/specs/web-app/api-core-integration/` e/ou `.contexto/` conforme o caso — nunca dentro de nenhum repo):
  - catálogo de endpoints do `api-core` (a partir do `/v3/api-docs` de QA);
  - correção do doc que dizia api-core nunca ser exposto via Kong;
  - atualização de `secrets.md` (cita `extract-env.ps1` como removido — na real ele foi revertido e depois re-adicionado via PR #47, existe de novo em `infra-platform/scripts/`);
  - lista de pendências fora de escopo (ver seção "Em aberto" abaixo — viram itens de pendência, não perguntas).

## Em aberto (viram pendência documentada, não bloqueiam esta tarefa)

- Endpoints de `solar-panel`/`solar-panel-models` não existem no `api-core` — decidir depois se mapeiam pra `/api/models`+`/api/offers` (formatos diferentes) ou se o backend ganha endpoints novos.
- `professionals` (tipo único no front) não tem resource equivalente único no backend — o mais próximo é `technicians`/`professions`/`professional-registrations` (múltiplos resources). Fora do escopo desta rodada (só `companies` entra agora).
- Endpoint de busca por slug inexistente no `api-core`, e o filtro client-side também não é viável hoje (o DTO real de resposta não inclui `slug`) — `getCompanyBySlug` ficou sem integração real, ver [pendências](../../../pendencias/web-app-api-core-integration.md).
- Rename completo "persistence" → "core" no backend (`api-core` Maven artifact + pacote Java, classes/env vars em `api-auth`, env var `PERSISTENCE_BASE_URL` em `infra-gitops/services/api-auth/deployment.yaml`).
- Rename da chave `VITE_API_PERSISTENCE` → `VITE_API_CORE` dentro do Infisical (pasta `/vite` do projeto `web-app`, env QA/prod) — infra compartilhada, decisão de quando/como fica com o usuário.

## Roadmap

1. **Doc em Excalibur** — criar catálogo de endpoints (`.contexto/specs/web-app/api-core-integration/endpoints-api-core.md`) a partir do `/v3/api-docs` de QA; corrigir a menção "api-core nunca exposto via Kong" em `repos.md`/`infra.md`; corrigir a menção ao `extract-env.ps1` em `secrets.md`; criar `.contexto/pendencias/` com os itens da seção "Em aberto". Pronto quando os 4 docs existem/estão corrigidos.
2. **Env var rename no web-app** — `VITE_API_PERSISTENCE` → `VITE_API_CORE` em `.env.example`, `RUNNING.md`, e nos 5 services que usam (`company.service.ts`, `messages.service.ts`, `professional.service.ts`, `solarPanel.service.ts`, `user.service.ts`). Pronto quando não sobra nenhuma referência a `VITE_API_PERSISTENCE` no repo.
3. **Base client do api-core** — criar um ponto único (ex.: constante `API_CORE_URL` derivada de `VITE_API_CORE` + `/api`) usado por todo `.service.ts` que fala com `api-core`, em vez de cada service montar a URL sozinho. Pronto quando `company.service.ts` usa esse ponto único e nenhuma URL de `api-core` é montada fora dele.
4. **Auth real** — implementar `access.service.ts` contra `api-auth` (`login`, `register`, `refresh`, `logout`), guardar/ler o JWT do `localStorage`, e fazer `httpJson` anexar `Authorization: Bearer <token>` quando houver token salvo. Atualizar `LoginPage.tsx`/`RegisterPage.tsx` pra usar o service real em vez do usuário fake. Pronto quando um login real contra QA devolve um JWT válido, salvo, e uma chamada subsequente a `api-core` sai com o header.
5. **Feature `companies` integrada** — `company.service.ts` passa a chamar `GET /api/companies/{id}` (getCompany) e `GET /api/companies` com filtro client-side por id (getCompanies). `getCompanyBySlug` não foi resolvido (ver "Em aberto") — continua chamando um endpoint inexistente, sem mudança de comportamento além do prefixo `/api`. Validado ponta a ponta: registro + login reais contra um `api-auth` local (mesmo banco/keystore de QA, já que rodar o `api-auth` de QA publicado ainda depende do fix de CORS ser deployado) geraram um JWT válido, guardado em `localStorage`, e uma chamada subsequente a `GET /api/companies/{id}` no `api-core` de QA real saiu com `Authorization: Bearer <token>` e o path `/api/companies/{id}` corretos — retornou 401 porque o `api-core` de QA valida o JWT contra o JWKS do `api-auth` de QA publicado (que ainda não tem o fix de CORS), não porque o front esteja errado. Falta um teste ponta a ponta num ambiente único e consistente (tudo local, ou tudo QA após o deploy do fix) pra confirmar dado real renderizado na tela.

## Adendo — acesso público ao feed/catálogo sem login (2026-09-17)

Depois da integração inicial, o usuário pediu: usuário deslogado precisa continuar acessando o feed principal e informações de produto normalmente; a única diferença entre logado/deslogado é outro ponto (especificamente: contato/mensagem com empresa ou profissional exige login).

Investigação mostrou que `api-core` bloqueava **tudo**, incluindo leitura, pra qualquer request sem JWT — em **duas camadas independentes**:
1. `SecurityConfig.java` (`resourceServerSecurityFilterChain`): `anyRequest().authenticated()` sem exceção de leitura.
2. `EndpointAuthorizationInterceptor`/`RbacAuthorizationService` (`com.solaria.persistence.security.rbac`): um interceptor MVC separado, registrado em `WebConfig.java` pra `/**` (exceto `/internal/**`, docs), que roda **depois** do Spring Security permitir a request e exige que o usuário tenha uma `UserCompany`+`Position` com permissão pro endpoint — não tem nenhuma noção de "público" além de um set fixo `BOOTSTRAP_ALWAYS_OPEN` (só `POST /api/users` e `POST /api/companies`). Pra usuário anônimo, `SecurityContextHolder` não é um `JwtAuthenticationToken`, então `hasEndpointAccess` sempre falha e a request morre com 403 `UNAUTHORIZED_ACCESS`, mesmo com o `permitAll()` da camada 1.

Escopo fechado com o usuário: abrir leitura pública (GET) pra `companies`, `offers`/`models` (catálogo de placas solares), `technicians`/`professions` (profissionais) — mesmo os que o front ainda não integrou (`solar-panel`, `professionals` — ver "Em aberto"), preparando o backend de uma vez. Escrita (POST/PUT/PATCH/DELETE) e qualquer outro recurso continuam exigindo JWT normalmente.

Implementado em `api-core` (branch `feature/public-catalog-endpoints`, a partir de `qa`):
- `SecurityConfig.java`: novo `requestMatchers(HttpMethod.GET, "/api/companies", "/api/companies/**", "/api/offers/**", "/api/models", "/api/models/**", "/api/technicians", "/api/technicians/**", "/api/professions", "/api/professions/**").permitAll()`.
- `RbacAuthorizationService.java`: novo `PUBLIC_READ_ENDPOINTS` (mesmo padrão de `BOOTSTRAP_ALWAYS_OPEN`), verificado antes da checagem de cargo/empresa em `requireEndpointAccess`.

Validado localmente (api-core rodando com banco/redis reais de QA via Infisical): `GET /api/companies`, `/api/models`, `/api/offers/catalog`, `/api/technicians`, `/api/professions` retornam 200 sem token; `POST /api/companies` e `GET /api/users` continuam 401 sem token. Suite de testes (`mvn test`) passando, sem regressão.

Contato/mensagem (a diferença que deve continuar exigindo login) já usa Firebase, não `api-core` — nada a mudar aí; a gate natural é o próprio front não deixar iniciar contato sem sessão ativa (não implementado nesta rodada, pendência se o front hoje não checar isso).

## Checklist de análise geral

- [ ] Reuso checado antes de criar código novo (padrao-de-codigo.md) — reaproveitar `httpJson`, `resolveWithMocks`, estrutura de feature existente
- [ ] Escopo mínimo — nada implementado além do pedido (sem mexer em `api-core`/`api-auth`/`infra-gitops`, sem tocar em `solar-panel`/`professionals` nesta rodada)
- [ ] Regras de commit/PR aplicáveis identificadas (commits.md / pr.md) — commits atômicos em inglês, `tipo: mensagem`, sem atribuição de IA; só subir a branch, sem abrir PR a menos que pedido
- [ ] Repo é "core" (`web-app`)? Mudança mínima confirmada — só os arquivos listados no roadmap
- [ ] Nenhum comentário de código sem pedido explícito
