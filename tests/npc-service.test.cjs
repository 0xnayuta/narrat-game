const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getAvailableNpcInteractions,
  getNpcInteractionDebugInfo,
  resolveNpcInteraction,
} = require("../.tmp-demo-tests/engine/world/index.js");

const npcs = [
  {
    id: "vendor",
    name: "Vendor",
    homeLocationId: "market",
    interactions: [
      {
        id: "first",
        label: "Talk to Vendor",
        nodeId: "intro",
        requiredFlags: { vendor_met: false },
        requiredQuests: { quest_intro_walk: "completed" },
        requiredVars: { current_goal: "market_visited" },
        requiredTimeOfDay: "morning",
      },
      {
        id: "repeat",
        label: "Talk again",
        nodeId: "repeat",
        requiredFlags: { vendor_met: true },
        requiredQuests: { quest_intro_walk: "completed" },
        requiredVars: { current_goal: "market_visited" },
        requiredTimeOfDay: "morning",
      },
    ],
  },
];

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 8, minute: 0 },
  currentLocationId: "market",
  flags: {},
  quests: {
    quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
  },
  inventory: {},
  vars: {},
};

test("NpcService should hide interactions when quest, vars or time requirements are not met", () => {
  assert.equal(resolveNpcInteraction(baseState, npcs[0]), null);
  assert.deepEqual(getAvailableNpcInteractions(baseState, npcs), []);

  const wrongVarState = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    vars: {
      current_goal: "visit_market",
    },
  };

  assert.equal(resolveNpcInteraction(wrongVarState, npcs[0]), null);
  assert.deepEqual(getAvailableNpcInteractions(wrongVarState, npcs), []);

  const wrongTimeState = {
    ...baseState,
    time: { day: 1, hour: 18, minute: 0 },
    flags: { vendor_met: false },
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    vars: {
      current_goal: "market_visited",
    },
  };

  assert.equal(resolveNpcInteraction(wrongTimeState, npcs[0]), null);
  assert.deepEqual(getAvailableNpcInteractions(wrongTimeState, npcs), []);
});

test("NpcService should resolve first and repeat interaction variants", () => {
  const completedState = {
    ...baseState,
    flags: { vendor_met: false },
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    vars: {
      current_goal: "market_visited",
    },
  };

  assert.deepEqual(resolveNpcInteraction(completedState, npcs[0]), {
    id: "first",
    label: "Talk to Vendor",
    nodeId: "intro",
    requiredFlags: { vendor_met: false },
    requiredQuests: { quest_intro_walk: "completed" },
    requiredVars: { current_goal: "market_visited" },
    requiredTimeOfDay: "morning",
  });

  assert.deepEqual(getAvailableNpcInteractions(completedState, npcs), [
    {
      npcId: "vendor",
      npcName: "Vendor",
      label: "Talk to Vendor",
      nodeId: "intro",
    },
  ]);

  const repeatState = {
    ...completedState,
    flags: { vendor_met: true },
  };

  assert.deepEqual(getAvailableNpcInteractions(repeatState, npcs), [
    {
      npcId: "vendor",
      npcName: "Vendor",
      label: "Talk again",
      nodeId: "repeat",
    },
  ]);
});

test("NpcService should provide debug reasons for blocked interaction rules", () => {
  const blockedState = {
    ...baseState,
    time: { day: 1, hour: 18, minute: 0 },
    flags: { vendor_met: false },
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    vars: {
      current_goal: "visit_market",
    },
  };

  const debugInfo = getNpcInteractionDebugInfo(blockedState, npcs);
  assert.equal(debugInfo.length, 1);
  assert.equal(debugInfo[0].resolvedInteractionId, null);

  const firstRule = debugInfo[0].rules.find((rule) => rule.ruleId === "first");
  assert.ok(firstRule);
  assert.equal(firstRule.matched, false);
  assert.deepEqual(
    firstRule.reasons.map((reason) => ({
      code: reason.code,
      key: reason.key,
      expected: reason.expected,
      actual: reason.actual,
    })),
    [
      {
        code: "var",
        key: "current_goal",
        expected: "market_visited",
        actual: "visit_market",
      },
      {
        code: "timeOfDay",
        key: undefined,
        expected: "morning",
        actual: "evening",
      },
    ],
  );
});
