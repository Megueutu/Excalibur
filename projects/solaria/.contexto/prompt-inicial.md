# Prompt inicial — acionar a pipeline SDD numa sessão nova

`grill-me` só pode ser rodado por você (`disable-model-invocation`), não pela IA — então roda ele primeiro, com a tarefa, antes de pedir a implementação.

```
/grill-me

<tarefa aqui, escrita normal>
```

Depois que a entrevista terminar (ou se quiser pular ela pra essa tarefa), manda seguir:

```
Use a skill sdd antes de começar (não pule pro código direto). Siga estritamente as regras de git.

Pode implementar.
```
