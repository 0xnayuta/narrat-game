# 开发计划

> 本文档是项目的权威开发计划来源。包含整体路线、多轮计划、里程碑。
> 每轮开始前需阅读本文档；每轮完成后需更新「里程碑」和「当前轮次」状态。

---

## 📌 项目现状

- **Engine**：Phase 1-4 完成，事件系统稳定
- **Phase 5**：DoL-like Daily Loop Vertical Slice 进行中（R-D1）
- **测试**：197 个用例全部通过，type-check 通过
- **现有 Demo**：`content/demo/`（剧情链 demo）保持不变，作为稳定回归样本
- **新内容**：`content/daily-demo/`（DoL-like 日常循环）开发中
- **参考仓库**：`../degrees-of-lewdity`（只读）

---

## 🎯 整体路线

**暂停横向剧情链扩展，转向 DoL-like 核心玩法切片。**

现有 `content/demo/` 保持不变作为回归样本。新玩法在 `content/daily-demo/` 独立构建。

| 阶段 | 方向 | 重点 |
|------|------|------|
| **D — DoL-like Daily Loop** | 日常循环 + 状态 + 地点行动 + NPC/时间调度 | 时间语义、地点行动、NPC schedule、hourly upkeep |
| **E — 经济与物品** | 商店、消耗品、基础装备（可选） | 经济循环、物品交互 |
| **F — 玩法层内容扩展** | 基于稳定玩法层扩内容 | 新地点、新 NPC、新事件 |

> ⚠️ 不再继续扩 Black Sail / Drowned Lantern / Brine Lark 的剧情节点密度。

---

## 📦 多轮计划

### 阶段 A — 内容整理与文档同步

| 轮次 | 名称 | 状态 | 目标 |
|------|------|------|------|
| **R-A1** | 标记默认主线路径 | ✅ 完成（文档已写入） | 分类 default / retained / archive 内容 |
| **R-A2** | Drowned Lantern 内容密度审查 | ✅ 完成（代码+测试已更新） | 审查并处理 recap 过密节点 |

### 阶段 B — Engine 稳定性小改进

| 轮次 | 名称 | 状态 | 目标 |
|------|------|------|------|
| **R-B1** | 存档 migration registry 梳理 | ✅ 完成（管道已就绪，v2 迁移 TODO 已知） | 注册前向迁移 registry，填补 `migration.ts:35` TODO |
| **R-B2** | RNG 确定性种子策略确认 | ✅ 完成（建议 Mulberry32，暂缓到阶段 C） | 确认种子策略或实现确定性重放 |

### 阶段 C — 内容层扩展

| 轮次 | 名称 | 状态 | 目标 |
|------|------|------|------|
| **R-C1** | NPC 互动深度扩展 | ✅ 完成（5个新交互已添加） | 为 Mira 添加 3-5 个基于 eventHistory 的新鲜反馈交互 |
| **R-C2** | 新地点/事件扩展 | ✅ 完成（2个新地点+3个新事件+2个hint节点已添加） | 按 `demo-walkthrough.md` 流程扩展内容 |

### 阶段 D — DoL-like Daily Loop（进行中）

| 轮次 | 名称 | 状态 | 目标 |
|------|------|------|------|
| **R-D1** | Daily Loop Vertical Slice | 🔲 进行中 | 时间语义 / 地点行动 / NPC schedule / hourly upkeep / 完整闭环 |

### 阶段 E — 经济与物品（待定）

- 商店系统
- 消耗品
- 基础装备（可选）

### 阶段 F — 玩法层内容扩展（待定）

- 新地点 / 新 NPC / 新事件
- 基于稳定玩法层做内容扩展

---

## 🏅 里程碑

| 里程碑 | 完成时间 | 备注 |
|--------|---------|------|
| ✅ 基线建立（pnpm install + test 100% 通过） | 2026-04-26 | 16 个测试套件全部通过 |
| ✅ Engine Phase 1-4 完成 | （历史记录） | eventHistory / windowed cooldown / triggerScopes |
| ✅ DoL 参考仓库就绪 | 2026-04-26 | `../degrees-of-lewdity` |
| ✅ R-A1 完成 | 2026-04-26 | 默认路径文档已写入 `round-R-A1-default-path-mapping.md` |
| ✅ R-A2 完成 | 2026-04-26 | Drowned Lantern 内容密度审查（Coal Berth反馈精简/Exchange window合并/Case boundary合并） |
| ✅ R-B1 完成 | 2026-04-26 | 存档 migration registry 梳理（管道已就绪，v2迁移TODO已知） |
| ✅ R-B2 完成 | 2026-04-26 | RNG 种子策略确认（建议Mulberry32，暂缓到阶段C） |
| ✅ R-C1 完成 | 2026-04-26 | Mira 5个新交互已添加（pier cross-ref / tower return / stakeout failure / sheds recap / coal berth cross-ref） |
| ✅ R-C2 完成 | 2026-04-26 | 新增 customs_stamps_shed 和 tide_warehouse 地点；新增 3 个 on-location-enter 事件；更新 Drowned Lantern 和 Brine Lark 起点为 travel-first 模式 |
| 🔲 R-D1 进行中 | — | Daily Loop Vertical Slice |
| 🔲 全部完成 | — | 全链路验证 + 文档最终同步 |

---

## 📍 当前轮次

> 每次开始新轮次时更新此 section。

**Phase 5（R-D1）进行中。目标：DoL-like Daily Loop Vertical Slice。**

详见 `docs/05-development/round-R-D1-daily-loop-slice.md`。

---

## 📖 轮次详细索引

| 轮次 | 详细文档 |
|------|---------|
| R-A1 | `round-R-A1-default-path-mapping.md` |
| R-A2 | `round-R-A2-drowned-lantern-review.md` |
| R-B1 | `round-R-B1-migration-registry.md` |
| R-B2 | `round-R-B2-rng-seed-strategy.md` |
| R-C1 | `round-R-C1-npc-interaction-deepening.md` |
| R-C2 | `round-R-C2-new-location-events.md` |
| R-D1 | `round-R-D1-daily-loop-slice.md` |

---

## 🔄 更新规则

1. **每轮开始前**：阅读本文件，确认当前轮次内容
2. **每轮完成后**：
   - 更新「里程碑」对应条目（🔲 → ✅ + 完成时间）
   - 更新「当前轮次」为下一轮
   - 填写本轮详细文档
3. **每次提交前**：运行 `pnpm run test` 确认无回归
