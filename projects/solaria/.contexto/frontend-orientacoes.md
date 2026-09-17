# Padrão de Código — Frontend (web-app)

> Específico do frontend (React + Vite + Tailwind). Regras gerais válidas para qualquer repo estão em [padrao-de-codigo.md](padrao-de-codigo.md); regras de Git/GitHub em [orientacoes.md](orientacoes.md).

## 1. Princípios gerais

- Evitar redundâncias e duplicação de código; sempre optar pelo caminho mais simples.
- HTML semântico e legível.
- Arquivos pequenos e de responsabilidade única — evitar arquivos extensos, pouco legíveis ou difíceis de manter.

---

## 2. Arquitetura

Arquitetura baseada em **Feature-Based Architecture**: um diretório `features/`, onde cada subdiretório representa uma feature isolada com seus próprios arquivos.

### 2.1 Estrutura de uma feature

Toda feature deve conter **exclusivamente** arquivos nomeados igual ao diretório (mudando apenas o *case* e a extensão):

```
footer/
├── Footer.tsx
├── Footer.d.ts
├── Footer.enum.ts
├── Footer.utils.ts
└── Footer.test.tsx
```

Features mais complexas podem ser divididas em subdiretórios, cada um seguindo a mesma regra internamente:

```
access/
├── login/
│   ├── Login.tsx
│   └── Login.d.ts
└── register/
    ├── Register.tsx
    └── Register.d.ts
```

### 2.2 Arquivos opcionais por feature

Nem toda feature precisa ter todos os tipos de arquivo — cada um só existe se fizer sentido:

- **`.service.ts`** só existe se a feature fizer chamada de API (ex.: `exchange` tem service por consumir uma API externa de câmbio; uma feature puramente de tipos, sem persistência, não precisa).
- **Componente (`.tsx`)** só existe se a feature tiver renderização própria. Features que são só estrutura de dados/lógica (ex.: `exchange`) podem não ter nenhum componente.
- O que **não muda**: os arquivos que existirem sempre seguem o nome do diretório/feature.

### 2.3 Estrutura de diretórios (`src/`)

Corrigido em 2026-09-16 — a versão anterior desta seção descrevia uma estrutura `src/app/{components,pages,routes}` + `src/lib/{shared,utils}` com aliases `@app`/`@lib` que **não existe no repo real** (`src/app/` e `src/lib/` estão vazios, sobra de uma reorganização que não chegou a acontecer). A estrutura real, confirmada em `tsconfig.app.json`/`vite.config.ts`:

```
src/
├── components/        # componentes de UI (categorias da seção 4.1)
├── pages/             # páginas/telas
├── routes/            # definição de rotas
├── assets/
├── config/            # configuração de app (mocks, logging, i18n, erros...)
├── features/          # Feature-Based Architecture (seção 2.1)
├── shared/            # tipos/estilos usados por mais de uma feature (seção 8)
├── utils/             # funções utilitárias gerais
├── test/
├── App.tsx
├── App.test.tsx
├── index.css
└── main.tsx
```

Aliases de import (`tsconfig.app.json` + `vite.config.ts`) — só existem estes dois:

| Alias | Aponta para | Exemplo |
|---|---|---|
| `@` | `src/` | `@/config/...`, `@/features/...`, `@/pages/...`, `@/shared/...` |
| `@@` | `src/components/` | `@@/ui/icon/Icon` |

> `config/` fica fora de `pages/`/`features/` porque é configuração transversal da aplicação (não tela/rota), na mesma linha de `features/` e `shared/`.

---

## 3. Padrão de nomenclatura de arquivos

| Tipo de arquivo | Extensão | `export default` |
|---|---|---|
| Lógica geral | `*.ts` | — |
| Teste de lógica | `*.test.ts` | — |
| Componente | `*.tsx` | Sim |
| Componentes predefinidos (variações) | `*.presets.tsx` | — |
| Teste de componente | `*.test.tsx` | — |
| Mock | `*.{tipo}.mock.ts` | — |
| Enums | `*.enum.ts` | **Nunca** |
| Interfaces | `*.d.ts` | **Nunca** |
| Funções utilitárias | `*.utils.ts` | **Nunca** |
| Service (chamada externa) | `*.service.ts` | — |
| Erro customizado | `*.error.ts` | **Nunca** |
| Componentes auxiliares de uma página/componente | `*.reusable.tsx` | **Nunca** |

