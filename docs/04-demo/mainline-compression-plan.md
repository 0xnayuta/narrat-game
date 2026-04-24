# 主线剧情压缩方案

## 目的

当前 demo 已经能完整展示 engine 能力，但从玩家体验看，主线内容出现了三个问题：

1. recap / feedback 过密，多个节点反复说明“这是路线，不是地点”。
2. Black Sail / Drowned Lantern / Brine Lark 的叙事边界不够清楚。
3. Brine Lark 后段治理层级过长，削弱了港口走私调查的核心体验。

本方案只定义内容整理方向，不引入新 engine 机制，不新增 quest step，不扩展 Brine Lark 高层治理链。

## 压缩后的主线一句话

玩家协助 Mira 从港口传闻追出 Black Sail 走私线，在煤炭泊位设伏抓到 courier 后，通过 ledger stub 发现 Drowned Lantern 是黎明交接 alias，最终把线索收束到 Brine Lark 这个负责把货物转入隐蔽水路系统的 runner。

## 三个核心问题

压缩后的 demo 主线只需要回答三个问题：

1. **Black Sail 是什么？**
   - 答案：利用港口夜间信号、水道和煤炭泊位进行转运的走私网络港口端。
2. **Black Sail 的下一层接头是什么？**
   - 答案：Drowned Lantern，不是船或地点，而是黎明交接用的 contact alias。
3. **谁能把玩家带到更深的路线？**
   - 答案：Brine Lark，一个处理标签、账本、潮汐窗口和短距离交接的 runner。

## 推荐保留主线骨架

保留并强化这条最小主线：

```text
市集/商贩传闻
→ Mira / Harbor Watch
→ Black Sail 夜间信号
→ Signal Tower / Pier / North Channel
→ Coal Berth ledger
→ Black Sail sting
→ Courier + ledger stub
→ Drowned Lantern alias
→ Customs sheds / dawn exchange
→ Brine Lark runner
→ Tide Warehouse
→ Customs Tide Stairs
→ Breaker Culvert
→ Reedway Cut 或 Breaker Culvert 后的短结尾
```

## 推荐 demo 终点

### 首选终点：Breaker Culvert / Reedway Cut

Brine Lark 的默认可玩主链建议收束在：

```text
Customs Tide Stairs
→ waterline pickup
→ Breaker Culvert
→ Reedway Cut
```

这里已经足够表达：

- Black Sail 只是港口端。
- Brine Lark 把货物转入更隐蔽的水路系统。
- 背后存在更大的网络，但 demo 不必继续逐层上升。

### 不推荐作为默认终点

不推荐默认可玩链继续推进到：

```text
Harbor Window Office
→ Harbor Command
→ Port Authority
→ Maritime Ministry
→ Cabinet / Executive Office / Prime Minister
```

这些节点可以保留为 archive / background code，但不应继续作为默认主线推进目标。

## Black Sail 压缩建议

### 必须保留

- Vendor / compass / harbor rumor 作为入口。
- Mira 作为主要调查搭档。
- Signal Tower → Pier → North Channel → Coal Berth 的可追踪路径。
- Coal Berth ledger 指向 Black Sail sting。
- Sting resolved 后得到 courier + ledger stub。
- Ledger stub 指向 Drowned Lantern。

### 可合并或弱化

- 多个“路线不是地点”的 recap 不应连续出现。
- North Channel wake feedback 与 Black Sail aftermath feedback 二选一强化即可；如果保留两者，前者服务“找 coal berth”，后者服务“Black Sail 结案”。
- Black Sail aftermath 只需说明：抓到的是一条线，不是整个组织。

### 推荐玩家理解

```text
Black Sail = 港口走私网络的可见端。
```

## Drowned Lantern 压缩建议

### 必须保留

- Drowned Lantern 不是船 / 泊位 / 仓库，而是 contact alias。
- Customs sheds 找到 tide slip / dawn exchange。
- Exchange window 将目标从 cargo hand 缩小为 runner/contact。
- 最终指向 Brine Lark。

### 可合并或弱化

当前 Drowned Lantern 有多种补点：

