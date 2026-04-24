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

## 活跃阶段

### 阶段 4（进行中）：事件 cooldowns / windowed history

**当前问题**（来自 `src/engine/events/selector.ts`）：

```
TODO: Extend cooldown to richer policies (windowed history, per-trigger scopes).
```

详见 `docs/dol-reference-plan.md`。

## 已知待办（TODO 清单摘要）

| 优先级 | 问题 | 位置 |
|---|---|---|
| 高 | 事件冷却策略偏弱（无时间窗口） | `src/engine/events/selector.ts:3` |
| 高 | once/cooldown history 分散在 flags/vars | `src/engine/types/state.ts:54` |
| 中 | 任务步骤仅 string stepId，无 per-step objective | `src/engine/types/quests.ts:9` |
| 中 | 存档 migration registry 未注册 | `src/engine/save/migration.ts:35` |
| 中 | RNG 未实现确定性种子 | `src/engine/rng/RngService.ts:3` |

完整 TODO 清单：`rg "TODO" src/ --type ts -n`（58 条）。

## 何时进入下一阶段

当以下任一条件满足时，评估是否进入下一阶段：

- 阶段 4（cooldowns）完成并通过测试
- 有新的具体业务需求驱动（不是预研）
- DoL 参考计划中列出的下一个专题有明确的实现动机

## 内容侧说明

- **Brine Lark** 当前主链已压缩，不继续向高层治理层扩展
- 横向扩展优先：观察点 → 轻记录 → 后续小分支
- 详见 `docs/brine-lark-routing-index.md`
