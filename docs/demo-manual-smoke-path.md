# Demo Manual Smoke Path

## Purpose
This note records that the current demo vertical slice has been checked through a **manual smoke-play path** in the demo UI.

It is intentionally practical:
- confirm that the shortest intended main route is manually playable
- provide a button-by-button reference path
- support the conclusion that the current playability / reachability pass can be treated as a phase checkpoint

## Current result
Status: **Passed**

A manual run through the shortest intended Black Sail main path was completed successfully in the demo UI.

This means the current vertical slice has now been verified through:
- automated tests
- direct manual play through the demo UI

## Scope of this smoke path
This is not a full content walkthrough.
It is a short reference route used to confirm that the current mainline can be reached and completed without falling into the previously identified major playability traps.

## Manual smoke path (1–55)

### Opening
1. `Go to Street`
2. `Head to the market`
3. `Continue` (if shown)
4. `Go to Market`

### Enter the oddities stall
5. `Check the oddities stall in the corner`
6. `Step closer and examine the wares`

### Recommended shortest branch: buy the compass
7. `Buy the compass (15 gold)`
8. `Continue` (if shown)
9. `Step back from the stall`
10. `Continue`

### Trigger the Black Sail lead through Vendor
11. `Ask about the oddities stall`
12. `Show the compass you bought`
13. `Continue`

### Harbor / Mira intro
14. `Go to Harbor`
15. `Continue` (if shown)
16. `Ask for Mira at the harbor watch`
17. `Show the compass and repeat the vendor's warning`
18. `Continue`

### Signal Tower
19. `Go to Old Signal Tower`
20. `Search the lantern room`
21. `Continue`

### Report tower clue to Mira
22. `Go to Harbor`
23. `Speak with Mira again`
24. `Show Mira the oilskin scrap from the tower`
25. `Continue`

### Harbor night signal
26. `Wait 1 hour`
27. `Head for the far pier before the light disappears`
28. `Continue`

### Far Pier
29. `Go to Far Pier`
30. `Open the tin capsule`
31. `Continue`

### Report note to Mira
32. `Go to Harbor`
33. `Speak with Mira again`
34. `Show Mira the note from the tin capsule`
35. `Continue`

### North Channel
36. `Go to North Channel`
37. `Inspect the marker and the torn sailcloth`
38. `Continue`

### Report north channel clue to Mira
39. `Go to Harbor`
40. `Speak with Mira again`
41. `Describe the torn sailcloth and marked cord from the north channel`
42. `Continue`

### Coal Berth
43. `Go to Old Coal Berth`
44. `Search the berth and the customs-side crates`
45. `Continue`

### Confirm the smuggling line and prepare the sting
46. `Go to Harbor`
47. `Speak with Mira again`
48. `Show Mira the ledger scrap from the coal berth`
49. `Tell Mira you'll help watch the berth on the next tide`
50. `Continue`

### Stakeout setup
51. `Wait 1 hour`
52. `Take your place overlooking the coal berth`
53. `Continue`

### Contact / net-closing beat
54. `Wait 1 hour`
55. `Give Mira the go-ahead to close the net`

## What this confirms
The current demo slice is now manually confirmed to support:
- Black Sail branch activation
- progression through Mira and the investigation chain
- night-time continuation through waiting in place
- completion of `quest_black_sail_trail`
- post-completion continuation into stakeout setup and contact / net-closing

## Practical notes
- During manual play, if a narrative scene is active, finish that scene before using travel or wait actions.
- `Wait 1 hour` is now part of the intended Harbor night progression path.
- This smoke path reflects the **shortest intended mainline**, not every valid branch or fallback route.

## Relationship to other docs
Related notes:
- `docs/black-sail-vertical-slice-milestone.md`
- `docs/black-sail-quest-current-goal-boundary.md`
- `docs/demo-playability-issues.md`

## Status note
This record supports treating the current playability / reachability cleanup pass as a completed phase checkpoint.
