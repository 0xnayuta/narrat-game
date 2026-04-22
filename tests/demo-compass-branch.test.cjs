const test = require("node:test");
const assert = require("node:assert/strict");

const { createDemoSession } = require("../.tmp-demo-tests/app/createDemoSession.js");

function setupSessionToStallExamined(gold) {
  const session = createDemoSession();
  const base = session.getState();

  session.restoreState({
    ...base,
    currentLocationId: "street",
    time: { day: 1, hour: 9, minute: 0 },
    flags: {
      ...base.flags,
      demo_enabled: false,
      quest_intro_started: true,
      market_visit_intent: false,
    },
    quests: {
      ...base.quests,
      quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
    },
    vars: {
      ...base.vars,
      current_goal: "visit_market",
      gold,
    },
  });

  const travelToMarket = session.travelTo("market");
  assert.equal(travelToMarket.triggeredEventId, "evt_market_stall_discovery");
  assert.equal(travelToMarket.scene?.nodeId, "node_stall_discovery");

  const explore = session.choose("explore_stall");
  assert.equal(explore.scene?.nodeId, "node_stall_examined");

  return { session, scene: explore.scene, state: explore.state };
}

test("demo compass branch: buy_compass visible when gold >= 15 and choice applies effects", () => {
  const { session, scene } = setupSessionToStallExamined(50);

  assert.ok(scene?.choices.some((choice) => choice.id === "buy_compass"));

  const buy = session.choose("buy_compass");
  assert.equal(buy.state.vars.gold, 35);
  assert.equal(buy.state.flags.compass_owned, true);
  assert.equal(buy.scene?.nodeId, "node_compass_bought");
});

test("demo compass branch: buy_compass hidden when gold < 15", () => {
  const { scene } = setupSessionToStallExamined(10);

  assert.ok(scene);
  assert.equal(scene.choices.some((choice) => choice.id === "buy_compass"), false);
  assert.deepEqual(
    scene.choices.map((choice) => choice.id),
    ["examine_compass", "leave_stall"],
  );
});
