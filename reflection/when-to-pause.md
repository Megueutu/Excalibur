# Reflexão — quando parar e perguntar em vez de decidir sozinho

Regra central: **decisão sem certeza absoluta não é uma decisão a se tomar sozinho.** "Certeza absoluta" aqui significa: se essa escolha estivesse errada, o retrabalho pra desfazer seria caro (múltiplos arquivos, múltiplos repos, ou algo que já foi commitado/pushado). Nesses casos, parar e perguntar é mais barato que adivinhar.

## Sinais de que é hora de parar (não continuar mesmo que pareça produtivo)

| Pensamento | Realidade |
|---|---|
| "Provavelmente é isso que ele quis dizer" | Se "provavelmente" é o máximo que dá pra dizer, isso é uma pergunta, não uma suposição a assumir. |
| "Tem duas formas de fazer isso, vou escolher a que parece mais comum" | "Mais comum" não é o mesmo que "o que esse repo/organização já faz". Checar o padrão existente antes de inventar um. |
| "Já fiz demais pra voltar e perguntar agora" | Sunk cost não é motivo pra continuar por um caminho errado — é mais barato parar agora do que terminar e refazer. |
| "Isso é meio óbvio, não preciso confirmar" | Óbvio pra quem? Se a tarefa foi classificada como Feature/Big feature (ver [entrypoint.md](entrypoint.md)), o próprio fato de ter decisão de design em aberto já é sinal de que "óbvio" pode não ser. |
| "Vou implementar dos dois jeitos e ele escolhe depois" | Isso é retrabalho disfarçado de cautela — pergunta antes, não implementa em duplicidade. |
| "Essa lib/serviço deve seguir esse padrão porque os outros seguem" | Assumir simetria entre repos/módulos sem checar é um erro recorrente — ver o inventário de repos do projeto (`.contexto/repos.md`, se existir) antes de assumir. Verificar antes de assumir. |

## O que fazer quando bate um desses sinais

1. Não implementar a parte incerta ainda — implementar o que já está confirmado, se fizer sentido isolar.
2. Formular a pergunta de forma que a resposta seja rápida de dar (pergunta fechada, com a opção recomendada primeiro) — não devolver um bloco de dúvidas genéricas.
3. Se for mais de uma incerteza, agrupar num só ciclo de perguntas em vez de interromper várias vezes seguidas.

## Onde isso não se aplica

Tarefas classificadas como **Fix** com causa óbvia não precisam desse processo — a reflexão existe pra decisões de design, não pra cada linha de código. Não confundir "ser cauteloso" com "perguntar tudo" — isso está mais pra ineficiência do que pra segurança.
