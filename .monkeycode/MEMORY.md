# 用户指令记忆

本文件记录了用户的指令、偏好和教导，用于在未来的交互中提供参考。

## 格式

### 用户指令条目
用户指令条目应遵循以下格式：

[用户指令摘要]
- Date: [YYYY-MM-DD]
- Context: [提及的场景或时间]
- Instructions:
  - [用户教导或指示的内容，逐行描述]

### 项目知识条目
Agent 在任务执行过程中发现的条目应遵循以下格式：

[项目知识摘要]
- Date: [YYYY-MM-DD]
- Context: Agent 在执行 [具体任务描述] 时发现
- Category: [代码结构|代码模式|代码生成|构建方法|测试方法|依赖关系|环境配置]
- Instructions:
  - [具体的知识点，逐行描述]

## 去重策略
- 添加新条目前，检查是否存在相似或相同的指令
- 若发现重复，跳过新条目或与已有条目合并
- 合并时，更新上下文或日期信息
- 这有助于避免冗余条目，保持记忆文件整洁

## 条目

[Narrat Engine 协作边界与当前阶段]
- Date: 2026-04-23
- Context: 用户在当前会话开头明确给出仓库协作约束与当前主路径
- Instructions:
  - 默认围绕 `ContentBundle`、`GameSession`、`DemoApp` 三个边界工作。
  - 事件系统默认以 `eventHistory` 与 adapter 层为主逻辑边界。
  - 不要在 UI 或新核心逻辑里新增对 `event.once.*` / `event.cooldown.*` legacy key 的直接读取。
  - 不要绕过 adapter 层扩散事件历史读写逻辑。
  - 不要把规则逻辑塞进 UI 组件。
  - 一次只推进一个小目标；每轮开始前先阅读相关文件并给出简短计划。
  - 优先最小实现，保持 `content / engine / ui` 分层、类型完整、可测试。
  - 每轮结束时要给出下一轮建议，并标明最推荐项。

[Brine Lark 阶段三保持为连续 pursuit block]
- Date: 2026-04-23
- Context: 用户要求继续在 `quest_brine_lark` 内聚合推进阶段三，而不是拆成新的 quest
- Instructions:
  - 将 `quest_brine_lark` 视为当前阶段三的主结构边界。
  - 不要立刻继续新建新的 `quest_xxx`。
  - 将 `suspect`、`trace`、`route`、`observation`、`handoff pattern` 视为同一段连续追踪操作。
  - 后续优先在这个块里再长 1 到 2 拍内容，观察它如何自然收束或自然产生新的断层。
  - 在锁定 receiving clerk 后，优先补“如何接近对方”的一拍，而不是立刻进入 confrontation。
  - 在设定 manifest pretext 之后，优先补 clerk 的“第一反应”这一拍，先验证反应形状，不急着展开完整分叉。
  - 当第一反应自然泄漏出新点位时，优先顺着该点位继续追一拍，而不是横向扩展新线。
  - 当 `quest_brine_lark` 已完成从 handoff observation 到 paper trace 再到 partial destination hint 的收束后，优先把它视为当前阶段三的自然收束点，不继续硬写新节点。
  - 当 `quest_brine_lark` 已经形成从港内 handoff 到 outer mooring line，再到 identity swap 与 outer marker set 的完整连续机制链时，可正式判定当前阶段已完成。
  - 当前阶段完成后，下一阶段应定义为“识别 `outer marker set` 的接手方”。