- Customs Tide Stairs lower landing
- Coal Berth route recap
- Coal-route Mira feedback
- Exchange-window default fallback
- Case boundary recap

这些节点单独合理，但连续出现时容易重复。建议后续整理时：

1. **默认路径只保留 exchange-window fallback**，用于承认线索有限并解释 runner profile。
2. **额外 observation 分支只保留一个强分支**：优先保留 Customs Tide Stairs，因为它和 dawn exchange 的 handoff 语义最直接。
3. Coal Berth route recap 可作为可选横向内容，但不应再额外引出多层 Mira 复述。
4. Case boundary recap 保留一段即可，功能是结束 Drowned Lantern 并转向 Brine Lark。

### 推荐玩家理解

```text
Drowned Lantern = 黎明交接 alias，用来遮住实际 runner。
```

## Brine Lark 压缩建议

### 必须保留

- Brine Lark 是可追踪的 runner / route handler。
- Tide Warehouse 作为起点。
- Customs Tide Stairs 显示水线交接。
- Breaker Culvert 显示货物从港口视线中消失。
- Reedway Cut 或同级水路节点显示更大隐蔽路线存在。

### 应停止默认推进的位置

推荐在 Breaker Culvert 或 Reedway Cut 后做一个 demo 边界节点：

```text
Mira 确认：Black Sail 的港口端已经被打断，但这条水路继续向内延伸。
当前 demo 到此为止，下一阶段目标是追查内陆水路网络。
```

### 应归档/背景化的内容

以下内容不适合作为当前默认主线继续推进：

- Harbor Signal Point 以上的大量管理节点。
- Port Authority / Ministry / Cabinet / Executive Office / Prime Minister 等治理层。
- 重复结构为“这个节点又听命于更高节点”的文本。

它们可以作为世界观素材保留，但不应让玩家在当前 demo 主线中逐层点击。

### 推荐玩家理解

```text
Brine Lark = 把 Black Sail 货物带离港口、转入隐蔽水路系统的 runner。
```

## Recap / feedback 使用规则

后续整理时，一个主线段落最多保留三类 recap：

1. **方向 recap**：告诉玩家下一步去哪。
2. **证据 recap**：解释一个新 observation 如何改变判断。
3. **边界 recap**：结束当前链并引出下一链。

避免连续出现多个功能相同的 recap，例如：

```text
这是路线，不是地点
→ 这是 handoff，不是 cargo
→ 这是 runner，不是 berth hand
→ 这是 contact alias，不是地点
```

这些判断应合并到一个强节点中，而不是分散到多个节点。

## 建议后续实施顺序

### 第 1 步：标记默认主线

先在文档或测试中明确默认可玩路径：

```text
Intro → Black Sail → Drowned Lantern → Brine Lark water-route boundary
```

不要先删代码。

### 第 2 步：压缩 Drowned Lantern recap

优先整理 Drowned Lantern，因为它目前最容易重复解释。

推荐目标：

- 默认 fallback 保留。
- Customs stairs insight 保留。
- Coal route feedback 降级为可选或合并。
- Case boundary 保留一段。

### 第 3 步：设置 Brine Lark demo 终点

把默认可玩链停在 Breaker Culvert / Reedway Cut 一带。

高层治理链保留在代码或 archive 中，但不再作为默认主线继续推进。

### 第 4 步：再决定是否删减代码

只有当默认路径和测试都稳定后，再考虑删除或归档未使用节点。不要在第一轮就大规模删除。

## 非目标

本方案不做：

- 新 engine 抽象。
- 新 quest schema。
- 新 NPC 系统。
- 新 eventHistory 能力。
- Brine Lark 更高治理层扩展。
- 一次性删除大量历史节点。

## 成功标准

整理后，玩家应能在 1-2 句话内说清：

```text
Black Sail 是港口走私端；Drowned Lantern 是黎明接头 alias；Brine Lark 是把货物转进隐蔽水路的 runner。
```

并且手动游玩时不再频繁感到：

- Mira 在重复解释同一件事。
- 每个节点只是指向“更高一层”。
- 当前主线不知道什么时候算完成。
