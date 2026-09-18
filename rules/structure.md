# Estrutura do repositório

```
Excalibur/
  rules/            regras sobre o próprio Excalibur (este arquivo e os vizinhos dele)
  pipeline/          metodologia de implementação, harness-agnóstica e projeto-agnóstica
  reflection/         cadeia de raciocínio e regras de quando parar/perguntar
  bootstrap/          wizard de onboarding: cria o destino de SDD de um projeto novo
  harnesses/
    <harness>/         adapter fino do harness — só "quando disparar" + ponteiro pro resto
  projects/
    solaria/.contexto/   contexto legado da Solaria — não usar como referência de projeto novo, ver nota abaixo
```

## Camadas e onde cada coisa vive

| Camada | Onde | Regra pra decidir se algo entra aqui |
|---|---|---|
| `rules/` | raiz | Regras sobre como usar/manter o Excalibur em si, incluindo como escrever skills, specs (Obsidian) e scripts. |
| `pipeline/` | raiz | Processo de implementação assumindo que o SDD do projeto já existe (grillme, classificação, spec, checklist). |
| `reflection/` | raiz | Como pensar ao produzir uma spec — cadeia de raciocínio padrão e quando parar/perguntar. Não é "o que fazer", é "como decidir". |
| `bootstrap/` | raiz | Onboarding de projeto novo — roda uma vez, decide onde o SDD do projeto vai morar. |
| `harnesses/<harness>/` | raiz | Só o adapter (gatilho + ponteiro). Nunca duplicar conteúdo de `pipeline/`/`reflection/`/`bootstrap/`. |
| `projects/` | raiz | **Legado.** Projetos não vivem mais dentro do Excalibur — `bootstrap/` materializa o SDD deles embutido no próprio repo ou num repo separado. `projects/solaria/` continua aqui até ser migrado (tarefa futura). |

## Por que a metodologia foi dividida em `pipeline/` e `reflection/`

`pipeline/` é sequência de processo ("primeiro grillme, depois classificar, depois spec"). `reflection/` é sobre como pensar em cada etapa dessa sequência ("qual cadeia de raciocínio seguir ao escrever a spec", "quando essa decisão é grande demais pra tomar sozinho") — são preocupações diferentes o suficiente pra não viverem no mesmo lugar.

Ver [adding-a-harness.md](adding-a-harness.md) pra como estender a camada de harnesses. Onboarding de projeto novo agora é [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md), não mais um arquivo em `rules/`.