> Exemplo de mock: a interface `player.d.ts` gera o mock `player.d.mock.ts`.

### 3.1 Erros customizados (`*.error.ts`)

Vivem em `config/error/`, um arquivo por tipo de erro. Padrão:

- Classe estende `Error`, nomeada `{Nome}Error`.
- Define `this.name` no construtor.
- Casos de uso comuns viram **static factory methods** com mensagem pronta, em vez de montar a mensagem no local da chamada.

```ts
export class InvalidPropError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPropError";
  }

  static missingProps(component: string, props: string[]): InvalidPropError {
    const propList = props.map((prop) => `\`${prop}\``).join(" ou ");
    return new InvalidPropError(`${component}: informe ${propList}.`);
  }
}
```

### 3.2 Componentes auxiliares (`*.reusable.tsx`)

Quando uma página (ou componente) cresce demais por conter subcomponentes de apoio usados só ali dentro (ex.: `SolarPanelAnnouncement` tinha vários componentes auxiliares no próprio arquivo, prejudicando a legibilidade), esses subcomponentes saem para um arquivo `*.reusable.tsx` ao lado do arquivo principal:

```
announcement/
├── SolarPanelAnnouncement.tsx
└── SolarPanelAnnouncement.reusable.tsx
```

- Nome do arquivo = nome da página/componente + `.reusable.tsx` (não o nome do subcomponente).
- **Sem `export default`** — cada componente auxiliar é um *named export*, igual a `.enum.ts`/`.utils.ts`.
- O arquivo principal importa o que precisa por nome: `import { HeaderSection, SpecsTable } from "./SolarPanelAnnouncement.reusable"`.
- Só entra aqui o que é exclusivo daquela página/componente. Se um subcomponente passa a ser usado em mais de um lugar, ele é promovido a componente de verdade (categoria UI/Feedback/Overlay/Layout, conforme o caso) — não fica em `.reusable.tsx`.

---

## 4. Padrão de componentes

- Todo componente tem `export default` (arquivo de responsabilidade única).
- As *props* do componente devem ficar no mesmo arquivo, desde que não fiquem muito extensas — a arquitetura deve naturalmente evitar isso.

### 4.1 Categorias de componentes

| Categoria | Descrição | Exemplos |
|---|---|---|
| **UI** | Elementos de alta interação, versões personalizadas de tags nativas | `Button`, `Input`, `Textarea`, `Link` |
| **Feedback** | Auxílio visual e feedback ao usuário | `Tooltip`, `Skeleton` |
| **Overlay** | Sobrepõem a interface e exigem configuração | `ContextMenu` (possivelmente `Scrollbar`) |
| **Layout** | Seções com múltiplos componentes, específicas de algumas páginas (não são feature nem componente universal) | — |

---

## 5. Padrão de páginas

- Toda página tem `export default` (arquivo de responsabilidade única).
- Páginas que consomem services seguem uma estrutura de **3 componentes**:
  1. **Componente exportado (default)** — verifica o estado do mock via `.env.example` e decide o que renderizar.
  2. **Componente da página com dados** (não exportado).
  3. **Componente skeleton** (não exportado) — exibido durante carregamento (real ou simulado).

### 5.1 Layout: `WrapperLayout`, `SaaSLayout` e `AdapterSidebar`

Os três vivem em `src/app/components/layout/wrappers/`. `WrapperLayout` é a base para páginas de **shop** (feed, scroll, sem sidebar fixa); `SaaSLayout` é a base para páginas de **SaaS** (só acessíveis logado, com menu fixo à esquerda). Ambos aceitam um `AdapterSidebar` acoplável à direita — a diferença entre "shop" e "SaaS" é só a presença ou não do menu fixo esquerdo; o resto do comportamento (margens responsivas, adapter sidebar) é compartilhado.

#### `WrapperLayout` (margem padrão da página)

O app ocupa 100% da tela (`w`/`h`). Para padronizar a margem lateral em vez de repetir padding em cada página, todo o conteúdo "de largura de leitura" de uma página deve ser retornado **dentro** de `WrapperLayout`:

```tsx
interface WrapperLayoutProps {
  children: React.ReactNode;
  ptop?: boolean; // aplica padding-top extra quando a página não tem elemento full-bleed no topo
  adapterSidebar?: React.ReactNode; // conteúdo do AdapterSidebar; só aparece quando passado
  onAdapterSidebarClose?: () => void;
}
```

- `WrapperLayout` centraliza o conteúdo e aplica os breakpoints de padding lateral (`sm`/`md`/`lg`/`xl`).
- Elementos que devem ocupar a largura **total** da tela (ex.: banner de perfil, imagem de capa) ficam **fora** do `WrapperLayout`; só o conteúdo "de leitura" entra dentro dele.

#### `SaaSLayout` (área logada, com menu fixo)

Compõe o `Sidebar` (`src/app/components/layout/sidebar/Sidebar.tsx`) fixo à esquerda com o `WrapperLayout` para a área de conteúdo — não duplica a lógica de margens/adapter sidebar, só adiciona o menu:

```tsx
interface SaaSLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode; // lista de <SidebarOption /> daquela tela (dashboard, admin, etc.)
  ptop?: boolean;
  adapterSidebar?: React.ReactNode;
  onAdapterSidebarClose?: () => void;
}
```

Quem usa `SaaSLayout` só passa o conteúdo principal e as opções de menu daquela área — o próprio `SaaSLayout` monta `<Sidebar>{sidebar}</Sidebar>` + `<WrapperLayout>`.

#### `AdapterSidebar` (painel acoplável à direita)

Chrome puro — largura fixa, sombra e comportamento responsivo — usado internamente por `WrapperLayout`/`SaaSLayout` quando a prop `adapterSidebar` é passada; nunca é usado diretamente pelas páginas. O conteúdo (chatbot, mensagens, login, um layout específico...) é responsabilidade de quem passa a prop, não do `AdapterSidebar`.

```tsx
interface AdapterSidebarProps {
  children: React.ReactNode;
  onClose?: () => void; // renderiza o botão de fechar só se passado
}
```

- Desktop: painel em fluxo (`static`), largura fixa, ao lado do conteúdo principal — que encolhe naturalmente por serem irmãos num `flex`. É isso que significa "moldar o layout principal": o `AdapterSidebar` nunca sobrepõe conteúdo no desktop.
- Mobile (abaixo do breakpoint `lg`): vira overlay `fixed inset-0`, cobrindo a tela inteira — não há espaço pra dividir com o conteúdo.

```tsx
// ProfilePage.tsx — padrão de referência
export default function ProfilePage({ bannerUrl, ... }: ProfilePageProps) {
  return (
    <div>
      {/* full-bleed: fora do wrapper */}
      <section
        className="h-60 w-full bg-cover bg-center sm:h-80"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />

      {/* conteúdo com margem padronizada: dentro do wrapper */}
      <WrapperLayout>
        <section className="flex flex-col gap-6">
          {/* ... */}
        </section>
      </WrapperLayout>
    </div>
  );
}
```

- Retornar uma página sem passar seu conteúdo pelo `WrapperLayout` é **dívida técnica**, não uma variação válida — mesmo páginas simples, sem elemento full-bleed, devem envolver o retorno com `WrapperLayout` (usando `ptop` quando não há nada acima para dar respiro).

### 5.2 Testes

- Toda **página** e todo **componente principal** (o ponto de entrada de uma feature/componente, o que carrega `export default`) deve ter `.test.tsx`.
- **Subcomponentes internos** (usados só por dentro de outro componente, sem export próprio relevante) não precisam de teste dedicado.
- Páginas que ainda são placeholder/incompletas podem ficar sem teste temporariamente, mas viram pendência assim que a página for finalizada.

---

## 6. Estilização

- Usar **apenas Tailwind**; `.css` é proibido, com exceção única do `index.css`.
- No `index.css`, preferir `@apply` para as classes base.

### 6.1 Regras do Tailwind

- **Nunca** usar valores predefinidos do framework (`rounded-*`, `border-*`, `shadow-*` etc.) — sempre usar as variáveis declaradas em `@theme` no `index.css` (`--color-*`, `--text-*`, `--radius-*`, `--spacing-*`, `--font-weight-*`).
- Para variações de opacidade, preferir uma `@utility` dedicada em vez de repetir a mesma combinação de classes com opacidade hardcoded em vários lugares.

  ```css
  @utility bg-interactive {
    @apply bg-black/8 hover:bg-black/14 active:bg-black/20 transition duration-350;
  }
  ```

- Preferir múltiplos de **4** nos valores numéricos do Tailwind; usar múltiplos de **2** apenas quando a interface exigir valores menores.
- `@utility` também é o lugar certo para padrões repetidos que não são só cor (ex.: `skeleton-shimmer`, `no-leading`), evitando reescrever a mesma combinação de classes em vários componentes.

---

## 7. Consumo de APIs (Services)

Toda chamada de API passa pelo helper central `resolveWithMocks(apiCall, mockCall)` (`config/mocks/fallback.service.ts`), controlado pela env `VITE_MOCKS` (enum `MocksMode`):

| Modo | Comportamento |
|---|---|
| `ALWAYS` | Sempre retorna o mock (com atraso simulado de latência). |
| `FALLBACK` | Tenta a API real; se falhar, loga o erro e cai para o mock (com atraso). |
| `DEACTIVATED` | Sempre chama a API real, nunca usa mock. |

```ts
export function getSolarPanel(id: string): Promise<SolarPanelAnnouncement> {
  return resolveWithMocks(
    () => fetchJson<SolarPanelAnnouncement>(`/solar-panels/${id}`, `Não foi possível obter o painel solar ${id}`),
    () => solarPanelAnnouncementMocks.find((a) => a.id === id) ?? solarPanelAnnouncementMocks[0],
  );
}
```

- Cada função de service segue o padrão: `apiCall` (fetch real) + `mockCall` (retorno derivado do mock), passados para `resolveWithMocks`.
- Os mocks (`*.d.mock.ts`) de cada feature são centralizados e tipados em `config/mocks/registry.ts`, que os exporta prontos para uso pelos services (`export const xMocks = xMockData as X[]`).

### 7.1 Logger

Logger central em `config/logging/logger.ts`, controlado pela env `VITE_LOGS` (enum `LogsMode`: `DEBUG` | `ACTIVATED` | `DEACTIVATED`). Todo service deve usá-lo na variação adequada:

| Método | Uso |
|---|---|
| `logger.info(message, data?)` | Eventos normais relevantes. |
| `logger.warn(message, data?)` | Situação anômala mas não bloqueante. |
| `logger.error(message, error?)` | Erro real. |
| `logger.debug(message, data?)` | Só aparece em modo `DEBUG`; detalhamento fino. |
| `logger.serviceError({ service, operation, status?, error })` | Padrão específico para falhas de chamada de API — monta a mensagem `service.operation failed (HTTP status)` automaticamente. |

- **Pendência:** migrar o logger para o padrão **OTEL**.

---

## 8. Camada `shared/`

Para tipos e estilos usados por **mais de uma feature** (não pertencem a nenhuma feature específica), usar `src/lib/shared/`, seguindo a mesma lógica de nomenclatura:

```
shared/
├── types/
│   ├── address/address.d.ts
│   ├── contact/contact.d.ts
│   └── image/image.d.ts
└── styles/
    └── colors/colors.enum.ts
