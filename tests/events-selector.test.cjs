const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCandidateEvents,
  selectEvent,
  selectResolvedEvent,
} = require("../.tmp-demo-tests/engine/events/index.js");

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 9, minute: 0 },
  currentLocationId: "street",
  flags: { intro_done: true },
  quests: {},
  inventory: {},
  vars: {},
};

const events = [
  {
    id: "street-morning",
    type: "ambient",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 8, endHour: 12 },
      flags: { intro_done: true },
    },
  },
  {
    id: "street-once",
    type: "ambient",
    trigger: "on-location-enter",
    once: true,
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 8, endHour: 12 },
    },
  },
  {
    id: "market-event",
    type: "ambient",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["market"],
    },
  },
];

test("event selector should filter by trigger and conditions", () => {
  const candidates = getCandidateEvents(events, baseState, "on-location-enter");
  assert.deepEqual(
    candidates.map((event) => event.id),
    ["street-morning", "street-once"],
  );

  const selected = selectEvent(events, baseState, "on-location-enter");
  assert.equal(selected?.id, "street-morning");
  assert.equal(selectResolvedEvent([]), null);
});

test("event selector should skip once events already marked as triggered", () => {
  const state = {
    ...baseState,
    flags: {
      ...baseState.flags,
      "event.once.street-once": true,
    },
  };

  const candidates = getCandidateEvents(events, state, "on-location-enter");
  assert.deepEqual(candidates.map((event) => event.id), ["street-morning"]);
});

