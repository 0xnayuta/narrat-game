# R-A1：标记默认主线路径

## 目标

在文档中明确区分：
1. **默认主线路径**（默认测试保护、主动维护）
2. **保留内容**（代码中存在但默认路径不推进、不主动测试）
3. **归档内容**（`docs/_archive/`，不再引用）

**本轮不做代码改动**，只做文档标记和分类。代码精简留待 R-A2。

---

## 一、默认主线路径（Default Path）

以下节点序列构成**默认可玩主线**，按顺序经过 4 个 Quest Chain：

### Intro Path（`quest_intro_walk`，3 步）

```
node_idle
→ node_street_arrival
→ node_market_plan
→ node_market_arrival_impression
→ node_market_done / node_stall_discovery
→ node_compass_bought / node_stall_examined
→ node_vendor_intro / node_vendor_stall_tip
→ node_vendor_compass_reaction
→ node_vendor_harbor_watch_name  [→ Harbor Watch / Mira 入口]
```

**说明**：intro 的目标是找到 Harbor Watch 的 Mira，是进入 Black Sail trail 的前提。

---

### Black Sail Trail（`quest_black_sail_trail`，7 步 → `quest_black_sail_sting`，3 步）

```
[进入 harbor]
→ node_harbor_arrival
→ node_harbor_watch_intro        [step_find_mira]
→ node_harbor_watch_clue
→ node_harbor_return_patrol_glance
---
[夜间信号路径]
→ node_harbor_watch_night_tip
→ node_harbor_night_signal       [step_watch_harbor_at_night]
→ node_harbor_night_signal_shadow_route_end
→ node_pier_arrival
→ node_pier_capsule_clue
→ node_harbor_watch_channel_tip  [step_follow_pier_signal]
---
[North Channel 调查]
→ node_north_channel_arrival     [step_search_signal_tower]
→ node_north_channel_clue
→ node_north_channel_return_wake_pattern  [横向点 R1.1]
→ node_north_channel_return_wake_pattern_end
---
[回到 Mira 获取 tip]
→ node_harbor_watch_black_sail_tip  [step_decode_pier_message]
    └── [条件解锁] connect_north_channel_wake_to_coal_berth
        → node_black_sail_north_channel_recap
    └── [R1.2] harbor-watch-north-channel-fresh-feedback（Mira 短窗口反馈）
---
[Coal Berth]
→ node_coal_berth_arrival       [step_investigate_north_channel]
→ node_coal_berth_clue
→ node_harbor_watch_smuggling_confirmed
→ node_harbor_watch_sting_plan  [step_investigate_black_sail_berth]
---
[Sting]
→ node_black_sail_stakeout       [step_prepare_stakeout]
→ node_black_sail_stakeout_ready
→ node_black_sail_contact        [step_hold_stakeout]
→ node_black_sail_net_closing
→ node_black_sail_sting_resolved [step_close_the_net]
→ node_black_sail_aftermath_report
    └── [R1.3] harbor-watch-black-sail-aftermath-feedback（Mira 结案反馈）
→ node_black_sail_next_lead
→ node_black_sail_next_lead_clarified
→ node_drowned_lantern_start_point
```

**说明**：Black Sail trail 完整讲述"发现走私网络 → 追查泊位 → 设伏抓人 → 得到 ledger stub 指向下一层"。

---

### Drowned Lantern（`quest_drowned_lantern`，3 步）

```
→ node_drowned_lantern_start_point  [进入 Drowned Lantern]
→ node_drowned_lantern_shed_trace  [step_search_customs_sheds]
→ node_customs_stairs_return_glance [横向点 R2.1 — Customs Tide Stairs]
→ node_customs_stairs_return_glance_end
→ node_drowned_lantern_coal_berth_route_recap [横向点 R2.2 — Coal Berth Route]
→ node_drowned_lantern_coal_berth_route_recap_end
→ node_harbor_watch_drowned_lantern_coal_route_feedback [R2.3 — Mira Coal Route Feedback]
→ node_harbor_watch_drowned_lantern_coal_route_feedback_end
→ node_harbor_watch_customs_stairs_recap [R2.4 — Mira Customs Stairs Recap]
→ node_drowned_lantern_exchange_window [step_trace_dawn_exchange]
    ├── [有 customs_stairs_exchange_point_noted] → node_drowned_lantern_exchange_window_confirmed
    ├── [有 drowned_lantern_coal_berth_route_noted] → node_drowned_lantern_exchange_window_route_confirmed
    └── [无额外 observation] → node_drowned_lantern_exchange_window_default_boundary
        → node_drowned_lantern_exchange_window_default_boundary_end
→ node_drowned_lantern_contact_confirmed_from_insight
→ node_drowned_lantern_case_boundary_from_insight
    或
→ node_drowned_lantern_contact_suspect
→ node_drowned_lantern_contact_confirmed
→ node_drowned_lantern_case_boundary [step_identify_drowned_lantern_contact]
→ node_brine_lark_start_point
```

