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
- 核心回归：`test:events` 44/44、`test:demo-session` 8/8、`test:demo-flow` 1/1`

### 阶段 5：DoL-like Daily Loop Vertical Slice（进行中）
- 暂停以剧情链为中心的横向内容扩展
- 转向 DoL-like 核心玩法切片：日常循环 + 状态变化 + 地点行动 + 随机事件 + NPC/时间调度
- 详见 `docs/05-development/round-R-D1-daily-loop-slice.md`

## 当前阶段

**阶段 5：DoL-like Daily Loop Vertical Slice**

不再继续扩 Black Sail / Drowned Lantern / Brine Lark 文本密度。下一轮：R-D1。

## 已知待办（TODO 清单摘要）

| 优先级 | 问题 | 位置 |
|---|---|---|
| 高 | 缺少 weekday/dayPhase 语义（DoL-like daily loop 基础） | `src/engine/time/time.ts` |
| 高 | 缺少地点行动（LocationAction）模型 | `src/engine/types/world.ts` |
| 高 | 缺少 NPC schedule 模型 | `src/engine/types/world.ts` |
| 高 | 缺少 hourly/daily upkeep 机制 | `src/engine/time/time.ts` |
| 中 | legacy event key 仍需通过 adapter/迁移兼容 | `src/engine/types/state.ts` |
| 中 | 任务步骤仅 string stepId，无 per-step objective | `src/engine/types/quests.ts` |
| 中 | 存档 migration registry 未注册 | `src/engine/save/migration.ts` |
| 中 | RNG 未实现确定性种子 | `src/engine/rng/RngService.ts` |
| 中 | PlayerState.stats 仍为泛型 Record，无基线属性模型 | `src/engine/types/state.ts` |

完整 TODO 清单：`rg "TODO" src/ --type ts -n`（60+ 条）。

## 何时进入下一阶段

当以下任一条件满足时，评估是否进入下一阶段：

- daily loop vertical slice 完成并验证闭环
- 有新的具体业务需求驱动（不是预研）
- DoL 参考计划中列出的下一个专题有明确的实现动机

## 内容侧说明

- **当前 demo 内容**（`content/demo/`）保持不变，作为稳定回归样本
- 新玩法内容开在 `content/daily-demo/` 或独立 bundle
- 不再向 Brine Lark 高层治理链扩展
- 详见 `docs/05-development/round-R-D1-daily-loop-slice.md`
