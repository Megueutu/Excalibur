# Escrevendo specs pro Obsidian

Toda spec produzida pelo `pipeline/spec-template.md` segue estas convenções, pra ser lida confortavelmente num vault Obsidian (graph view, backlinks, properties, Templater).

## Frontmatter / Properties

Todo `spec.md` começa com YAML frontmatter:

```yaml
---
status: em-andamento   # em-andamento | concluida | pausada
projeto: <nome-do-projeto>
tarefa: <slug-da-tarefa>
classe: feature         # fix | feature | big-feature
criada: YYYY-MM-DD
---
```

`status` e `classe` são os campos que mais valem a pena filtrar/consultar depois (ex. via Dataview, se o vault tiver o plugin) — manter atualizados, não só na criação.

## Wikilinks

Referências a outras notas do mesmo destino de SDD (outra spec, uma nota de decisão, uma nota de contexto do projeto) usam `[[nome-da-nota]]`, não link relativo de markdown (ex.: `[nome](../caminho.md)`). Isso é o que alimenta o graph view e os backlinks do Obsidian.

Links pra fora do vault (ex.: pra este repositório Excalibur, pra um arquivo de código) continuam como link markdown normal — wikilink é só entre notas do mesmo vault.

## Estrutura de vault

O destino do SDD de um projeto (ver [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)) segue:

```
<destino>/
  specs/
    <repo>/<tarefa>/spec.md
  Templates/
    spec-template.md      cópia do pipeline/spec-template.md, usada por Templater/QuickAdd
```

A pasta `Templates/` existe pra permitir criar uma spec nova de dentro do próprio Obsidian (comando "Insert Template" ou QuickAdd), sem depender do agente de IA pra copiar o template manualmente.

## Callouts

Seções que merecem destaque visual usam callout em vez de só um header:

- Decisão fechada: `> [!note] Decisão`
- Risco ou pendência bloqueante: `> [!warning] Em aberto`
- Algo que já deu errado uma vez e não deve se repetir: `> [!danger] Cuidado`

Exemplo:

```markdown
> [!warning] Em aberto
> Mecanismo de override da reasoning-chain ainda não testado neste projeto.
```
