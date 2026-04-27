# DoL 核心玩法机制对比

> 本文档记录从 `../degrees-of-lewdity` 只读参考提炼的核心机制，与本项目当前 engine 的对比。
> 每次参考实现后更新本文档。禁止直接复制 DoL 源码。

---

## 1. 时间系统

### DoL 时间机制
- **DateTime**：年/月/日/时/分/秒，epoch-based timestamp
- **weekDay**：1-7（周日到周六）
- **dayPhase**：`dawn` / `day` / `dusk` / `night`
- **schoolTerm / schoolDay / schoolTime**：学校日历
- **season / holidayMonths / moonPhase**
- **Time.pass(seconds)**：触发 secondPassed → minutePassed → hourPassed → dayPassed → weekPassed → yearPassed hooks
- **每个 hook 执行不同的 stat 变化和事件检查**

### 本项目当前
```ts
interface TimeState {
  day: number;
  hour: number;
  minute: number;
}
// 仅 advanceMinutes / advanceHours / getTimeOfDay
```

### 差距
- 无 weekday
- 无 dayPhase 语义
- 无多级 tick hooks
- 无季节/学校/月相

### R-D1 实现计划
- `getWeekday(time)` → 1-7
- `getDayPhase(time)` → dawn/morning/afternoon/evening/night
- `applyHourlyUpkeep(state, elapsed)` → 饥饿/疲劳变化
- `advanceToNextMorning(state)` → 睡眠后重置

### DoL 提炼结论
**不做**：月份、季节、学校、月相、假期（后续专题）。
**只做**：weekday + dayPhase + hourly upkeep + next day reset。

---

## 2. 地点系统

### DoL 地点机制
- **层级继承**：`setup.addlocation("home").parent("domus").location().inside().build()`
- **地点属性**：parent / area / bus / outside / inside / tanning / location_name / area_name / bus_name
- **室内外语义**：影响光照、暴露、天气
- **地图移动**：`$map` 记录相邻位置，`displayLinks` 显示可旅行地点
- **地点条件**：`outside` 场所白天安全、夜晚危险；室内不受天气影响

### 本项目当前
```ts
interface LocationDefinition {
  id: string;
  name: string;
  description: string;
  connections: LocationConnection[]; // { to, travelMinutes }
  tags?: string[];
}
```

### 差距
- 无层级继承
- 无室内外语义
- 无区域（area/bus）语义
- 无地图移动系统
- 无地点开放时间/条件

### R-D1 实现计划
- 暂不重构 `LocationDefinition`，在 `LocationActionDefinition` 上加 `locationType?: "indoor" | "outdoor"`
- 后续专题再引入完整层级

### DoL 提炼结论
DoL 的地点层级是 5 年迭代的产物。第一版不复制这套结构，先用 tags 代替。

---

## 3. 事件系统

### DoL 事件机制
- **eventpool**：加权随机选择器
- `<<cleareventpool>>` / `<<addevent WIDGET [WEIGHT]>>` / `<<runeventpool>>`
- `rollWeightedRandomFromArray`：Infinity weight = 强制选中
- 分散式 cooldown：每个 passage 手动管理 `$docks.pub.cooldown >= 1` 检查
- 无集中式 eventHistory
- `V.eventPoolOverride` 用于 debug 强制触发特定事件

### 本项目当前
```ts
interface EventDefinition {
  id: string;
  type: string;
  trigger: "manual" | "on-location-enter" | "on-time-check" | "after-choice";
  once?: boolean;
  priority?: number;
  weight?: number;
  cooldownMinutes?: number;
  conditions?: EventConditions;
  payload?: Record<string, unknown>;
}
// 集中式 selector + eventHistory + cooldownMinutes
```

### 差距
本项目 selector 比 DoL 更工程化（统一 selector、eventHistory、集中式 cooldown）。
DoL 的优势是内容海量（4874 个 widget，15166 个 passage）。

### DoL 提炼结论
不引入 DoL 的分散式 cooldown 模式。继续用本项目集中式 selector。
后续扩展时内容侧通过 `on-time-check` + `eventHistory.lastTriggeredWithinMinutes` 控制频率。

---

## 4. 玩家状态系统

### DoL 状态机制（核心 stat）
- **控制感**：`$control` / `$controlmax`（0-1000）
- **创伤**：`$trauma` / `$traumamax`（0-5000），影响 anxiety / nightmares / flashbacks / panic / dissociation / hallucinations
- **压力**：`$stress` / `$stressmax`
- **性唤起**：`$arousal` / `$arousalmax`（0-10000）
- **体质**：`$physique` / `$physiquemax`（0-20000）
- **意志力**：`$willpower` / `$willpowermax`
- **美丽**：`$beauty` / `$beautymax`
- **纯洁**：`$purity`（0-1000）
- **金钱**：`$money`
- **声望**：`$fame` / `$deviancy` / `$exhibitionism` / `$promiscuity`
- **犯罪**：`$crime`
- **疲劳**：`$tiredness`
- **饥饿/口渴**：`$hunger` / `$thirst`

### 本项目当前
```ts
interface PlayerState {
  id: string;
  name: string;
  stats: Record<string, number>;
  flags: Record<string, boolean>;
}
```

### 差距
- 当前是泛型 `Record<string, number>`，无基线语义
- 无派生状态（trauma → anxiety / nightmares）
- 无多维度 stat（fame / deviancy / purity）

### R-D1 实现计划
第一版固定一组核心 stat（见 `round-R-D1-daily-loop-slice.md`）：
- energy / stress / fatigue / hunger / money / reputation

