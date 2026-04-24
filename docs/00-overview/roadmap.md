# 路线图与当前阶段

## 已完成阶段

### 阶段 1：eventHistory / 共享条件系统落地
- `eventHistory` 作为 content-rule 输入，接入 events / narrative choices / NPC interactions
- 横向内容模式（小观察 → 轻记录 → 后续小分支）已验证并迁移到 Black Sail / Drowned Lantern / Brine Lark

### 阶段 2：Narrative / Quest Effect Model Stabilization
- `startQuest` 语义修复（幂等：保留 active/completed/failed）
- 4 个 manual `setQuests` 激活全部替换为语义化的 `startQuest`
- 权威文档：`docs/conditions-effects-summary.md`

### 阶段 3：DoL 参考就绪
- 自有 engine / content / ui / tests 分层稳定
- Demo 闭环完整（阶段 2 完成）
- 参考边界控制机制就位
- 当前参考专题：`docs/dol-reference-plan.md`（事件 cooldowns / windowed history 策略）

### 阶段 4：事件 cooldowns / windowed history

- `isEventInCooldownWindow` 已接入 selector 候选过滤
- `eventHistory.triggerScopes` 已支持 per-trigger cooldown
- travel / wait / after-choice 触发路径会写入 global + trigger-scoped cooldown 历史
- 核心回归：`test:events` 44/44、`test:demo-session` 8/8、`test:demo-flow` 1/1

详见 `docs/dol-reference-plan.md`。

## 活跃阶段

当前没有新的 engine 大专题在推进。默认进入稳定化与横向内容扩展阶段。

## 已知待办（TODO 清单摘要）

| 优先级 | 问题 | 位置 |
|---|---|---|
| 中 | legacy event key 仍需通过 adapter/迁移兼容，禁止在新逻辑中扩散 | `src/engine/types/state.ts` |
| 中 | 任务步骤仅 string stepId，无 per-step objective | `src/engine/types/quests.ts:9` |
| 中 | 存档 migration registry 未注册 | `src/engine/save/migration.ts:35` |
| 中 | RNG 未实现确定性种子 | `src/engine/rng/RngService.ts:3` |

完整 TODO 清单：`rg "TODO" src/ --type ts -n`（58 条）。

## 何时进入下一阶段

当以下任一条件满足时，评估是否进入下一阶段：

- 有新的具体业务需求驱动（不是预研）
- 横向内容扩展需要新的 engine 能力，且现有规则无法满足
- DoL 参考计划中列出的下一个专题有明确的实现动机

## 内容侧说明

- **Brine Lark** 当前主链已压缩，不继续向高层治理层扩展
- 横向扩展优先：观察点 → 轻记录 → 后续小分支
- 详见 `docs/04-demo/demo-scope.md`；历史细节归档于 `docs/_archive/brine-lark/`
