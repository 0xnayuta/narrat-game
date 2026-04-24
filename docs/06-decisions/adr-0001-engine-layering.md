# ADR-0001：引擎分层决策

## 状态：已通过

## 背景

在 engine 重写过程中，需要明确各层的职责边界，避免核心逻辑泄漏到 UI 层，也避免内容层依赖 engine 内部实现。

## 决策

### 1. 三层分离

```
engine/     → 核心逻辑，纯函数，TypeScript 类型边界
content/     → 游戏内容，JSON schema 风格，engine 无直接依赖
ui/          → 前端展示，Vue 组件，不承载核心规则逻辑
```

### 2. 条件系统边界

- 对外：`EventConditions`（events）、`NPCInteractionConditions`（NPCs）
- 内部统一求值：`StateConditions`（`src/engine/conditions/state.ts`）
- 内容层不感知 `StateConditions`，只感知外层 schema

### 3. 效果系统边界

- 对外：`NarrativeChoiceEffects`
- 内部统一应用：`applyNarrativeChoiceEffects`（`src/engine/narrative/effects.ts`）
- 执行顺序固定，不允许内容层自定义顺序

### 4. 状态访问边界

- `eventHistory` 是主逻辑边界
- 通过 `readEventHistoryState` adapter 读取，不直接访问 legacy flags/vars
- legacy `flags`/`vars` 仅用于兼容读取和存档迁移

## 结果

- Engine / content / session 边界具备独立测试覆盖（当前 192 个 `test(...)` 用例）
- UI 层通过 `GameSession` 公开 API 交互，不依赖内部实现
- 内容层通过类型契约与 engine 交互，可独立演进

## 相关决策

- `docs/event-history-migration-decision.md` — eventHistory 迁移决策（归档）
- `docs/conditions-effects-summary.md` — 效果语义权威文档
