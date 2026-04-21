# Event Selection Phase B 准备：`weight` + 可注入 RNG（仅设计）

## 参考专题
在 Phase A（priority）基础上，引入同优先级下的 `weight` 决策，并保持可测试性。

## 当前已知问题
1. 当前 selector 只支持 priority 决策，不支持同 priority 的概率分流。
2. 现有随机来源若直接用 `Math.random()`，测试会不稳定。
3. `RngService` 已存在，但仍是 `Math.random()` 直连，未形成可注入策略。

## 提炼结论（不含复制代码）
1. 先按 priority 过滤出“最高优先级候选集”。
2. 仅在该候选集内做 weight 选择。
3. 权重选择必须通过可注入 RNG 完成，避免在核心选择逻辑里直接调用全局随机。
4. 对异常权重做最小容错（负数/非数值按 0 处理）。

## 与当前项目边界映射
- `src/engine/types/events.ts`
  - 后续可增加：`weight?: number`
- `src/engine/events/selector.ts`
  - 保留候选过滤职责
  - 在“同 priority 候选”分支里调用可注入随机函数
- `src/engine/rng/RngService.ts`
  - 作为默认随机来源，但 selector 接口应允许传入替代实现（测试桩）
- `tests/events-selector.test.cjs`
  - 增加 deterministic 测试（通过注入固定随机值）

## 最小接口草案（下一实现轮）
> 仅草案，不在本轮实现。

1. Selector 增加可选依赖参数（默认值保持兼容）：
   - `randomFloat?: () => number`（返回 `[0, 1)`）
2. 调用方不传时，使用默认随机实现。
3. 测试传入固定序列随机函数，稳定复现选择结果。

## 测试策略草案（重点）
1. **同 priority、不同 weight**：高 weight 在特定随机值下应被选中。
2. **同 priority、同 weight**：在固定随机值下可预测。
3. **全部 weight 缺失/为 0**：回退到稳定顺序（与 Phase A 一致）。
4. **含非法 weight（负数/NaN）**：按 0 处理，不应抛错。
5. **once 过滤优先**：被 once 排除的事件不参与 weight 计算。

## 风险与回退点
- 风险：引入随机后测试脆弱。
  - 缓解：所有 weight 测试都注入 deterministic RNG。
- 风险：权重语义不清导致内容误配。
  - 缓解：文档明确“weight 仅在同 priority 组内生效”。
- 回退点：若 Phase B 不稳定，可临时关闭 weight 分支，保持 Phase A priority-only。
