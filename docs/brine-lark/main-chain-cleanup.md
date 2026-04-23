# Brine Lark — Main Chain Cleanup (Current State)

This document defines the **current retained main chain actually used by code-facing progression** after the completed compression passes.

Status:
- old nodes still exist in `narrative.ts`
- some old quest steps still exist historically in content discussions, but the active `quest_brine_lark.stepIds` has already been shortened
- the default playable ladder should follow the retained chain below

## 1. Retained main chain

```text
outer marker set
→ outer marker reaction
→ outer marker first reader
→ outer marker downstream node
→ Customs Tide Stairs
→ waterline receiver
→ Breaker Culvert activity
→ culvert carrier
→ Reedway Cut activity
→ reedway cut release trigger
→ inland release signal node
→ Sluice Control House / sluice control node
→ sluice house controller
→ Marsh Control Tower / marsh control node
→ marsh warden
→ Harbor Signal Point / harbor coordinator
→ Harbor Window Office / harbor authority node
→ Harbor Command / schedule master
→ Port Authority / maritime inspector
→ Maritime Oversight Board / oversight secretary
→ Maritime Ministry / maritime minister
→ Transport Cabinet
→ Executive Office / prime minister
```

## 2. Core retained layers

### Field / transfer path
- `outer marker set`
- `outer marker reaction`
- `outer marker first reader`
- `outer marker downstream node`
- `Customs Tide Stairs`
- `waterline receiver`
- `Breaker Culvert activity`
- `culvert carrier`
- `reedway cut activity`
- `reedway cut release trigger`
- `inland release signal node`

### Marsh / harbor control path
- `sluice control node`
- `sluice house controller`
- `marsh control node`
- `marsh warden`
- `Harbor Signal Point`
- `harbor coordinator`
- `harbor authority node` (`Harbor Window Office` in fiction)
- `Harbor Command`
- `schedule master`

### Upper governance path
- `Port Authority`
- `maritime inspector`
- `Maritime Oversight Board`
- `oversight secretary`
- `Maritime Ministry`
- `maritime minister`
- `Transport Cabinet`
- `Executive Office`
- `prime minister`

## 3. De-emphasized / bypassed layers

These still exist in code or history, but are no longer part of the default main-chain climb.

### Bypassed in the current default narrative path
- `skiff downstream node`
- `punt waterway node`
- `sluice blind operator`
- `window clerk`
- `Harbor Master`
- `coastal command`
- `coastal commander`
- `Navigation Master`
- `Harbor Authority Council`
- `harbor clerk`
- `Harbor Authority`
- `harbor authority registrar`

### Still present but retained as anchor points
These remain in the active chain and should not currently be treated as removed:
- `reedway cut activity`
- `inland release signal node`
- `sluice control node`
- `marsh control node`
- `harbor authority node`

## 4. Practical rule for future writing

1. Extend sideways from retained middle nodes first.
2. Treat bypassed layers as optional background unless a new feature requires them.
3. Do not add new upper governance layers by default.
4. If a compressed layer is re-promoted, it should introduce distinct gameplay, NPC logic, or event logic.
