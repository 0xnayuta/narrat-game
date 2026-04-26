# Demo 范围与目标

## Demo 目标

"Demo 完整"不是指内容很多，而是形成**一个可重复验证的小闭环**，能真实展示引擎核心链路并暴露架构问题。

## 已验证的核心能力

| 能力 | 验证方式 |
|---|---|
| 玩家状态（flags / vars / quests / time） | UI 实时展示，196 个测试覆盖 |
| 时间推进（travel / wait） | DemoApp travel/wait 按钮 |
| 地点切换（23 个地点） | DemoApp Travel 区域 |
| NPC 交互（2 个 NPC，10 个 interactions） | DemoApp NPC 按钮 |
| 事件触发（22 个事件，4 种 trigger） | UI "Last event" 区域 + DebugPanel |
| 叙事节点执行（2564 行，120+ choices） | TextPanel + ChoiceList |
| 任务推进（4 条任务链） | HudStats + DebugPanel |
| 存档/读档 | DemoApp Save/Load 按钮 |
| 条件过滤（flags / vars / quests / questSteps / eventHistory） | ChoiceList 自动过滤 |
| 效果应用（setFlags / setVars / startQuest / advanceQuestStep / completeQuest） | 196 个测试覆盖 |

## Demo 内容范围

- **地点**：`home` → `street` → `market` → `harbor`（主路径）+ 19 个扩展地点
- **主任务**：`quest_intro_walk`（3 步）
- **扩展链**：Black Sail trail → sting（7+3 步）、Drowned Lantern（3 步）、Brine Lark（已压缩）
- **NPC**：Vendor（市场）、Mira（港口）

## 主线压缩方向

当前内容已能完整闭环，但手动体验显示剧情有重复和纵向过长的问题。后续主线整理以 `docs/04-demo/mainline-compression-plan.md` 为依据：优先讲清 Black Sail（港口走私端）→ Drowned Lantern（黎明接头 alias）→ Brine Lark（水路 runner）的三段边界，并避免继续扩展 Brine Lark 高层治理链。

## Black Sail 横向回顾点

当前 Black Sail trail 主线保持 7 步不变，横向补点用于强化中段路线理解，不新增 quest step：

- **North Channel wake pattern**：回到 `north_channel` 时触发 `evt_north_channel_return_wake_pattern`，记录 `black_sail_north_channel_wake_pattern_noted`，在 `node_harbor_watch_black_sail_tip` 解锁 north-channel-to-coal-berth recap 分支。
- **Mira fresh-wake feedback**：在 `evt_north_channel_return_wake_pattern` 触发后的短窗口内回到 Mira，可触发 `harbor-watch-north-channel-fresh-feedback`，给出面向 coal berth 搜查的短时提示。
- **Mira aftermath feedback**：`harbor-watch-black-sail-aftermath-feedback` 在 sting 解决、ledger stub 后续线索展开前提供一次 seizure pattern recap，帮助把 Black Sail 线收束到可追踪模式。

## Drowned Lantern 横向回顾点

当前 Drowned Lantern 链保持 3 步主线不变，横向补点用于强化“观察 → 记录 → 后续小分支”的内容模式，并通过结案边界节点把 Drowned Lantern 线收束到 Brine Lark 起点：

- **Customs Tide Stairs lower landing**：进入 `customs_tide_stairs` 时触发 `evt_customs_stairs_return_glance`，记录 `customs_stairs_exchange_point_noted`，可通过 Mira recap 折回 `node_drowned_lantern_exchange_window`。
- **Coal Berth route recap**：进入 `coal_berth` 时触发 `evt_drowned_lantern_coal_berth_route_recap`，记录 `drowned_lantern_coal_berth_route_noted`，在 `node_drowned_lantern_exchange_window` 解锁 route-pattern recap 分支。
- **Exchange-window default fallback**：`node_drowned_lantern_exchange_window_default_boundary` 为没有额外 observation 的普通路径补一段 dawn-runner profile 边界说明，再进入既有 contact suspect 节点。
- **Case boundary recap**：`node_drowned_lantern_case_boundary` / `node_drowned_lantern_case_boundary_from_insight` 汇总 Black Sail → Drowned Lantern → Brine Lark 的边界，不新增 quest step。
- **Mira coal-route fresh feedback**：`harbor-watch-drowned-lantern-coal-route-feedback` 使用 `eventHistory.lastTriggeredWithinMinutes.evt_drowned_lantern_coal_berth_route_recap` 给出短窗口 NPC 反馈，过期后回落到普通 repeat。

## Brine Lark 链（边界已落地）

### 当前默认路径（已实施）

按 `docs/04-demo/brine-lark-demo-boundary-plan.md` 实施：

```
Tide Warehouse
→ shift change / receiving clerk
→ ledger alcove / tag pattern
→ outer mooring / marker set
→ Customs Tide Stairs
→ waterline receiver
→ Breaker Culvert activity
→ culvert carrier
→ Reedway Cut activity
→ [boundary] node_brine_lark_reedway_cut_activity_boundary
     └── completeQuest: ["quest_brine_lark"]
→ [end] node_brine_lark_reedway_cut_activity_end (choices: [])
```

默认路径在 Reedway Cut Activity 节点分叉：
- **选择"观察 release trigger"** → 进入 boundary 节点 → 选择"结束观察" → Quest 完成
- **高层治理链**（release trigger 之后的节点）→ 保留为背景 / 历史素材，不再作为默认主线推进

### 代码现状 vs 后续目标

| 层次 | 状态 | 说明 |
|---|---|---|
| **默认路径节点** | ✅ 已在代码中落地 | Reedway Cut Activity → Boundary → Quest Complete |
| **Boundary choice** | ✅ 已有 | `complete_observation_at_reedway_cut_concealment_berth` → `completeQuest` |
| **stepIds** | ✅ 已修剪完成 | 22 步（`step_search_tide_warehouse` → `step_observe_reedway_cut_activity`） |
| **高层治理节点文本** | 📦 保留在 narrative.ts | release trigger → sluice → marsh → harbor command → ... → prime minister（不在 stepIds 中） |
| **绕过的节点** | 📦 保留在代码中 | `skiff_downstream_node`、`punt_waterway_node`、`sluice_blind_operator` 等 |

### 横向 eventHistory 回顾点

- **Breaker Culvert 返回涟漪**：进入 `breaker_culvert` 时触发 `evt_brine_lark_breaker_culvert_return_ripple`，记录 `brine_lark_culvert_rhythm_noted`，解锁 Mira 的 `harbor-watch-brine-lark-culvert-recap` 交互，回归现有 `node_brine_lark_breaker_culvert_activity`，不新增主链步骤。

### 扩展规则

- 不从高层治理链继续向上延伸
- 优先从中间稳定节点做横向扩展（小观察 → 轻记录 → 后续小分支）
- 绕过的节点和高层治理节点保留在代码中作为背景素材，只有获得独特玩法价值时才重新激活

## Demo 不包含的内容

以下为 engine 支持但 demo 暂不需要的内容：

- Objective counters（目标计数器）
- Per-step objective objects（每步目标对象）
- Quest dependency graphs（任务依赖图）
- Complex NPC relationship/affection 系统
- 日历/季节模拟

## 扩展 demo 的规则

新增内容必须沿用现有 schema，不发明新 DSL。新增地点/事件/叙事节点/任务/NPC 交互的流程见 `docs/04-demo/demo-walkthrough.md`。
