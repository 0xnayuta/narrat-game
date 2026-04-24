# Brine Lark 默认 Demo 终点确认方案

## 结论

推荐把 Brine Lark 默认可玩主线收束在：

```text
node_brine_lark_reedway_cut_activity
→ 新的 demo boundary / case boundary 节点
```

也就是：玩家追到 Reedway Cut，看见货物从港口可见水线进入浅水、芦苇、泥岸遮蔽的隐蔽路线后，当前 demo 主线结束。

后续 `reedway cut release trigger`、`inland release signal node`、`sluice control`、`marsh control`、`harbor command`、`port authority`、`ministry`、`prime minister` 等内容保留为背景素材或归档层，不再作为默认主线继续推进。

## 为什么选择 Reedway Cut，而不是更早或更晚

### 不选 Breaker Culvert 作为首选终点

Breaker Culvert 很适合作为强中段节点，因为它证明：

```text
Black Sail / Brine Lark 的路线会从港口视线中消失。
```

但如果在这里结束，玩家只知道“货物进了涵洞”，还不够明确知道它进入了什么类型的新路线。

因此 Breaker Culvert 更适合承担：

- 水线从可见港口消失的证据点；
- Mira 横向 recap 的回归点；
- 进入最后一段 demo 追踪的门槛。

### 选择 Reedway Cut 作为首选终点

Reedway Cut 能补上 demo 需要的最后一个认知：

```text
这不是单个涵洞或单个藏货点，而是一条进入浅水/芦苇/内陆水网的路线。
```

它能同时满足三个叙事目标：

1. Brine Lark 不只是港口接头，而是 route handler。
2. Black Sail 的港口端已经被打断，但网络仍向内延伸。
3. 当前 demo 可以在“发现更大水路系统”处结束，而不是继续解释每一层控制者。

### 不选 release trigger 之后作为默认终点

`node_brine_lark_reedway_cut_release_trigger` 之后会自然引向：

```text
inland release signal
→ sluice control
→ marsh control
→ harbor command
→ port authority
→ ministry / cabinet / prime minister
```

这些节点的叙事结构容易变成：

```text
这个节点不是终点，它听命于更高节点。
```

这正是当前手动体验中“繁杂、重复、无意义”的主要来源之一。因此不建议让默认主线继续过 Reedway Cut activity。

## 推荐默认 Brine Lark 主线骨架

压缩后的默认 Brine Lark 主线应保留：

```text
Tide Warehouse
→ shift change / receiving clerk
→ ledger alcove / tag pattern
→ outer mooring / marker set
→ Customs Tide Stairs
→ waterline receiver
→ Breaker Culvert activity
→ culvert carrier
→ Reedway Cut activity
→ demo boundary
```

这里的重点不是“找到最高层负责人”，而是让玩家理解：

```text
Brine Lark 把 Black Sail 暴露出的港口货线，转入了普通港口守卫看不见的水路系统。
```

## 建议 boundary 节点功能

后续实施时，可以在 `node_brine_lark_reedway_cut_activity` 后接一个新的边界节点。该节点不需要新系统，不需要新 quest schema，只承担文本和状态收束。

### 该节点应表达

- Mira 确认 Black Sail 的港口端已经被打断。
- Drowned Lantern / Brine Lark 不是最终 boss，而是揭示路线结构的入口。
- Reedway Cut 证明货物已经进入更深水路网络。
- 当前 demo 到此为止，下一阶段不是“继续点击更高官员”，而是另一个更完整章节的调查。

### 推荐语义

```text
Mira does not call it a victory, but she does call it a map.
Black Sail gave them the harbor end.
Drowned Lantern gave them the dawn handoff.
Brine Lark gave them the route out of sight.
Past Reedway Cut, the case stops being a harbor sting and becomes a waterway campaign.
```

### Quest 状态建议

后续代码实施时有两个可选方案：

1. **轻量边界方案（推荐）**
   - 不新增 quest step。
   - 在 boundary choice 上 `completeQuest: ["quest_brine_lark"]`。
   - `current_goal` 设置为类似 `review_brine_lark_water_route_boundary`。

2. **最小 step 修剪方案**
   - 缩短 `quest_brine_lark.stepIds`，让 `step_observe_reedway_cut_activity` 成为最后一个默认 step。
   - boundary choice 完成 quest。
   - 高层治理 step 保留在代码文本中，但不在默认 quest ladder 中继续使用。

当前推荐先做方案 1，因为它改动小，风险低；等默认路径稳定后，再考虑是否做方案 2。

## 高层治理链处理方式

### 默认路径中淡出

以下内容不再作为默认主线推进目标：

```text
reedway cut release trigger
→ inland release signal node
→ sluice control node
→ sluice house controller
→ marsh control node
→ marsh warden
→ harbor signal point
→ harbor coordinator
→ harbor authority node
→ harbor command
→ schedule master
→ port authority
→ maritime inspector
→ oversight board
→ ministry
→ cabinet / executive office / prime minister
```

### 保留方式

这些节点可以暂时保留在 `narrative.ts` 中，作为：

- 历史内容；
- 世界观素材；
- 将来可能重新设计成独立章节的素材；
- archive 对照材料。

但后续新增内容不应继续沿这条链向上扩展。

### 文档表述

active docs 应把这些节点称为：

```text
background / retained historical content
```

而不是：

```text
current default main chain
```

## 与现有横向 recap 的关系

### Breaker Culvert recap

`evt_brine_lark_breaker_culvert_return_ripple` 和 `harbor-watch-brine-lark-culvert-recap` 可以保留，因为它们服务的是：

```text
理解 Breaker Culvert 的 transfer rhythm。
```

但它们不应再引出新的垂直层级。

### 不建议新增 Reedway recap

Reedway Cut 已经作为默认终点。除非后续有明确玩法需要，不建议再新增 Reedway recap，否则会继续加重“总结过多”的问题。

## 后续实施顺序建议

### 第 1 步：文档同步

将 `demo-scope.md` 中 Brine Lark 的“当前主链 43 步 retained 层”改成更准确的两层表述：

- 当前代码仍保留长链；
- 后续目标默认可玩链收束到 Reedway Cut。

### 第 2 步：增加 boundary 节点

在 `node_brine_lark_reedway_cut_activity` 后增加一个 demo boundary 节点，并让默认 choice 进入该节点，而不是继续 release trigger。

### 第 3 步：测试默认路径

增加或调整测试，只保护默认路径：

```text
Drowned Lantern handoff
→ Brine Lark start
→ Breaker Culvert
→ Reedway Cut
→ boundary complete
```

不要在默认路径测试中继续要求到 prime minister。

### 第 4 步：再考虑 stepIds 修剪

如果 boundary 路径稳定，再决定是否缩短 `quest_brine_lark.stepIds`。不要在第一轮同时改文本、quest ladder 和测试大范围断言。

## 非目标

本方案不做：

- 删除高层治理节点。
- 新增 engine 能力。
- 新增 objective counters。
- 新增 quest schema。
- 新增 Brine Lark 横向 recap。
- 继续扩展治理链。

## 成功标准

玩家走完默认 demo 后，应能说清：

```text
Black Sail 是港口走私端；Drowned Lantern 是黎明交接 alias；Brine Lark 把线索带到 Reedway Cut，说明这条货线进入了更深的隐蔽水路系统。
```

并且不会被迫继续经历：

```text
水路节点 → 控制节点 → 港口命令 → 行政机关 → 部委 → 首相
```

这样的逐层上升链。