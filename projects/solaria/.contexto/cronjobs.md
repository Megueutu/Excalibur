# Cronjobs

Preferência da org: **jobs agendados via GitHub Actions (`schedule: cron`)** em vez de `k8s CronJob` dentro do cluster GKE — faz sentido dado que o cluster é derrubado quando não está em uso (ver [infra.md](infra.md#filosofia-infra-efêmera-projeto-estudantil)); um CronJob dentro de um cluster que não existe boa parte do tempo não rodaria de forma confiável. GitHub Actions roda independente do cluster estar de pé ou não.

## `databricks-sync` — `.github/workflows/sync.yml`

```yaml
on:
  schedule:
    - cron: "0 */4 * * *"   # a cada 4 horas
  workflow_dispatch: {}
jobs:
  sync:
    steps:
      - checkout, setup-python 3.12, pip install -r requirements.txt
      - python synchronizer.py
```

- Sincroniza Postgres (`core` + `auth`) → Databricks.
- Usa **GitHub Secrets** (não Infisical diretamente): `DB_CORE_*`, `DB_AUTH_*`, `DATABRICKS_HOST`, `DATABRICKS_HTTP_PATH`, `DATABRICKS_TOKEN`, `DATABRICKS_CATALOG`, `DATABRICKS_SCHEMA_CORE`, `DATABRICKS_SCHEMA_AUTH`. Ver a lacuna de sincronização com Infisical em [secrets.md](secrets.md#como-é-consumido) — valores mudados no Infisical precisam ser replicados manualmente aqui.

## Outros repos

Nenhum outro workflow com `cron:` foi encontrado na busca de código da org até o momento (2026-09-12). Se algum repo precisar de um job agendado (ex.: `infra-keepalive` fazendo ping periódico nos serviços do Render), o padrão a seguir é este mesmo formato (`schedule: cron` + `workflow_dispatch` manual pra teste).
