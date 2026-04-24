# 分层边界

## 三层职责

### Engine 层（`src/engine/`）

- **不依赖**具体内容（`content/demo/` 之外的内容）
- 纯函数为主，核心逻辑不写 UI 框架代码
- 类型定义是内容层的契约，修改需向后兼容
- 通过 adapter 函数（如 `readEventHistoryState`）隔离内部实现

### Content 层（`src/content/`）

- 内容包（`ContentBundle`）与 engine 通过**类型契约**交互
- 不写核心逻辑，只描述条件、效果、节点关系
- 内容由 `GameSession` 运行时驱动，content 本身无状态
- 新增内容遵循已有 schema，不发明新 DSL

### UI 层（`src/ui/`）

- Vue 组件负责展示，不承载核心规则逻辑
- 通过 `GameSession` 的只读 API 获取状态（`getState()`、`getCurrentScene()`）
- 通过 `GameSession` 的命令 API 修改状态（`travelTo`、`choose`、`interactWithNpc`）
- 不直接读写 `GameState` 内部字段

## 模块边界规则

| 规则 | 说明 |
|---|---|
| Engine → Content | 通过类型定义和接口，不直接引用具体内容 |
| Content → Engine | 通过类型定义的条件/效果 schema，不直接调用 engine 内部函数 |
| UI → Engine | 通过 `GameSession` 公开 API，不直接操作 state |
| Engine → UI | 通过返回数据，UI 自行渲染 |

## 禁止越界

1. **Engine 层禁止**引入 Vue/UI 依赖
2. **UI 层禁止**写条件判断、事件选择、任务推进等核心逻辑
3. **Content 层禁止**引用 `GameState` 运行时内部字段（只读/写 `NarrativeChoiceEffects` 描述的效果）
4. **禁止**在运行时直接操作 legacy `flags`/`vars` 的 `event.once.*` / `event.cooldown.*` key

## 存档边界

- `eventHistory` 是主逻辑边界
- Legacy `flags`/`vars` 仅用于兼容读取和存档迁移
- 通过 adapter 层（`readEventHistoryState`）读取，不直接依赖 legacy key
