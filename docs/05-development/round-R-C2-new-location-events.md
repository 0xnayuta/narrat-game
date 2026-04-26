# R-C2 — 新地点/事件扩展

**日期**: 2026-04-26
**状态**: ✅ 完成
**目标**: 按 `demo-walkthrough.md` 流程扩展内容，补充缺失的地点定义和 on-location-enter 事件，完善 Drowned Lantern 和 Brine Lark 两条 quest 链的到达体验。

---

## 执行摘要

本轮新增了 2 个地点定义、3 个 on-location-enter 事件、2 个 transit hint 节点，并将 Drowned Lantern 和 Brine Lark 的起点选择从"原地搜索"改为"travel-first"模式，使玩家在选择行动后需要前往对应地点，再触发到达事件。

**测试结果**: 全部通过（test:npc 4/4、test:npc-matcher 18/18、test:demo-flow 1/1、test:quest-effects 23/23、test:demo-branch 11/11、test:content 1/1）

---

## 变更详情

### 1. 新增地点 (`locations.ts`)

| 地点 ID | 名称 | 描述 | 耗时 | 连接 |
|--------|------|------|------|------|
| `customs_stamps_shed` | Customs Stamps Shed | 海关盖章房，位于 customs post 附近 | 10 min | harbor(10) |
| `tide_warehouse` | Tide Warehouse | 潮汐仓库，位于 customs ropeshed 之后 | 10 min | harbor(10) |

两个地点均从 harbor 出发，耗时 10 分钟，构成 harbor 腹地的延伸探索区域。

### 2. 新增事件 (`events.ts`)

#### `evt_pier_return_glance` (arrival, priority 6)
- **触发**: 玩家在完成 `evt_harbor_pier_arrival` 后重访 pier
- **条件**: `flags.pier_angle_noted == true`（玩家曾在 harbor watch 记录过 pier 的 anchor angle）
- **效果**: 激活 `node_pier_return_glance`（→ R-C1 的 NPC 交互 `harbor-watch-pier-cross-reference`）
- **意义**: R-C1 新增的 pier cross-reference NPC 交互需要此事件来设置 `eventHistory.onceTriggered` 条件，使 Mira 在玩家重访 pier 后给出差异化回应

#### `evt_customs_stamps_shed_arrival` (arrival, priority 8)
- **触发**: 玩家到达 `customs_stamps_shed` 地点
- **条件**: `questSteps.quest_drowned_lantern` 在 `step_search_customs_sheds` 或之后
- **效果**: 激活 `node_customs_stamps_shed_arrival`

#### `evt_tide_warehouse_arrival` (arrival, priority 10)
- **触发**: 玩家到达 `tide_warehouse` 地点
- **条件**: `flags.brine_lark_followup_started == true` 且 `questSteps.quest_brine_lark == "step_search_tide_warehouse"`
- **效果**: 激活 `node_tide_warehouse_arrival`

**已放弃的事件**:
- `evt_north_channel_return_glance` — 与 `evt_north_channel_arrival` 在 first visit 时竞争，会被 `once: true` 消耗掉，导致 return visit 无法触发。替代方案：让 Mira 通过 NPC 交互自然触发 north channel recap。

### 3. 新增 Transit Hint 节点

#### `node_drowned_lantern_shed_trace_hint`
- **位置**: 插入在 `node_drowned_lantern_start_point` 和 `node_drowned_lantern_shed_trace` 之间
- **文本**: "You make your way to the Customs Stamps Shed behind the customs post."
- **choices**: `[]`（无选择，直接 transit 显示）

#### `node_brine_lark_warehouse_hint`
- **位置**: 插入在 `node_brine_lark_start_point` 和 `node_brine_lark_warehouse_trace` 之间
- **文本**: "You head toward the Tide Warehouse behind the customs ropeshed."
- **choices**: `[]`

### 4. 新增叙事节点

#### `node_customs_stamps_shed_arrival` (~150 words)
到达 Customs Stamps Shed 后的场景描写：狭长干燥的房间，文件架上堆满待处理的海关表格和潮汐单据，空气中弥漫着墨水和潮湿纸张的气味。在账簿架和墙壁的缝隙间，发现一枚未归档的蜡封潮汐单据——封蜡上的 drowning-lantern 印记与 Mira 展示的一致。
- **唯一选择**: 拿走潮汐单据并检查 → `node_customs_stamps_shed_discovery`

#### `node_customs_stamps_shed_discovery` (~80 words)
潮汐单据日期为两天前，背面标注了时间和地点：customs tide stairs，黎明前。线索指向：有人将 stamps shed 用作 relay point，在早晨海关巡查前将单据从一名 runner 传给下一名。
- **唯一选择**: 将潮汐单据带回给 Mira → `node_harbor_watch_customs_sheds_recap`（R-C1 新增的 NPC recap 交互）

