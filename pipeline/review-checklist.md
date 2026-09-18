# Checklist final — antes de anunciar a tarefa como concluída

Isso não é leitura de referência — é uma etapa de execução obrigatória, com saída visível. "Já li o arquivo antes" não conta como tê-lo rodado.

**Como executar, sem exceção:**
1. Rodar `git diff` (ou equivalente) sobre tudo que foi mudado — olhar o diff de verdade, não confiar na memória do que foi escrito.
2. Em **Feature**/**Big feature**: usar o Agent tool pra abrir um subagente de revisão dedicado, passando o diff e este arquivo, e pedir um veredito item a item — um agente fresco sem o viés de "eu já acho que terminei" pega mais coisa. Em **Fix**, fazer isso inline mesmo, mas ainda de forma explícita.
3. Escrever a resposta final citando o resultado de cada item abaixo (não precisa ser um relatório longo, mas cada item precisa ter sido de fato checado, não presumido).

Se algum item falhar, corrigir antes de considerar a tarefa concluída — não reportar como pronto com uma ressalva.

## Comentários em código
- Nenhum comentário novo deve existir no diff, a menos que o usuário tenha pedido explicitamente naquela tarefa.
- Se algum comentário foi adicionado "pra facilitar entendimento" sem pedido — remover antes de commitar.

## Rastro de IA
- `git diff` (ou `grep -ri "claude\|anthropic\|co-authored-by\|generated with"`) sobre tudo que vai ser commitado — nada disso pode aparecer em código, commit, PR ou nome de arquivo. Ver as regras gerais de código do projeto (`padrao-de-codigo.md`, se existir no destino de SDD do projeto — `.sdd/` embutido ou `<repo>-sdd/` separado).

## Formato de commit/PR
- Commits seguem as convenções do projeto (`commits.md`, se existir).
- Se for abrir PR: título e corpo seguem as convenções do projeto (`pr.md`, se existir) — checar também se já existe uma PR aberta pra essa branch antes de abrir outra.

## Escopo
- Nada foi implementado além do que foi pedido (mínimo retrabalho) — se algo "a mais" foi feito por parecer relacionado, decidir se remove ou pergunta antes de manter.
- Se o repo tocado exige cuidado extra (ver inventário de repos do projeto, se existir), reconferir que a mudança é mínima e cirúrgica.

## Spec (Feature/Big feature)
- O arquivo `spec.md` no destino de SDD do projeto (`.sdd/` embutido ou `<repo>-sdd/` separado, ver [`bootstrap/entrypoint.md`](../bootstrap/entrypoint.md)), em `specs/<repo>/<tarefa>/spec.md`, reflete o que foi de fato implementado (atualizar se o plano mudou no meio do caminho) — não deixar a spec desatualizada em relação ao código.
