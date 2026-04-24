# Agent 工作约束

本文档是 `AGENTS.md` 的摘要，完整约束见 `AGENTS.md`。

## 核心原则

1. **一次只做一个小目标**，每轮开始前先阅读相关文件并给出简短计划
2. **优先最小实现**，再逐步扩展；不要过度设计
3. **优先保持代码清晰、边界明确、类型完整、可测试**
4. **不要修改无关文件**，不要引入不必要的新依赖
5. **不要擅自提交 git commit**，除非明确要求

## 当前阶段

- 阶段 4（进行中）：事件 cooldowns / windowed history 策略
- 参考计划：`docs/dol-reference-plan.md`

## 禁止事项

1. 不要在 UI 或新核心逻辑里新增对 `event.once.*` / `event.cooldown.*` legacy key 的直接读取
2. 不要绕过 adapter 层直接扩散事件历史读写逻辑
3. 不要把规则逻辑塞进 UI 组件
4. 不要为了未来可能需求过早做插件化、通用化或大抽象
5. 不要在一次迭代里同时推进多个大专题

## Brine Lark 约束

- 不要把 Brine Lark 主链往更高治理层无限延长
- 优先横向扩展（小观察 → 轻记录 → 后续小分支）
- 详见 `docs/brine-lark-routing-index.md`

## DoL 参考约束

- 只读参考仓库（`G:\source\repos\degrees-of-lewdity`）
- 禁止直接复制源码
- 先提炼机制，再按本项目边界独立实现
- 详见 `docs/99-reference/reference-policy.md`

## 结束输出要求

每轮结束时必须给出：**下一轮建议做什么，哪个或哪些是最推荐的**。
