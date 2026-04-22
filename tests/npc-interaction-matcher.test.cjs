const test = require("node:test");
const assert = require("node:assert/strict");

const {
  evaluateNpcInteractionConditions,
  matchesNpcInteractionRule,
} = require("../.tmp-demo-tests/engine/world/index.js");

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 8, minute: 0 },
  currentLocationId: "market",
  flags: {
    vendor_met: false,
  },
  quests: {
    quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
  },
  inventory: {},
  vars: {
    current_goal: "market_visited",
    reputation: 1,
    can_trade: true,
  },
};

test("matchesNpcInteractionRule should return true when all conditions match", () => {
  const rule = {
    id: "vendor-first-talk",
    label: "Talk to Vendor",
    nodeId: "node_vendor_intro",
    requiredFlags: { vendor_met: false },
    requiredQuests: { quest_intro_walk: "completed" },
    requiredVars: {
      current_goal: "market_visited",
      reputation: 1,
      can_trade: true,
    },
    requiredTimeOfDay: "morning",
  };

  assert.equal(matchesNpcInteractionRule(baseState, rule), true);
});

test("matchesNpcInteractionRule should return false when any condition group mismatches", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "flag-mismatch",
      label: "Flag mismatch",
      nodeId: "node",
      requiredFlags: { vendor_met: true },
    }),
    false,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "quest-mismatch",
      label: "Quest mismatch",
      nodeId: "node",
      requiredQuests: { quest_intro_walk: "active" },
    }),
    false,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-mismatch",
      label: "Var mismatch",
      nodeId: "node",
      requiredVars: { current_goal: "visit_market" },
    }),
    false,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "time-mismatch",
      label: "Time mismatch",
      nodeId: "node",
      requiredTimeOfDay: "evening",
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support numeric comparison predicates in requiredVars", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-comparison-match",
      label: "Var comparison match",
      nodeId: "node",
      requiredVars: {
        reputation: { ">=": 1, "<": 5 },
      },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-comparison-mismatch",
      label: "Var comparison mismatch",
      nodeId: "node",
      requiredVars: {
        reputation: { ">": 5 },
      },
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support != and in predicates in requiredVars", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-predicate-match",
      label: "Var predicate match",
      nodeId: "node",
      requiredVars: {
        current_goal: { "!=": "rest" },
        current_goal_alias: { in: ["market_visited", "visit_market"] },
      },
    }),
    false,
  );

  const state = {
    ...baseState,
    vars: {
      ...baseState.vars,
      current_goal_alias: "market_visited",
    },
  };

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "var-predicate-match-2",
      label: "Var predicate match 2",
      nodeId: "node",
      requiredVars: {
        current_goal: { "!=": "rest" },
        current_goal_alias: { in: ["market_visited", "visit_market"] },
      },
    }),
    true,
  );
});

test("matchesNpcInteractionRule should support minimal not predicate in requiredVars", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-not-match",
      label: "Var not match",
      nodeId: "node",
      requiredVars: {
        current_goal: { not: "rest" },
        reputation: { not: { ">=": 5 } },
      },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "var-not-mismatch",
      label: "Var not mismatch",
      nodeId: "node",
      requiredVars: {
        current_goal: { not: "market_visited" },
      },
    }),
    false,
  );
});

test("matchesNpcInteractionRule should allow rules without conditions", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "always",
      label: "Always available",
      nodeId: "node",
    }),
    true,
  );
});

test("evaluateNpcInteractionConditions should provide mismatch reasons for debug", () => {
  const result = evaluateNpcInteractionConditions(baseState, {
    requiredFlags: { vendor_met: true },
    requiredQuests: { quest_intro_walk: "active" },
    requiredVars: { current_goal: "visit_market" },
    requiredTimeOfDay: "evening",
  });

  assert.equal(result.matched, false);
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["flag", "quest", "var", "timeOfDay"],
  );
});

test("matchesNpcInteractionRule should match by required quest step", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "step-match",
      label: "Step match",
      nodeId: "node",
      requiredQuestSteps: { quest_intro_walk: "step_go_market" },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "step-mismatch",
      label: "Step mismatch",
      nodeId: "node",
      requiredQuestSteps: { quest_intro_walk: "step_return" },
    }),
    false,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "step-missing",
      label: "Step missing",
      nodeId: "node",
      requiredQuestSteps: { quest_unknown: "step_any" },
    }),
    false,
  );
});

test("evaluateNpcInteractionConditions should report questStep mismatch reasons", () => {
  const result = evaluateNpcInteractionConditions(baseState, {
    requiredQuestSteps: { quest_intro_walk: "step_return", quest_unknown: "step_any" },
  });

  assert.equal(result.matched, false);
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["questStep", "questStep"],
  );
  assert.equal(result.reasons[0].key, "quest_intro_walk");
  assert.equal(result.reasons[0].expected, "step_return");
  assert.equal(result.reasons[0].actual, "step_go_market");
  assert.equal(result.reasons[1].key, "quest_unknown");
  assert.equal(result.reasons[1].actual, "missing");
});
