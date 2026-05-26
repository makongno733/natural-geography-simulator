# Claude Project Guide

This project is a Chinese natural geography teaching app built with Vue 3, Vite, Three.js, and Electron. It currently contains two main views:

- `#/atmosphere`: atmospheric structure teaching module.
- `#/sandbox`: 3D geomorphology sandbox, currently centered on fluvial landforms.

## Development Commands

Use `pnpm` for package management.

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
pnpm build:standalone
pnpm electron:dev
pnpm electron:start
pnpm electron:dist:mac
pnpm electron:dist:win
```

The local development and preview server uses:

```text
http://127.0.0.1:4173
```

## Project Structure

- `src/App.vue`: hash-based view switcher between atmosphere and sandbox modules.
- `src/AtmosphereView.vue`: atmosphere teaching experience.
- `src/lib/atmosphereScene.js`: Three.js scene logic for the atmosphere module.
- `src/lib/terrainScene.js`: Three.js terrain and fluvial scene logic.
- `src/sandbox/`: modular geomorphology sandbox UI and module system.
- `src/sandbox/engine/SceneEngine.js`: adapter around the terrain scene API.
- `src/sandbox/modules/`: geomorphology module registry and module definitions.
- `electron/`: Electron main process and preload files.
- `scripts/`: development, packaging, and standalone build helpers.
- `docs/superpowers/`: product specs and implementation plans.

## Implementation Notes

- Keep the user-facing UI in Chinese unless the surrounding file clearly uses another language.
- Prefer existing Vue single-file component patterns and the current plain CSS approach.
- Keep Three.js scene changes contained to `src/lib/*Scene.js` or the sandbox engine layer unless a UI change is required.
- Do not open generated HTML files directly as the normal development path; use the Vite server.
- The app uses `base: './'` so built assets continue to work in packaged Electron and standalone contexts.
- Be careful with released artifacts under `release/` and generated outputs under `dist/` or `electron-release/`; avoid editing them unless the task is specifically about packaging output.

## Verification

For normal web changes:

```bash
pnpm build
pnpm dev
```

Then check `http://127.0.0.1:4173/#/atmosphere` and `http://127.0.0.1:4173/#/sandbox`.

For Electron changes:

```bash
pnpm electron:dev
```

For packaging changes, run the relevant packaging command only after a successful build.

## Coding Style

- Use concise, direct code and avoid broad refactors unrelated to the requested task.
- Preserve existing educational tone, visual style, and Chinese terminology.
- Add comments only where they explain non-obvious scene math, simulation logic, or packaging behavior.
- Do not revert unrelated local changes.
