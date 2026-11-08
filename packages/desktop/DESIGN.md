---
version: alpha
name: Excalibur Desktop
description: Calm, borderless, minimal desktop interface. Built on the Apple design system as extracted on getdesign.md (one blue, flat tones, pill actions, tight tracking), adapted for a dense desktop app.
colors:
  primary: "#0066cc"
  primary-pressed: "#0071e3"
  on-primary: "#ffffff"
  canvas: "#ffffff"
  panel: "#f5f5f7"
  panel-2: "#e8e8ed"
  ink: "#1d1d1f"
  muted: "#6e6e73"
  ok: "#248a3d"
  warn: "#b25000"
  primary-dark: "#0071e3"
  primary-pressed-dark: "#0a84ff"
  on-primary-dark: "#ffffff"
  canvas-dark: "#161617"
  panel-dark: "#272729"
  panel-2-dark: "#333336"
  ink-dark: "#f5f5f7"
  muted-dark: "#a1a1a6"
  ok-dark: "#30d158"
  warn-dark: "#ff9f0a"
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.14
    letterSpacing: -0.02em
  title:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.24
    letterSpacing: -0.022em
  heading:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: -0.014em
  body:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.47
    letterSpacing: -0.016em
  body-strong:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: 600
    lineHeight: 1.47
    letterSpacing: -0.016em
  caption:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.43
    letterSpacing: -0.01em
  code:
    fontFamily: ui-monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
rounded:
  sm: 8px
  md: 11px
  lg: 18px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  page: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 20px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: 36px
    padding: 20px
  card:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: 20px
  sidebar-item:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    height: 36px
    padding: 12px
  sidebar-item-active:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.ink}"
  badge:
    backgroundColor: "{colors.panel-2}"
    textColor: "{colors.muted}"
    typography: "{typography.caption}"
    rounded: "{rounded.full}"
    padding: 10px
---

# Excalibur Desktop

## Overview

The app is opened rarely and used to configure, not to work in. It should feel calm and unhurried, never like a dashboard: borderless, flat, with content and state doing the talking.

The system takes the Apple design system as extracted on getdesign.md (`design-md/apple`, MIT) as its base: its palette, radii, tracking, pill actions, press state and rule of one interactive color. What changes for a desktop app: a 14px body instead of 17px, no photography tiles, no full-bleed bands, and the system font stack instead of a bundled SF Pro. Because these are a real brand's values, the app's final identity (name, mark, color) is still to be decided before any public release.

Both a light and a dark theme exist. Dark tokens carry the `-dark` suffix and follow the system setting.

## Colors

- **primary** is the only interactive color: primary buttons, focus ring, links. Never a second accent.
- **canvas** is the content area. **panel** is the frame (title bar and sidebar) and every raised group inside the content (cards, grouped lists, code blocks). **panel-2** is hover, the active sidebar item and badges.
- Separation is by tone only: canvas vs panel vs panel-2. There are **no borders and no dividers**.
- **ink** is primary text and **muted** is secondary text; there is no third tone.
- **ok** and **warn** are status colors only: a dot or a small label, never a filled area.

## Typography

Class merging (`cn`) is taught the five type levels, otherwise tailwind-merge reads `text-caption` as a color and drops it next to `text-muted`.

The typeface is **Plus Jakarta Sans** (variable, OFL), chosen by the user on 2026-11-07 from specimens. It is consumed from the `@fontsource-variable/plus-jakarta-sans` package and bundled by Vite, so the app works offline and no font file is committed. It is declared in exactly two places: imported in `shared/styles/fonts.css` and named in `--font-sans` in `theme.css`. Weights are 400 and 600 only.

Hierarchy is five levels, declared once in `theme.css` as Tailwind text sizes (size, line height, tracking and weight together), so a component writes one class and never a size:

- `text-display` 28px: the page title, once per page.
- `text-title` 17px: section titles and popup titles.
- `text-heading` 15px: the name inside a card or row.
- `text-body` 14px: running text and values, in `ink` or `muted`.
- `text-caption` 12px: small labels and metadata, in `muted`.

Section labels are `text-title` in `ink`, not small muted caps. Muted is for secondary information only.

## Layout

An 8px base. Page padding is `page` (32px) on every side; the gap between sections is 32px and between a section label and its content 8px. Groups (`card`) have 20px padding, rows inside a group 12px vertical and 16px horizontal. The frame (title bar plus sidebar) sits on `panel` and the content area is a `canvas` sheet with an `lg` radius at its top-left corner. Sidebar width is 250px, its padding 12px, items 36px tall with 2px between them, and section labels 24px above the first item.

Nothing touches an edge: text always has at least 12px to the nearest edge of its container, and controls at least 8px from each other.

### Collapsible sidebars

