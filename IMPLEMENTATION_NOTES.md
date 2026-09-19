# Notas de implementação — Excalibur

Companheiro em prosa do `IMPLEMENTATION_PLAN.md`. Para cada etapa do checklist: **o que vai ser feito**, **por quê** e **qual seção do design doc ela implementa**. Recebe também toda decisão tomada sem consulta ao dono do projeto, e a marcação do que é provisório.

Fonte de verdade: `excalibur-design-doc.md`.

---

## Índice de coisas que precisam de revisão humana

| Tipo | Onde | O quê |
|---|---|---|
| 🔧 Proposta técnica | `cli/src/lib/migrations.js`, `.excalibur/_migrations/` | Mapa de migração entre versões com breaking change (seção 22) — implementado, marcado `PENDENTE-REVISÃO` no código |
| Decisão tomada sozinho | ver "Decisões tomadas durante a implementação" abaixo | 8 decisões registradas |
| Fora de escopo | `PENDENCIAS.md` | TODO técnico + gaps da varredura |

---

## Decisões tomadas durante a implementação

Todas seguem os princípios que o próprio design doc repete (KISS, YAGNI, economia de token, preferir o padrão dos concorrentes pesquisados). Nenhuma travou o processo.

### D1 — Baseline do repositório: reconciliar com `origin/main` antes de começar

O repositório local estava 12 commits atrás de `origin/main` e com uma reestruturação não commitada em cima (uma variante `core/pipeline/` que não existe no design doc). O design doc foi escrito contra o estado de `origin/main` (`bootstrap/`, `pipeline/`, `reflection/`, `rules/`), então esse é o baseline correto.

Para não perder nada, a árvore suja local foi commitada e empurrada na branch **`pre-impl-snapshot`** antes do fast-forward de `main`. Nada foi descartado — a variante `core/` continua recuperável ali.

### D2 — `rules/` passa a ser conteúdo do framework; documentação sobre o repo vai pra `docs/repo/`

Conflito real: hoje `rules/` guarda regras *sobre o repositório Excalibur* (`purpose.md`, `structure.md`, `git.md`, `adding-a-harness.md`), mas a seção 8 classifica `rules/` como "Excalibur operacional" — conteúdo que é **copiado pra dentro de `.excalibur/`** no projeto-alvo. As duas coisas não podem coabitar: o instalador copiaria pro projeto do usuário regras sobre como manter o repo do Excalibur.

Resolução: `rules/` fica só com conteúdo distribuível (global, stacks, convenções de escrita, tabelas de heurística). A documentação sobre o próprio repo vai pra `docs/repo/`. `rules/adding-a-project.md` é descartado — descrevia `projects/<project>/.contexto/`, que a seção 11 remove.

### D3 — `reflection/` é absorvido por `pipeline/`

`reflection/when-to-pause.md` e `reasoning-chain.md` são metodologia de pipeline e já eram copiados pro destino do SDD pelo `init.sh`. Mantê-los numa pasta raiz separada cria uma terceira categoria de conteúdo distribuível sem ganho. Viram `pipeline/reflection/`. A seção 11 só protege os *nomes* (`pipeline`, `reflection`, `rules`, `harnesses`) de renomeação gratuita — o nome `reflection` continua existindo, só aninhado.

### D4 — Idioma do "Excalibur operacional" fica em pt-BR

A seção 8 diz que o conteúdo operacional nunca é traduzido e fica num idioma fixo — "provavelmente inglês, o idioma canônico do framework". Como "provavelmente" não é uma decisão travada e todo o conteúdo existente do repositório está em pt-BR, reescrever tudo em inglês agora seria churn grande sem benefício imediato.

O que importa de fato — o invariante que a seção estabelece — é que o `translator` **não gasta token traduzindo conteúdo operacional**. Isso está implementado. O idioma fixo escolhido é pt-BR, registrado em `PENDENCIAS.md` como revisável antes de qualquer publicação pública.

Exceção: **mensagens de commit continuam em inglês e lowercase**, conforme `docs/repo/git.md`, que não muda.

### D5 — O "build" é biblioteca interna, não comando de CLI

