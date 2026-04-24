const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createQuestStateFromDefinitions,
  advanceQuestStep,
  buildQuestStepIndex,
  getFirstQuestStepId,
  resetQuestStep,
  setQuestStep,
} = require("../.tmp-demo-tests/engine/quests/QuestService.js");
const {
  applyNarrativeChoiceEffects,
} = require("../.tmp-demo-tests/engine/narrative/effects.js");

const questDefs = [
  { id: "q1", title: "Quest 1", status: "inactive", stepIds: ["step_a", "step_b", "step_c"] },
  { id: "q2", title: "Quest 2", status: "inactive", stepIds: ["step_x"] },
  { id: "q_empty", title: "Empty Steps", status: "inactive", stepIds: [] },
];

const stepIndex = buildQuestStepIndex(questDefs);

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 9, minute: 0 },
  currentLocationId: "market",
  flags: {},
  quests: createQuestStateFromDefinitions(questDefs),
  inventory: {},
  vars: {},
};

test("advanceQuestStep should move to the next step", () => {
  const quests = { q1: { status: "active", currentStepId: "step_a" } };
  const result = advanceQuestStep("q1", quests, stepIndex);
  assert.equal(result?.currentStepId, "step_b");
  assert.equal(result?.wasAtLastStep, false);
});

test("advanceQuestStep should stay at last step when already at the end", () => {
  const quests = { q1: { status: "active", currentStepId: "step_c" } };
  const result = advanceQuestStep("q1", quests, stepIndex);
  assert.equal(result?.currentStepId, "step_c");
  assert.equal(result?.wasAtLastStep, true);
});

test("advanceQuestStep should handle single-step quest", () => {
  const quests = { q2: { status: "active", currentStepId: "step_x" } };
  const result = advanceQuestStep("q2", quests, stepIndex);
  assert.equal(result?.currentStepId, "step_x");
  assert.equal(result?.wasAtLastStep, true);
});

test("advanceQuestStep should return null for unknown quest", () => {
  const result = advanceQuestStep("unknown", baseState.quests, stepIndex);
  assert.equal(result, null);
});

test("advanceQuestStep should return null for quest with empty stepIds", () => {
  const quests = { q_empty: { status: "active", currentStepId: undefined } };
  const result = advanceQuestStep("q_empty", quests, stepIndex);
  assert.equal(result, null);
});

test("advanceQuestStep should handle unknown currentStepId by starting from step 0", () => {
  const quests = { q1: { status: "active", currentStepId: "step_unknown" } };
  const result = advanceQuestStep("q1", quests, stepIndex);
  assert.equal(result?.currentStepId, "step_a");
});

test("getFirstQuestStepId should return first step when available", () => {
  assert.equal(getFirstQuestStepId("q1", stepIndex), "step_a");
  assert.equal(getFirstQuestStepId("q_empty", stepIndex), undefined);
  assert.equal(getFirstQuestStepId("unknown", stepIndex), undefined);
});

test("setQuestStep should set a valid quest step and preserve status", () => {
  const quests = { q1: { status: "active", currentStepId: "step_a" } };
  const result = setQuestStep("q1", "step_c", quests, stepIndex);
  assert.equal(result?.status, "active");
  assert.equal(result?.currentStepId, "step_c");
});

test("setQuestStep should return null for invalid target step or missing quest", () => {
  const quests = { q1: { status: "active", currentStepId: "step_a" } };
  assert.equal(setQuestStep("q1", "step_missing", quests, stepIndex), null);
  assert.equal(setQuestStep("unknown", "step_a", quests, stepIndex), null);
});

test("resetQuestStep should return first step and preserve status", () => {
  const quests = { q1: { status: "failed", currentStepId: "step_c" } };
  const result = resetQuestStep("q1", quests, stepIndex);
  assert.equal(result?.status, "failed");
  assert.equal(result?.currentStepId, "step_a");
});


test("applyNarrativeChoiceEffects should advance quest step", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "active", currentStepId: "step_a" } },
  };

  const result = applyNarrativeChoiceEffects(state, {
    advanceQuestStep: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.currentStepId, "step_b");
  assert.equal(result.quests.q1.status, "active");
});

test("applyNarrativeChoiceEffects should start a quest at its first step", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "inactive", currentStepId: "step_c" } },
  };

  const result = applyNarrativeChoiceEffects(state, {
    startQuest: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.status, "active");
  assert.equal(result.quests.q1.currentStepId, "step_a");
});