Both sidebars fold to a 64px icon rail so the content can have the whole window: the fixed sidebar (Início, Perfil, Configurações, projects) and, inside a project, the repository list. The rail keeps every destination reachable (icons with tooltips, a dot where something needs attention). `Ctrl or Cmd + B` folds the fixed sidebar, `+ Shift + B` the repository list, `+ Shift + E` the files, `+ \` folds them all or restores the repository list. The choice is remembered. The columns animate over 200ms.

## Elevation & Depth

Flat. Depth comes only from the tone steps above. The one exception is a dialog over its backdrop, which uses a wide, soft shadow at low opacity so it reads as detached.

## Shapes

Actions, badges and inputs are pills (`full`). Cards, grouped lists and dialogs use `lg` (18px). Sidebar items use `md` (11px), small inner controls `sm` (8px). Do not mix radii outside this scale.

## Components

- **Buttons** are pills, 36px tall, 20px horizontal padding. Primary is filled with `primary`, secondary is `panel` with no outline. On press scale to 0.95; hover shifts to `primary-pressed` or `panel-2`. Focus shows a 2px `primary` ring offset by 2px.
- **Popups** have no close button: they close with Escape or a click outside. The page behind blurs and darkens, the backdrop fades in over 200ms and the sheet rises in over 240ms with a soft ease; leaving takes 150ms. Reduced-motion turns the animation off.
- **Cards and grouped lists** are `panel` with `lg` radius. Rows inside are separated by space, not lines.
- **Sidebar items** are 36px tall with `md` radius; active uses `panel-2`.
- **Chips** (Badge, PathLink, Pill) are one height, `h-chip` (24px), and one tone: `bg-field`, the same tone buttons and fields take on their surface. `bg-selected` is for a selected item only, never for a tag. A repository header is the name on its own line (truncated, never wrapped by a tag), the path under it as a path, and then one row of equal chips: hub, branch, stack.
- **Icons** are consumed from the icon libraries at build time through `unplugin-icons` (`~icons/<set>/<name>`); no SVG is copied into the source. Two single-color sets: Solar Linear for the interface (CC BY 4.0, so the app needs a credits entry) and Simple Icons for git, GitHub and the stack (CC0). Their weight is tuned in one place, `electron.vite.config.ts` (Solar stroke 2, a light round outline on the solid brand icons). They are sized with Tailwind (`size-4`, `size-5`), never with numbers in code. Interface icons are exported from `shared/ui/icons/index.ts`; kind and stack icons live in `features/projects/lib`.
- **Repository kind** has one symbol each: GitHub (git with a GitHub remote), Git (local, no remote) and a plain folder. A repository row always shows its kind first, then its main stack icon, then its name.
- **Stack icons** come from detectors, not from hand-picked lists: `linguist-js` for the language and `@specfy/stack-analyser` for frameworks and tools, each mapped to a Simple Icons slug. A technology without an icon is skipped, never replaced by a colored logo.
- **Fixed tabs** sit together at the top of the sidebar: Início, Perfil do usuário, Configurações. Projects and standalone repositories follow below.
- **Visual first:** pages show state as cards with an icon and one short line, not as tables. Projects and repositories are cards; configuration is a row of badges.
- **Project page** has two sidebars side by side, then the panel. The first lists the repositories ("Visão geral" is the project as a whole). The second lists the files of the repository being read; it only exists on the Arquivos tab. Only one of the two is open at a time: opening one folds the other to a rail, and leaving the Arquivos tab removes the files sidebar and gives the room back. Both have the same header, the title on the left and the fold button on the right, folded or not. The files are grouped by kind (context, profile, specs, decisions, reports) and specs by task, and every group folds on its own, with an arrow that turns; there is no filter, because the whole list is one continuous scroll. Files show their real names. Opening a project also folds the fixed sidebar, since the project lists its repositories itself; this only closes it, the person can open it again, and leaving the project restores their own choice. The panel shows only what the person cannot already know, or something they can act on, in tabs: Tarefas, Saúde, Arquivos, Configuração.
- **Open in editor** is a split button: the main part opens the path in the last editor used, shown by that editor's icon, a thin bar divides it from an arrow, and the arrow lists the other editors and "Mostrar na pasta". It appears on a file and on a repository.
- **Actions** that change files are real and say what they did in a short toast, or why they could not. Anything that leaves the machine (a GitHub remote) asks first in a popup. A button that is really unavailable keeps its fill and turns its text muted; it never just fades into the surface.
- **File reader** is titled with the file's own name, extension included (`spec.md`), with the full path under it as a path. Beside the text (below it when narrow) a "Sobre o arquivo" card holds what the file is (kind, whether it is always read, its cost) and, for a spec, what its frontmatter says (status, date, linked commit, freshness), then the files it depends on and links to as chips.
- **Paths** are code, not chips. They keep their own shape (4px corners, `rounded-xs`) and the mono font, they never sit in a row of chips (a repository header puts the path on its own line, above the chips), and they are always clickable: inside the app when they name a file of the repository, otherwise they open in the editor or file manager. Inline code in Markdown that looks like a path becomes a path link, and so does a commit hash.
- **File graph** is not hand-built: it uses `react-force-graph-2d` (canvas, d3-force), which owns layout, zoom, pan and drag. The component only decides how a node looks. Kinds are told apart by shape and icon, not color; the selected node is `primary`, the hovered node and its neighbors are `ink`, the rest fade. Colors are read from the CSS tokens, so the canvas follows the theme.
- **Markdown** in the reader is rendered by `react-markdown`, with relative links between files made clickable.
- **Snap-in board** shows what a repository has switched on as a puzzle, not a list of switches. The assembly on top is the core piece followed by the snap-ins in the order they were snapped in, in rows that wrap; neighbors interlock with a real jigsaw outline (tabs and blanks drawn as SVG from the neighbors, alternating like a puzzle, `features/projects/lib/jigsaw.ts`). The shelf below holds every piece that exists, grouped by family; a piece in use leaves only a dashed outline in its place. Taking a piece from the shelf, by click or drag, makes it fly into the row; "Devolver à prateleira" puts it back. A piece takes its family color from `--family-*` (registro, git, seguranca, analise) mixed into the surface by `--piece-fill-mix`, so it reads on both themes; a snap-in of unknown family is muted. A meter under the board shows what the agent reads before the first task: the base plus what the snap-ins add, against the recommended limit. It appears in the repository's Configuração tab and in step 2 of Criar projeto, where shortcuts (Essencial, Git em dia, Economia de tokens, Seguro, Tudo, Nenhum) snap several in at once.
- **Profile** is a notebook: a sentence at the top says what it is, a strip of three numbers says where things stand (instructions, repositories up to date, time since the last version), a list of instructions in two groups (valem sempre, só em alguns projetos) sits beside the one being written. An instruction is a title, a sentence for when the agent reads it, and its text; it saves itself a moment after the last keystroke. There is one button, "Guardar versão", whose second step brings the repositories up to date. Git words (branch, commit, remote) do not appear on this page.
- **Create project** is four steps, one question each, under a header with a Solar "folder with files" icon in a tile and a `Stepper` (a progress bar with the step names: a check on the ones done, a filled number on the current one). Projeto asks for a name and folder and shows the path it will make. Repositórios opens with a plain explanation of what a repository is, three ready-made arrangements (um só, contexto + código as the recommended one, do meu jeito) each with its folder tree, and then the editable list with what Pasta, Git local and GitHub mean and what the hub is. Snap-ins is the jigsaw board with shortcuts and the context meter. Revisar shows the folders that will exist and what will happen, and repeats that nothing leaves the machine. The name is made into a folder name (lowercase, no accents) and shown before it is used.
- **Status** is a small dot, never a banner, unless an action would change files (then a short plain-language note in a card).

## Tokens and where they live

Nothing visual is hardcoded in components. Styles are split by concern in `shared/styles/`: `fonts.css`, `tokens.css` (raw values, light and dark, layout sizes, motion), `theme.css` (the Tailwind mapping), `base.css` (element defaults: cursor, focus ring, scrollbar) and `animations.css`. Backgrounds are semantic and depend on the parent: `bg-frame` (title bar and sidebar) and three surfaces, `surface-page`, `surface-card` and `surface-control`. Each surface sets `--field`, the tone for the controls that sit on it, and buttons, chips, segmented controls and fields use `bg-field`, so a control is never the same color as what it sits on and nobody picks a gray by hand. `bg-hover` and `bg-selected` are the two states. Text is `text-ink` or `text-muted`. Layout sizes (`--sidebar-width`, `--titlebar-height`, `--modal-width`, `--page-gutter`) are tokens, used through `var()` or the `gutter` spacing.

## Control sizes

Every control that sits in a row has the same height, from tokens: `h-control` (36px) for buttons, fields and the tab bar, `h-control-sm` (32px) for small buttons, chips, segmented controls and the toggle buttons, and `min-h-row` (48px) for rows that hold a control, such as a module with its switch. A chip, a segmented control and a small button next to each other line up. A switcher (segmented control, tab bar) frames its selected pill with 4px of padding, never 2px, so the frame is a whole number of device pixels at common display scales and its four sides look equal.

## Pointer and interaction

Anything clickable shows the hand cursor; anything disabled shows the not-allowed cursor and drops to 40% opacity; text fields show the text cursor. Every clickable surface changes tone on hover (`bg-hover`) with a 150ms transition and shrinks to 95% while pressed. Keyboard focus shows a 2px `primary` ring. The window chrome is not selectable; page content (`PageBody`) and fields are. Scrollbars are not drawn anywhere; the page still scrolls with the wheel, the trackpad and the keyboard, and there is one scroll per page: sidebars grow with their content instead of scrolling on their own.

## Do's and Don'ts

**Do**
- Use `primary` for every interactive element and nothing else.
- Separate with tone and space; keep surfaces flat.
- Use pills for actions and `lg` for groups.
- Write UI text in Portuguese, short and plain.
- Keep the press state on every button.

**Don't**
- Add borders, dividers, outlines or a second accent color.
- Put shadows on cards, buttons or text (dialog excepted).
- Use weight 500, uppercase labels or decorative gradients.
- Fill large areas with `ok` or `warn`.
- Let text or controls touch an edge or each other.
