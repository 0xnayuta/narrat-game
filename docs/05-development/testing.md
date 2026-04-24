# 测试命令与入口

## 测试命令

```bash
# 按模块
npm run test:events            # 事件系统（44 个）
npm run test:npc-matcher       # NPC 匹配（18 个）
npm run test:quest-effects     # 任务效果（23 个）
npm run test:demo-session      # Session 集成（8 个）
npm run test:demo-flow         # 全流程（1 个）
npm run test:npc-event-loop    # NPC → choice → event 闭环（37 个）
npm run test:choice-visibility # Choice 可见性（17 个）
npm run test:content           # Content bundle 验证（1 个）
npm run test:demo-branch       # 内容分支可见性（10 个）
npm run test:npc               # NPC service（4 个）
npm run test:save              # 存档 roundtrip（3 个）
npm run test:add-vars          # addVars / addStats（10 个）
npm run test:initial-vars      # 初始状态（3 个）
npm run test:narrative         # Narrative 运行时（3 个）
npm run test:time              # 时间系统（5 个）
npm run test:world             # 世界服务（3 个）

# 类型检查
npm run type-check
```

**当前 `tests/*.cjs` 总计 194 个 `test(...)` 用例**。按需运行对应模块。

## 测试文件位置

```
tests/
├── events-selector.test.cjs          selectEvent / priority / weight
├── events-history.test.cjs          eventHistory / once / cooldown
├── npc-interaction-matcher.test.cjs NPC 条件匹配 / debug 原因
├── quest-effects.test.cjs          Quest 激活 / 推进 / 完成
├── demo-session.test.cjs           Session 集成
├── demo-flow.test.cjs              全 demo 流程
├── npc-event-loop.test.cjs          NPC → choice → event 闭环
├── choice-visibility.test.cjs       Choice 条件过滤
├── content-bundle.test.cjs          ContentBundle 验证
├── demo-content-branch.test.cjs     分支可见性
├── demo-compass-branch.test.cjs     Compass 分支可见性
├── npc-service.test.cjs             NPC service + debug info
├── save-roundtrip.test.cjs         Save/load roundtrip
├── add-vars-stats.test.cjs          addVars / addStats
├── initial-vars.test.cjs            初始状态
├── narrative-runtime.test.cjs       Narrative 图导航
├── time-system.test.cjs            时间推进
└── world-location.test.cjs         地点服务
```

## 编写新测试

```javascript
// tests/my-feature.test.cjs
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { createDemoSession } = require("../dist/src/app/createDemoSession");

describe("my feature", () => {
  it("should do X", () => {
    const session = createDemoSession();
    // ...
  });
});
```

## 临时测试文件

- 临时测试文件放 `tests/tmp/`，不在仓库提交
- 或在现有测试文件中用 `describe.skip` 临时标注
- 禁止在 `docs/` 中存放测试文件

## 调试

- `npm run dev` — 启动 Vue UI
- DebugPanel 显示实时状态（flags / vars / quests / eventHistory / NPC mismatch reason）
- `rg "TODO" src/ --type ts -n` — 查看已知问题
