# DoL 参考计划：事件 Cooldowns / Windowed History 策略

## 1. 参考专题

**事件 cooldowns / windowed history 策略**

## 2. 当前已知问题

`src/engine/events/selector.ts` 存在以下 TODO：

```
TODO: Extend cooldown to richer policies (windowed history, per-trigger scopes).
```

**具体缺口**：

| 缺口 | 当前实现 | 理想实现 |
|---|---|---|
| 时间窗口冷却 | `hasEventCooldownActive` 只检查"冷却中/已冷却"二元状态 | 能在 N 分钟窗口内记录多次触发，用于控制事件密度 |
| 触发器作用域 | 共享全局 cooldown 命名空间 | 同一事件按不同 trigger（on-location-enter / on-time-check）可有独立冷却窗口 |
| 存档中的事件历史 | 存在 legacy `flags`/`vars` 分散存储（如 `event.once.*`、`event.cooldown.*`） | 应统一到 `eventHistory` slice，selector 按时间窗口过滤而非二元判断 |
| 事件密度控制 | 靠 `once: true`（一次性）和 `priority` 排序 | 应有"每 N 分钟最多触发 M 次"的窗口策略 |

相关 TODO：

- `src/engine/events/selector.ts:3` — "Extend cooldown to richer policies (windowed history, per-trigger scopes)"
- `src/engine/events/history.ts:3` — "TODO: Move to a dedicated event history slice if save/runtime complexity grows"
- `src/engine/types/state.ts:54` — "TODO: Move once/cooldown history fully from flags/vars into eventHistory"

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
- 修改已通过测试的 33 个事件测试
- 改变 `once: true` 语义

**做**（最小范围）：

#### Step 1：扩展 `EventHistoryState`

在 `src/engine/events/history.ts` 中扩展 `EventHistoryState`：

```typescript
// 当前 shape：
interface EventHistoryState {
  onceTriggeredByEventId: Record<string, boolean>;
  lastTriggeredAt: Record<string, number>; // timestamp
  lastTriggeredByTrigger: Record<string, string>; // trigger -> eventId
}

// 新增（最小增量）：
interface EventHistoryEntry {
  onceTriggered: boolean;
  lastTriggeredAt: number;      // timestamp (ms)
  triggerCount: number;         // 触发次数
  triggerScopes: Record<string, number>; // trigger-specific timestamps
}
```

#### Step 2：更新 `hasEventCooldownActive` 支持时间窗口

在 `src/engine/events/history.ts` 中新增：

```typescript
/**
 * 检查事件是否在 cooldown 窗口内。
 * 如果 eventDefinition.cooldownMinutes > 0：
 *   - 距上次触发不足 cooldownMinutes 分钟 → 视为冷却中
 *   - 距上次触发已超过 cooldownMinutes 分钟 → 冷却结束
 * 如果 eventDefinition.cooldownMinutes 未定义或 0：使用 legacy once 逻辑
 */
export function isEventInCooldownWindow(
  state: GameState,
  event: EventDefinition,
): boolean { /* ... */ }
```

#### Step 3：更新 `selectEvent` / `getCandidateEvents`

在 `src/engine/events/selector.ts` 中，`getCandidateEvents` 增加对 cooldown 时间窗口的检查：

- 调用 `isEventInCooldownWindow` 过滤候选事件
- `once: true` 事件走 `hasTriggeredOnceEvent`（现有逻辑不变）
- 有 `cooldownMinutes` 的事件走 `isEventInCooldownWindow`

#### Step 4：更新 `triggerEvent` 记录触发历史

在 `src/engine/runtime/GameSession.ts` 或事件触发逻辑中，更新 `EventHistoryEntry` 时同步写入 `triggerScopes`。

#### Step 5：添加测试

在 `tests/events-selector.test.cjs` 或 `tests/events-history.test.cjs` 中新增：

- cooldownMinutes 窗口内事件不入选
- cooldownMinutes 窗口外事件入选
- 不同 trigger 的 cooldown 独立计数
- 存档/读档后 cooldown 状态恢复正确

**预期文件改动**：

- `src/engine/events/history.ts` — 新增 entry shape + `isEventInCooldownWindow`
- `src/engine/events/selector.ts` — `getCandidateEvents` 增加窗口检查
- `src/engine/types/state.ts` — `EventHistoryEntry` 类型定义
- `tests/events-history.test.cjs` — 新增 5~8 个 cooldown 窗口测试
- `tests/events-selector.test.cjs` — 新增 3~5 个窗口过滤测试

## 5. 验证方式

```bash
# 现有测试不应因本次改动失败
npm run test:events          # 33 个事件测试
npm run test:demo-session    # 7 个 session 测试
npm run test:demo-flow       # 1 个 demo 流程测试
npm run test:quest-effects   # 23 个 quest 效果测试
npm run type-check           # 类型检查

# 新增测试
npm run test:events          # 窗口相关新增测试应通过
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
| 破坏现有 33 个事件测试 | 低 — 只扩展条件，不改变已有过滤逻辑 | 如果 `npm run test:events` 有失败，缩小改动范围到仅新增函数 |

**回退命令**：

```bash
git checkout -- src/engine/events/history.ts src/engine/events/selector.ts src/engine/types/state.ts
npm run test:events
```

---

## 相关文件

- `docs/reference-policy.md` — 参考策略总纲
- `docs/current-prototype-architecture.md` — 引擎架构入口
- `src/engine/events/selector.ts` — 事件选择器（待改动）
- `src/engine/events/history.ts` — 事件历史（待改动）
- `src/engine/types/state.ts` — 状态类型（待改动）
- `tests/events-history.test.cjs` — 事件历史测试（待新增）
