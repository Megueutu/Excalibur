# Observações

## Trabalho em computadores diferentes

O usuário trabalha nos repos a partir de mais de uma máquina (não sempre o mesmo PC). Isso significa que o estado local de um repo pode estar desatualizado em relação ao remoto mesmo sem nenhuma mudança feita nesta máquina — outra máquina pode ter commitado/mergeado algo depois da última vez que este checkout foi tocado.

**Ao iniciar uma sessão em um repo, antes de qualquer trabalho:**

1. `git fetch origin` para ver o estado real do remoto.
2. Se a branch local só está atrás (sem divergência, sem mudanças locais não commitadas) → `git pull`.
3. Se houver divergência ou o pull normal não resolver de forma limpa, e não houver trabalho local não commitado que valha a pena preservar → `git fetch` + `git reset --hard origin/<branch>` + `git clean -fd` para sincronizar exatamente com o remoto.

**Antes de rodar `reset --hard`/`clean -fd`** (ambos destroem mudanças locais sem volta): sempre rodar `git status` primeiro. Se houver algo não commitado que pareça trabalho em andamento do usuário (não sujeira/lixo), avisar antes de descartar — não presumir que é seguro só porque é outra máquina.
