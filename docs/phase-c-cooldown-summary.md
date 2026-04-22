# Phase C 完成摘要：Event Selection `cooldownMinutes`

## 目标
在 Phase B（priority + weight + RNG 注入）基础上，增加最小 cooldown 能力，并保持：
1. 过滤与决策边界清晰；
2. 默认行为兼容（未配置 cooldown 时不变）；
3. 可测试、可回归。

## 已落地结果

### 1) 类型与校验
- `EventDefinition` 增加 `cooldownMinutes?: number`。
- content bundle 校验支持 `event.cooldownMinutes` 为可选 number。
- 非法值（NaN/负数/<=0）按禁用 cooldown 处理。

### 2) 过滤顺序
候选过滤顺序更新为：
1. trigger
2. once
3. cooldown
4. conditions

说明：cooldown 只影响候选可用性，不改变 priority/weight 选择语义。

### 3) 历史记录方案（最小实现）
- 当前将 cooldown 历史记录在 `GameState.vars`：
  - `event.cooldown.<eventId>.lastTriggeredMinute`
- 触发事件后写入当前绝对分钟（day/hour/minute -> absolute minutes）。
- 新增历史工具：
  - `getEventCooldownVarKey`
  - `hasEventCooldownActive`
  - `markEventCooldownTimestamp`
- 新增逻辑边界类型与适配层：
  - `EventHistoryState`（`onceTriggeredByEventId` + `cooldownLastTriggeredMinuteByEventId`）
  - `readEventHistoryState` / `writeEventHistoryState`（当前 flags/vars 存储到逻辑历史边界的读写映射）
- C3/C4 补充：
  - `GameState` 增加可选 `eventHistory` 字段（前向兼容）
  - 运行时读取 history 时优先 `eventHistory`，缺失时回退 legacy flags/vars
  - save 反序列化支持可选 `eventHistory` 字段
- C5/C6/C7/C8 补充：
  - 新增 `migrateLegacyEventHistoryToSlice`，可把 legacy keys 投影到 `eventHistory`
  - 新增写入策略：`dual-write` / `slice-only`（当前默认）
  - runtime/session 创建入口已支持传入 `eventHistoryWriteStrategy`
  - Demo/UI 运行时 direct legacy 读取已替换为 adapter 读取

### 4) key 管理收口
为避免 key 拼接漂移，`history.ts` 新增并集中使用：
- `EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_PREFIX`
- `EVENT_COOLDOWN_LAST_TRIGGERED_MINUTE_KEY_SUFFIX`

## 测试覆盖

### selector 层
- cooldown 生效时，高优先级事件会被过滤。
- cooldown 过期后事件可再次参与选择。
- 非法 cooldown 值按禁用处理。
- once + cooldown 组合时 once 仍优先排除。

### session 集成层
- travel 流程下 cooldown 阻止短时间重复触发。
- after-choice 流程下 cooldown 阻止短时间重复触发。

### history 工具层
- key 生成稳定。
- 绝对分钟写入正确。
- cooldown 窗口边界判定正确。
- 非法历史值容错正确。

## 当前限制 / 技术债
- 当前处于过渡态：运行时已支持可选 `eventHistory`，但仍保留 legacy flags/vars 读写兼容。
- 当前仅支持“固定分钟 cooldown”，尚未支持更复杂策略（按 trigger 维度 / 多窗口 / 次数窗口）。

## 下一步建议（可选）
1. 抽象 `EventHistoryState`，把 once + cooldown 从 flags/vars 迁移出去。
2. 为 cooldown 增加可选作用域（同 trigger / 全 trigger）。
3. 若平衡需求出现，再扩展为“分钟 + 次数窗口”的组合冷却策略。
