# R-D1：DoL-like Daily Loop Vertical Slice

## 目标

在 Engine 稳定的基础上，做一条最小可玩的 DoL-like 核心循环：

> 日常循环 + 状态变化 + 地点行动 + 随机事件 + NPC/时间调度

**不是**：继续扩 Black Sail / Drowned Lantern / Brine Lark 的剧情节点密度。
**是**：引入 DoL 的日常玩法基础，让玩家真正能在世界里"过日子"。

---

## 当前 Engine 缺口分析（提炼）

以下均来自 `../degrees-of-lewdity` 只读参考，提炼机制后按本项目边界实现。

### 缺口 1：时间语义不足
DoL 有 weekday / dayPhase / schoolTerm / season / moonPhase；当前只有 day/hour/minute。
DoL 的 `Time.pass(seconds)` 在时间推进时触发 secondPassed / minutePassed / hourPassed / dayPassed 等 hooks。
**提炼**：当前项目需要最小加 weekday、dayPhase、hourly upkeep hook。

### 缺口 2：地点只有连接图，没有"行动"
DoL 地点不是静态地图节点，而是玩家可以"做事情"的地方。
**提炼**：需要 `LocationActionDefinition` 模型——地点 + 可执行动作 + 时间消耗 + 状态变化。

### 缺口 3：NPC 无 schedule
DoL named NPC 根据 weekday + hour + story state 在不同地点之间移动。
**提炼**：需要 NPC `schedule` 字段，根据时间/星期动态出现在不同地点。

### 缺口 4：玩家状态模型太薄
DoL 有控制感/压力/创伤/体力/体质/意志力/美丽/纯洁/犯罪/声望等具体状态。
当前 `player.stats` 是泛型 `Record<string, number>`，没有基线语义。
**提炼**：先固定一组核心 stat（见下方实现范围），不做大重构。

### 缺口 5：缺少 upkeep / daily reset
DoL 有 sleep / nextDay 机制，时间推进时应用 stat 变化（饥饿、疲劳、金钱变化等）。
**提炼**：需要 `applyHourlyUpkeep` 和 `advanceToNextMorning` 机制。

---

## 最小实现范围

### 目标：一条可闭环的 daily loop

```
起床/在家
→ 查看时间/状态
→ 选择地点行动（消耗时间 + 改变状态）
→ 时间推进（可能触发随机事件）
→ NPC 根据时间出现在不同地点
→ 状态变化（+钱/-体力/+压力等）
→ 回家休息/睡觉
→ 进入第二天
```

### Step 1：扩展 time 系统（`src/engine/time/time.ts`）

**新增**：
- `getWeekday(time: TimeState): number`（1=周日，7=周六）
- `getDayPhase(time: TimeState): "dawn" | "morning" | "afternoon" | "evening" | "night"`
- `advanceToNextMorning(state: GameState): GameState`（睡眠后进入新一天）
- `applyHourlyUpkeep(state: GameState, elapsedMinutes: number): GameState`（每小时状态衰减/恢复）

**DayPhase 建议**：
- dawn: 5-7
- morning: 7-12
- afternoon: 12-17
- evening: 17-21
- night: 21-5

**hourly upkeep 最小逻辑**：
- 每经过 60 分钟，hunger 小幅增加
- 长时间不睡眠，fatigue 累积
- 特定地点可能有 upkeep 减免/加成

**不做**：月份、季节、学校学期、月相、假期——这些是后续专题。

### Step 2：新增 LocationAction 模型

**新增类型**（`src/engine/types/world.ts`）：

```ts
interface LocationActionDefinition {
  id: string;
  label: string;
  description?: string;
  /** 所在地点 */
  locationId: string;
  /** 消耗时间（分钟） */
  durationMinutes: number;
  /** 执行前提条件 */
  conditions?: NPCInteractionConditions; // 复用现有条件类型
  /** 执行后的状态变化 */
  effects?: {
    addStats?: Record<string, number>;
    addVars?: Record<string, number>;
    setFlags?: Record<string, boolean>;
    setVars?: Record<string, string | number | boolean>;
    /** 触发事件 ID */
    triggerEventId?: string;
  };
}
```

**LocationService 扩展**：
- 新增 `getAvailableActions(state: GameState): LocationActionDefinition[]`
- 根据 `locationId` 和 `conditions` 过滤可用行动
- `performAction(state, actionId): SessionActionResult`

**GameSession 扩展**：
- 新增 `performAction(actionId: string): SessionActionResult`
- 执行行动 → 推进时间 → 应用状态变化 → 触发事件 → 触发 upkeep

**不做**：
- 复杂消耗品/装备效果
- 多步骤行动树
- 行动依赖链

### Step 3：新增 NPC Schedule 模型

**扩展 NPCDefinition**（`src/engine/types/world.ts`）：

```ts
interface NPCScheduleEntry {
  locationId: string;
  weekdays?: number[]; // [1,2,3,4,5] = 工作日
  startHour: number;
  endHour: number;
}

interface NPCDefinition {
  id: string;
  name: string;
  homeLocationId?: string;
  interactions?: NPCInteractionRule[];
  schedule?: NPCScheduleEntry[];
  tags?: string[];
}
```

**LocationService 或 NpcService 新增方法**：
- `getNpcLocationAtTime(npcId: string, state: GameState): string | null`
- 根据 NPC schedule + 当前时间/星期计算 NPC 当前所在地点
- `getAvailableNpcInteractions` 改为动态计算（不在固定 homeLocation）

**不做**：
- NPC relationship / affection / corruption 系统
- NPC 个人剧情状态机
- NPC 移动路径可视化

### Step 4：扩展 EventDefinition 触发时机

当前 trigger：