A seção 6 exige uma etapa de build que resolve o fallback `.excalibur.custom/` → `.excalibur/` e escreve o arquivo efetivo no caminho fixo que o harness lê (`.claude/agents/<agente>.md`). Mas a tabela de comandos da seção 19 não lista nenhum `excalibur build`.

Resolução: o build vira `cli/src/lib/build.js`, chamado automaticamente por `init`, `update` e `customize` — os três momentos em que o conjunto efetivo de arquivos muda. Não inventa um comando fora da tabela fechada da seção 19, e o usuário nunca precisa lembrar de rodar build manualmente.

### D6 — Parser YAML próprio e mínimo, sem dependência nova

A seção 20 fecha o stack do CLI em `@clack/prompts` + `mri` + `picocolors` — exatamente as três do `create-vite`, nada além. Mas o CLI precisa ler/escrever YAML (`manifest.yaml`, `.excalibur-answers.yaml`, `Excalibur`, `.excalibur-session.yaml`).

Resolução: `cli/src/lib/yaml.js`, um leitor/escritor mínimo que cobre só o subconjunto que o Excalibur usa (mapas, listas, escalares, strings multilinha simples). Evita adicionar uma 4ª dependência fora da decisão fechada. Se o subconjunto se mostrar insuficiente na prática, trocar por `yaml` é uma mudança localizada num arquivo.

### D7 — `history.yaml` é escrito por script, não por agente

A seção 15 decide que o registro do histórico é "mecânico via script (barato, determinístico)". Implementado como `wizard/scripts/record-history.sh`, acionado pelo agente que executou a mudança. O agente passa os campos por flag; o script cuida de formato e append. Nenhum agente gasta token formatando YAML.

### D8 — Skills de tipo de tarefa compartilham um corpo único

A seção 23 pede 11 skills de tipo (Conventional Commits completo). Onze `SKILL.md` com o mesmo texto seria DRY violado dentro do repositório que prega DRY (seção 12). Cada `SKILL.md` de tipo carrega só o frontmatter e o *esforço-hint* daquele tipo, e aponta pro corpo compartilhado em `pipeline/task-types.md`.

---

## Fase 1 — Fundação do repositório

### 1.1 Reconciliar `main` com `origin/main`

Ver **D1**. Pré-requisito de tudo: implementar em cima de um baseline que não bate com o design doc geraria conflito em cada etapa seguinte.

### 1.2 Licença MIT

O TODO da seção final do design doc registra que a licença atual (Boost Software License) foi escolhida aleatoriamente na criação do repo, e que os 3 concorrentes pesquisados na seção 18 (OpenSpec, Spec Kit, BMad Method) são todos MIT. MIT entra como default de trabalho pra não deixar o repositório sem licença coerente; a decisão final segue em `PENDENCIAS.md`.

### 1.3 Plano, notas e pendências

Os três arquivos de rastreamento pedidos no prompt de implementação. `IMPLEMENTATION_PLAN.md` usa a própria convenção de numeração que o design doc define na seção 16.

### 1.4 Reestruturação das pastas raiz

Materializa a arquitetura que o design doc descreve espalhada em várias seções (1, 6, 12, 18, 20): `wizard/` (seção 1), `pipeline/` com `agents/` (seção 6), `rules/` com `global/` e `stacks/` (seção 12), `cli/` (seção 20), `harnesses/claude/` (seção 11), `docs/repo/` (**D2**).

### 1.5 Remoção de `projects/solaria/`

Seção 11, decisão ✅: o Excalibur é exclusivamente um framework de SDD e nunca guarda contexto de negócio de um projeto real. O conteúdo continua recuperável no histórico do git e na branch `pre-impl-snapshot`.

### 1.6 READMEs obrigatórios

Seção 18, decisão ✅: toda pasta de primeiro nível do Excalibur (e as subpastas mais importantes) tem `README.md` curto explicando sua função. A mesma decisão registra que isso é **convenção do repositório do Excalibur**, não regra imposta ao usuário final — o `review-checklist.md` do projeto-alvo não checa isso.

---

## Fase 2 — Wizard

### 2.1 `bootstrap/` → `wizard/`

Seção 1, decisão ✅: troca de nome 1:1, mesma responsabilidade, sem absorver escopo novo. `wizard/entrypoint.md` mantém o nome do arquivo interno. Todas as referências textuais a "bootstrap" em `pipeline/`, `rules/`, `harnesses/` e `README.md` acompanham.