**说明**：Drowned Lantern 链讲清"黎明接头 alias → customs sheds → exchange window → 指向 Brine Lark"。

---

### Brine Lark 默认终点（`quest_brine_lark`，22 步止于 Reedway Cut）

```
→ node_brine_lark_start_point
→ node_brine_lark_warehouse_trace     [step_search_tide_warehouse]
→ node_brine_lark_route_window
→ node_brine_lark_watch_plan
→ node_brine_lark_shift_change_observed [step_watch_shift_change]
→ node_brine_lark_next_pressure_point
→ node_brine_lark_receiver_marked     [step_identify_exchange_contact]
→ node_brine_lark_clerk_approach_plan [step_pressure_receiving_clerk]
→ node_brine_lark_clerk_cover_set
→ node_brine_lark_clerk_first_reaction [step_read_clerk_reaction]
→ node_brine_lark_ledger_alcove_lead  [step_follow_ledger_alcove_lead]
→ node_brine_lark_ledger_alcove_marked
→ node_brine_lark_ledger_alcove_trace [step_recover_ledger_alcove_trace]
→ node_brine_lark_repeated_tag_pattern [step_identify_repeated_tag_pattern]
→ node_brine_lark_partial_destination_mark [step_identify_partial_destination_mark]
→ node_brine_lark_outer_mooring_line_confirmed [step_verify_outer_mooring_line_node]
→ node_brine_lark_outer_mooring_line_role [step_determine_outer_mooring_line_role]
→ node_brine_lark_outer_mooring_transfer_window [step_identify_outer_mooring_transfer_window]
→ node_brine_lark_outer_mooring_transfer_activity [step_confirm_outer_mooring_transfer_activity]
→ node_brine_lark_identity_swap_pattern [step_identify_identity_swap_pattern]
→ node_brine_lark_outer_marker_set     [step_identify_outer_marker_set]
→ node_brine_lark_outer_marker_reaction [step_identify_outer_marker_reaction]
→ node_brine_lark_outer_marker_first_reader
→ node_brine_lark_outer_marker_downstream_node [step_identify_outer_marker_downstream_node]
→ node_brine_lark_customs_tide_stairs_activity [step_observe_customs_tide_stairs_activity]
→ node_brine_lark_waterline_receiver  [step_identify_waterline_receiver]
→ node_brine_lark_breaker_culvert_return_ripple [横向点 — Breaker Culvert 返回涟漪]
→ node_brine_lark_breaker_culvert_return_ripple_end
→ node_harbor_watch_brine_lark_culvert_recap [Mira Breaker Culvert 横向 recap]
→ node_brine_lark_breaker_culvert_activity [step_observe_breaker_culvert_activity]
→ node_brine_lark_culvert_carrier   [step_identify_culvert_carrier]
→ node_brine_lark_reedway_cut_activity [step_observe_reedway_cut_activity]
→ [CHOICE: 观察 release trigger]
→ node_brine_lark_reedway_cut_activity_boundary [DEFAULT DEMO END]
    └── [completeQuest: quest_brine_lark]
→ node_brine_lark_reedway_cut_activity_end [choices: []]
```

**DEFAULT DEMO 终点**：`node_brine_lark_reedway_cut_activity_boundary`  
**标志**：`completeQuest: ["quest_brine_lark"]` 执行，quest 完结，无进一步主线推进。

---

## 二、保留内容（Retained / Background）

以下节点**保留在代码中**，但**不属于默认路径**，不主动测试：

### Drowned Lantern 可选变体

| 节点 ID | 说明 | 触发条件 |
|---------|------|---------|
| `node_drowned_lantern_exchange_window_confirmed` | 有 Customs Stairs observation 时进入 | `customs_stairs_exchange_point_noted: true` |
| `node_drowned_lantern_exchange_window_route_confirmed` | 有 Coal Berth observation 时进入 | `drowned_lantern_coal_berth_route_noted: true` |
| `node_drowned_lantern_exchange_window_default_boundary` | 无额外 observation 的默认 fallback | 无额外 flag |

