# Demo Playability / Reachability Issues

## Purpose
This note tracks **player-facing playability and reachability issues** in the current demo vertical slice.

It is not a full design document.
It exists so we can:
- record where players can get confused or soft-lock
- prioritize fixes
- update issue status as we repair the demo flow

## Current status
The demo is now **structurally playable** and the Black Sail vertical slice can be completed in tests, but the manual play path is still more fragile than it should be.

The biggest remaining risks are:
- hidden or misleading content entry points
- soft-lock-like states caused by reasonable player choices
- night event triggers that are technically valid but not player-intuitive

---

## Issue list

### 1. Night harbor events require unintuitive re-entry behavior
**Priority:** High

**Problem**
Several major night beats depend on `on-time-check` events at `locationIds: ["harbor"]`.
In practice, this often means the player must leave harbor and then travel back to harbor to trigger the next beat.

Affected examples:
- `evt_harbor_night_signal`
- `evt_black_sail_stakeout`
- `evt_black_sail_contact`

**Why this is a problem**
From the player's perspective, text like "stay near the harbor after dark" suggests they should be able to remain at harbor and wait.
Requiring leave-and-return behavior feels like a system quirk rather than intended play.

**Recommended fix direction**
Prefer one of:
1. add a small `Wait` / `Pass time` / `Check harbor` action
2. trigger the next beat from content flow without requiring travel re-entry
3. only as a temporary fallback: clarify re-entry in text

**Status:** Fixed

**Update**
A generic `wait(minutes)` path was added to `GameSession`, and the demo UI now exposes a `Wait 1 hour` action.
This allows Harbor night beats to be triggered by waiting in place instead of forcing leave-and-return travel behavior.

---

### 2. Market morning path still has an easy wrong turn
**Priority:** High

**Problem**
`node_market_morning` currently offers both:
- `Check the oddities stall in the corner`
- `Look around the stalls`

The first is the current intended Black Sail entry.
The second can move the player away from the most direct route.

**Why this is a problem**
A fresh player can reasonably choose `Look around the stalls` first and then wonder why the Black Sail entry becomes unclear.

**Recommended fix direction**
Possible options:
1. make the oddities stall option more visually primary
2. ensure the Black Sail entry remains clearly accessible even after `finish_walk`
3. add an explicit follow-up choice after `node_market_done`

**Status:** Fixed

**Update**
`node_market_done` now provides an explicit recovery choice back into the oddities stall path, so choosing `Look around the stalls` no longer hides the Black Sail entry route.

---

### 3. Compass acquisition is still too central to the main route
**Priority:** High

**Problem**
The most reliable Black Sail start still strongly depends on obtaining the compass.
A player who does not buy it can still drift into a weak or confusing state.

**Why this is a problem**
Even after adding a return-to-stall loop, the branch still depends heavily on one object purchase or one alternate stat path.

**Recommended fix direction**
Possible options:
1. provide a clearer fallback lead when the player does not buy the compass
2. make stall-side information carry more of the branch entry responsibility
3. ensure low-gold / no-compass states still have a readable next step

**Status:** Fixed

**Update**
`node_vendor_stall_tip` now provides a fallback path when the player has examined the compass but not bought it. Describing the strange compass to Vendor can now activate the Black Sail lead without requiring compass ownership or high reputation.

---

### 4. Low-gold states may become future soft-locks
**Priority:** Medium-High

**Problem**
`buy_compass` requires `gold >= 15`.
Today this is usually safe because the demo starts with enough gold, but future content or tuning could easily break that assumption.

**Why this is a problem**
If gold drops below the threshold and the player also lacks the alternate route, the branch may become unclear or feel blocked.

**Recommended fix direction**
Possible options:
1. ensure a free fallback lead exists
2. provide explicit feedback for insufficient gold
3. avoid tying the main route only to successful purchase

**Status:** Fixed

**Update**
`node_stall_examined` now exposes an explicit low-gold branch when the player cannot afford the compass. That branch gives clear feedback, marks the compass as examined, and points the player back toward the Vendor fallback route instead of silently hiding the purchase path.

---

### 5. Mira repeat can be available while offering no useful action
**Priority:** Medium-High

**Problem**
`harbor-watch-repeat` now opens from:
- `harbor_watch_contacted = true`
- `quest_black_sail_trail = active`

