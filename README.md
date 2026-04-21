# narrat-game prototype

This repository started from a Narrat template, but it is now being reshaped into a **new web text RPG engine prototype**.

Current direction:
- keep the old Narrat path available
- build a new engine/runtime path in parallel
- gradually replace template/demo content with the new stack

## Current project status

The **active prototype path** is the demo UI/runtime flow built around:
- `ContentBundle`
- `GameSession`
- `NarrativeRuntime`
- Vue demo UI

The old Narrat template entry is still present, but it is no longer the main focus of current prototype work.

## Recommended way to run

### Prototype demo UI
This is the recommended entry for current work:

```bash
npm install
npm run dev:demo-ui
```

This runs the current prototype UI with:
- travel between locations
- time advancement
- event triggering
- narrative choices
- quest/flag/var updates
- save/load
- debug/status panel

### Original Narrat template path
If you want to run the old template path:

```bash
npm install
npm run dev
```

## Architecture document

Current main-path architecture is documented here:

- `docs/current-prototype-architecture.md`

Read that file if you want to understand:
- which runtime path is active
- content layer vs engine layer vs app/UI layer
- what is part of the live prototype
- which files are still skeleton-only

## Useful scripts

### Development

```bash
npm run dev
npm run dev:demo-ui
```

### Type check

```bash
npm run type-check
```

### Tests

```bash
npm run test:content
npm run test:demo-session
npm run test:demo-flow
npm run test:time
npm run test:save
```

### Build demo UI path

```bash
npx cross-env VITE_DEMO_UI=true vite build
```

### Existing build/package scripts
The repository still contains existing web/electron build scripts inherited from the template and previous setup.
Those remain available, but the prototype workflow currently centers on the demo UI path.

## Repository structure (current mental model)

- `src/content/`
  - demo content bundles and loaders
- `src/engine/`
  - engine runtime, state, events, narrative, save, time, world
- `src/app/`
  - app-level session wiring and demo UI entry
- `src/ui/`
  - Vue UI components for the prototype
- `tests/`
  - current automated tests
- `docs/`
  - project architecture notes

## Notes

- This is **not** a finished game.
- This is **not** yet a full replacement for Narrat.
- The current goal is to keep the prototype:
  - small
  - testable
  - structurally clear
  - easy to extend incrementally