### 2.2 `wizard/manifest.yaml` — 13 perguntas

Seção 4 (as 5 originais + 8 novas), seção 12 (a pergunta de stack vira um grupo de três: linguagem, framework, IDE), seção 5 (`destination: external` como 3ª opção formal), seção 15 (gitignore do histórico). Cada pergunta carrega:

- `options` fixas com `copy: source/dest` quando materializam arquivo (seção 4: sem geração dinâmica de conteúdo por enquanto);
- `default` obrigatório — exigência da decisão cross-cutting da seção 17;
- `review_hint` **só onde faz falta** (seção 5, 🟡): alimenta o agente interpretador pós-manifesto sem poluir o arquivo com campo vazio na maioria das perguntas.

O manifesto continua lista linear, sem dependência condicional entre perguntas (seção 4, ✅).

### 2.3 Pergunta-mestre de personalização

Seção 17, decisão ✅: o wizard abre perguntando "personalizar as configurações do Excalibur ou usar os padrões?". Em "padrão", todas as perguntas configuráveis usam seu `default` sem perguntar uma por uma. É o que obriga cada pergunta a ter `default` definido.

### 2.4 `init.sh` com modo `external`

Seção 5, decisão ✅: 3º modo ao lado de `embedded`/`separate`. O local não é fixo — o agente interpretador oferece `~/.excalibur/projects/<nome>/` como opção pré-definida (única por enquanto, 🟡 YAGNI) mais caminho livre digitado pelo usuário.

### 2.5 `wizard/entrypoint.md`

Seção 4, decisão ✅: entra um passo novo entre o passo 4 (perguntas) e o passo 5 (resolver em copy-list) — o **agente interpretador pós-manifesto**, que lê o conjunto de respostas como um todo e faz perguntas de acompanhamento. Seção 4, 🟡: não vira agente dedicado em `pipeline/agents/` — é responsabilidade do próprio `entrypoint.md`, porque é um passo do fluxo, não um papel reutilizável.

Seção 5 também unifica aqui a criação de repo do zero com a escolha de destino do SDD — deixam de ser dois momentos desconectados.

### 2.6 Scripts

Seção 7. A decisão ✅ de manter `.sh` (revertendo a ideia de Node) tem justificativa medida — 106ms → 5ms, 21x, pelo overhead de startup do V8 — e a decisão ✅ seguinte obriga o `README.md` de `scripts/` a documentar isso, justamente pra ninguém reabrir a discussão sem saber que já foi pesquisada. Git Bash é pré-requisito assumido no Windows; `excalibur check` verifica `bash` no PATH; wrapper `.ps1` só como exceção pontual.

Categorias implementadas (seção 7, 🟡): git/GitHub (já existia), detecção de stack, scaffolding (é o próprio `init.sh`), registro de histórico (**D7**).

---

## Fase 3 — Pipeline e agentes

### 3.1 `pipeline/agents/`

Seção 6, decisões ✅: lugar único e fixo (não mais por harness — `harnesses/claude/agents/translator.md` migra pra cá); um `.md` por agente com frontmatter YAML + corpo Markdown, sem `.yaml` separado; seis agentes (`translator`, `grill-me`, `review`, `orchestrator`, `spec-writer`, `idealizador`).

Cada agente recebe `tools:` explícito — reforço técnico do guardrail, não só tom: `review` sem `Write`/`Edit` (fisicamente não edita código), `orchestrator` com `Task` pra delegar. Todos rodam como subagentes de contexto isolado, o que é proposital (seção 6): o handoff é o único canal de informação, então nem a sessão do usuário nem o `history.yaml` contaminam o viés do agente.

O `grill-me` carrega a regra de formatar sempre em `P:` / `R:` (seção 6, ✅), que também vira convenção geral em `rules/interaction.md`.

### 3.2 Persona `guardrail` como Skill

Seção 6, decisão ✅: personas deixam de ser `.md` soltos concatenados e viram Skills nativas, referenciadas por `skills: [guardrail]` no frontmatter — o harness pré-carrega sozinho, sem lógica de concatenação no build. Recebem a persona: `review`, `orchestrator`, `spec-writer`, `idealizador`. Não recebem: `translator` e `grill-me` (não tomam decisão de risco).