**说明**：这三个变体对应"同样的叙事位置，不同的 player observation 积累"，都是合法的默认可玩路径。

### Brine Lark 高层治理链（不属于 stepIds）

以下节点属于 Brine Lark 高层治理延伸，**代码中存在，但不在 `quest_brine_lark.stepIds` 中**，默认路径不推进：

```
node_brine_lark_reedway_cut_release_trigger
node_brine_lark_inland_release_signal_node
node_brine_lark_sluice_blind_operator
node_brine_lark_sluice_control_node
node_brine_lark_sluice_house_controller
node_brine_lark_marsh_control_node
node_brine_lark_marsh_warden
node_brine_lark_harbor_signal_point
node_brine_lark_harbor_coordinator
node_brine_lark_harbor_authority_node
node_brine_lark_window_clerk
node_brine_lark_harbor_master
node_brine_lark_harbor_command
node_brine_lark_schedule_master
node_brine_lark_port_authority
node_brine_lark_maritime_inspector
node_brine_lark_coastal_command
node_brine_lark_coastal_commander
node_brine_lark_navigation_master
node_brine_lark_harbor_authority_council
node_brine_lark_harbor_clerk
node_brine_lark_harbor_authority
node_brine_lark_harbor_authority_registrar
node_brine_lark_maritime_oversight_board
node_brine_lark_oversight_secretary
node_brine_lark_maritime_minister
node_brine_lark_transport_cabinet
node_brine_lark_executive_office
node_brine_lark_prime_minister
```

**说明**：这些节点可作为未来章节素材保留，但当前 `quest_brine_lark.stepIds`（22 步）止于 `step_observe_reedway_cut_activity`，不包含上述任意一步。

### Brine Lark 其他保留节点

以下节点**不在默认路径**，属于垂直深化的背景内容：

| 节点 ID | 说明 |
|---------|------|
| `node_brine_lark_skiff_downstream_node` | skiff downstream 路线 |
| `node_brine_lark_punt_waterway_node` | punt 水路节点 |

---

## 三、Archive 内容

`docs/_archive/brine-lark/` 目录下已归档历史文档，不再引用：
- `locations.md`、`nodes.md`、`roles.md`、`main-chain-cleanup.md`、`soft-cleanup-plan.md`、`brine-lark-routing-index.md`
- `black-sail-quest-current-goal-boundary.md`、`black-sail-vertical-slice-milestone.md`

Archive 内容仅作历史参考，不再维护。

---

## 四、横向扩展点索引（Default Path 内）

以下横向 recap 点**属于默认路径内的正常体验**，不是额外支线：

| ID | 类型 | 位置 | 内容 |
|----|------|------|------|
| `evt_north_channel_return_wake_pattern` | 事件 | North Channel 返回 | 发现 wake pattern 指向 customs-side berths |
| `harbor-watch-north-channel-fresh-feedback` | NPC | Mira（短窗口） | Coal Berth 搜查方向提示 |
| `harbor-watch-black-sail-aftermath-feedback` | NPC | Mira（sting 后） | Seizure pattern recap，Black Sail 线收束 |
| `evt_customs_stairs_return_glance` | 事件 | Customs Tide Stairs | 发现 exchange point |
| `evt_drowned_lantern_coal_berth_route_recap` | 事件 | Coal Berth | Route pattern recap |
| `harbor-watch-drowned-lantern-coal-route-feedback` | NPC | Mira（短窗口） | Dawn-runner profile 提示 |
| `evt_brine_lark_breaker_culvert_return_ripple` | 事件 | Breaker Culvert | 发现 culvert rhythm |
| `harbor-watch-brine-lark-culvert-recap` | NPC | Mira（横向 recap） | Breaker Culvert 回归 |

---

## 五、验证方式

```bash
# 全量测试（默认路径被测试套件覆盖）
pnpm run test

# 手动验证默认终点
pnpm run dev
# 路径：Harbor → Mira → Black Sail trail → Drowned Lantern → Brine Lark → Reedway Cut → boundary
# 预期：到达 node_brine_lark_reedway_cut_activity_boundary 后 quest_brine_lark 状态为 completed
```

---

## 六、更新规则

1. 任何新增 narrative node/NPC/event，必须标注属于哪个分类
2. 任何修改默认路径节点，需同步更新本文件
3. 本文件是 `development-plan.md`「轮次详细索引」的唯一权威来源