```ts
"manual" | "on-location-enter" | "on-time-check" | "after-choice"
```

复用 `on-time-check` 在行动后自动触发随机事件池。暂不加新 trigger。

后续如果需要，再加 `"after-action"`，但第一版用 `on-time-check` 在 `performAction` 后手动触发即可。

### Step 5：新内容包 `content/daily-demo/`

**新 bundle**：`src/content/daily-demo/`

```
src/content/daily-demo/
├── bundle.ts
├── locations.ts      // 6-8 个新地点
├── actions.ts        // 地点行动定义
├── events.ts         // 随机事件（复用 engine on-time-check）
├── npcs.ts           // 2-3 个带 schedule 的 NPC
├── narrative.ts      // 最小叙事节点（home sleep / action results）
└── quests.ts         // 可选：日常任务（不要扩现有剧情链）
```

**地点建议**（最小集）：

| id | name | 描述 |
|---|---|---|
| `home` | Home | 休息/睡觉/检查状态 |
| `street` | Street | 闲逛/找零工 |
| `market` | Market | 打工/买东西 |
| `docks` | Docks | 危险工作 |
| `cafe` | Cafe | 社交/打工 |
| `park` | Park | 休息/随机事件 |

**核心 stat 建议**（第一版固定）：

| stat | 初始值 | 用途 |
|---|---|---|
| `energy` | 100 | 行动资源，耗尽后行动受限 |
| `stress` | 0 | 心理压力，高值触发负面事件 |
| `fatigue` | 0 | 疲劳，睡眠消除 |
| `hunger` | 0 | 饥饿，高值扣减 energy |
| `money` | 50 | 金币 |
| `reputation` | 0 | 声望，影响 NPC 态度 |

**hourly upkeep 逻辑**（第一版）：

```ts
function applyHourlyUpkeep(state: GameState, elapsedMinutes: number): GameState {
  const hours = Math.floor(elapsedMinutes / 60);
  if (hours === 0) return state;

  let stats = { ...state.player.stats };
  stats.hunger = clamp(stats.hunger + hours * 2, 0, 100);
  stats.fatigue = clamp(stats.fatigue + hours * 1, 0, 100);

  // 饥饿 > 70 时 energy 下降
  if (stats.hunger > 70) {
    stats.energy = clamp(stats.energy - hours * 3, 0, 100);
  }

  return { ...state, player: { ...state.player, stats } };
}
```

**睡眠 reset 逻辑**（第一版）：

```ts
function advanceToNextMorning(state: GameState): GameState {
  return {
    ...state,
    time: advanceDays(state.time, 1), // day + 1, reset hour/minute
    player: {
      ...state.player,
      stats: {
        ...state.player.stats,
        fatigue: 0,
        stress: Math.max(0, state.player.stats.stress - 10),
      },
    },
  };
}
```

### Step 6：更新 GameSession

`GameSession` 需要新增：

```ts
performAction(actionId: string): SessionActionResult {
  // 1. 检查条件
  // 2. 应用 effects（addStats/addVars/setFlags）
  // 3. 推进时间（durationMinutes）
  // 4. 应用 hourly upkeep
  // 5. 触发 on-time-check 事件
  // 6. 如果是 sleep，触发 advanceToNextMorning
}
```

### Step 7：更新 DemoApp UI

`DemoApp.vue` 新增：

- "Actions" 区域（显示当前地点可用行动）
- Stat bar（energy / stress / fatigue / hunger / money）
- "Sleep" 按钮（当地点为 home 时）
- 时间/星期显示

**不做**：大重构 UI，保持用现有 Vue 组件结构。

---

## 测试策略

| 测试 | 覆盖 |
|---|---|
| `test:time` | weekday / dayPhase / hourly upkeep / advanceToNextMorning |
| `test:location-actions` | 新增：`performAction` 条件过滤 / 状态变化 / 时间推进 |
| `test:npc-schedule` | 新增：NPC 根据时间出现在正确地点 |
| `test:daily-loop` | 新增：完整 daily loop 闭环（起床→行动→睡眠→第二天） |
| `test:demo-flow` | 现有回归，不应因本次改动失败 |

---

## 风险与回退点

| 风险 | 影响 | 回退点 |
|---|---|---|
| `performAction` 改动破坏 `GameSession` 现有 API | 中 | 先在 `GameSession` 上加 overload，不改现有方法签名 |
| `applyHourlyUpkeep` 影响现有事件测试 | 中 | upkeep 只对新 content bundle 生效，不改默认 state |
| `LocationActionDefinition` schema 膨胀 | 低 | 第一版 conditions 只支持 flags/vars/quests，不加 all/any/not |
| NPC schedule 破坏现有 NPC interaction 测试 | 低 | schedule 字段可选；无 schedule 的 NPC 行为不变 |

---

## 验证方式

```bash
npm run test        # 全部通过
npm run type-check # 通过
npm run dev         # 手动验证 daily loop 闭环
```

**手动验证路径**：

1. 启动 `npm run dev`
2. 在 `home` 点击 "Sleep" → 进入新一天，fatigue 清零
3. 查看 stat bar（energy / stress / fatigue / hunger / money）
4. 前往 `market`，看到可用行动列表
5. 执行 "Find small work" → +money, -energy, 时间推进
6. 执行后触发随机事件
7. 等待足够时间后 NPC Mira 出现在 `harbor`
8. 存档/读档，状态正确恢复

---

## 阶段完成后

- 现有 `content/demo/` 保持不变（稳定回归样本）
- 新玩法在 `content/daily-demo/` 独立演进
- 后续专题（clothing / combat / economy / NPC relationship）按需从 DoL 参考逐步引入
- `docs/99-reference/dol-gameplay-comparison.md` 记录本次对比结论，供后续参考
