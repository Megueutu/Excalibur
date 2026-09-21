# Pendências — fora do escopo desta rodada de implementação

Itens da seção **"TODO — validações técnicas pendentes"** do `excalibur-design-doc.md` e da **varredura de gaps** que a fecha. Nenhum deles foi resolvido nesta rodada, por decisão explícita do prompt de implementação. Listados aqui sem exceção, pra não se perderem.

---

## 1. Licença do repositório

- **Status:** default de trabalho aplicado — **MIT**.
- **Contexto:** o repositório tinha uma licença escolhida aleatoriamente na criação (Boost Software License 1.0). Os 3 concorrentes pesquisados na seção 18 (OpenSpec, GitHub Spec Kit, BMad Method) são todos MIT.
- **Por que foi decidido agora:** deixar o repositório sem licença coerente travaria publicação e confundiria contribuidores, e o prompt de implementação autorizou MIT como default de trabalho por ser o padrão da categoria.
- **O que falta:** confirmação do dono do projeto antes de qualquer publicação real. **Pode mudar.**

## 2. YAML é mesmo a melhor escolha no contexto de SDD? (parcialmente resolvido no doc)

- Pesquisa já feita no design doc encontrou o **TOON** (Token-Oriented Object Notation, pacote `toon-lang`) — indentação estilo YAML + layout tabular estilo CSV, ganho medido de 30–60% menos tokens que JSON formatado.
- Recomendação já registrada: não trocar tudo. TOON só compensa em arquivos que são listas grandes e uniformes (candidatos: o `manifest.yaml` de customização se crescer, a recomendação de skills por stack da seção 12). Pra config pequena e heterogênea, YAML continua certo.
- **O que falta:** medir o tamanho real dos arquivos depois que existirem de verdade e decidir quais (se algum) migram.

## 3. O agente lê/considera frontmatter de metadados de forma confiável?

- Dúvida original da seção 14, ainda não validada na prática.
- **Impacto direto no que foi implementado:** por causa dessa incerteza, `rules/heuristics/md-size-limits.yaml` é a fonte de verdade dos limites e o frontmatter espelhado é tratado como decorativo. Se a validação mostrar que o frontmatter é confiável, dá pra simplificar.

## 4. Onde exatamente o Claude Code espera skills/agentes num projeto-alvo

- Seção 18: o instalador precisa copiar pra lá, e isso exige teste prático — não dá pra responder sem validar.
- **Impacto direto no que foi implementado:** o build atual (`cli/src/lib/build.js`) assume `.claude/agents/` e `.claude/skills/` no projeto-alvo. Os caminhos estão centralizados num único lugar (`cli/src/lib/paths.js`) justamente pra que corrigir isso depois seja uma mudança de uma linha.

## 5. Publicação formal no npm registry

- Seção 18: começa testando local, via `npm install` apontando pro git do próprio Excalibur, sem publicar em registro nenhum.
- **O que falta:** decidir se/quando publicar de verdade como `excalibur` (ou outro nome — checar disponibilidade no registro).

## 6. Estratégia de versionamento (semver)

- Como numerar as versões do pacote único da seção 20, e o que conta como breaking change (ex.: mudança na estrutura de `.excalibur/` que quebra projetos já instalados).
- **Ligação:** define quando o mecanismo de migração da seção 22 (item 12 abaixo) precisa entrar em ação.

## 7. CI do próprio repositório Excalibur

- Pipeline (provavelmente GitHub Actions) que valida mudanças antes de subir/publicar — ex.: garantir que uma mudança no prompt do agente `review` não quebrou nada.
- **Não confundir** com a pergunta 9 do manifesto, que é sobre CI/CD do projeto-alvo do usuário, não do Excalibur em si.

## 8. Ecossistema de "community schemas" (gap #8 da comparação com o OpenSpec)

- Hoje o Excalibur só tem recomendação de skills por stack feita pelo próprio autor (seção 12). O OpenSpec tem um modelo mais ambicioso, de pacotes de terceiros instaláveis.
- **O que falta:** avaliar se/quando isso faz sentido pro Excalibur.

## 9. Suporte a monorepo

- A pergunta 6 do manifesto já pergunta se o projeto é app/lib/CLI/monorepo, mas **nada no resto do design muda de comportamento com base nessa resposta ainda**.
- **Decisão que falta:** um monorepo tem um `.excalibur/` só pra tudo, ou um `.excalibur/` por sub-pacote (já que sub-pacotes costumam ter stacks bem diferentes — `packages/api` em Node, `packages/mobile` em Swift)?
- **Impacto:** muda a estrutura de pastas, o CLI (`excalibur init` roda uma vez no monorepo ou uma vez por pacote?) e como as regras de stack da seção 12 se aplicam.
- **Estado atual da implementação:** a resposta é coletada e gravada em `.excalibur-answers.yaml`, mas não altera nenhum comportamento — exatamente como o design doc descreve hoje.

---

## Itens adicionais registrados durante a implementação

## 10. Idioma fixo do "Excalibur operacional"

- A seção 8 diz que o conteúdo operacional nunca é traduzido e fica num idioma fixo — "**provavelmente** inglês, o idioma canônico do framework". Não era uma decisão travada.
- **Implementado como:** inglês, confirmando a direção que o conteúdo mais recente do repositório já seguia (wizard, manifesto, agentes e skills já estavam em inglês, e o contrato do `translator` assume inglês como fonte).
- **O que falta:** varrer os arquivos legados em pt-BR que esta rodada não tocou e converter, se algum sobrar. Nada disso bloqueia uso — só consistência.

## 11. Ícone customizado no VSCode

- Seção 18: o Excalibur não controla isso — depende de temas de ícone de terceiros já instalados, que não têm API pra receber mapeamento de fora.
- **Implementado:** `.vscode/settings.json` com `files.associations` (realce YAML no arquivo `Excalibur` sem extensão) e `.vscode/extensions.json` recomendando `excalibur.icon-theme` pelo mecanismo nativo do VSCode.
- **O que falta:** publicar de fato a extensão de tema de ícone. Até lá, a recomendação aponta pra uma extensão que ainda não existe.

## 12. 🔧 Migração entre versões com breaking change (seção 22)

- **Toda a seção 22 é uma proposta técnica marcada 🔧** — pensada sem validação do dono do projeto.
- **Implementado de forma provisória**, marcado `PENDENTE-REVISÃO` em `cli/src/lib/migrations.js` e `.excalibur/_migrations/README.md`: mapa de migração em YAML por versão, movimentação automática de override quando a renomeação é conhecida, e sinalização de "customização órfã" (no `update` e no `status`) quando a mudança for mais profunda que um simples caminho.
- **O que falta:** revisão humana do mecanismo inteiro antes de confiar nele num update real.

## 13. Formato de arquivo do conversor de histórico

- Seção 17 fecha o **critério** (estruturado, schema fixo, sem prosa livre, feito pro agente ler e não pro humano), mas não o formato concreto.
- **Implementado como:** YAML com schema fixo, por consistência com o resto do framework. Candidato natural a TOON se o histórico crescer (ver item 2).

## 14. Primeira execução real ponta a ponta

- Nada nesta rodada foi validado rodando o wizard de verdade contra um projeto-alvo real. O CLI foi verificado quanto a sintaxe e execução dos comandos, mas o fluxo completo (`init` → agente interpretador → `init.sh` → build → primeira tarefa) não foi exercitado de ponta a ponta.
- **O que falta:** um teste prático guiado, que provavelmente também resolve os itens 3 e 4 acima.
