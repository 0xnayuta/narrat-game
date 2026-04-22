const test = require("node:test");
const assert = require("node:assert/strict");

const {
  applyNarrativeChoiceEffects,
} = require("../.tmp-demo-tests/engine/narrative/effects.js");

const baseState = {
  player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
  time: { day: 1, hour: 9, minute: 0 },
  currentLocationId: "market",
  flags: {},
  quests: {},
  inventory: {},
  vars: { gold: 50, steps: 10 },
};

test("addVars should increment existing numeric vars", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addVars: { gold: -15 },
  });

  assert.equal(result.vars.gold, 35);
  assert.equal(result.vars.steps, 10);
});

test("addVars should treat missing keys as 0", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addVars: { reputation: 5 },
  });

  assert.equal(result.vars.reputation, 5);
  assert.equal(result.vars.gold, 50);
});

test("addVars should treat non-number existing values as 0", () => {
  const state = {
    ...baseState,
    vars: { gold: 50, label: "market" },
  };

  const result = applyNarrativeChoiceEffects(state, {
    addVars: { label: 3 },
  });

  assert.equal(result.vars.label, 3);
});

test("addVars should apply after setVars", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    setVars: { gold: 100 },
    addVars: { gold: -20 },
  });

  // setVars sets gold to 100, then addVars subtracts 20
  assert.equal(result.vars.gold, 80);
});

test("addVars should support multiple deltas at once", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addVars: { gold: -10, steps: 5, found_items: 1 },
  });

  assert.equal(result.vars.gold, 40);
  assert.equal(result.vars.steps, 15);
  assert.equal(result.vars.found_items, 1);
});

test("addVars with no effect should not change state", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addVars: {},
  });

  assert.deepEqual(result.vars, baseState.vars);
});

test("addStats should increment existing stats", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addStats: { stamina: -10, health: 5 },
  });

  assert.equal(result.player.stats.stamina, 90);
  assert.equal(result.player.stats.health, 105);
  assert.equal(result.player.stats.willpower, 100);
});

test("addStats should treat missing stats as 0", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addStats: { courage: 10 },
  });

  assert.equal(result.player.stats.courage, 10);
});

test("addStats should not affect non-stat player fields", () => {
  const result = applyNarrativeChoiceEffects(baseState, {
    addStats: { health: -50 },
  });

  assert.equal(result.player.id, "player");
  assert.equal(result.player.name, "Player");
  assert.deepEqual(result.player.flags, {});
});

test("addVars and addStats should work together with other effects", () => {
  const state = {
    ...baseState,
    quests: { quest_test: { status: "active", currentStepId: "step_a" } },
  };

  const questDefs = [
    { id: "quest_test", title: "Test", status: "inactive", stepIds: ["step_a", "step_b"] },
  ];

  const result = applyNarrativeChoiceEffects(state, {
    setFlags: { action_taken: true },
    setVars: { gold: 200 },
    addVars: { gold: -50 },
    addStats: { stamina: -5 },
    advanceQuestStep: ["quest_test"],
    completeQuest: ["quest_test"],
  }, questDefs);

  assert.equal(result.flags.action_taken, true);
  // setVars sets gold to 200, addVars subtracts 50
  assert.equal(result.vars.gold, 150);
  assert.equal(result.player.stats.stamina, 95);
  // advanceQuestStep moves to step_b, completeQuest sets completed
  assert.equal(result.quests.quest_test.status, "completed");
  assert.equal(result.quests.quest_test.currentStepId, "step_b");
});
