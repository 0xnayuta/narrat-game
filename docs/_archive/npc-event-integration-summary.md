# NPC / Quest / Event Integration Summary

## Scope
This document summarizes the NPC ↔ Quest ↔ Event closed-loop integration completed after the conditions and effects enhancements.

## Key finding
The engine already supported the NPC → choice → event closed loop:
- `GameSession.choose()` calls `runTriggeredEventFlow` with trigger `"after-choice"`
- This works regardless of whether the scene was started by travel or NPC interaction
- No engine changes were needed to enable the loop — only content and tests

## Closed loop architecture

```
Travel → Event → Narrative choice → Quest/Var/Flag changes → NPC unlocks
                                                                    ↓
After-choice event ← Narrative choice ← NPC interaction ←──────────┘
```

The loop works because:
1. Event conditions can read `vars`, `quests`, `questSteps` — so events can be gated by quest state
2. NPC conditions can read the same — so NPCs unlock when quest state changes
3. NPC choices apply effects → after-choice events can trigger → more state changes
4. This creates a natural content progression cycle

## Demo content loops

### Main loop
1. Travel to street → `evt_street_arrival` (location + flags condition)
2. Choose "Head to market" → sets `current_goal = "visit_market"`, activates quest at `step_go_market`
3. Travel to market → `evt_market_morning` (location + flags condition)
4. Choose "Look around the stalls" → completes quest, sets `current_goal = "market_visited"`
5. NPC "Talk to Vendor" unlocks (quest completed + goal + morning)
6. Choose "Ask how business is going" → sets `vendor_met`, `last_npc_spoken`
7. After-choice event `evt_vendor_aftermath` triggers (vendor_met + last_npc_spoken)

### Side loop
1. At market with active quest at `step_go_market` + `current_goal = "visit_market"` → `evt_market_stall_discovery` triggers
2. Choose "Step closer" → `advanceQuestStep` moves to `step_examine_stall`, sets `stall_discovered`
3. NPC "Ask about the oddities stall" unlocks (`requiredQuestSteps: step_examine_stall` + `stall_discovered`)
4. Choose "Thank the vendor" → sets `current_goal = "ask_about_compass"`

## Content authoring patterns

### Pattern: Event gated by quest step
```ts
conditions: {
  locationIds: ["market"],
  quests: { quest_intro_walk: "active" },
  questSteps: { quest_intro_walk: "step_go_market" },
}
```
Event only fires when the quest is active AND at a specific step.

### Pattern: NPC gated by quest step
```ts
requiredQuestSteps: { quest_intro_walk: "step_examine_stall" },
requiredFlags: { stall_discovered: true },
```
NPC interaction only available when the quest is at a specific step AND a flag is set.

### Pattern: After-choice event from NPC dialogue
```ts
// Event triggered after any choice that sets vendor_met + last_npc_spoken
{
  id: "evt_vendor_aftermath",
  trigger: "after-choice",
  conditions: {
    locationIds: ["market"],
    flags: { vendor_met: true },
    vars: { last_npc_spoken: "npc_vendor_01" },
  },
}
```
No special NPC-to-event hookup needed — the engine's after-choice flow handles it automatically.

### Pattern: Quest step advancement
```ts
// In a narrative choice:
effects: {
  advanceQuestStep: ["quest_intro_walk"],
}
```
Advances to the next step based on `QuestDefinition.stepIds` order.
Does NOT auto-complete — use `completeQuest` separately if needed.

## What does NOT work yet
1. **NPC interaction does NOT trigger on-enter events** — starting an NPC dialogue only jumps to a narrative node, it does not run event filtering at trigger `"on-npc-interact"` (no such trigger exists yet)
2. **No conversation-loop events** — after closing an NPC scene, you're back in free-roam; no automatic "on-npc-exit" event
3. **No event-triggered NPC dialogue** — events currently only start narrative scenes; an event cannot directly trigger an NPC interaction (only indirectly by setting state that gates an NPC)
4. **No NPC schedule/movement** — NPCs are static at their homeLocationId; they don't move based on time/state

## Testing
File: `tests/npc-event-loop.test.cjs`

Three integration tests covering:
1. **Full closed loop**: travel → event → quest → NPC → choice → after-choice event
2. **Once-only enforcement**: after-choice event doesn't re-trigger
3. **Quest step gating**: NPC interaction locked until quest reaches a specific step, then unlocks
