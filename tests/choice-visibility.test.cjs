const test = require("node:test");
const assert = require("node:assert/strict");

const {
  filterVisibleChoices,
  getVisibleChoiceViewModels,
} = require("../.tmp-demo-tests/engine/narrative/visibility.js");
const {
  applyNarrativeChoiceEffects,
} = require("../.tmp-demo-tests/engine/narrative/effects.js");
const { createGameSessionFromBundle } = require("../.tmp-demo-tests/engine/index.js");

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 9, minute: 0 },
  currentLocationId: "market",
  flags: { vendor_met: false },
  quests: {},
  inventory: {},
  vars: { current_goal: "market_visited" },
};

test("filterVisibleChoices should return all choices when none have conditions", () => {
  const choices = [
    { id: "a", text: "Option A", nextNodeId: "node_a" },
    { id: "b", text: "Option B", nextNodeId: "node_b" },
  ];

  const result = filterVisibleChoices(choices, baseState);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "a");
  assert.equal(result[1].id, "b");
});

test("filterVisibleChoices should show choices whose conditions match", () => {
  const choices = [
    { id: "always", text: "Always visible", nextNodeId: "node_a" },
    {
      id: "gated",
      text: "Gated choice",
      nextNodeId: "node_b",
      conditions: { flags: { vendor_met: false } },
    },
  ];

  const result = filterVisibleChoices(choices, baseState);
  assert.equal(result.length, 2);
  assert.equal(result[0].id, "always");
  assert.equal(result[1].id, "gated");
});

test("filterVisibleChoices should hide choices whose conditions don't match", () => {
  const choices = [
    { id: "always", text: "Always visible", nextNodeId: "node_a" },
    {
      id: "gated",
      text: "Gated choice",
      nextNodeId: "node_b",
      conditions: { flags: { vendor_met: true } },
    },
  ];

  const result = filterVisibleChoices(choices, baseState);
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "always");
});

test("filterVisibleChoices should support vars conditions on choices", () => {
  const choices = [
    {
      id: "require_goal",
      text: "Requires goal",
      nextNodeId: "node_a",
      conditions: { vars: { current_goal: "market_visited" } },
    },
  ];

  const matching = filterVisibleChoices(choices, baseState);
  assert.equal(matching.length, 1);

  const mismatching = filterVisibleChoices(choices, {
    ...baseState,
    vars: { current_goal: "other" },
  });
  assert.equal(mismatching.length, 0);
});

test("filterVisibleChoices should support numeric comparison predicates in vars conditions", () => {
  const choices = [
    {
      id: "require_gold_range",
      text: "Requires gold in range",
      nextNodeId: "node_a",
      conditions: { vars: { gold: { ">=": 10, "<": 30 } } },
    },
  ];

  const matching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      gold: 20,
    },
  });
  assert.equal(matching.length, 1);

  const mismatching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      gold: 50,
    },
  });
  assert.equal(mismatching.length, 0);
});

test("filterVisibleChoices should support != and in predicates in vars conditions", () => {
  const choices = [
    {
      id: "predicate-choice",
      text: "Predicate choice",
      nextNodeId: "node_a",
      conditions: {
        vars: {
          current_goal: { "!=": "rest" },
          mood: { in: ["calm", "focused"] },
        },
      },
    },
  ];

  const matching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      mood: "calm",
    },
  });
  assert.equal(matching.length, 1);

  const mismatching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      current_goal: "rest",
      mood: "calm",
    },
  });
  assert.equal(mismatching.length, 0);
});

test("filterVisibleChoices should support minimal not predicate in vars conditions", () => {
  const choices = [
    {
      id: "not-choice",
      text: "Not choice",
      nextNodeId: "node_a",
      conditions: {
        vars: {
          current_goal: { not: "rest" },
          gold: { not: { ">=": 100 } },
        },
      },
    },
  ];

  const matching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      gold: 50,
    },
  });
  assert.equal(matching.length, 1);

  const mismatching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      current_goal: "rest",
      gold: 50,
    },
  });
  assert.equal(mismatching.length, 0);
});

test("filterVisibleChoices should support quest step conditions on choices", () => {
  const choices = [
    {
      id: "quest_step_gate",
      text: "Quest step gate",
      nextNodeId: "node_a",
      conditions: {
        questSteps: { quest_intro_walk: "step_go_market" },
      },
    },
  ];

  const stateWithQuest = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
    },
  };

  const matching = filterVisibleChoices(choices, stateWithQuest);
  assert.equal(matching.length, 1);

  const wrongStep = {
    ...baseState,
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
  };

  const mismatching = filterVisibleChoices(choices, wrongStep);
  assert.equal(mismatching.length, 0);
});

test("filterVisibleChoices should support any groups in conditions", () => {
  const choices = [
    {
      id: "or_choice",
      text: "OR choice",
      nextNodeId: "node_a",
      conditions: {
        any: [
          { flags: { vendor_met: true } },
          { vars: { reputation: { ">=": 3 } } },
        ],
      },
    },
  ];

  const matching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      reputation: 3,
    },
  });
  assert.equal(matching.length, 1);

  const mismatching = filterVisibleChoices(choices, {
    ...baseState,
    vars: {
      ...baseState.vars,
      reputation: 1,
    },
  });
  assert.equal(mismatching.length, 0);
});

