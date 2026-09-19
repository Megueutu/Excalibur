# Estrutura do repositório

```
Excalibur/
  rules/            regras sobre o próprio Excalibur (este arquivo e os vizinhos dele)
  core/
    pipeline/        metodologia SDD, harness-agnóstica e projeto-agnóstica
  harnesses/
    <harness>/        adapter fino do harness — só "quando disparar" + ponteiro pro core/
  projects/
    <project>/.contexto/   contexto específico do projeto/org: regras de git, specs, infra, etc.
```

## Camadas e onde cada coisa vive

| Camada | Onde | Regra pra decidir se algo entra aqui |
|---|---|---|
| `rules/` | raiz | Regras sobre como usar/manter o Excalibur em si. Não é metodologia SDD nem contexto de projeto. |
| `core/pipeline/` | raiz | Só entra aqui o que é 100% genérico — nenhuma menção a um projeto, org ou repo específico. Se citar um nome próprio (ex.: "Solierrr", "web-app"), não pertence aqui. |
| `harnesses/<harness>/` | raiz | Só o adapter (gatilho + ponteiro). Nunca duplicar o conteúdo de `core/pipeline/` — se o adapter está explicando *como* fazer algo em vez de *apontar pra onde está explicado*, ele cresceu demais. |
| `projects/<project>/.contexto/` | raiz | Tudo que é específico daquele projeto/org: convenções de git/commit/PR daquele contexto, inventário de repos, infra, secrets, specs de tarefas. |

## Por que a metodologia foi promovida pra `core/`

Os arquivos de pipeline (`entrypoint.md`, `reflection.md`, `review-checklist.md`, `spec-template.md`) descrevem o processo SDD em si — grillme, classificação fix/feature/big feature, onde ficam specs, checklist final. Nenhum deles menciona a Solaria ou a Solierrr; são o mesmo processo pra qualquer projeto. Por isso vivem em `core/`, não dentro de `projects/solaria/.contexto/` — um projeto novo reusa o mesmo `core/pipeline/` sem copiar nada.

Ver [adding-a-project.md](adding-a-project.md) e [adding-a-harness.md](adding-a-harness.md) pra como estender cada camada.
