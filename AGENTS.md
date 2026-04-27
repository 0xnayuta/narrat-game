# AGENTS.md

你是一个精通 Narrat Engine 的 agent 编程助手。
目标是基于现有仓库，逐步搭建一个可持续扩展、可测试、可维护的**网页文本 RPG 新引擎原型**，并逐步构建 **DoL-like 日常循环玩法内容**。

路线：**引擎稳定化 → DoL-like 核心玩法切片 → 基于玩法层扩展内容**。

## 当前阶段

**阶段 5：DoL-like Daily Loop Vertical Slice（R-D1）**

当前默认围绕这条活跃主路径工作：

- 内容边界：`ContentBundle`（`content/daily-demo/`）
- 运行时边界：`GameSession`
- UI 边界：`DemoApp`

### 活跃内容边界

| 边界 | 内容 |
|---|---|
| 回归样本 | `content/demo/`（剧情链 demo，已冻结，不再扩展） |
| 活跃开发 | `content/daily-demo/`（DoL-like 日常循环，R-D1） |

---

## 阶段状态

### 已完成阶段

- **阶段 1**：`eventHistory` / 共享条件系统落地
- **阶段 2**：`Narrative / Quest Effect Model Stabilization`
- **阶段 3**：`DoL 参考就绪`
- **阶段 4**：事件 cooldowns / windowed history 策略

### 当前进行中

- **阶段 5**：DoL-like Daily Loop Vertical Slice
  - 详见 `docs/05-development/round-R-D1-daily-loop-slice.md`
  - 目标：weekday / dayPhase / hourly upkeep / LocationAction / NPC schedule / 完整闭环
  - 核心参考：`docs/99-reference/dol-gameplay-comparison.md`

### 后续阶段（待定）

- **阶段 E**：经济与物品（商店、消耗品、基础装备）
- **阶段 F**：玩法层内容扩展（新地点 / 新 NPC / 新事件）

---

## DoL-like Daily Loop 目标闭环

```
起床/在家
→ 查看时间/状态（weekday / dayPhase / energy / stress / fatigue / hunger / money）
→ 选择地点行动（消耗时间 + 改变状态）
→ 时间推进（applyHourlyUpkeep）
→ 随机事件触发（on-time-check）
→ NPC 根据时间/星期出现在不同地点
→ 回家休息/睡觉（advanceToNextMorning）
→ 进入第二天
```

---

## 事件系统当前状态

- Phase A：`priority` ✅
- Phase B：`weight` + 可注入 RNG ✅
- Phase C：`cooldownMinutes` + `eventHistory` 迁移路径 ✅
- Phase D：`windowed cooldown` + `triggerScopes` ✅

**默认事件历史策略**：

- 默认写入模式：`slice-only`
- `eventHistory` 是主逻辑边界
- legacy `flags/vars` 仅用于兼容读取和存档迁移

---

## 现阶段禁止事项

1. **不要**在 UI 或新核心逻辑里新增对 `event.once.*` / `event.cooldown.*` legacy key 的直接读取。
2. **不要**绕过 adapter 层直接扩散事件历史读写逻辑。
3. **不要**把规则逻辑塞进 UI 组件。
4. **不要**为了未来可能需求过早做插件化、通用化或大抽象。
5. **不要**在一次迭代里同时推进多个大专题。
6. **不要再扩 `content/demo/`**（已冻结为回归样本）。
7. **不要再扩 Brine Lark 垂直治理链**（内容已保留在代码中，不作为主路径推进）。

---

## 现阶段优先事项（R-D1）

按以下顺序推进（不要一次做多个）：

1. **扩展 time 系统**：weekday / dayPhase / hourly upkeep / advanceToNextMorning
2. **新增 LocationAction 模型**：地点 + 可执行动作 + 时间消耗 + 状态变化
3. **扩展 NPC schedule**：weekday + hour → 动态 NPC 位置
4. **新增 `content/daily-demo/` 内容包**：6-8 个地点 / 核心 stat / 地点行动 / 随机事件 / 带 schedule 的 NPC
5. **更新 GameSession.performAction**：执行行动 → 推进时间 → 应用状态 → 触发事件 → upkeep
6. **更新 DemoApp UI**：Actions 区域 / Stat bar / Sleep 按钮 / 时间/星期显示
7. 在每步前优先保持现有测试通过（`npm run test`）

**不要引入**：服装系统、战斗、NPC relationship、月份/季节、学校系统（后续专题）。

---

## 工作方式

1. 一次只做一个小目标，每轮开始前先阅读 `docs/05-development/round-R-D1-daily-loop-slice.md` 并给出简短计划。
2. 优先最小实现，再逐步扩展；不要过度设计。
3. 优先保持代码清晰、边界明确、类型完整、可测试。
4. 不要修改无关文件，不要引入不必要的新依赖。
5. 如果需求与当前结构冲突，先说明冲突，再给出最小调整方案。
6. 如需创建 TODO、占位实现或技术债标记，要明确写出。
7. 不要擅自提交 git commit，不要执行危险或不可逆操作，除非我明确要求。
8. 涉及 `content/demo/` 内容时，**只读不写**（已冻结）。
9. DoL 参考时先读 `docs/99-reference/dol-gameplay-comparison.md`，提炼机制后再实现。

---

## 架构原则

1. 保持 `content / engine / ui` 分层，UI 不承载核心规则逻辑。
2. 核心系统优先低耦合、尽量纯函数化，并通过 TypeScript 类型定义边界。
3. 对外行为先稳定，再逐步扩展能力。
4. 内容结构遵循“稳定玩法层优先，再做横向扩展”的原则。

---

## 外部参考约束

1. 外部仓库只读，禁止直接复制源码到本项目。
2. DoL 参考目录（仅用于阅读与分析）：`../degrees-of-lewdity`
3. 必须先提炼机制，再按本项目边界独立实现。
4. 参考结果不得破坏 `content / engine / ui` 分层。
5. 每次参考任务遵循 `docs/99-reference/reference-policy.md` 的最小交付模板。
6. DoL 核心机制对比参考：`docs/99-reference/dol-gameplay-comparison.md`。

---

## 结束输出要求

每轮结束时必须给出：下一轮建议做什么，哪个或哪些是你最推荐的
