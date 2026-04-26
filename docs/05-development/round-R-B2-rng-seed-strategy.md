# R-B2：RNG 种子策略分析

## 目标

根据 `roadmap.md` Engine TODO 3（RNG seed / 确定性重放），分析当前 RNG 架构，制定确定性种子策略。

---

## 当前架构

### RNG 注入链路

```
DemoApp.vue
  └─ createDemoSession()
       └─ createGameSessionFromBundle()
            └─ new GameSession(..., options: { randomFloat? })

selectResolvedEvent(candidates, randomFloat = Math.random)
  └─ 当 weighted tie-break 时使用 randomFloat()
```

### 当前实现

**`RngService.ts`**：空的占位实现
```typescript
export class RngService {
  nextFloat(): number {
    // TODO: Replace with seeded deterministic implementation.
    return Math.random();
  }
}
```

**`GameSessionOptions`**：接受 `randomFloat` 注入，默认为 `Math.random`
```typescript
export interface GameSessionOptions extends RuntimeEventHistoryOptions {
  randomFloat?: () => number;
}
```

### 测试中的 RNG 注入

**`tests/demo-session.test.cjs`** 已验证注入式 RNG 在 weighted tie-break 中工作正常。

---

## 需求分析

### 需要确定性重放的场景

| 场景 | 是否需要确定性 | 当前状态 |
|------|--------------|---------|
| QA 测试 / 自动化测试 | ✅ 高优先级 | 已通过注入 RNG 覆盖 |
| 调试回放 | ✅ 高优先级 | 需要 session 序列化支持 |
| 玩家存档重放 | ⚠️ 中优先级 | 序列化已有，需要验证 |
| 多人同步模式 | ✅ 高优先级（如果做） | 目前无此需求 |

### 不需要确定性重放的场景

- 正常游戏中的事件随机性（这是设计意图，不是 bug）
- UI 动画随机性

---

## 策略选择

### 方案对比

| 方案 | 描述 | 优点 | 缺点 |
|------|------|------|------|
| **A. Mulberry32 PRNG + seed** | 轻量纯函数 PRNG，接受 uint32 seed | 确定性强、可序列化、易测试 | 需要显式 seed 管理 |
| **B. Xoshiro128** | 高质量 PRNG，接受种子数组 | 统计学质量更好 | 实现更复杂 |
| **C. 内置 Math.random()** | 不改动 | 最简单 | 不可预测、无法测试确定性 |
| **D. Crypto.getRandomValues** | 密码学随机 | 安全性好 | 不可预测、无法测试确定性 |

**推荐方案 A（Mulberry32）** — 原因：
1. 纯函数，无副作用，测试友好
2. 单 uint32 seed，存储和传输极简
3. 适合游戏场景（均匀分布、周期长）
4. 与测试桩兼容（注入 mock）

---

## 推荐实现方案

### 步骤 1：实现 `SeededRandomService`

```typescript
// src/engine/rng/SeededRandomService.ts

/** Mulberry32 — fast, seedable, pure-function PRNG */
export function createMulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export class SeededRandomService {
  private readonly nextFloat: () => number;

  constructor(seed: number) {
    this.nextFloat = createMulberry32(seed);
  }

  next(): number {
    return this.nextFloat();
  }
}
```

### 步骤 2：在 `GameSession` 中支持 seed

```typescript
// GameSessionOptions
export interface GameSessionOptions extends RuntimeEventHistoryOptions {
  randomFloat?: () => number;
  seed?: number;  // NEW
}
```

在 `createSessionFromBundle` 中：
- 如果提供了 `seed`，创建 `SeededRandomService` 并注入
- 如果提供了 `randomFloat`，优先使用 `randomFloat`
- 如果都没提供，使用 `Math.random`（向后兼容）

### 步骤 3：session 序列化包含 RNG seed

存档时将 seed 存入 SaveFile，重放时从存档恢复 seed：
```typescript
interface SaveFile {
  version: number;
  savedAt: string;
  slotId: string;
  state: GameState;
  rngSeed?: number;  // NEW
}
```

---

## 当前 Demo 优先级

**当前阶段不需要实现确定性重放。** 原因：
1. Demo 阶段的测试已通过注入 RNG 覆盖
2. 主要内容是叙事驱动的，不依赖事件随机性
3. `RngService` TODO 不会阻塞任何 Demo 功能

**建议**：标记 roadmap.md 中的 RNG seed 为 `⚠️ 阶段 C 优先级`，暂不实现。

---

## R-B2 状态

- 架构分析：✅ 完成
- 策略制定：✅ 完成
- 代码实现：⏸️ 暂缓（建议延迟到阶段 C）
- 文档输出：✅ 完成

---

## 下一轮

**R-B2 建议推迟到阶段 C**。R-B 全部完成后汇报。是否继续进入 **R-C** 内容层扩展，还是就此停止并汇报？等待指示。
