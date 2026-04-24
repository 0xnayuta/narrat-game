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

test("matchesNpcInteractionRule should support eventHistory onceTriggered conditions", () => {
  const state = {
    ...baseState,
    eventHistory: {
      onceTriggeredByEventId: {
        evt_market_return_glance: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  };

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "event-history-once-match",
      label: "Event history once match",
      nodeId: "node",
      eventHistory: {
        onceTriggered: { evt_market_return_glance: true },
      },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "event-history-once-mismatch",
      label: "Event history once mismatch",
      nodeId: "node",
      eventHistory: {
        onceTriggered: { evt_missing: true },
      },
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support eventHistory lastTriggeredWithinMinutes conditions", () => {
  const state = {
    ...baseState,
    time: { day: 1, hour: 8, minute: 0 },
    eventHistory: {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {
        evt_recent_signal: 470,
        evt_old_signal: 400,
      },
    },
  };

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "event-history-recent-match",
      label: "Event history recent match",
      nodeId: "node",
      eventHistory: {
        lastTriggeredWithinMinutes: { evt_recent_signal: 30 },
      },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "event-history-recent-mismatch",
      label: "Event history recent mismatch",
      nodeId: "node",
      eventHistory: {
        lastTriggeredWithinMinutes: { evt_old_signal: 30 },
      },
    }),
    false,
  );
});

test("evaluateNpcInteractionConditions should report eventHistory mismatch reasons", () => {
  const result = evaluateNpcInteractionConditions(baseState, {
    eventHistory: {
      onceTriggered: { evt_market_return_glance: true },
    },
  });

  assert.equal(result.matched, false);
  assert.deepEqual(
    result.reasons.map((reason) => reason.code),
    ["eventHistory"],
  );
  assert.equal(result.reasons[0].key, "evt_market_return_glance");
  assert.equal(result.reasons[0].expected, true);
  assert.equal(result.reasons[0].actual, false);
});

test("matchesNpcInteractionRule should support eventHistory in nested groups", () => {
  const state = {
    ...baseState,
    eventHistory: {
      onceTriggeredByEventId: {
        evt_harbor_return_patrol_glance: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  };

  assert.equal(
    matchesNpcInteractionRule(state, {
      id: "event-history-nested-match",
      label: "Event history nested match",
      nodeId: "node",
      all: [
        { requiredVars: { reputation: { ">=": 1 } } },
        {
          any: [
            { eventHistory: { onceTriggered: { evt_missing: true } } },
            { eventHistory: { onceTriggered: { evt_harbor_return_patrol_glance: true } } },
          ],
        },
      ],
    }),
    true,
  );
});

test("matchesNpcInteractionRule should support any groups", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "any-match",
      label: "Any match",
      nodeId: "node",
      any: [
        { requiredFlags: { vendor_met: true } },
        { requiredVars: { reputation: { ">=": 1 } } },
      ],
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "any-mismatch",
      label: "Any mismatch",
      nodeId: "node",
      any: [
        { requiredFlags: { vendor_met: true } },
        { requiredVars: { reputation: { ">=": 5 } } },
      ],
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support all groups", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "all-match",
      label: "All match",
      nodeId: "node",
      all: [
        { requiredFlags: { vendor_met: false } },
        { requiredVars: { reputation: { ">=": 1 } } },
      ],
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "all-mismatch",
      label: "All mismatch",
      nodeId: "node",
      all: [
        { requiredFlags: { vendor_met: false } },
        { requiredVars: { reputation: { ">=": 5 } } },
      ],
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support not groups", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "not-match",
      label: "Not match",
      nodeId: "node",
      not: {
        requiredFlags: { vendor_met: true },
      },
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "not-mismatch",
      label: "Not mismatch",
      nodeId: "node",
      not: {
        requiredFlags: { vendor_met: false },
      },
    }),
    false,
  );
});

test("matchesNpcInteractionRule should support nested all/any/not composition", () => {
  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "nested-match",
      label: "Nested match",
      nodeId: "node",
      all: [
        {
          any: [
            { requiredVars: { reputation: { ">=": 2 } } },
            { requiredFlags: { vendor_met: false } },
          ],
        },
        {
          not: {
            requiredTimeOfDay: "evening",
          },
        },
      ],
    }),
    true,
  );

  assert.equal(
    matchesNpcInteractionRule(baseState, {
      id: "nested-mismatch",
      label: "Nested mismatch",
      nodeId: "node",
      all: [
        {
          any: [
            { requiredVars: { reputation: { ">=": 2 } } },
            { requiredFlags: { vendor_met: false } },
          ],
        },
        {
          not: {
            requiredTimeOfDay: "morning",
          },
        },
      ],
    }),
    false,
  );
});

test("evaluateNpcInteractionConditions should report group mismatch reasons for any/not", () => {
  const anyResult = evaluateNpcInteractionConditions(baseState, {
    any: [
      { requiredFlags: { vendor_met: true } },
      { requiredVars: { reputation: { ">=": 5 } } },
    ],
  });

  assert.equal(anyResult.matched, false);
  assert.deepEqual(anyResult.reasons.map((reason) => reason.code), ["group"]);
  assert.equal(anyResult.reasons[0].expected, "any");

  const notResult = evaluateNpcInteractionConditions(baseState, {
    not: {
      requiredFlags: { vendor_met: false },
    },
  });

  assert.equal(notResult.matched, false);
  assert.deepEqual(notResult.reasons.map((reason) => reason.code), ["group"]);
  assert.equal(notResult.reasons[0].expected, "not");
});
