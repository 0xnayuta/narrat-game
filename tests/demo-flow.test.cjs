const test = require("node:test");
const assert = require("node:assert/strict");

const { runDemoContentFlow } = require("../.tmp-demo-tests/app/demo-content-flow.js");

test("demo flow should progress quest and vars through narrative choices", () => {
  const steps = runDemoContentFlow();

  assert.equal(steps.length, 2);

  assert.deepEqual(steps[0], {
    locationId: "street",
    timeLabel: "Day 1 08:10 (morning)",
    triggeredEventId: "evt_street_arrival",
    sceneText: "You arrive on the street.",
    selectedChoiceId: "go_market",
    marketVisitIntent: true,
    currentGoal: "visit_market",
    questStatus: "active",
    questStepId: "step_go_market",
  });

  assert.deepEqual(steps[1], {
    locationId: "market",
    timeLabel: "Day 1 08:25 (morning)",
    triggeredEventId: "evt_market_morning",
    sceneText: "The market is open and calm.",
    selectedChoiceId: "finish_walk",
    marketVisitIntent: true,
    currentGoal: "market_visited",
    questStatus: "completed",
    questStepId: "step_go_market",
  });
});