test("applyNarrativeChoiceEffects should start a quest even when runtime state entry is missing", () => {
  const state = {
    ...baseState,
    quests: {},
  };

  const result = applyNarrativeChoiceEffects(state, {
    startQuest: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.status, "active");
  assert.equal(result.quests.q1.currentStepId, "step_a");
});

test("applyNarrativeChoiceEffects should reset and set quest step", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "active", currentStepId: "step_c" } },
  };

  const resetResult = applyNarrativeChoiceEffects(state, {
    resetQuestStep: ["q1"],
  }, questDefs);
  assert.equal(resetResult.quests.q1.status, "active");
  assert.equal(resetResult.quests.q1.currentStepId, "step_a");

  const setResult = applyNarrativeChoiceEffects(state, {
    setQuestStep: { q1: "step_b" },
  }, questDefs);
  assert.equal(setResult.quests.q1.status, "active");
  assert.equal(setResult.quests.q1.currentStepId, "step_b");
});

test("applyNarrativeChoiceEffects should complete a quest", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "active", currentStepId: "step_b" } },
  };

  const result = applyNarrativeChoiceEffects(state, {
    completeQuest: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.status, "completed");
  assert.equal(result.quests.q1.currentStepId, "step_b");
});

test("applyNarrativeChoiceEffects should fail a quest", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "active", currentStepId: "step_b" } },
  };

  const result = applyNarrativeChoiceEffects(state, {
    failQuest: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.status, "failed");
  assert.equal(result.quests.q1.currentStepId, "step_b");
});

test("applyNarrativeChoiceEffects should combine setQuests + advanceQuestStep + completeQuest", () => {
  const state = {
    ...baseState,
    quests: {
      q1: { status: "inactive", currentStepId: "step_a" },
      q2: { status: "inactive", currentStepId: "step_x" },
    },
  };

  const result = applyNarrativeChoiceEffects(state, {
    setQuests: {
      q1: { status: "active", currentStepId: "step_b" },
    },
    advanceQuestStep: ["q1"],
    completeQuest: ["q2"],
  }, questDefs);

  // setQuests sets q1 to active/step_b, then advanceQuestStep moves to step_c
  assert.equal(result.quests.q1.status, "active");
  assert.equal(result.quests.q1.currentStepId, "step_c");

  // completeQuest overrides q2 status
  assert.equal(result.quests.q2.status, "completed");
});

test("applyNarrativeChoiceEffects should throw when quest progression effects are used without questDefinitions", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "active", currentStepId: "step_a" } },
  };

  assert.throws(
    () => applyNarrativeChoiceEffects(state, { advanceQuestStep: ["q1"] }),
    /quest progression effects require questDefinitions/,
  );

  assert.throws(
    () => applyNarrativeChoiceEffects(state, { startQuest: ["q1"] }),
    /quest progression effects require questDefinitions/,
  );

  assert.throws(
    () => applyNarrativeChoiceEffects(state, { setQuestStep: { q1: "step_b" } }),
    /quest progression effects require questDefinitions/,
  );
});

test("applyNarrativeChoiceEffects should handle multiple quest advancements", () => {
  const state = {
    ...baseState,
    quests: {
      q1: { status: "active", currentStepId: "step_a" },
      q2: { status: "active", currentStepId: "step_x" },
    },
  };

  const result = applyNarrativeChoiceEffects(state, {
    advanceQuestStep: ["q1", "q2"],
  }, questDefs);

  assert.equal(result.quests.q1.currentStepId, "step_b");
  // q2 has only one step, stays at step_x (wasAtLastStep = true)
  assert.equal(result.quests.q2.currentStepId, "step_x");
});

test("applyNarrativeChoiceEffects completeQuest should take precedence over quest progression actions for same quest", () => {
  const state = {
    ...baseState,
    quests: { q1: { status: "inactive", currentStepId: "step_c" } },
  };

  const result = applyNarrativeChoiceEffects(state, {
    startQuest: ["q1"],
    setQuestStep: { q1: "step_b" },
    advanceQuestStep: ["q1"],
    completeQuest: ["q1"],
  }, questDefs);

  assert.equal(result.quests.q1.status, "completed");
  assert.equal(result.quests.q1.currentStepId, "step_c");
});
