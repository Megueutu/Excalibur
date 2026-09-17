# Infraestrutura

## Filosofia: infra efêmera (projeto estudantil)

Este é um projeto estudantil — não faz sentido (nem é viável financeiramente) manter tudo de pé 24/7. Por isso:

- O cluster GKE (`solaria-gke`, GCP, `us-central1`) **é derrubado sempre que não está em uso** e recriado quando necessário via Terraform (`infra-platform`). Não assumir que o cluster está de pé — confirmar com o usuário ou checar via `gcloud container clusters list` antes de qualquer operação que dependa dele.
- QA roda no **Render** em vez de GCP justamente para não gerar custo (branch `qa` dos repos aplicáveis é o que o Render deploya) — ver [repos.md](repos.md#branch-qa-vs-main).
- O **Infisical** (vault de secrets) é o único componente que fica disponível 24/7 de graça — é a fonte de verdade dos secrets independente de GCP/Render estarem de pé ou não (ver [secrets.md](secrets.md)).
- O Render free tier "dorme" serviços sem tráfego — por isso existe `infra-keepalive`, um serviço dedicado a fazer ping periódico nos serviços do Render pra evitar esse sleep. Repo ainda vazio (scaffold), a implementar.

## `infra-platform` (Terraform)

- Provisiona: VPC (`solaria-vpc`) + subnet, cluster GKE (`solaria-gke`), node pool, IP estático do Kong (`solaria-kong-ip`), `helm_release` do ArgoCD e do Kong, `kubernetes_secret` por serviço (populados via Infisical, ver [secrets.md](secrets.md)), `kubectl_manifest` de `ClusterIssuer` (cert-manager, Let's Encrypt via desafio **DNS-01** com token da Cloudflare — DNS-01 escolhido em vez de HTTP-01 porque o cluster é destruído com frequência e HTTP-01 falharia na renovação com o cluster fora do ar).
- **Nunca rodar `terraform apply`/`destroy` diretamente para escalar nodes** — usar `scripts/toggle-nodes.ps1 -NodeCount N -Apply` (faz PR + merge + apply de forma segura). Rodar `terraform apply` direto sem passar pelo script já causou timeout de `helm_release` (nodes não existiam ainda quando o apply tentou instalar ArgoCD/Kong) e, outra vez, uma dessincronia entre state e realidade (destroy zerou o state mas o cluster real continuou de pé, criado por um apply concorrente) — nos dois casos, limpeza manual via `gcloud` foi necessária.
- `main` branch do `infra-platform` está **sem** o ruleset `main-protection` no momento (foi removido pelo usuário para permitir um force-push de emergência — remover um commit com atribuição de IA — e não foi recriado ainda). Ver [rulesets.md](rulesets.md).
- Sem backend remoto de state — `terraform.tfstate` é só o arquivo local do checkout. Cuidado com múltiplos clones/terminais rodando apply/destroy ao mesmo tempo (causa de pelo menos um incidente de dessincronia).

## `infra-gitops`

- Repo GitOps consumido pelo ArgoCD. Contém os manifests (`Ingress` etc.) dos serviços expostos via Kong: `api-auth`, `api-messenger`, `api-recommendation`, `ai-assistant`, `ai-validation`, **e também `api-core`** — todos com host `sslip.io` usando o IP do Kong.
- `web-app` tem domínio próprio (`web.solaria.com`, Cloudflare, A record apontando pro IP do Kong) — **o IP do Kong muda toda vez que o cluster é recriado** (é um `google_compute_address` novo), então o A record da Cloudflare precisa ser reconferido/atualizado depois de cada recriação do cluster.
- `api-core` **tem** `ingress.yaml` em `infra-gitops/services/api-core/` (host `api-core.<ip>.sslip.io` → serviço `api-core:8080`) — corrigido em 2026-09-16: a doc antiga dizia que ficava fora do Ingress "de propósito", mas isso não bate com o manifest real. Só `mcp-database` (ex-`api-mcp`) é de fato internal-only (sem `ingress.yaml`, só `deployment.yaml`/`service.yaml`).

## `infra-gateway` / `infra-otel-collector`

- `infra-gateway`: (a confirmar detalhes exatos com o usuário).
- `infra-otel-collector`: coletor de observabilidade (OpenTelemetry). Há uma pendência conhecida de migrar o logger do `web-app` (hoje um logger próprio em `config/logging/logger.ts`) para o padrão OTEL.

## Cloudflare

- DNS de `web.solaria.com` → IP estático do Kong. Reconferir sempre que o cluster for recriado (o IP muda).
