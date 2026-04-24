# Demo 范围与目标

## Demo 目标

"Demo 完整"不是指内容很多，而是形成**一个可重复验证的小闭环**，能真实展示引擎核心链路并暴露架构问题。

## 已验证的核心能力

| 能力 | 验证方式 |
|---|---|
| 玩家状态（flags / vars / quests / time） | UI 实时展示，194 个测试覆盖 |
| 时间推进（travel / wait） | DemoApp travel/wait 按钮 |
| 地点切换（23 个地点） | DemoApp Travel 区域 |
| NPC 交互（2 个 NPC，9 个 interactions） | DemoApp NPC 按钮 |
| 事件触发（22 个事件，4 种 trigger） | UI "Last event" 区域 + DebugPanel |
| 叙事节点执行（2529 行，120+ choices） | TextPanel + ChoiceList |
| 任务推进（4 条任务链） | HudStats + DebugPanel |
| 存档/读档 | DemoApp Save/Load 按钮 |
| 条件过滤（flags / vars / quests / questSteps / eventHistory） | ChoiceList 自动过滤 |
| 效果应用（setFlags / setVars / startQuest / advanceQuestStep / completeQuest） | 194 个测试覆盖 |

## Demo 内容范围

- **地点**：`home` → `street` → `market` → `harbor`（主路径）+ 19 个扩展地点
- **主任务**：`quest_intro_walk`（3 步）
- **扩展链**：Black Sail trail → sting（7+3 步）、Drowned Lantern（3 步）、Brine Lark（已压缩）
- **NPC**：Vendor（市场）、Mira（港口）

## Black Sail 横向回顾点

当前 Black Sail trail 主线保持 7 步不变，横向补点用于强化中段路线理解，不新增 quest step：

- **North Channel wake pattern**：回到 `north_channel` 时触发 `evt_north_channel_return_wake_pattern`，记录 `black_sail_north_channel_wake_pattern_noted`，在 `node_harbor_watch_black_sail_tip` 解锁 north-channel-to-coal-berth recap 分支。
- **Mira fresh-wake feedback**：在 `evt_north_channel_return_wake_pattern` 触发后的短窗口内回到 Mira，可触发 `harbor-watch-north-channel-fresh-feedback`，给出面向 coal berth 搜查的短时提示。

## Drowned Lantern 横向回顾点

当前 Drowned Lantern 链保持 3 步主线不变，横向补点用于强化“观察 → 记录 → 后续小分支”的内容模式，并通过结案边界节点把 Drowned Lantern 线收束到 Brine Lark 起点：

- **Customs Tide Stairs lower landing**：进入 `customs_tide_stairs` 时触发 `evt_customs_stairs_return_glance`，记录 `customs_stairs_exchange_point_noted`，可通过 Mira recap 折回 `node_drowned_lantern_exchange_window`。
- **Coal Berth route recap**：进入 `coal_berth` 时触发 `evt_drowned_lantern_coal_berth_route_recap`，记录 `drowned_lantern_coal_berth_route_noted`，在 `node_drowned_lantern_exchange_window` 解锁 route-pattern recap 分支。
- **Case boundary recap**：`node_drowned_lantern_case_boundary` / `node_drowned_lantern_case_boundary_from_insight` 汇总 Black Sail → Drowned Lantern → Brine Lark 的边界，不新增 quest step。
- **Mira coal-route fresh feedback**：`harbor-watch-drowned-lantern-coal-route-feedback` 使用 `eventHistory.lastTriggeredWithinMinutes.evt_drowned_lantern_coal_berth_route_recap` 给出短窗口 NPC 反馈，过期后回落到普通 repeat。

## Brine Lark 链（已压缩）

**当前状态**：主链已从原始长链压缩到 43 步 retained 层，不再向高层治理层扩展。

### 主链保留节点（43 步）

从 `node_brine_lark_outer_marker_set` 到 `node_brine_lark_prime_minister`，分三段：

| 段落 | 节点范围 |
|---|---|
| 现场 / 转运段 | outer marker set → reaction → first reader → downstream node → Customs Tide Stairs → waterline receiver → Breaker Culvert activity → culvert carrier → Reedway Cut activity → reedway cut release trigger → inland release signal node |
| 沼泽 / 港口控制段 | Sluice Control House → sluice house controller → Marsh Control Tower → marsh warden → Harbor Signal Point → harbor coordinator → Harbor Window Office → Harbor Command → schedule master |
| 上层治理段 | Port Authority → maritime inspector → Maritime Oversight Board → oversight secretary → Maritime Ministry → maritime minister → Transport Cabinet → Executive Office → prime minister |

### 绕过的节点（代码中仍存在，不走默认链）

`skiff_downstream_node`、`punt_waterway_node`、`sluice_blind_operator`、`window_clerk`、`Harbor Master`、`coastal_command`、`coastal_commander`、`Navigation Master`、`Harbor Authority Council`、`harbor_clerk`、`Harbor Authority`、`harbor_authority_registrar`

### 横向 eventHistory 回顾点

- **Breaker Culvert 返回涟漪**：进入 `breaker_culvert` 时触发 `evt_brine_lark_breaker_culvert_return_ripple`，记录 `brine_lark_culvert_rhythm_noted`，解锁 Mira 的 `harbor-watch-brine-lark-culvert-recap` 交互，回归现有 `node_brine_lark_breaker_culvert_activity`，不新增主链步骤。

### 扩展规则

- 不从压缩后的高层治理链继续向上延伸
- 优先从中间稳定节点做横向扩展（小观察 → 轻记录 → 后续小分支）
- 绕过的节点保留在代码中作为背景素材，只有获得独特玩法价值时才重新激活

**详细状态追踪**：`docs/_archive/brine-lark/main-chain-cleanup.md`（归档，不再维护）

## Demo 不包含的内容

以下为 engine 支持但 demo 暂不需要的内容：

- Objective counters（目标计数器）
- Per-step objective objects（每步目标对象）
- Quest dependency graphs（任务依赖图）
- Complex NPC relationship/affection 系统
- 日历/季节模拟

## 扩展 demo 的规则

新增内容必须沿用现有 schema，不发明新 DSL。新增地点/事件/叙事节点/任务/NPC 交互的流程见 `docs/04-demo/demo-walkthrough.md`。
