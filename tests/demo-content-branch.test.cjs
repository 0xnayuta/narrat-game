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
      quest_black_sail_trail: { status: "inactive", currentStepId: undefined },
      quest_black_sail_sting: { status: "inactive", currentStepId: undefined },
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

test("demo branch should show an explicit low-gold compass fallback when gold < 15", () => {
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
    ["cannot_afford_compass", "examine_compass", "leave_stall"],
  );

  const choiceResult = runtime.choose("cannot_afford_compass");
  const nextState = applyNarrativeChoiceEffects(state, choiceResult.effects, demoQuests);
  assert.equal(choiceResult.node.id, "node_compass_too_expensive");
  assert.equal(nextState.flags.compass_examined, true);
  assert.equal(nextState.vars.current_goal, "ask_about_compass");
});

test("demo market morning should show retrace choice only when arrival event is recent in eventHistory", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_market_morning");

  const visibleWithRecentHistory = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      eventHistory: {
        onceTriggeredByEventId: { evt_market_morning: true },
        cooldownLastTriggeredMinuteByEventId: { evt_market_morning: 520 },
      },
    }),
  );
  assert.deepEqual(
    visibleWithRecentHistory.map((choice) => choice.id),
    ["retrace_market_arrival", "inspect_oddities_stall", "finish_walk"],
  );

  const visibleWithExpiredHistory = filterVisibleChoices(
    runtime.getCurrentChoices(),
    buildBranchState({
      eventHistory: {
        onceTriggeredByEventId: { evt_market_morning: true },
        cooldownLastTriggeredMinuteByEventId: { evt_market_morning: 500 },
      },
    }),
  );
  assert.deepEqual(
    visibleWithExpiredHistory.map((choice) => choice.id),
    ["inspect_oddities_stall", "finish_walk"],
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
    ["return_to_oddities_stall", "thank_vendor"],
  );

  const visibleState = buildBranchState({
    flags: {
      compass_owned: true,
    },
  });
  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), visibleState);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["show_compass", "press_for_harbor_watch", "return_to_oddities_stall", "thank_vendor"],
  );

  const choiceResult = runtime.choose("show_compass");
  const nextState = applyNarrativeChoiceEffects(visibleState, choiceResult.effects, demoQuests);
  assert.equal(choiceResult.node.id, "node_vendor_compass_reaction");
  assert.equal(nextState.flags.compass_vendor_reacted, true);
  assert.equal(nextState.vars.current_goal, "investigate_compass");
  assert.equal(nextState.quests.quest_black_sail_trail.status, "active");
  assert.equal(nextState.quests.quest_black_sail_trail.currentStepId, "step_find_mira");
});

test("demo black sail stakeout should allow resetting the sting plan back to its first step", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_black_sail_stakeout");

  const state = buildBranchState({
    currentLocationId: "harbor",
    vars: {
      current_goal: "hold_black_sail_stakeout",
    },
    quests: {
      quest_black_sail_sting: { status: "active", currentStepId: "step_hold_stakeout" },
    },
  });

  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), state);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["take_stakeout_position", "reset_stakeout_plan"],
  );

  const choiceResult = runtime.choose("reset_stakeout_plan");
  const nextState = applyNarrativeChoiceEffects(state, choiceResult.effects, demoQuests);
  assert.equal(choiceResult.node.id, "node_harbor_watch_sting_plan");
  assert.equal(nextState.vars.current_goal, "prepare_black_sail_sting");
  assert.equal(nextState.quests.quest_black_sail_sting.status, "active");
  assert.equal(nextState.quests.quest_black_sail_sting.currentStepId, "step_prepare_stakeout");
});

test("black sail tip should reveal north channel recap branch when wake pattern was recorded", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_harbor_watch_black_sail_tip");

  const stateWithoutWakePattern = buildBranchState({
    currentLocationId: "harbor",
    flags: {
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_berth_identified: true,
    },
    quests: {
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    vars: {
      current_goal: "investigate_black_sail_berth",
    },
  });
  assert.deepEqual(filterVisibleChoices(runtime.getCurrentChoices(), stateWithoutWakePattern), []);

  const stateWithWakePattern = buildBranchState({
    currentLocationId: "harbor",
    flags: {
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_berth_identified: true,
      black_sail_north_channel_wake_pattern_noted: true,
    },
    quests: {
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    vars: {
      current_goal: "investigate_black_sail_berth",
    },
  });
  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), stateWithWakePattern);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["connect_north_channel_wake_to_coal_berth"],
  );

  const recapChoice = runtime.choose("connect_north_channel_wake_to_coal_berth");
  assert.equal(recapChoice.node.id, "node_black_sail_north_channel_recap");

  const nextState = applyNarrativeChoiceEffects(stateWithWakePattern, recapChoice.effects, demoQuests);
  assert.equal(nextState.flags.black_sail_north_channel_recap_used, true);
  assert.equal(nextState.vars.current_goal, "investigate_black_sail_berth");
  assert.equal(
    nextState.quests.quest_black_sail_trail.currentStepId,
    "step_investigate_black_sail_berth",
  );
});