test("event selector should prioritize higher priority while keeping stable tie order", () => {
  const priorityEvents = [
    {
      id: "low-priority-first",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-priority-second",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-priority-third",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selectedHigh = selectEvent(priorityEvents, baseState, "on-location-enter");
  assert.equal(selectedHigh?.id, "high-priority-second");

  const defaultPriorityEvents = [
    {
      id: "default-priority-a",
      type: "ambient",
      trigger: "on-location-enter",
      conditions: { locationIds: ["street"] },
    },
    {
      id: "default-priority-b",
      type: "ambient",
      trigger: "on-location-enter",
      conditions: { locationIds: ["street"] },
    },
  ];

  const selectedDefault = selectEvent(defaultPriorityEvents, baseState, "on-location-enter");
  assert.equal(selectedDefault?.id, "default-priority-a");
});

test("event selector should apply weight only within same highest priority group", () => {
  const weightedEvents = [
    {
      id: "high-weight-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-weight-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 3,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "lower-priority-ignored",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      weight: 999,
      conditions: { locationIds: ["street"] },
    },
  ];

  const pickA = selectEvent(weightedEvents, baseState, "on-location-enter", () => 0.0);
  assert.equal(pickA?.id, "high-weight-a");

  const pickB = selectEvent(weightedEvents, baseState, "on-location-enter", () => 0.9);
  assert.equal(pickB?.id, "high-weight-b");
});

test("event selector should resolve equal weights predictably with injected random", () => {
  const equalWeightEvents = [
    {
      id: "equal-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "equal-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const pickA = selectEvent(equalWeightEvents, baseState, "on-location-enter", () => 0.49);
  assert.equal(pickA?.id, "equal-a");

  const pickB = selectEvent(equalWeightEvents, baseState, "on-location-enter", () => 0.5);
  assert.equal(pickB?.id, "equal-b");
});

test("event selector should keep deterministic fallback order when total weight is zero", () => {
  const zeroWeightEvents = [
    {
      id: "zero-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 0,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "zero-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 0,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(zeroWeightEvents, baseState, "on-location-enter", () => 0.99);
  assert.equal(selected?.id, "zero-a");
});

test("event selector should treat invalid weights as zero", () => {
  const invalidWeightEvents = [
    {
      id: "invalid-negative",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: -5,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "valid-positive",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 2,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "invalid-nan",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: Number.NaN,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(invalidWeightEvents, baseState, "on-location-enter", () => 0.5);
  assert.equal(selected?.id, "valid-positive");
});

test("event selector should apply once filtering before weight selection", () => {
  const weightedOnceEvents = [
    {
      id: "once-weighted",
      type: "ambient",
      trigger: "on-location-enter",
      once: true,
      priority: 10,
      weight: 100,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "repeatable-weighted",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    flags: {
      ...baseState.flags,
      "event.once.once-weighted": true,
    },
  };

  const selected = selectEvent(weightedOnceEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "repeatable-weighted");
});

test("event selector should filter out events with active cooldown", () => {
  const cooldownEvents = [
    {
      id: "cooldown-active",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      cooldownMinutes: 30,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "cooldown-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    vars: {
      ...baseState.vars,
      "event.cooldown.cooldown-active.lastTriggeredMinute": 540,
    },
  };

  const selected = selectEvent(cooldownEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "cooldown-fallback");
});

test("event selector should allow event again when cooldown has expired", () => {
  const cooldownEvent = [
    {
      id: "cooldown-expired",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      cooldownMinutes: 30,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    vars: {
      ...baseState.vars,
      "event.cooldown.cooldown-expired.lastTriggeredMinute": 500,
    },
  };

  const selected = selectEvent(cooldownEvent, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "cooldown-expired");
});

test("event selector should treat invalid cooldown values as disabled", () => {
  const invalidCooldownEvents = [
    {
      id: "invalid-cooldown-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      cooldownMinutes: Number.NaN,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "invalid-cooldown-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      cooldownMinutes: -5,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(invalidCooldownEvents, baseState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "invalid-cooldown-a");
});

test("event selector should still exclude once events even if cooldown has expired", () => {
  const onceCooldownEvents = [
    {
      id: "once-with-cooldown",
      type: "ambient",
      trigger: "on-location-enter",
      once: true,
      priority: 10,
      cooldownMinutes: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "fallback-after-once",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    flags: {
      ...baseState.flags,
      "event.once.once-with-cooldown": true,
    },
    vars: {
      ...baseState.vars,
      "event.cooldown.once-with-cooldown.lastTriggeredMinute": 1,
    },
  };

  const selected = selectEvent(onceCooldownEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "fallback-after-once");
});

test("event selector should filter by required vars", () => {
  const varEvents = [
    {
      id: "var-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        vars: { current_goal: "visit_market", known_vendor: false },
      },
    },
    {
      id: "var-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    vars: {
      ...baseState.vars,
      current_goal: "visit_market",
      known_vendor: false,
    },
  };

  const selected = selectEvent(varEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "var-match");

  const mismatched = selectEvent(
    varEvents,
    {
      ...state,
      vars: {
        ...state.vars,
        current_goal: "rest",
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "var-fallback");
});

test("event selector should filter by required quest status", () => {
  const questEvents = [
    {
      id: "quest-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        quests: { quest_intro_walk: "completed" },
      },
    },
    {
      id: "quest-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
  };

  const selected = selectEvent(questEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "quest-match");

  const mismatched = selectEvent(
    questEvents,
    {
      ...state,
      quests: {
        quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "quest-fallback");
});

test("event selector should filter by required quest step", () => {
  const questStepEvents = [
    {
      id: "step-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        questSteps: { quest_intro_walk: "step_go_market" },
      },
    },
    {
      id: "step-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
    },
  };

  const selected = selectEvent(questStepEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "step-match");

  const wrongStepState = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_return" },
    },
  };

  const mismatched = selectEvent(questStepEvents, wrongStepState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "step-fallback");

  const missingQuestState = {
    ...baseState,
    quests: {},
  };

  const missing = selectEvent(questStepEvents, missingQuestState, "on-location-enter", () => 0.0);
  assert.equal(missing?.id, "step-fallback");
});

test("event selector should support numeric comparison predicates in vars conditions", () => {
  const comparisonEvents = [
    {
      id: "comparison-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        vars: {
          gold: { ">=": 10, "<": 20 },
          threat: { "<": 5 },
        },
      },
    },
    {
      id: "comparison-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      gold: 15,
      threat: 2,
    },
  };

  const selected = selectEvent(comparisonEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "comparison-match");

  const mismatchedState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      gold: 30,
      threat: 2,
    },
  };

  const mismatched = selectEvent(comparisonEvents, mismatchedState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "comparison-fallback");
});

test("event selector should support != and in predicates in vars conditions", () => {
  const predicateEvents = [
    {
      id: "predicate-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        vars: {
          mood: { "!=": "angry" },
          weather: { in: ["sunny", "cloudy"] },
        },
      },
    },
    {
      id: "predicate-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      mood: "calm",
      weather: "sunny",
    },
  };

  const selected = selectEvent(predicateEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "predicate-match");

  const mismatchedState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      mood: "angry",
      weather: "sunny",
    },
  };

  const mismatched = selectEvent(predicateEvents, mismatchedState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "predicate-fallback");
});

test("event selector should support minimal not predicate in vars conditions", () => {
  const notEvents = [
    {
      id: "not-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        vars: {
          mood: { not: "angry" },
          gold: { not: { ">=": 100 } },
        },
      },
    },
    {
      id: "not-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      mood: "calm",
      gold: 50,
    },
  };

  const selected = selectEvent(notEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "not-match");

  const mismatchedState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      mood: "angry",
      gold: 50,
    },
  };

  const mismatched = selectEvent(notEvents, mismatchedState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "not-fallback");
});

test("event selector should support any groups in conditions", () => {
  const anyEvents = [
    {
      id: "any-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        any: [
          { flags: { vip: true } },
          { vars: { reputation: { ">=": 3 } } },
        ],
      },
    },
    {
      id: "any-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      reputation: 3,
    },
  };

  const selected = selectEvent(anyEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "any-match");

  const mismatchedState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      reputation: 1,
    },
  };

  const mismatched = selectEvent(anyEvents, mismatchedState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "any-fallback");
});

