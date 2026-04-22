const test = require("node:test");
const assert = require("node:assert/strict");

const {
  NarrativeRuntime,
  filterVisibleChoices,
  applyNarrativeChoiceEffects,
} = require("../.tmp-demo-tests/engine/index.js");
const { demoNarrativeGraph } = require("../.tmp-demo-tests/content/demo/narrative.js");
const { demoQuests } = require("../.tmp-demo-tests/content/demo/quests.js");
const { demoContentBundle } = require("../.tmp-demo-tests/content/demo/bundle.js");

function buildBranchState(overrides = {}) {
  return {
    player: {
      id: "player",
      name: "Player",
      stats: { health: 100, willpower: 100, stamina: 100 },
      flags: {},
    },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      market_visit_intent: true,
      stall_discovered: true,
      ...(overrides.flags ?? {}),
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      ...(overrides.quests ?? {}),
    },
    inventory: {},
    vars: {
      ...(demoContentBundle.initialVars ?? {}),
      current_goal: "examine_stall",
      ...(overrides.vars ?? {}),
    },
    ...overrides,
  };
}

test("demo branch should show buy_compass when gold >= 15 and apply effects", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_stall_examined");

  const state = buildBranchState({
    vars: {
      gold: 50,
    },
  });

  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), state);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["buy_compass", "examine_compass", "leave_stall"],
  );

  const choiceResult = runtime.choose("buy_compass");
  const nextState = applyNarrativeChoiceEffects(state, choiceResult.effects, demoQuests);

  assert.equal(choiceResult.node.id, "node_compass_bought");
  assert.equal(nextState.vars.gold, 35);
  assert.equal(nextState.flags.compass_owned, true);
});

test("demo branch should hide buy_compass when gold < 15", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_stall_examined");

  const state = buildBranchState({
    vars: {
      gold: 10,
    },
  });

  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), state);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["examine_compass", "leave_stall"],
  );
});

test("demo vendor intro should show stall question only when current_goal matches in-predicate", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_vendor_intro");

  const visibleWithMatchingGoal = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      vars: {
        current_goal: "market_visited",
      },
    }),
  );
  assert.deepEqual(
    visibleWithMatchingGoal.map((choice) => choice.id),
    ["ask_vendor", "ask_vendor_about_stall", "ask_vendor_for_rumors"],
  );

  const visibleWithMismatchingGoal = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      vars: {
        current_goal: "rest",
      },
    }),
  );
  assert.deepEqual(
    visibleWithMismatchingGoal.map((choice) => choice.id),
    ["ask_vendor"],
  );
});

test("demo vendor intro should show rumors choice only when current_goal != rest", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_vendor_intro");

  const visibleWithNonRestGoal = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      flags: {
        stall_discovered: false,
      },
      vars: {
        current_goal: "market_visited",
      },
    }),
  );
  assert.deepEqual(
    visibleWithNonRestGoal.map((choice) => choice.id),
    ["ask_vendor", "ask_vendor_for_rumors"],
  );

  const visibleWithRestGoal = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      flags: {
        stall_discovered: false,
      },
      vars: {
        current_goal: "rest",
      },
    }),
  );
  assert.deepEqual(
    visibleWithRestGoal.map((choice) => choice.id),
    ["ask_vendor"],
  );
});

test("demo vendor stall tip should show compass follow-up only when compass_owned is true", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_vendor_stall_tip");

  const hiddenState = buildBranchState({
    flags: {
      compass_owned: false,
    },
  });
  const hiddenChoices = filterVisibleChoices(runtime.getCurrentChoices(), hiddenState);
  assert.deepEqual(
    hiddenChoices.map((choice) => choice.id),
    ["thank_vendor"],
  );

  const visibleState = buildBranchState({
    flags: {
      compass_owned: true,
    },
  });
  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), visibleState);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["show_compass", "thank_vendor"],
  );

  const choiceResult = runtime.choose("show_compass");
  const nextState = applyNarrativeChoiceEffects(visibleState, choiceResult.effects, demoQuests);
  assert.equal(choiceResult.node.id, "node_vendor_compass_reaction");
  assert.equal(nextState.flags.compass_vendor_reacted, true);
  assert.equal(nextState.vars.current_goal, "investigate_compass");
});