```

- Só vai para `shared/` o que é genuinamente transversal (ex.: `Address`, `Image` usados por várias features). Tipo específico de uma feature fica dentro dela.

---

## 9. Storybook

- Toda story fica **co-localizada** com o componente, nomeada `Component.stories.tsx` (mesmo diretório dos demais arquivos da feature/componente).
- `title` do `meta` espelha a categoria do componente (seção 4.1) e o caminho de pastas: `"UI/Select"`, `"Layout/Announcement/Corridor"`, `"Feedback/Skeleton"`, `"Overlay/Menu"`.
- **Dados de exemplo nunca são inventados na story.** Se o prop consome um tipo de domínio que já tem mock (`*.d.mock.ts`), a story importa dele — direto do arquivo ou via `config/mocks/registry.ts` — em vez de recriar objetos à mão. O mesmo vale para listas de opções que já existem como `*.enum.ts` (ex.: usar `Object.values(SolarPanelType)` em vez de repetir as strings do enum).
- Só existe literal hardcoded na story quando o prop é genuinamente arbitrário e não tem fonte única no código (ex.: `content: "Continuar"` em `Button`).
- `.storybook/preview.tsx` centraliza os decorators globais (`MemoryRouter`, i18n) — stories individuais não devem envolver o componente em providers próprios para isso.