test("getVisibleChoiceViewModels should return id+text pairs for visible choices", () => {
  const choices = [
    { id: "a", text: "Option A", nextNodeId: "node_a" },
    {
      id: "b",
      text: "Option B",
      nextNodeId: "node_b",
      conditions: { flags: { vendor_met: true } },
    },
  ];

  const result = getVisibleChoiceViewModels(choices, baseState);
  assert.deepEqual(result, [{ id: "a", text: "Option A" }]);
});

test("GameSession should hide conditional choices from view", () => {
  const bundle = {
    id: "choice-visibility-test",
    title: "Choice Visibility Test",
    version: 1,
    locations: [
      {
        id: "home",
        name: "Home",
        description: "Test home",
        connections: [{ to: "street", travelMinutes: 5 }],
      },
      {
        id: "street",
        name: "Street",
        description: "Test street",
        connections: [{ to: "home", travelMinutes: 5 }],
      },
    ],
    events: [
      {
        id: "street-scene",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_with_gated_choices" },
      },
    ],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
        {
          id: "node_with_gated_choices",
          text: "You see two paths.",
          choices: [
            {
              id: "always_open",
              text: "Take the main road",
              nextNodeId: "node_end",
            },
            {
              id: "secret_path",
              text: "Take the hidden trail",
              nextNodeId: "node_end",
              conditions: { flags: { secret_unlocked: true } },
            },
          ],
        },
        { id: "node_end", text: "You arrive.", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: {},
  };

  // Without secret_unlocked flag — only one choice visible
  const session = createGameSessionFromBundle(bundle);
  const travelResult = session.travelTo("street");
  assert.equal(travelResult.scene?.choices.length, 1);
  assert.equal(travelResult.scene?.choices[0].id, "always_open");

  // Try to choose hidden choice — should throw
  assert.throws(
    () => session.choose("secret_path"),
    /Choice not available: secret_path/,
  );

  // Choose the visible one
  const choice = session.choose("always_open");
  assert.equal(choice.scene?.nodeId, "node_end");
});

test("GameSession should show conditional choices when conditions match", () => {
  const bundle = {
    id: "choice-visibility-match-test",
    title: "Choice Visibility Match Test",
    version: 1,
    locations: [
      {
        id: "home",
        name: "Home",
        description: "Test home",
        connections: [{ to: "street", travelMinutes: 5 }],
      },
      {
        id: "street",
        name: "Street",
        description: "Test street",
        connections: [{ to: "home", travelMinutes: 5 }],
      },
    ],
    events: [
      {
        id: "street-scene",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_with_gated_choices" },
      },
    ],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
        {
          id: "node_with_gated_choices",
          text: "You see two paths.",
          choices: [
            {
              id: "always_open",
              text: "Take the main road",
              nextNodeId: "node_end",
            },
            {
              id: "secret_path",
              text: "Take the hidden trail",
              nextNodeId: "node_end",
              conditions: { flags: { secret_unlocked: true } },
            },
          ],
        },
        { id: "node_end", text: "You arrive.", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: { secret_unlocked: true },
  };

  // With secret_unlocked flag — both choices visible
  const session = createGameSessionFromBundle(bundle);
  const travelResult = session.travelTo("street");
  assert.equal(travelResult.scene?.choices.length, 2);
  assert.equal(travelResult.scene?.choices[0].id, "always_open");
  assert.equal(travelResult.scene?.choices[1].id, "secret_path");

  // Both choices are selectable
  const choice = session.choose("secret_path");
  assert.equal(choice.scene?.nodeId, "node_end");
});

test("canCloseScene should return true when all visible choices are hidden", () => {
  const bundle = {
    id: "choice-all-hidden-test",
    title: "Choice All Hidden Test",
    version: 1,
    locations: [
      {
        id: "home",
        name: "Home",
        description: "Test home",
        connections: [{ to: "street", travelMinutes: 5 }],
      },
      {
        id: "street",
        name: "Street",
        description: "Test street",
        connections: [{ to: "home", travelMinutes: 5 }],
      },
    ],
    events: [
      {
        id: "street-scene",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_only_gated" },
      },
    ],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
        {
          id: "node_only_gated",
          text: "There is a locked door here.",
          choices: [
            {
              id: "enter_door",
              text: "Enter the door",
              nextNodeId: "node_end",
              conditions: { flags: { door_unlocked: true } },
            },
          ],
        },
        { id: "node_end", text: "Inside.", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: {},
  };

  const session = createGameSessionFromBundle(bundle);
  const travelResult = session.travelTo("street");

  // The only choice is hidden, so the scene should have no visible choices
  assert.equal(travelResult.scene?.choices.length, 0);
  assert.equal(session.canCloseScene(), true);
});
