# 架构总览

## 分层结构

```
src/
├── engine/          核心逻辑层（纯函数，TypeScript 类型边界）
│   ├── conditions/  共享条件求值器
│   ├── content/    内容加载与验证
│   ├── core/       核心类型（基础定义，不含运行时）
│   ├── events/     事件系统（selector + history）
│   ├── modules/    模块注册（骨架）
│   ├── narrative/ 叙事运行时（节点导航 + choice 过滤 + 效果应用）
│   ├── quests/    任务服务
│   ├── rng/       随机数服务
│   ├── runtime/   运行时编排（GameSession）
│   ├── save/      存档服务（serializer + SaveService）
│   ├── script/    脚本解析（骨架）
│   ├── state/     状态管理
│   ├── time/      时间系统
│   ├── types/     核心类型定义
│   └── world/     世界服务（LocationService + NpcService + NpcInteractionMatcher）
│
├── content/        内容包（JSON schema 风格，engine 无直接依赖具体内容）
│   └── demo/      Demo 内容包
│       ├── bundle.ts       统一导出
│       ├── events.ts       22 个事件
│       ├── locations.ts    23 个地点
│       ├── narrative.ts    叙事图（2529 行，120+ choices）
│       ├── npcs.ts         2 个 NPC，9 个 interactions
│       ├── quests.ts       4 条任务链
│       └── loader.ts       内容加载
│
├── ui/             前端展示层（Vue 组件，不含核心规则逻辑）
│   └── text-rpg/   文本 RPG UI 组件
│
└── app/            应用入口
    ├── DemoApp.vue           Demo UI
    └── createDemoSession.ts  Session 创建
```

## 关键类型边界

- **对外类型**（`src/engine/types/`）：稳定，外部内容直接引用
  - `EventDefinition`、`NarrativeNode`、`NarrativeChoice`、`NPCDefinition`、`QuestDefinition`
  - `EventConditions`、`NPCInteractionConditions`、`NarrativeChoiceEffects`
  - `GameState`、`SaveData`

- **内部类型**（`src/engine/` 内部模块）：不直接暴露给 content 层
  - `StateConditions`、`EventHistoryEntry`（内部求值用）
  - `EventHistoryState`（通过 `readEventHistoryState` adapter 读取）

## 测试入口

- `npm run test:events` — 事件系统（44 个）
- `npm run test:npc-matcher` — NPC 匹配（18 个）
- `npm run test:quest-effects` — 任务效果（23 个）
- `npm run test:demo-session` — Session 集成（8 个）
- `npm run test:demo-flow` — Demo 全流程（1 个）
- `npm run test:npc-event-loop` — NPC → choice → event 闭环（37 个）
- `npm run type-check` — 类型检查

**当前 `tests/*.cjs` 总计 194 个 `test(...)` 用例**。按需运行对应模块。

## 权威文档

- 完整架构说明：`docs/01-architecture/module-boundaries.md`
- 运行时数据流：`docs/01-architecture/data-flow.md`
- 效果语义：`docs/conditions-effects-summary.md`（唯一权威来源）
- 架构入口：`docs/README.md`
