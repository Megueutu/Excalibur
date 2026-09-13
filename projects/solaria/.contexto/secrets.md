# Secrets — Infisical

Vault único da org (Infisical), 3 ambientes (`dev`/`qa`/`prod`). É o único componente de infra que fica disponível 24/7 de graça — ver [infra.md](infra.md#filosofia-infra-efêmera-projeto-estudantil) sobre por que isso importa (GCP e Render custam/dormem, o vault não).

## Organização: por categoria de tecnologia, não por serviço

Pastas são compartilhadas entre serviços que usam a mesma tecnologia/credencial, em vez de uma pasta por serviço — porque várias credenciais são genuinamente compartilhadas (ex.: `api-auth` e `api-core` usam a mesma instância Postgres, só muda o nome do banco).

Pastas conhecidas: `/database`, `/redis`, `/auth`, `/llm`, `/cloudinary`, `/google`, `/otel`, `/databricks`, `/vite`, `/service-urls`, `/mcp`, `/recommendation`, `/agent-queue`, `/outbox`.

Nomenclatura padronizada dentro de `/database`, por exemplo: `DB_POSTGRES_URI/HOST/PORT/USER/PASSWORD` (compartilhado) + `DB_POSTGRES_AUTH`/`DB_POSTGRES_CORE` (nome do banco, isolado por consumidor). Mesmo padrão para Mongo e Redis (Upstash).

## Como é consumido

1. **Terraform (`infra-platform/secrets.tf`) lê do Infisical, nunca escreve nele:**
   ```hcl
   data "infisical_secrets" "database" {
     env_slug     = "prod"
     workspace_id = var.infisical_project_id
     folder_path  = "/database"
   }
   ```
2. **Terraform materializa isso como `kubernetes_secret`, um por serviço**, combinando as pastas que aquele serviço precisa. É esperado (e considerado inofensivo) que um serviço receba chaves que não usa — ex.: `api-core` recebe `DB_POSTGRES_AUTH` também, porque a pasta `/database` é compartilhada e cada app só lê as env vars que reconhece.
3. **Caso especial `api-auth`:** recebe também um keystore JWT via `binary_data` (`JWT_KEYSTORE_BASE64`, decodificado como `.p12`).
4. **Caso especial `web-app`:** não tem `kubernetes_secret` — é SPA estática (Vite+nginx), `VITE_*` são embutidas no bundle **em build-time no CI**, não injetadas em runtime no cluster.
5. **GitHub Actions (cronjobs) usam GitHub Secrets, não leem o Infisical diretamente** — ex.: `databricks-sync` usa `secrets.DB_CORE_HOST` etc. do próprio GitHub (ver [cronjobs.md](cronjobs.md)). Isso significa que valores mudados no Infisical também precisam ser replicados manualmente nos GitHub Secrets desses workflows — não há sincronização automática entre os dois hoje (a confirmar se isso é intencional ou uma lacuna pendente).
6. **Localmente (fora do cluster)**, sem acesso direto ao Infisical, cada dev replica as env vars manualmente num `.env` (ou usa um script de extração, ex.: `extract-env.ps1` visto em `infra-platform`).

## Docs de referência (em `docs-warehouse`)

- `docs-warehouse/architecture/2026-09-03-secrets-and-envs-design.md` — desenho da decisão (por que pastas por categoria, não por serviço).
- `docs-warehouse/architecture/2026-09-03-secrets-and-envs-plan.md` — plano de rollout (piloto no `api-core` → resto dos serviços).
- `docs-warehouse/architecture/2026-09-04-secrets-and-envs-status.md` — status/pendências no momento em que foi escrito (2026-09-04); pode estar desatualizado, conferir antes de assumir como estado atual.
- Ambos os dois primeiros estavam marcados como "rascunho — aguardando revisão do usuário" — confirmar se já foram aprovados antes de tratá-los como decisão final.

## Nunca

- Nunca colar secrets reais no chat — pedir para o usuário salvar num arquivo local (fora do git) e ler de lá, ou usar CLI do Infisical diretamente.
- Nunca commitar `.env` preenchido com valores reais.
