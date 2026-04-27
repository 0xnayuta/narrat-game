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
corepack enable
pnpm install
pnpm run dev:demo-ui
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
corepack enable
pnpm install
pnpm run dev
```

## 项目位置

假设项目在以下目录结构中：

```
repos/
├── narrat-game/      ← 当前项目
└── degrees-of-lewdity/ ← DoL 参考仓库（可选）
```

所有脚本使用相对路径引用。

## WSL2 / Ubuntu setup

```bash
# 假设当前在 repos/ 父目录
cd narrat-game
```

Use Node 22+ and the latest pnpm available on your machine:

```bash
cd narrat-game
nvm install
nvm use
# ensure pnpm is available (version 10+ recommended)
pnpm -v
pnpm install
pnpm run dev:demo-ui
```

Do not reuse Windows `node_modules` in WSL2. Reinstall dependencies so platform-specific packages such as Electron and Steamworks are resolved correctly.

More details: `docs/05-development/wsl2-setup.md`.

## Architecture document

Current main-path architecture is documented here:

- `docs/01-architecture/architecture-overview.md`
- `docs/01-architecture/module-boundaries.md`
- `docs/01-architecture/data-flow.md`

Read those files if you want to understand:
- which runtime path is active
- content layer vs engine layer vs app/UI layer
- what is part of the live prototype

## Useful scripts

### Development

```bash
pnpm run dev
pnpm run dev:demo-ui
```

### Type check

```bash
pnpm run type-check
```

### Tests

```bash
# run all test suites at once (recommended)
pnpm run test

# run individual test suites
pnpm run test:content
pnpm run test:demo-session
pnpm run test:demo-flow
pnpm run test:events
pnpm run test:time
pnpm run test:save
pnpm run test:npc
pnpm run test:npc-matcher
pnpm run test:narrative
pnpm run test:quest-effects
pnpm run test:npc-event-loop
pnpm run test:choice-visibility
pnpm run test:add-vars
pnpm run test:initial-vars
pnpm run test:demo-branch
```

### Build demo UI path

```bash
pnpm exec cross-env VITE_DEMO_UI=true vite build
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
