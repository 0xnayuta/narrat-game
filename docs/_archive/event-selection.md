# Event Selection 专题提炼（阶段 3 / DoL 参考就绪）

## 参考专题
事件选择策略（从 first-hit 过渡到可控优先级模型）

## 当前已知问题
基于当前实现（`src/engine/events/selector.ts`）：

1. 选择策略固定为 `selectFirstEvent`，候选顺序依赖内容数组顺序，缺乏显式优先级。
2. `EventDefinition` 中尚无 `priority` / `weight` / `cooldown` 字段。
3. 测试仅验证“过滤 + first-hit”，还未覆盖“冲突候选如何稳定决策”。

## 参考提炼结论（不含复制代码）
> 来源：对外部 DoL 仓库进行只读机制观察；本项目不复制其实现代码。

可提炼的通用机制（与具体项目无关）：

1. **先过滤，再决策**
   - 第一步：按 trigger/conditions/once 过滤候选。
   - 第二步：在候选集合里做稳定决策（priority/weight/cooldown）。

2. **显式决策字段优于隐式数组顺序**
   - 把“谁先触发”从内容书写顺序，转移到显式字段（如 `priority`）。

3. **分阶段引入复杂度**
   - 先上 deterministic 的 `priority`（可测试、可回归）。
   - 再考虑 `weight`（随机性）与 `cooldown`（历史依赖）。

## 与当前项目边界的映射

- `engine/types/events.ts`
  - 新增最小字段：`priority?: number`

- `engine/events/selector.ts`
  - 保留 `getCandidateEvents(...)` 过滤职责
  - 新增/替换选择函数为“按 priority 决策”

- `content/demo/events.ts`
  - 可选：给 demo 事件加 priority，验证行为可读性

- `tests/events-selector.test.cjs`
  - 增加 priority 冲突场景测试

- `ui`
  - 不需要改动（UI 不承载规则逻辑）

## 本轮最小实现范围（设计草案，不落代码）

### Phase A（下一实现轮）
1. `EventDefinition` 增加 `priority?: number`（默认 0）。
2. 选择策略改为：
   - 按 priority 降序
   - 同 priority 时保持原内容顺序（稳定、可预测）
3. 保留 `selectFirstEvent`（可作为内部工具）或改名为 `selectHighestPriorityEvent`。

### Phase B（后续）
1. 增加 `weight?: number`（仅在同 priority 候选中使用）。
2. 引入最小 RNG 注入点（避免全局随机不可测）。

### Phase C（后续）
1. 增加 cooldown 字段与最近触发历史检查。
2. 与 once/history 统一为一套“事件可触发性”策略层。

## 验证方式（下一实现轮建议）

新增/更新测试（`tests/events-selector.test.cjs`）：

1. `priority` 高者优先触发。
2. 同 `priority` 时保持原顺序。
3. 未配置 `priority` 视为 0。
4. once 已触发事件仍应在过滤阶段被排除（不受 priority 影响）。

建议回归命令：

```bash
npm run test:events
npm run test:demo-flow
npm run test:demo-session
```

## 风险与回退点

- 风险：内容作者可能误以为“顺序仍然决定一切”。
  - 缓解：在类型注释/文档里明确 priority 规则。

- 风险：提前引入 weight/cooldown 会放大复杂度。
  - 缓解：严格按 Phase A -> B -> C 小步推进。

- 回退点：若 Phase A 不稳定，可临时回退到 first-hit（现有测试可快速验证）。
