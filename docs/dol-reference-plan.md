# DoL 参考计划：事件 Cooldowns / Windowed History 策略

## 1. 参考专题

**事件 cooldowns / windowed history 策略**

## 2. 原始问题与当前状态

本专题来自原先 `src/engine/events/selector.ts` 中关于扩展 cooldown/windowed history/per-trigger scopes 的待办。该 selector 待办已在阶段 4 中完成并移除。当前状态：

| 缺口 | 阶段 4 后状态 |
|---|---|
| 时间窗口冷却 | 已通过 `isEventInCooldownWindow` 在 selector 层过滤窗口内事件 |
| 触发器作用域 | 已通过 `eventHistory.triggerScopes["eventId:trigger"]` 支持 per-trigger cooldown |
| 存档中的事件历史 | `eventHistory` 为主逻辑边界；legacy `flags`/`vars` 仅通过 adapter/迁移兼容 |
| 事件密度控制 | 当前完成“距上次触发 N 分钟内不再入选”；“每 N 分钟最多 M 次”未引入，避免过早扩展 |

保留的相关 TODO：

- `src/engine/types/state.ts` — 仅保留 legacy 兼容边界说明；新逻辑不得直接读写 legacy event key

## 3. 提炼结论（不含复制代码）

### 3.1 DoL 的事件冷却策略

DoL **没有集中式的事件冷却系统**。冷却逻辑分散在各个场景中实现：

```
// DoL 的典型模式（分散式）：
V.docks.pub.cooldown >= 1 时不显示
每次触发时设置 cooldown 为固定值
时间推进时递减（V.docks.pub.cooldown--）
```

**提炼结论 1**：DoL 采用"分散式手动 cooldown"——每个场景自己管理一个数字倒计时。这在小型项目中可行，但扩展到大量事件时会导致冷却逻辑碎片化。

**提炼结论 2**：DoL 的 `eventpool` 是加权随机选择器（weight-based），没有内置的时间窗口或频率限制。事件的"不再出现"完全靠内容作者在场景逻辑中手动处理。

**提炼结论 3**：DoL 的 `once` 语义是"这个事件触发过就不再出现"，没有"每 N 分钟/小时最多出现一次"的窗口概念。

### 3.2 DoL 的存档版本策略（用于 windowed history 的存档设计参考）

DoL `save.js` 的版本策略：

```
版本格式：major * 1,000,000 + minor * 10,000 + patch * 100 + 0
加载时：parseVersion(current) >= parseVersion(save) → 正常加载
加载时：current < save → 提示兼容性确认
saveVersions 数组记录所有历史版本（last() 取最新）
```

**提炼结论 4**：DoL 用"当前版本 vs 保存版本"的前向兼容性检查。版本号是单调递增的整数，不存在后向迁移。

**提炼结论 5**：存档元数据（metadata）与存档数据分离存储（`dolSaveDetails` key 存 localStorage），md5 签名用于铁人模式防篡改。

### 3.3 对本项目的设计映射

| DoL 提炼 | 映射到本项目 | 说明 |
|---|---|---|
| 分散式手动 cooldown | 统一到 `EventHistory` slice | 每个事件记录 `{ lastTriggered: timestamp, triggerCount: number }` |
| 场景内手动递减 | 由 `selector.ts` 在 `selectEvent` 时统一计算时间窗口 | 不需要分散在各 content 逻辑里 |
| 无时间窗口 | 引入 `cooldownMinutes` 作为选择时的过滤条件之一 | `cooldownMinutes: 60` = 距上次触发不足 60 分钟则不入选 |
| 无 per-trigger 作用域 | `eventHistory` key 包含 `trigger` 字段 | `on-location-enter:evt_xxx` 和 `on-time-check:evt_xxx` 独立冷却 |
| save 版本检查 | `SaveService` 已有 version 字段 | 下一步：注册前向迁移 registry |

**核心设计原则**：不要把 DoL 的"分散式手动"风格引进来。要把 DoL 的"在内容层面处理冷却"思路，转化为"在 engine selector 层面统一处理"。

## 4. 本轮最小实现范围

### 目标：引入事件时间窗口冷却策略

**不做**：
- 重写整个事件系统
- 改变 `eventHistory` 的基本 shape
- 破坏已通过的事件测试（当前为 44 个）
- 改变 `once: true` 语义

**做**（最小范围）：

#### Step 1：扩展 `EventHistoryState` ✅（已完成）

实际落地在 `src/engine/types/events.ts`：

```typescript
interface EventHistoryState {
  onceTriggeredByEventId: Record<string, boolean>;
  cooldownLastTriggeredMinuteByEventId: Record<string, number>;
  triggerScopes: Record<string, number>; // "eventId:trigger" -> absolute minute
}
```

未引入 object-based history entry 或 trigger count，保持当前 shape 最小增量。

#### Step 2：新增 `isEventInCooldownWindow` 支持时间窗口 ✅（已完成）

已在 `src/engine/events/history.ts` 中新增：

```typescript
export function isEventInCooldownWindow(
  state: GameState,
  event: EventDefinition,
): boolean { /* ... */ }
```

语义：

