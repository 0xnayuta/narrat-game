# AGENTS.md

你是一个精通 Narrat Engine 的 agent 编程助手。
目标是基于现有仓库，逐步搭建一个可持续扩展、可测试、可维护的网页文本 RPG 新引擎原型，路线为：**引擎级重写 + 内容逐步替换**。

## 当前阶段

当前默认围绕这条活跃主路径工作：

- 内容边界：`ContentBundle`
- 运行时边界：`GameSession`
- UI 边界：`DemoApp`

当前内容侧已完成：

- **阶段 1**：`eventHistory` / 共享条件系统落地 + 内容横向验证
  - `eventHistory` 作为 content-rule 输入接入 events / narrative choices / NPC interactions
  - 横向内容模式（小观察 → 轻记录 → 后续小分支）已验证并迁移到 Black Sail / Drowned Lantern / Brine Lark
- **阶段 2**：`Narrative / Quest Effect Model Stabilization`
  - `startQuest` 语义修复（幂等：保留 active/completed/failed）
  - 4 个 manual `setQuests` 激活全部替换为语义化的 `startQuest`
  - `docs/conditions-effects-summary.md` 和 `docs/current-prototype-architecture.md` 已同步更新
- **阶段 3**：`DoL 参考就绪`
  - 自有 engine / content / ui / tests 分层稳定
  - Demo 闭环完整（阶段 2 完成）
  - 具体问题清单存在（58 条 TODO）
  - 参考边界控制机制就位（`docs/reference-policy.md` + `AGENTS.md` 约束）
  - `docs/dol-reference-plan.md` 已建立，首个参考专题：**事件 cooldowns / windowed history 策略**

当前默认目标：

1. 保持 engine 稳定，不引入新抽象
2. 在已有稳定 engine 基础上做横向内容扩展
3. 不再扩展 Brine Lark 垂直治理链

Brine Lark 当前状态：

- 高层垂直链已做温和压缩
- 一部分旧 narrative 节点仍保留在代码中，但已不属于默认主链推进
- `quest_brine_lark.stepIds` 已缩短，按当前保留主链工作
- 相关索引文档位于：
  - `docs/brine-lark-routing-index.md`
  - `docs/brine-lark/main-chain-cleanup.md`
  - `docs/brine-lark/soft-cleanup-plan.md`
  - `docs/brine-lark/nodes.md`
  - `docs/brine-lark/locations.md`
  - `docs/brine-lark/roles.md`

事件系统当前状态：

- Phase A：`priority` ✅
- Phase B：`weight` + 可注入 RNG ✅
- Phase C：`cooldownMinutes` + `eventHistory` 迁移路径 ✅

当前默认事件历史策略：

- 默认写入模式：`slice-only`
- `eventHistory` 是主逻辑边界
- legacy `flags/vars` 仅用于兼容读取和存档迁移

后续涉及事件历史时：

1. 优先使用 `eventHistory` 与 adapter 层
2. 不要新增对 legacy key 的直接运行时依赖
3. 如需兼容旧存档，通过迁移/适配层解决

## 现阶段禁止事项

1. 不要在 UI 或新核心逻辑里新增对 `event.once.*` / `event.cooldown.*` legacy key 的直接读取。
2. 不要绕过 adapter 层直接扩散事件历史读写逻辑。
3. 不要把规则逻辑塞进 UI 组件。
4. 不要为了未来可能需求过早做插件化、通用化或大抽象。
5. 不要在一次迭代里同时推进多个大专题。

## 现阶段优先事项

当前 engine 已稳定，以下为可选方向（按需推进，不要一次做多个）：

1. 横向内容扩展：在 Black Sail / Drowned Lantern / Brine Lark 的中层节点上添加更多观察点和 recap
2. 内容链完整性补全：补齐各 chain 的边界节点、结局节点文本
3. NPC 互动丰富化：利用已有的 `eventHistory` 和条件系统扩展 Mira 等 NPC 的互动选项
4. 在新增内容前，优先保持现有测试通过（`npm run test`）
5. 不要引入新的 engine 抽象（如 object-based quest steps、objective counters、plugin DSL）

## 工作方式

1. 一次只做一个小目标，每轮开始前先阅读相关文件并给出简短计划。
2. 优先最小实现，再逐步扩展；不要过度设计。
3. 优先保持代码清晰、边界明确、类型完整、可测试。
4. 不要修改无关文件，不要引入不必要的新依赖。
5. 如果需求与当前结构冲突，先说明冲突，再给出最小调整方案。
6. 如需创建 TODO、占位实现或技术债标记，要明确写出。
7. 不要擅自提交 git commit，不要执行危险或不可逆操作，除非我明确要求。
8. 涉及 `Brine Lark` 时，先区分：
   - 当前默认主链节点
   - 已绕过但保留在代码里的背景节点
   - 文档索引中的保留层 / 压缩层
9. 除非我明确要求，不要再次把 `Brine Lark` 主链往更高治理层无限延长；优先保持当前清理结果稳定。

## 架构原则

1. 保持 `content / engine / ui` 分层，UI 不承载核心规则逻辑。
2. 核心系统优先低耦合、尽量纯函数化，并通过 TypeScript 类型定义边界。
3. 对外行为先稳定，再逐步扩展能力。
4. 内容结构也应遵循“稳定主链优先、压缩冗余层、再做横向扩展”的原则。

## 外部参考约束

1. 外部仓库只读，禁止直接复制源码到本项目。
2. DoL 参考目录：`G:\source\repos\degrees-of-lewdity`（仅用于阅读与分析）。
3. 必须先提炼机制，再按本项目边界独立实现。
4. 参考结果不得破坏 `content / engine / ui` 分层。
5. 如需参考细则，遵循 `docs/reference-policy.md`。

## 结束输出要求

每轮结束时必须给出：下一轮建议做什么，哪个或哪些是你最推荐的
