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