不做派生状态逻辑（后续专题）。

### DoL 提炼结论
DoL 的 stat 系统是长期迭代的复杂网络。**不要**一次性复制。先固定最小集合，再按需扩展。

---

## 5. NPC 系统

### DoL NPC 机制
- **named NPC**：Robin / Kylar / Sydney / Avery / Whitney / etc.
- **状态对象**：`C.npc[name]` 包含 love / lust / corruption / purity / pregnancy 等
- **schedule**：`sydneySchedule()` 根据 weekday + hour + story state 计算 `T.sydney_location`
- **relationship**：`$npcRelationship[name]`
- **appearance**：NPC 根据地点/时间/状态动态出现在 passage 中

### 本项目当前
```ts
interface NPCDefinition {
  id: string;
  name: string;
  homeLocationId?: string;
  interactions?: NPCInteractionRule[];
  tags?: string[];
}
// 无 schedule，无动态位置，无 NPC state object
```

### 差距
- 无 NPC state object
- 无 NPC schedule 计算
- 无 relationship / affection
- 位置是静态的

### R-D1 实现计划
- 扩展 `NPCDefinition` 加 `schedule?: NPCScheduleEntry[]`
- `getNpcLocationAtTime(npcId, state)` 动态计算 NPC 位置
- 不做 NPC state object（后续专题）

### DoL 提炼结论
DoL 的 NPC 是 15+ 个 named NPC + 各自独立的状态机 + schedule 函数。第一版只做 schedule 最小版（时间/星期 → 地点）。

---

## 6. 服装系统

### DoL 服装机制
- **14 个 slot**：over_upper / over_lower / upper / lower / under_upper / under_lower / head / face / neck / hands / handheld / legs / feet / genitals
- **wetness**：每件衣服有 `$upperwet` / `$lowerwet` 等
- **transparency / exposure**：影响 `<<exhibition>>` 事件
- **wardrobe / store / worn**：三层管理
- **clothing traits**：naked / swim / sleep / school / etc.
- **gender presentation**：影响 NPC 对玩家的态度

### 本项目当前
- 无服装系统
- 只有 `inventory: Record<string, number>`

### R-D1 实现计划
**不作为 R-D1 范围**。后续专题（Phase E）。

### DoL 提炼结论
服装系统是 DoL 的核心沉浸机制，但实现复杂度高。先做地点行动和 stat 循环，后续专题再引入。

---

## 7. 战斗/遭遇系统

### DoL 战斗机制
- **enemy health / arousal / anger / trust**
- **player arousal / pain / trauma / control**
- **position**：`standing` / `walking` / `doggy` / etc.
- **actions**：按身体部位分（mouth / anus / vagina / penis / hands / feet）
- **npc behavior**：aggressive / passive / seductive
- **swarm / beast / tentacle / machine**：特殊系统
- **vore / pregnancy**：高级系统

### 本项目当前
- 无 encounter runtime
- narrative choice effects 只支持 setFlags / setVars / addStats / quest progression

### R-D1 实现计划
**不作为 R-D1 范围**。后续专题。

### DoL 提炼结论
DoL 的战斗系统是 5 年迭代的复杂状态机。先做地点行动循环，战斗系统后续专题。

---

## 8. 经济系统

### DoL 经济机制
- **金钱**：`$money`
- **商店**：`V.store[slot]` / `$shop` passage
- **消耗品**：食物/饮料/药
- **blackmoney**：地下经济（不影响正常商店）
- **每日花费**：`$rent` / `$food / `$drinks`

### 本项目当前
- `vars: Record<string, number | string | boolean>`
- 无商店系统
- 无每日消耗

### R-D1 实现计划
- 第一版通过 `LocationAction` 实现简单经济（"find small work" → +money）
- 后续专题再做商店系统

### DoL 提炼结论
DoL 经济系统与服装/消耗品/租房深度耦合。第一版先做 action-based 简单经济。

---

## 9. 存档系统

### DoL 存档机制
- **SugarCube built-in**：`State.history` / `SaveSystem`
- **版本策略**：major * 1,000,000 + minor * 10,000 + patch * 100
- **md5 防篡改**：铁人模式
- **metadata 分离**：`dolSaveDetails` key 存 localStorage

### 本项目当前
- `SaveService` / `serializer` / `migration`
- 版本字段存在，migration registry 管道就绪但未注册

### 差距
本项目存档架构更轻量，适合当前规模。

### DoL 提炼结论
不引入 DoL 的 md5 签名。继续用当前 `SaveService` + migration 管道。

---

## 总结：R-D1 需要从 DoL 参考的实现

| 专题 | DoL 提炼 | R-D1 范围 | 优先级 |
|---|---|---|---|
| 时间语义 | weekday / dayPhase / hourly hooks | ✅ | P0 |
| 地点行动 | action-based 活动 + stat 变化 | ✅ | P0 |
| NPC schedule | time/weekday → location | ✅ | P0 |
| stat 系统 | energy/stress/fatigue/hunger/money/reputation | ✅ | P0 |
| hourly upkeep | 饥饿/疲劳随时间累积 | ✅ | P0 |
| 服装系统 | — | ❌ 后续专题 | P1 |
| 战斗系统 | — | ❌ 后续专题 | P1 |
| 经济/商店 | — | ❌ 后续专题（Phase E） | P1 |
| NPC state/relationship | — | ❌ 后续专题 | P2 |
| 月份/季节/学校 | — | ❌ 后续专题 | P2 |
