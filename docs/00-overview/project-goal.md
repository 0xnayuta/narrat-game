# 项目目标与约束

## 目标

基于现有仓库，逐步搭建一个可持续扩展、可测试、可维护的**网页文本 RPG 新引擎原型**。

路线：**引擎级重写 + 内容逐步替换**。

"可运行 demo"的意思不是内容很多，而是已经形成一个**可重复验证的小闭环**，能够真实展示引擎的核心链路，并暴露架构问题。

## 核心约束

1. **保持 `content / engine / ui` 三层分离**
   - `engine`：核心逻辑，纯函数，TypeScript 类型定义边界
   - `content`：游戏内容（事件、地点、叙事节点、任务、NPC），JSON schema 风格
   - `ui`：前端展示层，不承载核心规则逻辑

2. **禁止事项**
   - 不要在 UI 层写核心规则逻辑
   - 不要绕过 adapter 层直接操作 legacy `flags`/`vars`
   - 不要为了未来可能的需求提前做插件化/通用化/大抽象
   - 不要在一次迭代里同时推进多个大专题

3. **外部参考**
   - DoL（`G:\source\repos\degrees-of-lewdity`）仅作定向专题参考
   - 禁止直接复制源码；先提炼机制，再按本项目边界独立实现
   - 详见 `docs/99-reference/reference-policy.md`

## 活跃主路径

| 边界 | 内容 |
|---|---|
| 内容边界 | `ContentBundle` |
| 运行时边界 | `GameSession` |
| UI 边界 | `DemoApp` |

当前阶段：基础引擎搭建 + DoL 参考就绪（见 `docs/00-overview/roadmap.md`）。