### 3.3 `pipeline/entrypoint.md`

Seção 13: a 4ª camada (orquestrador) entra acima de spec → implementar → revisar. Seção 23: as skills de tipo viram o ponto de entrada explícito, e o esforço-hint de cada tipo **alimenta** a classificação Fix/Feature/Big feature em vez de substituí-la.

### 3.4 Cinco arquivos por tarefa

Seção 16, decisão ✅ (adoção completa do gap #2 do OpenSpec): `proposal.md`, `spec.md`, `design.md` em Markdown (prosa, e YAML lida mal com prosa), `tasks.yaml` em YAML (lista estruturada de registros, parseável sem interpretar checkbox de markdown). Seção 15 acrescenta o 5º: `history.yaml`, na mesma pasta, porque o histórico é por tarefa e inventar árvore paralela seria pior.

A divisão de quem escreve o quê (seção 16, ✅ — dividida entre os agentes, não um agente único) está detalhada no frontmatter/corpo de cada agente.

### 3.5 `review-checklist.md`

Cresce com: checagem de CI/CD antes de considerar pronto (seção 4, pergunta 9), limite de tamanho de `.md` da allowlist (seção 14 — item de checklist, tarefa não fecha com arquivo estourado), marcação dos itens de `tasks.yaml` (seção 16), fechamento de `history.yaml` e atualização do Canvas via checklist YAML (seção 16).

---

## Fase 4 — Regras

### 4.1 Princípios globais

Seção 12, decisão ✅ com ressalva: os 4 são KISS, YAGNI, DRY e SOLID, e o próprio dono do projeto pediu que a definição fosse revista com calma na hora de escrever — principalmente SOLID, que são 5 princípios, não 1. Tratado como guarda-chuva num arquivo só, com os 5 nomeados e uma linha cada: abrir 5 arquivos pra algo que o agente lê como bloco único é custo de token sem ganho (KISS).

Seção 12, 🟡: entram só como documento lido pelo agente, não como ferramenta instalada — são princípios de design, não regras verificáveis por linter sem falso positivo.

### 4.2 Stacks

Seção 12, 🟡: `rules/stacks/{languages,frameworks,ides}/`, combináveis — um projeto "TypeScript + React + VSCode" cruza três arquivos. Formato YAML, um domínio por arquivo (seção 18, padrão "fonte única → build"). "Perguntar antes vs. rodar direto" a instalação reaproveita a preferência de autonomia da pergunta 11 do manifesto, sem criar pergunta nova.

### 4.3 Allowlist de limite de `.md`

Seção 14, decisões ✅: modelo de **allowlist**, não de perfis — por padrão nenhum tipo tem limite; só entram os tipos que são absurdos se crescerem. Allowlist inicial (🟡): prompt de usuário de skill, handoff, frontmatter de agente/skill. Limite varia por item. A tabela central em `rules/` é a fonte de verdade — frontmatter espelhado é decorativo, porque não dá pra confiar que o agente lê frontmatter de forma consistente (isso é inclusive um TODO em aberto).

Seção 14, ✅: não existe regra global de "o índice vira o mesmo arquivo ou um novo" — cada convenção de diretório resolve por si.

### 4.4 Heurística de ordenação de tarefas

Seção 16, decisão ✅: se as tarefas têm dependência de ordem, numeração hierárquica; se são independentes, lista simples. A decisão é tomada por **heurística fixa guardada em YAML**, não pelo agente julgando caso a caso — explicitamente por economia de token.

### 4.5 Nomenclatura

Seção 13, 🟡: `YYYY-MM-DD-titulo.md` pra artefatos "de um momento" (plans, specs, handoffs); arquivos vivos atualizados continuamente (`roadmap.md`, `stack.md`) não levam data. Cobre também o problema levantado na seção 13 de nunca cair em `roadmap-1.md`, `roadmap-2.md`.

### 4.6 Formato de interação

Seção 6, ✅: `P:` / `R:` vira convenção de interação referenciada em `rules/`, não só regra interna do `grill-me`.

### 4.7 Escrita pro Obsidian

Seção 10, 🟡: só convenção de formatação (wikilinks, callouts, frontmatter, estrutura amigável a grafo) — sem gerar `.obsidian/` de config, porque instalar/configurar o app é responsabilidade do usuário. Generaliza o `rules/writing-specs-obsidian.md` que já existia (era só sobre specs) pra todo `.md` do SDD.

---

## Fase 5 — CLI

### 5.1 Stack e empacotamento

Seção 20, decisões ✅: `@clack/prompts` + `mri` + `picocolors`, a mesma combinação do `create-vite` que inspirou o pedido original da seção 9. Pacote **único** (`package.json` na raiz) cobrindo CLI e conteúdo do framework juntos — é o que OpenSpec e BMad Method fazem, e bate com KISS/YAGNI. `cli/` não duplica `wizard/`/`pipeline/`/`rules/`: essas continuam a fonte da verdade do conteúdo, `cli/` é só o mecanismo de distribuição.

### 5.2 Biblioteca interna

Resolução base+override por arquivo individual (seção 18, ✅): procura em `.excalibur.custom/<caminho>`, cai pra `.excalibur/<caminho>`. Por arquivo, não por pasta — customizar um arquivo não faz o usuário perder os vizinhos. Mais o build (**D5**) e o YAML mínimo (**D6**).

### 5.3 `init`

Seção 18, ✅: checagem **antes** de escrever, não rollback depois — é o que o código real do `create-vite` faz. Se `.excalibur/` já existe e não está vazio, três opções: cancelar / remover e continuar / ignorar e continuar. Seção 9: o formulário coleta as 13 perguntas e grava `.excalibur-answers.yaml` (YAML, não JSON — economia de token e consistência com o resto do framework); não implementa nada, só coleta. O passo de `gh auth login` continua fora do CLI (seção 9, 🟡) porque é OAuth interativo.

### 5.4 `update`

Seção 18: regrava só `.excalibur/`, nunca toca `.excalibur.custom/` — customização nunca se perde, sem precisar de diff/hash por arquivo. Seção 22 (🔧) entra aqui.

### 5.5 `customize`

Seção 18, ✅: copia um arquivo de `.excalibur/` pra `.excalibur.custom/` no mesmo caminho relativo, e atualiza o índice `.excalibur.custom/manifest.yaml` (metadado de quais caminhos estão customizados, não o conteúdo). Só CLI, sem versão skill.

### 5.6–5.8 Demais comandos

Seção 19, tabela consolidada: `check` (gap que os 3 concorrentes já cobriam), `status`, `session`, `reset`, `clean-history`, `clean`, `kill-my-self`.

### 5.9 VSCode

Seção 18, ✅: `.vscode/settings.json` com `files.associations` mapeando `Excalibur` → `yaml` (mesmo truque nativo do `Dockerfile`) e `.vscode/extensions.json` recomendando o tema de ícone pelo mecanismo nativo de recomendação do VSCode. Instalação silenciosa via `code --install-extension` fica descartada por agressiva/frágil.

### 5.10 Arquivo `Excalibur`

Seção 18, ✅: config na raiz, sem extensão, conteúdo YAML, igual ao `Dockerfile`. Só na raiz, porque é onde o harness roda.

---

## Fase 6 — Skills do harness Claude

Seção 2 (`/excalibur-init` como atalho adicional — a detecção automática continua funcionando), seção 23 (`magic-book`, `try-gh`, skills de tipo) e seção 3 (`/excalibur-skill-create`).

A seção 3 tem uma decisão ✅ importante: antes de construir criador de skills próprio, o Excalibur **verifica se o `skill-creator` público do ambiente Claude já cobre a necessidade** e, se cobrir, orienta usar o que já existe em vez de duplicar. A skill implementada faz exatamente isso: checa o catálogo primeiro, e só ensina as convenções específicas do Excalibur (onde salvar, formato) por cima. É também por isso que ela é um arquivo curto, não um criador completo.

`magic-book` é de invocação manual, não hook automático a cada sessão (seção 23, ✅) — mesma lógica de não gastar token em sessão que não precisa. Bônus registrado na própria decisão: ela carrega exatamente o prefixo estável que a seção 13 define como cacheável, então rodar `magic-book` de forma consistente ajuda o cache a bater.

`try-gh` segue a ordem barata primeiro: checagem local do `gh` (grátis), e só se falhar, busca na internet (caro, último recurso).

---

## Fase 7 — Obsidian e i18n

### 7.1 Canvas

Seção 16, ✅: o JSON Canvas é formato aberto (JSON puro, spec MIT), então o agente escreve direto, sem manipular o app. É um **canvas geral do projeto** (visão macro), não por tarefa, e também cabe na fase de idealização quando fizer sentido pra aquela ideia — não como regra obrigatória. Quem atualiza é o agente de revisão, consultando um checklist YAML do tipo "sofreu alteração em X?" a cada passagem.

### 7.2 Tradução

Seção 8, ✅: a divisão é estrutural, por posição na árvore, não lista fechada de arquivos. **SDD visível** (`ideas/`, `architecture/`, `proposal.md`, `spec.md`, `design.md`, Canvas) é traduzido; **Excalibur operacional** (`.excalibur/` inteiro, `pipeline/`, `rules/`, `tasks.yaml`, `history.yaml`) nunca é. O motivo é economia de token: não traduzir arquivo que nenhum humano vai ler. Ver **D4** sobre qual é o idioma fixo do operacional.

Seção 8, 🟡: a tradução passa a valer continuamente, não só na leva inicial do wizard. Detecção de idioma: idioma da conversa + `README.md` do projeto-alvo; locale do SO fica de fora por pouco confiável.

---

## Fase 8 — Orquestrador, handoff e cache

Deixada por último conforme a ordem da seção 11 — é a parte menos definida e de maior impacto arquitetural.

### 8.1 Handoff

Seção 13, 🟡: `.md` curto com frontmatter YAML (mesmo padrão dos agentes), contendo link pro spec da tarefa, quais arquivos de `architecture/` são relevantes, e o escopo — nada além disso. A seção 6 explica por que ele é enxuto: é literalmente o único canal de informação que o subagente recebe, já que não herda a sessão principal.

### 8.2 Cache de prompt

Seção 13, ✅: é a feature real da API (`cache_control`), não metáfora de organização. Os limites técnicos moldam o desenho: mínimo de ~1024 tokens pra compensar, **máximo de 4 breakpoints** por requisição — então o Excalibur precisa escolher até 4 pontos de corte, não marcar tudo. Ordem do prefixo estável (🟡): `rules/` globais → `rules/stacks/*` → `architecture/` → `spec.md` da tarefa (esse último sempre fora do cache, no fim).

Direção prática registrada na decisão: o foco não é cachear tudo sempre, é garantir prefixo bem definido nas sessões que já sabidamente custam mais (muitos handoffs, specs grandes, `architecture/` extenso). Sessão curta não precisa da mesma preocupação.

Sobre TTL: em assinatura Pro/Max o padrão já é 1 hora renovada a cada uso — só cai pra 5 minutos em crédito de uso extra ou acesso via API key direta.

### 8.3 Diretivas de sessão

Seção 21, ✅: 9 flags, em `.excalibur-session.yaml` na raiz — **fora** de `.excalibur/` e de `.excalibur.custom/`, porque é estado próprio da sessão, não customização de arquivo padrão. Como vive fora de `.excalibur/`, o `update` nunca encosta nele, então tanto o comando gerador quanto edição manual são seguros.

### 8.4 Histórico

Seção 15, ✅: changelog por tarefa (não log de evento granular), escopo por tarefa (não por agente), em `specs/<repo>/<task>/history.yaml`, **não lido por padrão por nenhum agente** — só quando o handoff ou o usuário mandar explicitamente. Isso não é só economia de token: é isolamento de viés proposital (seção 6).

Seção 17, ✅: limpeza default é combinada — sai do controle de versão **e** arquiva localmente em `history/archive/` ignorada pelo git. Não é apagar de vez nem versionar pra sempre. As 6 opções (tarefa agendada nativa do Claude Code, GitHub Actions, hook local, script manual, nada, usuário faz do jeito dele) são oferecidas em camadas, sem forçar. O conversor gera formato **pro agente ler**, não pra humano: schema fixo, sem prosa livre, justamente pra não abrir espaço pra alucinação em cima de histórico mal formatado.

---

## Etapas bloqueadas

Nenhuma até agora. Se alguma travar por exigir escolha de arquitetura sem base no design doc, ela é marcada `[!]` no plano e o motivo entra aqui.
