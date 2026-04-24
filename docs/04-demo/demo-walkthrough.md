# Demo 手动验证路径

## 快速启动

```bash
npm run dev
# 打开浏览器 → DemoApp UI
```

## 主流程闭环（可完整手动验证）

### 步骤 1：初始状态
- 启动后默认在 `home`，无 scene text
- DebugPanel 显示当前 flags / vars / quests / time

### 步骤 2：进入 street → 触发首个事件
- 点击 `Go to street`（travelMinutes: 10）
- 触发 `evt_street_arrival`（priority=10, on-location-enter）
- 显示 `node_street_arrival`，选择一个 choice（如 `Head to market`）
  - 效果：`setFlags.demo_enabled=true`、`startQuest: quest_intro_walk`、`setQuestStep: step_go_market`
- 关闭 scene，回到 free-roam

### 步骤 3：进入 market → 触发事件 + NPC
- 点击 `Go to market`（travelMinutes: 15）
- 触发 `evt_market_plan`（after-choice from go_market）和 `evt_market_morning`（ambient）
- 显示 `node_market_morning`
- 选择 `Look around the stalls` → `advanceQuestStep(step_examine_stall)`
- 选择 `Finish the walk` → `completeQuest(quest_intro_walk)`
- NPC 区域出现 `Talk to Vendor`（条件：quest completed + vars）

### 步骤 4：与 NPC 对话 → 触发 after-choice 事件
- 点击 `Talk to Vendor`
- 选择一个对话选项
- 触发 `evt_vendor_aftermath`（after-choice）
- 关闭 scene

### 步骤 5：存档/读档
- 点击 `Save` → 显示 "Saved to demo-slot-1"
- 刷新页面 / 重新启动
- 点击 `Load` → 状态恢复，DebugPanel 显示原 flags / vars / quests

## 事件历史验证路径

### 验证 1：once 事件不再触发
1. 完成 `evt_street_arrival`（once=true）
2. 回到 street，不会再触发该事件
3. DebugPanel 的 `triggeredOnceEvents` 列出已触发事件

### 验证 2：eventHistory 条件生效
1. 完成 Drowned Lantern 链中的 `evt_customs_stairs_return_glance`
2. 满足条件时，Mira 出现 `Tell Mira about the customs stairs lower landing`（需要 eventHistory.onceTriggered.evt_customs_stairs_return_glance=true）

## 横向内容验证路径

这些路径用于手动确认近期横向补点是否出现在正确边界；它们不新增 quest step，也不改变主线闭环。

### Black Sail aftermath feedback
1. 完成 Black Sail trail，并在 sting 中走到 `node_black_sail_aftermath_report`
2. 在继续询问 ledger stub 指向哪里之前，回到 harbor 与 Mira 互动
3. 应出现 `Ask Mira what the Black Sail seizure changes`
4. 选择后进入 `node_harbor_watch_black_sail_aftermath_feedback_end`，并记录 `black_sail_aftermath_feedback_heard=true`
5. 再次与 Mira 互动时，该反馈不再抢占普通 repeat

### Drowned Lantern coal-route feedback
1. 在 Drowned Lantern 的 `step_trace_dawn_exchange` 阶段，回到 `coal_berth`
2. 触发 `evt_drowned_lantern_coal_berth_route_recap`，选择记录 coal berth → customs sheds 的路线
3. 在 45 分钟窗口内回到 harbor 与 Mira 互动
4. 应出现 `Ask Mira about the coal-berth route line`
5. 选择后记录 `drowned_lantern_coal_route_feedback_heard=true`；窗口过期或已听过后回落到普通 repeat

### Drowned Lantern exchange fallback
1. 不使用 customs stairs insight，也不使用 coal-route recap 分支
2. 在 `node_drowned_lantern_exchange_window` 选择 `Ask Mira who is most likely handling that dawn exchange`
3. 应先进入 `node_drowned_lantern_exchange_window_default_boundary`
4. 再选择 `Use the dawn-runner profile to name the most likely contact`
5. 之后进入既有 `node_drowned_lantern_contact_suspect`，后续 Drowned Lantern → Brine Lark 边界不变

## 测试命令

| 命令 | 覆盖 |
|---|---|
| `npm run test:save` | 存档 round-trip 与 eventHistory 迁移 |
| `npm run test:events` | 事件选择、历史、冷却 |
| `npm run test:demo-session` | Session 集成 |
| `npm run test:demo-flow` | 全流程（自动） |
| `npm run test:demo-branch` | 条件分支与近期内容分支 |
| `npm run test:content` | ContentBundle 基础校验 |
| `npm run test:npc-event-loop` | NPC → choice → event 闭环 |
| `npm run test:quest-effects` | Quest effects 语义 |
| `npm run test:choice-visibility` | Choice condition 过滤 |
| `npm run type-check` | TypeScript 类型 |