#### `node_tide_warehouse_arrival` (~120 words)
到达 Tide Warehouse 后的场景描写：低矮封闭的砖墙仓库，盐桶堆叠在墙边，角落里有一卷分裂的绳索。在仓库深处、货架后面的砖墙上，有人在砖面留下了粉笔痕迹——足够新鲜，边缘的灰尘位移清晰可见。痕迹与 Mira 描述的 Brine Lark relay 签名一致。
- **唯一选择**: 仔细检查痕迹和周围区域 → `node_brine_lark_warehouse_trace`

### 5. 起点选择重命名

| 原选择文本 | 新选择文本 | 新目标节点 |
|-----------|-----------|-----------|
| "Search the customs-side sheds for any trace of the contact" | "Go to the Customs Stamps Shed to continue the search" | `node_drowned_lantern_shed_trace_hint` |
| "Search the tide warehouse behind the customs ropeshed" | "Go to the Tide Warehouse to begin the search" | `node_brine_lark_warehouse_hint` |

选择效果也做了调整：
- Drowned Lantern: 移除 `advanceQuestStep` 和 `drowned_lantern_shed_trace_found` flag，改为 `startQuest` + 设置 `current_goal`
- Brine Lark: 移除 `advanceQuestStep` 和 `brine_lark_warehouse_trace_found` flag，改为只设置 `current_goal`（quest 在到达事件时自然前进）

---

## 设计决策记录

### Decision: Travel-First vs.原地搜索

**问题**: Drowned Lantern 和 Brine Lark 起点选择的文本是"搜索 X"而非"前往 X"，玩家直接跳到发现节点，绕过了 travel 系统的地点到达事件。

**选项 A**（选择）: 将起点选择改为"Go to [地点]"，增加 hint 节点显示 transit 文本，到达后触发 arrival 事件。
- **优点**: 符合游戏 travel 规范，丰富场景描写，arrival 事件可以与 quest step 条件绑定。
- **缺点**: 增加一个额外的节点层级。

**选项 B**: 保持原有选择文本，但修改 `locationIds` 让选择同时触发 travel 到 `customs_stamps_shed`。
- **优点**: 改动最小。
- **缺点**: 需要引擎支持 choice-to-travel 效果，修改范围不透明。

**Decision**: 选项 A。Narrat 引擎中 choice 本身不携带 travel 信息，最干净的方式是通过节点链（start → hint → arrival → discovery）来模拟完整的到达体验。

### Decision: 放弃 `evt_north_channel_return_glance`

**问题**: `evt_north_channel_return_glance` 的条件是 `locationIds: ["north_channel"]` 和 `eventHistory.onceTriggered: { eventId: "evt_north_channel_arrival" }`。由于 `once: true`，该事件在 first visit 时被触发并消耗，导致 return visit 无法激活。

**替代方案**: 让 Mira 通过 harbor watch 的 NPC recap 交互（`harbor-watch-north-channel-recap`）来处理 north channel 重访场景，这样不依赖事件消耗机制，更可靠。

---

## 文件变更摘要

| 文件 | 变更类型 | 变更内容 |
|------|---------|---------|
| `src/content/demo/locations.ts` | 修改 | 新增 `customs_stamps_shed` 和 `tide_warehouse` 地点；harbor connections 新增两项 |
| `src/content/demo/events.ts` | 修改 | 新增 3 个 arrival 事件 |
| `src/content/demo/narrative.ts` | 修改 | 新增 2 个 transit hint 节点、3 个 arrival/discovery 叙事节点；重写 2 个起点选择 |
| `docs/05-development/development-plan.md` | 修改 | R-C2 里程碑更新 |

---

## 测试验证

| 测试套件 | 结果 |
|---------|------|
| `test:content` | 1/1 ✅ |
| `test:npc` | 4/4 ✅ |
| `test:npc-matcher` | 18/18 ✅ |
| `test:demo-flow` | 1/1 ✅ |
| `test:quest-effects` | 23/23 ✅ |
| `test:demo-branch` | 11/11 ✅ |

---

## 下一步 (R-C3)

R-C3 目标是**内容节点横向扩展**，按 `demo-walkthrough.md` 流程补充尚未实现的叙事节点。优先考虑：
1. Black Sail 支线的独立叙事节点（当前 `node_black_sail_contact` 是唯一节点）
2. Reedway Cut Activity 的详细场景节点（当前只有 `node_brine_lark_reedway_cut_activity_boundary` 一个节点）
3. 其他 `demo-walkthrough.md` 中标注但尚未实现的节点
