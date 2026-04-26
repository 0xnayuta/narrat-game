# R-A2：Drowned Lantern 内容密度审查

## 目标

根据 `mainline-compression-plan.md` 第 2 步，对 Drowned Lantern 链的内容密度进行审查，识别过密/冗余节点，给出整理建议。

**本轮不做代码删除**，只做文档分析和建议整理。执行留待确认后进行。

---

## 当前 Drowned Lantern 全流程（含所有分支）

```
node_drowned_lantern_start_point
  └── CHOICE: search_customs_sheds
      → node_drowned_lantern_shed_trace  [step_search_customs_sheds]

          ╔══════════════════════════════════════════════════════╗
          ║  BACK TO MIRA (任意时间可触发 NPC 交互)               ║
          ╠══════════════════════════════════════════════════════╣
          ║ [coal_berth 触发] evt_drowned_lantern_coal_berth_route_recap  ║
          ║   → [45min 窗口] harbor-watch-drowned-lantern-coal-route-feedback  ║
          ║     → node_harbor_watch_drowned_lantern_coal_route_feedback_end   ║
          ╠══════════════════════════════════════════════════════╣
          ║ [customs_tide_stairs 触发] evt_customs_stairs_return_glance  ║
          ║   → node_customs_stairs_return_glance_end               ║
          ║   → [back to Mira] harbor-watch-customs-stairs-recap  ║
          ║     → CHOICE: fold_into_exchange → node_drowned_lantern_exchange_window  ║
          ╚══════════════════════════════════════════════════════╝

          ↓ [ask Mira about dawn exchange]
          node_drowned_lantern_exchange_window  [step_trace_dawn_exchange]
              ├── [customs_stairs_exchange_point_noted]
              │   → node_drowned_lantern_exchange_window_confirmed
              ├── [drowned_lantern_coal_berth_route_noted]
              │   → node_drowned_lantern_exchange_window_route_confirmed
              └── [无额外 observation]
                  → node_drowned_lantern_exchange_window_default_boundary
                      → CHOICE: use_default_profile
                          → node_drowned_lantern_contact_suspect

          ↓ [either confirmed variant]
          node_drowned_lantern_case_boundary_from_insight
          或
          node_drowned_lantern_contact_suspect
          → node_drowned_lantern_contact_confirmed
          → node_drowned_lantern_case_boundary  [step_identify_drowned_lantern_contact]
```

---

## 内容密度分析

### 问题 1：双横向 observation 事件并行

Drowned Lantern 在 `shed_trace` 之后有**两条并列的横向 observation 路径**：

| 路径 | 事件 | 触发 | Mira NPC |
|------|------|------|----------|
| Customs Tide Stairs | `evt_customs_stairs_return_glance` | 进入 customs_tide_stairs | `harbor-watch-customs-stairs-recap` |
| Coal Berth Route | `evt_drowned_lantern_coal_berth_route_recap` | 进入 coal_berth | `harbor-watch-drowned-lantern-coal-route-feedback` |

**问题**：这两条路径服务的是同一个叙事目标（"Drowned Lantern 不是地点，是黎明交接 alias"），但各自独立触发、分别回到 Mira 对话。两条线都产生相似的 runner profile 信息。

**compression-plan.md 建议**：默认 fallback 保留，Customs stairs insight 保留为强分支，Coal Berth route recap 降级为可选或合并，Case boundary 保留一段即可。

---

### 问题 2：双 Mira NPC 反馈位置过近

```
node_harbor_watch_drowned_lantern_coal_route_feedback_end
  → 直接进入 → harbor-watch-customs-stairs-recap
```

两个 Mira NPC 反馈节点在叙事序列上相邻（coal_route_feedback_end 后直接是 customs_stairs_recap），连续出现"Runner 行为模式" recap，造成重复感。

---

### 问题 3：Exchange window 三变体叙事密度

`node_drowned_lantern_exchange_window` 有三个分支变体：

| 变体 | 触发条件 | 内容侧重点 |
|------|---------|-----------|
| `exchange_window_confirmed` | 有 customs_stairs observation | 基于实地观察确认 runner profile |
| `exchange_window_route_confirmed` | 有 coal_berth observation | 基于路线分析确认 runner profile |
| `exchange_window_default_boundary` | 无额外 observation | Mira 给出 runner profile 边界说明 |

**问题**：三个变体文本内容接近（都是"Mira 给出 runner profile 说明"），区别仅在于 player 之前积累了哪个 observation。

**compression-plan.md 建议**：exchange-window default fallback 保留，额外 observation 分支只保留 Customs stairs 作为强分支。

---

### 问题 4：Case boundary 两节点并存

`node_drowned_lantern_case_boundary` 和 `node_drowned_lantern_case_boundary_from_insight` 并存，功能基本相同（都是 Drowned Lantern → Brine Lark 边界 recap）。

---

## 整理建议

### 建议 1：Customs Stairs 作为主要横向 observation

Customs stairs 路径与 dawn exchange 的 handoff 语义最直接（都是潮汐相关），建议保留作为**主要横向路径**。

### 建议 2：Coal Berth Route 降级

Coal Berth route recap 作为可选横向内容保留，但**不额外引出独立的 Mira 复述节点**。`harbor-watch-drowned-lantern-coal-route-feedback` 可考虑降级为普通 repeat 对话，而非独立 feedback session。

### 建议 3：Exchange window 变体合并或简化

三个 exchange window 变体（confirmed / route_confirmed / default_boundary）中，建议：
- **default_boundary 保留**：为无额外 observation 的普通路径补上 runner profile 说明
- **confirmed / route_confirmed 考虑合并**：两个变体内容接近，可合并为带条件的单一节点

### 建议 4：Case boundary 节点合并

`case_boundary_from_insight` 和 `case_boundary` 合并为单一边界节点。

---

## 待确认问题

以下决定需要你确认后才能执行代码修改：

1. **Coal Berth Route feedback 是否降级为普通 repeat？**（还是保留现有的独立 feedback session？）
2. **Exchange window confirmed/route_confirmed 是否合并？**
3. **Case boundary 两节点是否合并？**

---

## R-A2 状态

- 文档分析：✅ 完成
- 问题识别：✅ 完成
- 整理建议：✅ 完成
- 代码执行：⏳ 等待确认以上 3 个问题

---

## 下一轮

R-A2 确认并执行后，进入 **R-B1：存档 migration registry 梳理**。
