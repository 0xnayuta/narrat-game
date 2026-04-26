# R-C1: NPC 互动深度扩展

**状态**: ✅ 完成
**完成时间**: 2026-04-26
**目标**: 为 Mira 添加 3-5 个基于 eventHistory 的新鲜反馈交互

---

## 背景

Mira（`npc_harbor_watch_01`）是 Harbor 地点的常驻 NPC，支持多个 NPC interaction rules 组成的条件分支系统。

分析发现：
- **已有 recap 机制**：Mira 已经有一套基于 `eventHistory.onceTriggered` 和 `lastTriggeredWithinMinutes` 的 recap 反馈节点（coal berth route feedback、customs stairs recap、north channel feedback）
- **缺少数个关键交叉反馈**：玩家带着不同地点的发现返回港口时，Mira 没有关联性回应

---

## 新增交互

### 1. `harbor-watch-pier-cross-reference`

**标签**: Ask Mira what the pier message angle implies for the harbor

**触发条件**:
- `harbor_watch_contacted: true`
- `pier_angle_noted: true`
- `quest_black_sail_trail: step_follow_pier_signal`
- `eventHistory.onceTriggered.evt_pier_arrival: true`

**叙事节点**: `node_harbor_watch_pier_cross_reference`

Mira 解读 pier 信息的角度解读：消息角度指向 harbor 盲侧的水边操作者，而非码头。缩小了嫌疑人范围。

**Choices**:
- `ask_mira_which_runnerts_read_that_angle` → 推进 `quest_black_sail_trail`

---

### 2. `harbor-watch-signal-tower-return-recap`

**标签**: Return to Mira after searching the signal tower

**触发条件**:
- `harbor_watch_contacted: true`
- `signal_tower_clue_found: true`
- `quest_black_sail_trail: step_search_signal_tower`
- `eventHistory.onceTriggered.evt_signal_tower_return_approach: true`

**叙事节点**: `node_harbor_watch_signal_tower_return_recap`

Mira 解读 oilskin 双层密码：外环是标准 harbor signal，内环是另一个消息。玩家返回港口后，Mira 给出更深入的解读而非重复首次见面时的内容。

**Choices**:
- `report_tower_oilskin_to_mira` → 推进 `quest_black_sail_trail`

---

### 3. `harbor-watch-stakeout-failure-recap`

**标签**: Tell Mira the stakeout did not produce a capture

**触发条件**:
- `harbor_watch_contacted: true`
- `stakeout_attempted: true`
- `black_sail_courier_captured: false`
- `stakeout_failure_feedback_heard: false`
- `quest_black_sail_sting: step_hold_stakeout`

**叙事节点**: `node_harbor_watch_stakeout_failure_recap`

Mira 解读 stakeout 失败的意义：如果路线是热的，Black Sail 会移动；没出现说明他们知道被监视。需要换一个角度——不是 berth 本身，而是 berth 前后的环节。

**Choices**:
- `ask_mira_for_a_different_approach_to_black_sail` → 重回 `node_harbor_watch_night_tip`，改变叙事节奏

---

### 4. `harbor-watch-customs-sheds-recap`

**标签**: Tell Mira about the customs sheds tide slip

**触发条件**:
- `harbor_watch_contacted: true`
- `drowned_lantern_tide_slip_found: true`
- `drowned_lantern_sheds_feedback_heard: false`
- `quest_drowned_lantern: step_search_customs_sheds`
- `eventHistory.onceTriggered.evt_drowned_lantern_coal_berth_route_recap: false` — 排除已听过 coal berth route recap 的情况

**叙事节点**: `node_harbor_watch_customs_sheds_recap`

Mira 确认 Drowned Lantern tide slip 的意义：这是 Drowned Lantern contact 的第一块实证。Sheds 被用作黎明前 paper handover 的干燥中继点。

**Choices**:
- `ask_mira_where_to_watch_for_the_dawn_exchange` → 推进 `quest_drowned_lantern`

---

### 5. `harbor-watch-coal-berth-cross-reference`

**标签**: Tell Mira the coal berth confirms the north-channel pattern

**触发条件**:
- `harbor_watch_contacted: true`
- `coal_berth_clue_found: true`
- `black_sail_north_channel_wake_pattern_noted: true`
- `drowned_lantern_coal_route_feedback_heard: true`
- `coal_berth_cross_reference_heard: false`
- `quest_drowned_lantern: step_identify_drowned_lantern_contact`

