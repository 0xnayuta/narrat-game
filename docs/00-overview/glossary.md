# 术语表

## 引擎核心

| 术语 | 含义 |
|---|---|
| `GameState` | 运行时全局状态，包含 flags、vars、quests、time、eventHistory 等 |
| `GameSession` | 运行时入口，管理 travel / wait / choose / NPC 交互 / 存档 |
| `ContentBundle` | 内容包格式，包含 locations / events / narrative / quests / npcs / initialFlags / initialVars |
| `NarrativeRuntime` | 叙事图执行器，负责节点导航和 choice 过滤 |
| `QuestService` | 任务服务，管理任务激活、步骤推进、完成/失败 |
| `EventSelector` | 事件候选过滤和选择器 |
| `SaveService` | 存档服务，基于 localStorage |

## 内容

| 术语 | 含义 |
|---|---|
| `NarrativeNode` | 叙事节点，包含 text、choices、nextNodeId |
| `NarrativeChoice` | 选择项，包含 conditions、effects、nextNodeId |
| `EventDefinition` | 事件定义，包含 trigger、conditions、payload（指向 narrative node） |
| `NPCInteraction` | NPC 交互规则，包含 conditions、nodeId |
| `QuestDefinition` | 任务定义，包含 stepIds（顺序列表） |

## 状态条件

| 术语 | 含义 |
|---|---|
| `StateConditions` | 运行时状态条件（flags / vars / quests / questSteps / eventHistory） |
| `EventConditions` | 事件触发条件 |
| `NPCInteractionConditions` | NPC 交互条件 |
| `eventHistory` | 事件历史记录，包含 onceTriggered、lastTriggeredAt、triggerCount |
| `shared evaluator` | `src/engine/conditions/state.ts` 中的统一条件求值器 |

## 效果

| 术语 | 含义 |
|---|---|
| `NarrativeChoiceEffects` | 选择效果，包含 setFlags / setVars / startQuest / advanceQuestStep 等 |
| `applyNarrativeChoiceEffects` | 效果应用函数，按固定顺序执行 |
| `startQuest` | 语义化任务激活（幂等：仅对 inactive/missing 生效） |

## 触发器

| 术语 | 含义 |
|---|---|
| `on-location-enter` | 进入地点时触发 |
| `after-choice` | 选择后立即触发 |
| `on-time-check` | 时间推进时触发 |
| `ambient` | 环境事件，与时间无关 |

## 存档

| 术语 | 含义 |
|---|---|
| `slice-only` | 默认写入模式：只写 eventHistory 切片，不写全局 flags/vars |
| `migration` | 存档版本迁移，将旧版本存档适配为当前 schema |
| `legacy` | 旧版存档格式，需要通过 adapter 层兼容读取 |

## 参考

| 术语 | 含义 |
|---|---|
| `DoL` | Degrees of Lewdity，项目外部参考仓库（只读） |
| `提炼` | 从 DoL 提取机制思路，不复制代码，按本项目边界独立实现 |
