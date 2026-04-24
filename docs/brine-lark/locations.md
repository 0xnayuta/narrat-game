# Brine Lark — Location Index

## Active main-chain locations

### Nearshore / waterline
- `customs_tide_stairs` — Customs Tide Stairs
- `breaker_culvert` — Breaker Culvert

### Marsh / waterway
- `reedway_cut` — Reedway Cut
- `sluice_blind` — Sluice Blind
- `sluice_control_house` — Sluice Control House
- `marsh_control_tower` — Marsh Control Tower

### Harbor / district
- `harbor_signal_point` — Harbor Signal Point
- `coordinator_post` — Harbor Coordinator's Post
- `harbor_window_office` — Harbor Window Office

### Higher governance
- `maritime_ministry` — Maritime Ministry
- `transport_cabinet` — Transport Cabinet
- `executive_office` — Executive Office
- `prime_ministers_office` — Prime Minister's Office

## Horizontal eventHistory recap usage

- `breaker_culvert` also hosts `evt_brine_lark_breaker_culvert_return_ripple`, a side observation that records `brine_lark_culvert_rhythm_noted` and unlocks Mira's `harbor-watch-brine-lark-culvert-recap` interaction.
- This usage keeps `breaker_culvert` as the same retained main-chain location; it does not add a new main-chain location or governance layer.

## Background / de-emphasized locations still present in code or notes
- `coastal_command_hq` — Coastal Command HQ
- `harbor_authority_office` — Harbor Authority Office

## Reference
- See [Main Chain Cleanup](./main-chain-cleanup.md) for which locations remain foregrounded in the active ladder.