This is structurally correct, but a player can enter the repeat scene and see no meaningful choices if they have not brought the right clue yet.

**Why this is a problem**
To a player, this can look like unfinished content or a failed trigger.

**Recommended fix direction**
Possible options:
1. add a hint-like fallback line or choice
2. rewrite the repeat text to better explain what Mira is waiting for
3. preserve the broader quest-first entry but improve the no-choice state

**Status:** Fixed

**Update**
`node_harbor_watch_repeat` now uses more explicit guidance text. When no action choices are available, Mira tells the player to bring something concrete from the tower, the piers, or the berth, so the empty state reads as intentional guidance rather than a failed trigger.

---

### 6. Vendor availability is still partially time-fragile
**Priority:** Medium

**Problem**
`vendor-first-talk` and `vendor-repeat-talk` still require `morning`.
`vendor-stall-tip` does not.

**Why this is a problem**
A player can revisit market later in the day and wrongly conclude that Vendor content disappeared or broke.

**Recommended fix direction**
Possible options:
1. loosen the time requirement for some vendor interactions
2. improve flavor text / state feedback when the vendor is effectively unavailable
3. make the stall-tip path more obviously independent from the flavor talk path

**Status:** Fixed

**Update**
The ordinary Vendor interactions are no longer restricted to `morning`, so revisiting market later in the day no longer makes the Vendor appear to disappear unexpectedly.

---

### 7. Returning to the oddities stall works, but still feels patch-like
**Priority:** Medium

**Problem**
`return_to_oddities_stall` solves the immediate reachability problem, but the transition currently feels like a recovery patch rather than a naturally authored route.

**Why this is a problem**
It is mechanically correct, but may feel abrupt or overly meta during manual play.

**Recommended fix direction**
Possible options:
1. eventually give the stall a more stable direct market entry
2. improve the wording to feel more diegetic
3. reduce dependence on the Vendor as the stall return gateway

**Status:** Open

---

### 8. Market has two overlapping oddities-stall entry paths
**Priority:** Medium

**Problem**
The branch currently has both:
- a direct content path from `node_market_morning`
- `evt_market_stall_discovery`

**Why this is a problem**
Over time, dual entry paths can drift apart and become harder to maintain.

**Recommended fix direction**
Possible options:
1. explicitly declare one path primary and the other fallback
2. later collapse them into one clearer authored route

**Status:** Open

---

### 9. Vendor branch gating is split across NPC rules and dialogue choices
**Priority:** Medium

**Problem**
Vendor behavior is currently controlled by a mix of:
- NPC interaction rules
- in-dialogue choice conditions
- flags
- `current_goal`
- quest step state

**Why this is a problem**
This is manageable now, but it increases the chance of future confusion or accidental regressions.

**Recommended fix direction**
Possible options:
1. document the intended role of each Vendor entry path
2. reduce unnecessary overlap between NPC-level gating and dialogue-level gating
3. keep one clearly primary Black Sail entry route

**Status:** Open

---

### 10. Post-completion continuation currently relies on flags without a new quest boundary
**Priority:** Medium-High

**Problem**
After `quest_black_sail_trail` completes, continuation now uses flags such as:
- `black_sail_network_confirmed`
- `black_sail_sting_prepared`
- `black_sail_stakeout_started`
- `black_sail_net_closing`

**Why this is a problem**
This is acceptable for a minimal continuation hook, but if the branch continues to grow, structure could drift back toward flag-driven flow.

**Recommended fix direction**
Possible options:
1. introduce a small follow-up quest for the stakeout / capture phase
2. or explicitly extend the current quest into a new second phase

**Status:** Open

---

## Recommended fix order
If we address these issues incrementally, the current suggested order is:

1. Night harbor events requiring leave-and-return behavior
2. Market morning wrong-turn risk
3. Compass acquisition / fallback route clarity
4. Mira repeat empty-state clarity
5. Vendor time-fragility
6. Consolidation / documentation of overlapping entry paths
7. Decide whether post-completion continuation needs a new quest boundary

---

## Update policy
When an issue is addressed, update:
- `Status`
- a short note on what changed
- whether the fix was content-only, test-only, or engine-affecting

This document should stay short and practical.
