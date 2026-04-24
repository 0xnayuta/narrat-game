# Event History Migration Decision Notes

## Current state
The runtime currently supports two event history storage paths:
1. **Legacy compatibility path**
   - once history in `GameState.flags`
   - cooldown history in `GameState.vars`
2. **New logical path**
   - `GameState.eventHistory`

Runtime reads prefer `eventHistory` when present and fall back to legacy keys.

## Write strategies

### `dual-write`
Writes event history to:
- `eventHistory`
- legacy flags/vars keys

Use this while:
- older saves/content/runtime assumptions still rely on legacy keys
- migration stability is still being verified
- save/load compatibility is the top priority

### `slice-only` (default)
Writes event history only to:
- `eventHistory`

Use this when:
- all runtime readers have been confirmed to use the adapter layer
- save/load roundtrip with `eventHistory` is stable
- no active code path depends directly on legacy event keys

## Recommended switch checklist
Before changing the project default from `dual-write` to `slice-only`, confirm:
1. `npm run test:events`
2. `npm run test:save`
3. `npm run test:demo-session`
4. one explicit integration test covering `slice-only` path passes
5. no remaining engine code reads `event.once.*` or `event.cooldown.*` directly outside the history adapter

## Current rollout status
1. Default has been switched to `slice-only` for the demo runtime.
2. Legacy save compatibility is preserved through adapter reads and deserialize migration.
3. `dual-write` remains available as an explicit fallback strategy if troubleshooting is needed.
4. Legacy direct reads should remain confined to migration tooling/tests only.
