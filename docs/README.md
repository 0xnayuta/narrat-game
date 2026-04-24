# 文档索引

## 目录结构

```
docs/
├── README.md                          ← 本文档，文档索引
├── 00-overview/                      ← 项目概览
│   ├── project-goal.md               ← 项目目标与约束
│   ├── roadmap.md                    ← 当前阶段与已知问题
│   └── glossary.md                   ← 术语表
├── 01-architecture/                  ← 架构说明
│   ├── architecture-overview.md      ← 架构总览
│   ├── module-boundaries.md          ← 分层边界
│   └── data-flow.md                 ← 运行时数据流
├── 04-demo/                          ← Demo 说明
│   ├── demo-scope.md                 ← Demo 范围与目标
│   └── demo-walkthrough.md          ← 手动验证路径
├── 05-development/                   ← 开发指南
│   ├── testing.md                    ← 测试命令与入口
│   ├── agent-workflow.md             ← Agent 工作约束（AGENTS.md 摘要）
│   └── temp-files.md                ← 临时产物策略
├── 06-decisions/                     ← 重要决策记录
│   └── adr-0001-engine-layering.md  ← 引擎分层决策
└── 99-reference/                     ← 参考资料（外部仓库策略）
    └── reference-policy.md          ← DoL 参考策略
```

## 权威文档（唯一来源）

以下文档为唯一权威来源，其他文档引用但不重复内容：

| 文档 | 权威内容 |
|---|---|
| `AGENTS.md` | Agent 工作约束、工作阶段、禁止事项 |
| `docs/conditions-effects-summary.md` | Narrative / Quest effect 语义与执行顺序 |
| `docs/99-reference/reference-policy.md` | DoL 参考策略与强制规则 |
| `docs/dol-reference-plan.md` | 当前 DoL 参考专题与实现计划 |
| `docs/narrative-quest-effects-audit.md` | quest 效果使用审计 |
| `docs/04-demo/demo-scope.md` | Demo 范围（含 Brine Lark 当前状态） |

## 文档生命周期

- **当前阶段**：基础引擎搭建 + 最小 demo + DoL 参考定向
- **02-engine/** 和 **03-content/**：在 engine/content 稳定后再建，届时从 `01-architecture/` 和 `src/engine/types/` 中的实际类型定义生成
- **临时产物**：统一放到 `tests/tmp/` 或 `tmp/`，不在 `docs/` 中存放
- **归档**：不再维护的旧文档移入 `docs/_archive/`

## 快速入口

- 新加入项目？先读 `docs/00-overview/project-goal.md`
- 想了解 engine 分层？读 `docs/01-architecture/module-boundaries.md`
- 想运行 demo？读 `docs/04-demo/demo-scope.md` + `docs/04-demo/demo-walkthrough.md`
- 想参考 DoL？读 `docs/99-reference/reference-policy.md` + `docs/dol-reference-plan.md`
- 想了解 engine 效果模型？读 `docs/conditions-effects-summary.md`