test("drowned lantern exchange window should reveal route recap branch when coal berth route was recorded", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_drowned_lantern_exchange_window");

  const stateWithRouteRecap = buildBranchState({
    currentLocationId: "harbor",
    flags: {
      drowned_lantern_shed_trace_found: true,
      drowned_lantern_exchange_window_found: true,
      drowned_lantern_coal_berth_route_noted: true,
    },
    quests: {
      quest_drowned_lantern: { status: "active", currentStepId: "step_identify_drowned_lantern_contact" },
    },
    vars: {
      current_goal: "identify_drowned_lantern_exchange_window",
    },
  });

  const visibleChoices = filterVisibleChoices(runtime.getCurrentChoices(), stateWithRouteRecap);
  assert.deepEqual(
    visibleChoices.map((choice) => choice.id),
    ["connect_coal_berth_lane_to_the_dawn_exchange", "ask_who_handles_the_dawn_exchange"],
  );

  const routeChoice = runtime.choose("connect_coal_berth_lane_to_the_dawn_exchange");
  assert.equal(routeChoice.node.id, "node_drowned_lantern_exchange_window_route_confirmed");

  const afterRouteChoice = applyNarrativeChoiceEffects(stateWithRouteRecap, routeChoice.effects, demoQuests);
  assert.equal(afterRouteChoice.flags.drowned_lantern_route_pattern_used, true);
  assert.equal(afterRouteChoice.flags.drowned_lantern_contact_suspect_identified, true);
  assert.equal(afterRouteChoice.vars.current_goal, "verify_drowned_lantern_contact_suspect");
  assert.equal(
    afterRouteChoice.quests.quest_drowned_lantern.currentStepId,
    "step_identify_drowned_lantern_contact",
  );

  const nameRunner = runtime.choose("name_the_route_runner_as_the_contact_suspect");
  assert.equal(nameRunner.node.id, "node_drowned_lantern_contact_suspect");
});

test("drowned lantern exchange window should reveal insight branch when customs stairs observation was recorded", () => {
  const runtime = new NarrativeRuntime(demoNarrativeGraph);
  runtime.jumpTo("node_drowned_lantern_exchange_window");

  // Without customs_stairs_exchange_point_noted, only the default ask is visible
  const stateWithoutInsight = buildBranchState({
    currentLocationId: "harbor",
    flags: {
      drowned_lantern_shed_trace_found: true,
      drowned_lantern_exchange_window_found: true,
    },
    quests: {
      quest_drowned_lantern: { status: "active", currentStepId: "step_identify_drowned_lantern_contact" },
    },
    vars: {
      current_goal: "identify_drowned_lantern_exchange_window",
    },
  });
  const choicesWithoutInsight = filterVisibleChoices(runtime.getCurrentChoices(), stateWithoutInsight);
  assert.equal(choicesWithoutInsight.length, 1);
  assert.equal(choicesWithoutInsight[0].id, "ask_who_handles_the_dawn_exchange");

  // With customs_stairs_exchange_point_noted, both choices are visible
  const stateWithInsight = buildBranchState({
    currentLocationId: "harbor",
    flags: {
      drowned_lantern_shed_trace_found: true,
      drowned_lantern_exchange_window_found: true,
      customs_stairs_exchange_point_noted: true,
    },
    quests: {
      quest_drowned_lantern: { status: "active", currentStepId: "step_identify_drowned_lantern_contact" },
    },
    vars: {
      current_goal: "identify_drowned_lantern_exchange_window",
    },
  });
  const choicesWithInsight = filterVisibleChoices(runtime.getCurrentChoices(), stateWithInsight);
  assert.equal(choicesWithInsight.length, 2);
  assert.equal(choicesWithInsight[0].id, "suggest_the_customs_stairs_lower_landing");
  assert.equal(choicesWithInsight[1].id, "ask_who_handles_the_dawn_exchange");

  // Choosing the insight branch sets the correct flags while preserving the current quest step
  const insightChoice = runtime.choose("suggest_the_customs_stairs_lower_landing");
  const afterInsight = applyNarrativeChoiceEffects(stateWithInsight, insightChoice.effects, demoQuests);
  assert.equal(afterInsight.flags.drowned_lantern_stairs_insight_used, true);
  assert.equal(afterInsight.flags.drowned_lantern_contact_suspect_identified, true);
  assert.equal(afterInsight.vars.current_goal, "verify_drowned_lantern_contact_suspect");
  assert.equal(afterInsight.quests.quest_drowned_lantern.currentStepId, "step_identify_drowned_lantern_contact");
  assert.equal(insightChoice.node.id, "node_drowned_lantern_exchange_window_confirmed");

  // The insight path now has a real downstream choice — directly confirm Brine Lark
  const confirmChoice = runtime.choose("confirm_brine_lark_direct_from_stairs_insight");
  assert.equal(confirmChoice.node.id, "node_drowned_lantern_contact_confirmed_from_insight");

  const afterConfirm = applyNarrativeChoiceEffects(afterInsight, confirmChoice.effects, demoQuests);
  assert.equal(afterConfirm.flags.brine_lark_identified_as_target, true);
  assert.equal(afterConfirm.vars.current_goal, "trace_brine_lark_network");
  assert.equal(afterConfirm.quests.quest_drowned_lantern.status, "completed");

  const closeFile = runtime.choose("close_the_drowned_lantern_file_from_insight");
  assert.equal(closeFile.node.id, "node_drowned_lantern_case_boundary_from_insight");

  const followBrineLark = runtime.choose("ask_where_brine_lark_runs_goods_from_insight");
  assert.equal(followBrineLark.node.id, "node_brine_lark_start_point");

  const afterFollow = applyNarrativeChoiceEffects(afterConfirm, followBrineLark.effects, demoQuests);
  assert.equal(afterFollow.flags.brine_lark_followup_started, true);
  assert.equal(afterFollow.vars.current_goal, "track_brine_lark_route");
  assert.equal(afterFollow.quests.quest_brine_lark.status, "active");
  assert.equal(afterFollow.quests.quest_brine_lark.currentStepId, "step_search_tide_warehouse");
});
