# Event Selection Phases Summary

## Scope
This document summarizes the current implemented state of the event selection system across Phase A, Phase B, and Phase C.

## Phase A: priority-first selection
Implemented result:
- `EventDefinition.priority?: number`
- candidate filtering separated from final decision
- highest `priority` wins
- equal `priority` falls back to original content order

Stable rule:
- `priority` defaults to `0`

## Phase B: weight + RNG injection
Implemented result:
- `EventDefinition.weight?: number`
- `weight` is only evaluated inside the highest-priority candidate group
- invalid `weight` values are treated as `0`
- when effective total weight is `0`, selection falls back to stable content order
- RNG injection is supported in selector/runtime/session paths
- default runtime RNG comes from `RngService`

Stable rule:
- `weight` never allows a lower-priority event to override a higher-priority event

## Phase C: cooldown + event history migration path
Implemented result:
- `EventDefinition.cooldownMinutes?: number`
- candidate filtering order is:
  1. trigger
  2. once
  3. cooldown
  4. conditions
- cooldown history supports a new logical boundary:
  - `GameState.eventHistory`
- runtime reads prefer `eventHistory` and fall back to legacy flags/vars
- save deserialize can migrate legacy event history keys into `eventHistory`
- default event-history write strategy is now `slice-only`
- `dual-write` remains available as an explicit fallback strategy

Stable rule:
- `cooldownMinutes` only affects candidate availability; it does not change priority/weight semantics

## Current recommended mental model
For current prototype work, the safest model is:
1. filter candidates by trigger / once / cooldown / conditions
2. resolve by priority
3. resolve equal-priority ties by weight
4. persist event history primarily in `eventHistory`
5. keep legacy keys only as compatibility input, not as the main runtime contract

## Follow-up topics outside these phases
The event selection phases are now functionally complete for the current prototype scope.
Natural next topics include:
- richer event conditions
- quest/system-driven predicates
- broader narrative/effect model
- NPC/system integration that consumes event history more explicitly
