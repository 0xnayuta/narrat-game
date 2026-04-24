# Phase B 完成摘要：Event Selection `weight` + RNG 注入

## 目标
在 Phase A（priority-first）基础上，实现：
1. 同最高 priority 候选内支持 `weight` 决策。
2. 选择逻辑支持可注入 RNG，保障测试可复现。
3. 默认运行路径保持兼容，且不破坏 content / engine / ui 分层。

## 已落地结果

### 1) 类型与校验
- `EventDefinition` 增加 `weight?: number`。
- content bundle 校验允许 `event.weight` 为可选 number。

### 2) Selector 规则
- 先过滤候选（trigger / conditions / once）。
- 在候选中选择最高 `priority` 组。
- 仅在该组内按 `weight` 进行选择。
- 非法权重（负数 / NaN / 非有限值）按 `0` 处理。
- 当组内总有效权重 `<= 0` 时，回退到原内容顺序（稳定可预测）。

### 3) RNG 注入链路
- selector 接口支持传入 `randomFloat`。
- runtime / session 支持透传 `randomFloat`。
- `createGameSessionFromBundle` 提供 `CreateGameSessionOptions.randomFloat`。
- 默认 session 路径使用 `RngService.nextFloat()` 作为随机来源。

### 4) 测试覆盖
- selector 层新增 deterministic 用例：
  - 同 priority 不同 weight
  - 同 priority 同 weight
  - 全 0 权重回退
  - 非法权重容错
  - once 过滤优先
- session 层新增集成测试：
  - travel 流程下 injected RNG 影响 weighted tie-break
  - after-choice 流程下 injected RNG 影响 weighted tie-break
  - `createDemoSession` options 透传防回归

## 当前行为约定（给内容作者）
1. `priority` 决定优先级组；`weight` 不会让低优先级事件越级触发。
2. `weight` 只在同最高 priority 候选组内生效。
3. `once` 与条件过滤先执行，被过滤事件不参与权重计算。
4. 若同组权重全为 0，则按内容顺序触发。

## 与 Phase C 的衔接建议（cooldown）
下一阶段建议在不破坏现有规则的前提下新增 cooldown：
1. 在事件类型增加 cooldown 字段（最小语义先定义为“最近 N 次/分钟内不可再触发”之一）。
2. 将 cooldown 纳入“可触发性过滤”阶段（在 weight 前）。
3. 为 cooldown 补 deterministic 回归测试（含与 once、priority、weight 的组合）。
4. 保持 API 兼容：不配置 cooldown 时行为应与当前 Phase B 一致。
