# Excalibur desktop (prototype)

A desktop app for the same things the CLI does, starting with the user profile and the list of projects. This is a **prototype**: every screen runs on sample data (`src/renderer/shared/api/mock.ts`) and nothing reads or writes the user's files yet.

It is not part of the published npm package (`files` in the root `package.json` leaves it out) and has its own dependencies.

```bash
cd packages/desktop
npm install
npm run dev        # open the app with hot reload
npm run typecheck
npm run build
```

## Layout

Folders are organized by feature.

```text
src/
  main/               Electron main process: the window
  preload/            the typed bridge the screen may use
  shared/             contract (types and zod schemas) used by both sides
  renderer/
    app/              router, providers, shell and sidebar
    features/<name>/  one folder per feature: pages, dialogs, hooks
    shared/           ui kit, api, state, styles, helpers
```

## Rules of the road

- The screen has no Node or disk access. Everything will go through the preload bridge, validated on the main side.
- Data reaches the screen only through `renderer/shared/api`. Replace the mock there with the bridge; the screens do not change.
- Icons come only from `renderer/shared/ui/icons.ts`, so the icon library can be swapped in one place.
- Colors, radii and fonts are tokens in `renderer/shared/styles/index.css`. The current values are placeholders until the visual identity is decided.