test("event selector should support all groups in conditions", () => {
  const allEvents = [
    {
      id: "all-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        all: [
          { flags: { intro_done: true } },
          { vars: { reputation: { ">=": 3 } } },
        ],
      },
    },
    {
      id: "all-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const matchingState = {
    ...baseState,
    vars: {
      ...baseState.vars,
      reputation: 3,
    },
  };

  const selected = selectEvent(allEvents, matchingState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "all-match");

  const mismatched = selectEvent(
    allEvents,
    {
      ...matchingState,
      vars: {
        ...matchingState.vars,
        reputation: 2,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "all-fallback");
});

test("event selector should support not groups in conditions", () => {
  const notEvents = [
    {
      id: "not-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        not: {
          flags: { banned: true },
        },
      },
    },
    {
      id: "not-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(notEvents, baseState, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "not-match");

  const mismatched = selectEvent(
    notEvents,
    {
      ...baseState,
      flags: {
        ...baseState.flags,
        banned: true,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "not-fallback");
});

test("event selector should support nested all/any/not composition", () => {
  const nestedEvents = [
    {
      id: "nested-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        all: [
          {
            any: [
              { vars: { reputation: { ">=": 5 } } },
              { flags: { vip: true } },
            ],
          },
          {
            not: {
              vars: { heat: { ">=": 3 } },
            },
          },
        ],
      },
    },
    {
      id: "nested-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(
    nestedEvents,
    {
      ...baseState,
      vars: {
        ...baseState.vars,
        reputation: 5,
        heat: 1,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(selected?.id, "nested-match");

  const mismatched = selectEvent(
    nestedEvents,
    {
      ...baseState,
      vars: {
        ...baseState.vars,
        reputation: 5,
        heat: 3,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "nested-fallback");
});

test("event selector should support eventHistory.onceTriggered conditions", () => {
  const historyEvents = [
    {
      id: "history-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        eventHistory: {
          onceTriggered: {
            evt_intro_seen: true,
          },
        },
      },
    },
    {
      id: "history-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(
    historyEvents,
    {
      ...baseState,
      eventHistory: {
        onceTriggeredByEventId: { evt_intro_seen: true },
        cooldownLastTriggeredMinuteByEventId: {},
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(selected?.id, "history-match");

  const mismatched = selectEvent(historyEvents, baseState, "on-location-enter", () => 0.0);
  assert.equal(mismatched?.id, "history-fallback");
});

test("event selector should support eventHistory.lastTriggeredWithinMinutes conditions", () => {
  const historyWindowEvents = [
    {
      id: "history-window-match",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: {
        locationIds: ["street"],
        eventHistory: {
          lastTriggeredWithinMinutes: {
            evt_recent: 30,
          },
        },
      },
    },
    {
      id: "history-window-fallback",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(
    historyWindowEvents,
    {
      ...baseState,
      vars: {
        ...baseState.vars,
        "event.cooldown.evt_recent.lastTriggeredMinute": 520,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(selected?.id, "history-window-match");

  const mismatched = selectEvent(
    historyWindowEvents,
    {
      ...baseState,
      vars: {
        ...baseState.vars,
        "event.cooldown.evt_recent.lastTriggeredMinute": 500,
      },
    },
    "on-location-enter",
    () => 0.0,
  );
  assert.equal(mismatched?.id, "history-window-fallback");
});
