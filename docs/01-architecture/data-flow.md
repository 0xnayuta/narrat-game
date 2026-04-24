# 运行时数据流

## 主循环

```
用户操作（travel / choose / wait / NPC interact）
  → GameSession.command()
    → 修改 GameState（flags / vars / quests / time / eventHistory）
    → 返回 { triggeredEventId? }
  → 检查是否有 triggeredEventId
    → EventSelector.selectEvent()
      → getCandidateEvents()（过滤 once/cooldown/conditions）
      → selectResolvedEvent()（priority-first + weight tie-break）
    → NarrativeRuntime.goToNode()
      → 返回 NarrativeScene
  → UI 渲染 scene.text + scene.choices
```

## 事件触发时序

```
GameSession.travelTo("harbor")
  → time += travelMinutes
  → EventSelector.selectEvent(events, state, "on-location-enter")
    → getCandidateEvents() → filter(once + cooldown + conditions)
    → selectResolvedEvent() → 选出一个或 null
  → 如果有事件：
    → NarrativeRuntime.goToNode(payload.narrativeNodeId)
      → 应用 node.effects（如有）
      → 返回 NarrativeScene
  → 返回 { triggeredEventId? }
```

## Choice 选择时序

```
用户选择 choiceId
  → GameSession.choose(choiceId)
    → NarrativeRuntime.applyChoice(choiceId)
      → evaluate conditions → 过滤不可见的 choice
      → applyNarrativeChoiceEffects(effects)
        → 按顺序：setFlags → setVars → startQuest → resetQuestStep → setQuestStep → advanceQuestStep → setQuests → completeQuest / failQuest
      → next node 推进
    → 检查 after-choice 事件（EventSelector + "after-choice" trigger）
    → 返回 { triggeredEventId? }
```

## 存档流程

```
保存：
  GameState → SaveService.save(slot)
    → Serializer.serialize(state)
    → localStorage.setItem(slot, saveData)

加载：
  localStorage.getItem(slot) → SaveService.load(slot)
    → Serializer.deserialize(data)
    → GameSession.restoreState(state)
```

## 关键函数

| 函数 | 位置 | 作用 |
|---|---|---|
| `createDemoSession()` | `src/app/createDemoSession.ts` | 创建可复用的 demo session |
| `selectEvent()` | `src/engine/events/selector.ts` | 事件选择入口 |
| `evaluateStateConditions()` | `src/engine/conditions/state.ts` | 共享条件求值 |
| `applyNarrativeChoiceEffects()` | `src/engine/narrative/effects.ts` | 效果应用（固定顺序） |
| `evaluateChoices()` | `src/engine/narrative/visibility.ts` | choice 可见性过滤 |
| `matchNpcInteraction()` | `src/engine/world/NpcInteractionMatcher.ts` | NPC 交互匹配 |