**叙事节点**: `node_harbor_watch_coal_berth_cross_reference`

Mira 将 north-channel angle 和 coal berth landing 两个证据关联：Black Sail 用 berth 作为 transfer point 而非 storage point。Rope 和 soot 是证据。

**Choices**:
- `close_the_coal_berth_cross_reference` → 进入 `node_drowned_lantern_contact_suspect`

---

## 实现细节

### 文件变更

| 文件 | 变更类型 | 说明 |
|------|---------|------|
| `src/content/demo/npcs.ts` | 修改 | 新增 5 个 NPC interaction rules |
| `src/content/demo/narrative.ts` | 修改 | 新增 5 个叙事节点 |
| `docs/05-development/round-R-C1-npc-interaction-deepening.md` | 新建 | 本文档 |

### Flag 管理

| Flag | 用途 |
|------|------|
| `pier_angle_noted` | pier angle insight 已记录（触发 cross-reference） |
| `pier_angle_cross_referenced` | 已完成 pier-Mira 交叉对话 |
| `signal_tower_clue_found` | tower oilskin 已找到 |
| `stakeout_attempted` | stakeout 已尝试（不管结果） |
| `stakeout_failure_feedback_heard` | stakeout 失败反馈已听 |
| `drowned_lantern_tide_slip_found` | customs sheds tide slip 已找到 |
| `drowned_lantern_sheds_feedback_heard` | sheds 反馈已听 |
| `coal_berth_cross_reference_heard` | coal berth 交叉引用已听 |

### eventHistory 条件使用

| 交互 | eventHistory 条件 | 作用 |
|------|----------------|------|
| pier cross-reference | `onceTriggered.evt_pier_arrival: true` | 确保玩家确实去过 pier |
| signal tower return recap | `onceTriggered.evt_signal_tower_return_approach: true` | 确保玩家是"返回"tower 而非首次探索 |
| customs sheds recap | `onceTriggered.evt_drowned_lantern_coal_berth_route_recap: false` | 排除听过 coal berth recap 的情况，避免重复 |

### 测试覆盖

所有相关测试套件通过：
- `test:npc` — 4/4 ✅
- `test:npc-matcher` — 18/18 ✅
- `test:demo-flow` — 1/1 ✅
- `test:content` — 1/1 ✅
- `test:demo-branch` — 11/11 ✅
- `test:quest-effects` — 23/23 ✅

---

## 与已有交互的关系

已有交互（按优先级）:
1. `harbor-watch-intro` — 首次见面
2. `harbor-watch-black-sail-aftermath-feedback` — Black Sail 捕获后反馈
3. `harbor-watch-drowned-lantern-coal-route-feedback` — Coal berth route recap（基于 lastTriggeredWithinMinutes）
4. `harbor-watch-customs-stairs-recap` — Customs stairs recap（基于 eventHistory）
5. `harbor-watch-brine-lark-culvert-recap` — Culvert rhythm recap（基于 eventHistory）
6. `harbor-watch-north-channel-fresh-feedback` — North channel fresh feedback（基于 lastTriggeredWithinMinutes）
7. **新增**: `harbor-watch-pier-cross-reference` — pier 交叉引用
8. **新增**: `harbor-watch-signal-tower-return-recap` — tower 返回 recap
9. **新增**: `harbor-watch-stakeout-failure-recap` — 失败重访
10. **新增**: `harbor-watch-customs-sheds-recap` — sheds 首次反馈
11. **新增**: `harbor-watch-coal-berth-cross-reference` — coal berth 交叉引用
12. `harbor-watch-repeat` — 兜底重复对话

---

## 限制与注意事项

1. **`stakeout_attempted` flag**：需要在 `evt_black_sail_stakeout` 事件或相关 choice effects 中设置。当前 Demo 内容中如果该 flag 未被设置，此交互不会触发。
2. **`pier_angle_noted` flag**：需要地点事件 `evt_pier_arrival` 触发时设置。
3. **eventHistory 依赖**：所有 eventHistory 条件依赖对应事件已被 `markEventTriggered` 调用，确保事件 `once: true` 配置正确。
