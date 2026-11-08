# Excalibur desktop (prototype)

A desktop app for the same things the CLI does, starting with the user profile and the list of projects. Everything the screens offer is real. Reading comes from `packages/core` through the main process: the user's registry, git, the SDD and the profile repository. Writing goes through the core or the CLI's own commands: health fixes (sync the profile, update the framework, create a private GitHub remote after a confirmation), "Nova tarefa", resuming a paused task, "Incorporar projeto", "Criar projeto" (folders, `git init` and `excalibur init --yes` per repository, the hub holding the SDD), the profile page (edit and save a file, local commit, link or create the repository), the attention list on the home and the Settings dialog (default snapshot). Nothing pushes, and a GitHub remote is only created after a confirmation. Without the bridge (plain browser) the screens fall back to sample data (`shared/api/mock.ts`) and the shell shows a "dados de exemplo" badge.

It is not part of the published npm package (`files` in the root `package.json` leaves it out) and has its own dependencies.

```bash
cd packages/desktop
npm install
npm run dev        # open the app with hot reload
npm run typecheck
npm run build
npm run icons        # regenerate the Solar icon paths after editing scripts/generate-icons.mjs
npm run lint:design  # validate DESIGN.md
```

## Layout

Folders are organized by feature. Each feature groups its own `pages/`, `dialogs/`, `components/` and `lib/`.

```text
src/
  main/               Electron main process: window, ipc.ts (one handler per method, output checked by zod), core.ts (loads packages/core), services/ (registry, detail, profile, catalog, git, stack, editors, folders, paths)
  preload/            the typed bridge the screen may use
  shared/             contract (types and zod schemas) used by both sides
  renderer/
    app/              router, providers, shell and sidebar
    features/<name>/  pages, dialogs, components, lib, hooks
    shared/
      api/            the single place data comes from (mock for now)
      lib/ state/     small helpers and interface-only state
      styles/         fonts, tokens, theme, base, animations (index.css only orders them)
      ui/
        primitives/   Button, Badge, StatusDot, Segmented
        layout/       PageHeader, PageBody, Section, Group, Fact
        overlays/     Modal
        icons/        the interface icon set, consumed from the library
```

## Rules of the road

- The screen has no Node or disk access. Everything goes through the preload bridge (`window.excalibur.api`), and the main side validates every answer against `shared/contract.ts`. File paths a screen sends are checked against the registered repositories, their SDDs and the profile repository.
- Data reaches the screen only through `renderer/shared/api`, which picks the bridge or the mock.
- Nothing visual is hardcoded. Colors, sizes, radii, type levels and motion are tokens in `shared/styles` and reach components as Tailwind classes. The visual system is [DESIGN.md](DESIGN.md) (`npm run lint:design`).
- Anything that is a solved problem comes from a library, not from the repo: the file graph (`react-force-graph-2d`), Markdown (`react-markdown`), dialogs (Radix), routing, data fetching and state each have one.
- Icons and fonts are consumed from their packages: icons through `unplugin-icons` (`~icons/solar/...`, `~icons/simple-icons/...`), the font through `@fontsource`. Solar is CC BY 4.0: the app needs a credits entry for it.

## Running against real data

```bash
EXCALIBUR_HOME=/some/folder npm run dev   # registry at <folder>/projects.yaml instead of ~/.excalibur
EXCALIBUR_CORE_DIR=/path/to/core          # override where packages/core is loaded from
EXCALIBUR_DEBUG_PORT=9333                 # expose the window to the Chrome DevTools Protocol, for driving it in tests
```

Projects are derived from the registry: repositories that share a parent folder form a project, and the repository the others use as their `sdd_path` is the hub. Not done yet: packaging (where the core lives in a built app).