- `cooldownMinutes <= 0`：不在冷却窗口内
- 优先读取 `triggerScopes["eventId:trigger"]`
- 缺少 trigger-scope 时回退 `cooldownLastTriggeredMinuteByEventId[event.id]`
- 距上次触发不足 `cooldownMinutes` 分钟时视为冷却中
- `once: true` 仍由 `hasTriggeredOnceEvent` 独立处理

#### Step 3：更新 `selectEvent` / `getCandidateEvents`

在 `src/engine/events/selector.ts` 中，`getCandidateEvents` 增加对 cooldown 时间窗口的检查：

- 调用 `isEventInCooldownWindow` 过滤候选事件
- `once: true` 事件走 `hasTriggeredOnceEvent`（现有逻辑不变）
- 有 `cooldownMinutes` 的事件走 `isEventInCooldownWindow`

#### Step 4：更新 `triggerEvent` 记录触发历史 ✅（已完成）

当前事件触发记录逻辑由 `src/engine/runtime/travelEventFlow.ts` 的 `runTriggeredEventFlow` 承载：触发事件后会调用 `markEventTriggered` 与 `markEventCooldownTimestamp`。

`markEventCooldownTimestamp` 已同步写入：

- global cooldown：`cooldownLastTriggeredMinuteByEventId[event.id]`
- trigger-scoped cooldown：`triggerScopes["eventId:trigger"]`

#### Step 5：添加测试 ✅（已完成）

已在 `tests/events-history.test.cjs`、`tests/events-selector.test.cjs`、`tests/demo-session.test.cjs` 完成覆盖：

- [x] cooldownMinutes 窗口内事件不入选
- [x] cooldownMinutes 窗口外事件入选
- [x] 不同 trigger 的 cooldown 独立计数
- [x] restoreState 后 cooldown 状态恢复正确（集成路径）

**实际文件改动**：

- `src/engine/types/events.ts` — 扩展 `EventHistoryState.triggerScopes` 与 `cooldownMinutes` 注释语义
- `src/engine/events/history.ts` — 新增 `getTriggerScopeKey`、`isEventInCooldownWindow`，并让 cooldown 写入 global + trigger-scoped 历史
- `src/engine/events/selector.ts` — `getCandidateEvents` 使用 `isEventInCooldownWindow` 过滤窗口内事件
- `src/engine/events/index.ts` — 导出新增事件历史 helper
- `src/engine/state/GameState.ts` — clone `eventHistory.triggerScopes`
- `src/engine/runtime/travelEventFlow.ts` — 现有 `runTriggeredEventFlow` 调用链负责触发后历史写入（未新增文件级结构）
- `tests/events-history.test.cjs` — 新增 cooldown 窗口与 per-trigger 历史测试
- `tests/events-selector.test.cjs` — 新增 selector 窗口过滤与 trigger 独立性测试
- `tests/demo-session.test.cjs` — 新增 restoreState 后 cooldown 窗口集成测试
- `tests/save-roundtrip.test.cjs` — 同步 `eventHistory.triggerScopes` 预期

## 5. 验证方式

```bash
# 现有测试不应因本次改动失败
npm run test:events          # 44 个事件测试
npm run test:demo-session    # 8 个 session 测试
npm run test:demo-flow       # 1 个 demo 流程测试
npm run test:quest-effects   # 23 个 quest 效果测试
npm run type-check           # 类型检查

# 新增测试
npm run test:events          # 44/44，通过窗口相关新增测试
```

**手动验证路径**：

1. 启动 `npm run dev`
2. 前往 harbor，触发一个带 `cooldownMinutes: 60` 的事件
3. 立即再前往，事件不应触发
4. 等待/推进 60 分钟后再前往，事件应重新可选

## 6. 风险与回退点

| 风险 | 影响 | 回退点 |
|---|---|---|
| 修改 `EventHistoryState` shape 可能破坏存档兼容性 | 低 — 新增字段对旧存档是可选的，不会破坏 load | 如果 `npm run test:save` 失败，回退 history.ts 改动 |
| `selectEvent` 性能下降（新增时间计算） | 极低 — 纯数学计算，O(1) | 如果性能测试发现问题，在 `getCandidateEvents` 加 early return |
| 影响现有 `once: true` 语义 | 低 — `once` 走独立路径，不走 cooldown | 如果测试失败，确认 `once` 和 `cooldownMinutes` 互斥 |
| 破坏现有 44 个事件测试 | 低 — 只扩展条件，不改变已有过滤逻辑 | 如果 `npm run test:events` 有失败，缩小改动范围到仅新增函数 |

**回退命令**：

```bash
git checkout -- src/engine/events/history.ts src/engine/events/selector.ts src/engine/types/state.ts
npm run test:events
```

---

## 相关文件

- `docs/99-reference/reference-policy.md` — 参考策略总纲
- `docs/01-architecture/architecture-overview.md` — 当前架构入口
- `src/engine/events/selector.ts` — 事件选择器（已接入窗口过滤）
- `src/engine/events/history.ts` — 事件历史 adapter 与 cooldown helper
- `src/engine/types/events.ts` — `EventHistoryState` 类型定义
- `tests/events-history.test.cjs` — 事件历史与 cooldown 窗口测试
- `tests/events-selector.test.cjs` — selector 窗口过滤测试
- `tests/demo-session.test.cjs` — restoreState 集成测试
