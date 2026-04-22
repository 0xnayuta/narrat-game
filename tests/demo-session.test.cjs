const test = require("node:test");
const assert = require("node:assert/strict");

const { createDemoSession } = require("../.tmp-demo-tests/app/createDemoSession.js");
const engineModule = require("../.tmp-demo-tests/engine/index.js");
const { createGameSessionFromBundle } = engineModule;

test("createDemoSession should pass options through to createGameSessionFromBundle", () => {
  const originalCreate = engineModule.createGameSessionFromBundle;
  const markerRng = () => 0.123;
  const fakeSession = { __test: "fake-session" };
  let capturedBundle = null;
  let capturedOptions = null;

  try {
    engineModule.createGameSessionFromBundle = (bundle, options) => {
      capturedBundle = bundle;
      capturedOptions = options;
      return fakeSession;
    };

    const result = createDemoSession({ randomFloat: markerRng });
    assert.equal(result, fakeSession);
    assert.ok(capturedBundle && typeof capturedBundle.id === "string");
    assert.equal(capturedOptions?.randomFloat, markerRng);
  } finally {
    engineModule.createGameSessionFromBundle = originalCreate;
  }
});

test("demo session should use injected RNG for weighted event tie-break in travel flow", () => {
  const weightedBundle = {
    id: "weighted-session-test",
    title: "Weighted Session Test",
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
        id: "weighted-a",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        weight: 1,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_weighted_a" },
      },
      {
        id: "weighted-b",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        weight: 3,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_weighted_b" },
      },
    ],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
        { id: "node_weighted_a", text: "Picked A", choices: [] },
        { id: "node_weighted_b", text: "Picked B", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: {},
  };

  const pickA = createGameSessionFromBundle(weightedBundle, { randomFloat: () => 0.0 });
  const pickAResult = pickA.travelTo("street");
  assert.equal(pickAResult.triggeredEventId, "weighted-a");
  assert.equal(pickAResult.scene?.nodeId, "node_weighted_a");

  const pickB = createGameSessionFromBundle(weightedBundle, { randomFloat: () => 0.99 });
  const pickBResult = pickB.travelTo("street");
  assert.equal(pickBResult.triggeredEventId, "weighted-b");
  assert.equal(pickBResult.scene?.nodeId, "node_weighted_b");
});

test("demo session should use injected RNG for weighted event tie-break in after-choice flow", () => {
  const weightedAfterChoiceBundle = {
    id: "weighted-after-choice-session-test",
    title: "Weighted After Choice Session Test",
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
        id: "enter-street-scene",
        type: "ambient",
        trigger: "on-location-enter",
        priority: 10,
        conditions: { locationIds: ["street"] },
        payload: { narrativeNodeId: "node_intro" },
      },
      {
        id: "after-choice-a",
        type: "follow-up",
        trigger: "after-choice",
        priority: 10,
        weight: 1,
        conditions: { locationIds: ["street"], flags: { after_choice_ready: true } },
        payload: { narrativeNodeId: "node_after_a" },
      },
      {
        id: "after-choice-b",
        type: "follow-up",
        trigger: "after-choice",
        priority: 10,
        weight: 3,
        conditions: { locationIds: ["street"], flags: { after_choice_ready: true } },
        payload: { narrativeNodeId: "node_after_b" },
      },
    ],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
        {
          id: "node_intro",
          text: "Intro",
          choices: [
            {
              id: "pick",
              text: "Pick",
              nextNodeId: "node_post_pick",
              effects: { setFlags: { after_choice_ready: true } },
            },
          ],
        },
        { id: "node_post_pick", text: "Post pick", choices: [] },
        { id: "node_after_a", text: "After choice A", choices: [] },
        { id: "node_after_b", text: "After choice B", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: {},
  };

  const pickA = createGameSessionFromBundle(weightedAfterChoiceBundle, { randomFloat: () => 0.0 });
  pickA.travelTo("street");
  const pickAChoice = pickA.choose("pick");
  assert.equal(pickAChoice.triggeredEventId, "after-choice-a");
  assert.equal(pickAChoice.scene?.nodeId, "node_after_a");

  const pickB = createGameSessionFromBundle(weightedAfterChoiceBundle, { randomFloat: () => 0.99 });
  pickB.travelTo("street");
  const pickBChoice = pickB.choose("pick");
  assert.equal(pickBChoice.triggeredEventId, "after-choice-b");
  assert.equal(pickBChoice.scene?.nodeId, "node_after_b");
});

test("demo session should support manual travel and choice flow", () => {
  const session = createDemoSession();

  assert.equal(session.getMode(), "free-roam");
  assert.equal(session.canTravel(), true);

  const travelStreet = session.travelTo("street");
  assert.equal(travelStreet.triggeredEventId, "evt_street_arrival");
  assert.equal(session.getMode(), "in-scene");
  assert.equal(session.canTravel(), false);
  assert.throws(() => session.travelTo("home"), /Cannot travel while a narrative scene is active/);
  assert.equal(travelStreet.state.currentLocationId, "street");
  assert.equal(travelStreet.state.flags["event.once.evt_street_arrival"], true);
  assert.equal(travelStreet.scene?.nodeId, "node_street_arrival");
  assert.deepEqual(travelStreet.scene?.choices, [
    { id: "go_market", text: "Head to the market" },
  ]);

  const chooseStreet = session.choose("go_market");
  assert.equal(chooseStreet.triggeredEventId, "evt_market_plan");
  assert.equal(chooseStreet.state.flags.market_visit_intent, true);
  assert.equal(chooseStreet.state.flags["event.once.evt_market_plan"], true);
  assert.equal(chooseStreet.state.vars.current_goal, "visit_market");
  assert.equal(chooseStreet.state.quests.quest_intro_walk?.status, "active");
  assert.equal(chooseStreet.scene?.nodeId, "node_market_plan");
  assert.deepEqual(chooseStreet.scene?.choices, []);
  assert.equal(session.canCloseScene(), true);

  const closePlan = session.closeScene();
  assert.equal(closePlan.scene, null);
  assert.equal(session.getMode(), "free-roam");
  assert.equal(session.canTravel(), true);
  assert.deepEqual(session.getAvailableNpcs(), []);

  const travelMarket = session.travelTo("market");
  assert.equal(travelMarket.triggeredEventId, "evt_market_morning");
  assert.equal(travelMarket.state.currentLocationId, "market");
  assert.equal(travelMarket.state.flags["event.once.evt_market_morning"], true);
  assert.equal(travelMarket.scene?.nodeId, "node_market_morning");
  assert.deepEqual(travelMarket.scene?.choices, [
    { id: "finish_walk", text: "Look around the stalls" },
  ]);

  const chooseMarket = session.choose("finish_walk");
  assert.equal(chooseMarket.state.vars.current_goal, "market_visited");
  assert.equal(chooseMarket.state.quests.quest_intro_walk?.status, "completed");
  assert.equal(chooseMarket.scene?.nodeId, "node_market_done");
  assert.deepEqual(chooseMarket.scene?.choices, []);
  assert.equal(session.canCloseScene(), true);

  const closed = session.closeScene();
  assert.equal(closed.scene, null);
  assert.equal(session.getCurrentScene(), null);
  assert.equal(session.hasActiveScene(), false);
  assert.equal(session.getMode(), "free-roam");
  assert.equal(session.canTravel(), true);

  assert.deepEqual(session.getAvailableNpcs(), [
    {
      npcId: "npc_vendor_01",
      npcName: "Vendor",
      label: "Talk to Vendor",
      nodeId: "node_vendor_intro",
    },
  ]);

  const restoredWrongVarNpc = session.restoreState({
    ...session.getState(),
    currentLocationId: "market",
    vars: {
      ...session.getState().vars,
      current_goal: "visit_market",
    },
  });
  assert.equal(restoredWrongVarNpc.scene, null);
  assert.deepEqual(session.getAvailableNpcs(), []);

  session.restoreState({
    ...session.getState(),
    currentLocationId: "market",
    vars: {
      ...session.getState().vars,
      current_goal: "market_visited",
    },
  });

  assert.deepEqual(session.getAvailableNpcs(), [
    {
      npcId: "npc_vendor_01",
      npcName: "Vendor",
      label: "Talk to Vendor",
      nodeId: "node_vendor_intro",
    },
  ]);

  const restoredWrongTimeNpc = session.restoreState({
    ...session.getState(),
    currentLocationId: "market",
    time: {
      ...session.getState().time,
      hour: 18,
      minute: 0,
    },
  });
  assert.equal(restoredWrongTimeNpc.scene, null);
  assert.deepEqual(session.getAvailableNpcs(), []);
  const npcDebug = session.getNpcDebugInfo();
  assert.equal(npcDebug.length, 1);
  assert.equal(npcDebug[0].resolvedInteractionId, null);
  assert.equal(npcDebug[0].rules[0].matched, false);
  assert.ok(npcDebug[0].rules[0].reasons.some((reason) => reason.code === "timeOfDay"));

  session.restoreState({
    ...session.getState(),
    currentLocationId: "market",
    time: {
      ...session.getState().time,
      hour: 8,
      minute: 25,
    },
  });

  assert.deepEqual(session.getAvailableNpcs(), [
    {
      npcId: "npc_vendor_01",
      npcName: "Vendor",
      label: "Talk to Vendor",
      nodeId: "node_vendor_intro",
    },
  ]);

  const npcScene = session.interactWithNpc("npc_vendor_01");
  assert.equal(npcScene.scene?.nodeId, "node_vendor_intro");
  assert.deepEqual(npcScene.scene?.choices, [
    { id: "ask_vendor", text: "Ask how business is going" },
  ]);

  const npcChoice = session.choose("ask_vendor");
  assert.equal(npcChoice.state.flags.vendor_met, true);
  assert.equal(npcChoice.state.vars.last_npc_spoken, "npc_vendor_01");
  assert.equal(npcChoice.scene?.nodeId, "node_vendor_done");
  assert.deepEqual(npcChoice.scene?.choices, []);

  const npcClosed = session.closeScene();
  assert.equal(npcClosed.scene, null);
  assert.equal(session.getMode(), "free-roam");

  assert.deepEqual(session.getAvailableNpcs(), [
    {
      npcId: "npc_vendor_01",
      npcName: "Vendor",
      label: "Talk to Vendor again",
      nodeId: "node_vendor_repeat",
    },
  ]);

  const npcRepeat = session.interactWithNpc("npc_vendor_01");
  assert.equal(npcRepeat.scene?.nodeId, "node_vendor_repeat");
  assert.deepEqual(npcRepeat.scene?.choices, []);
  session.closeScene();

  const restoredLockedNpc = session.restoreState({
    ...session.getState(),
    currentLocationId: "market",
    quests: {
      ...session.getState().quests,
      quest_intro_walk: {
        status: "active",
        currentStepId: "step_go_market",
      },
    },
  });
  assert.equal(restoredLockedNpc.scene, null);
  assert.deepEqual(session.getAvailableNpcs(), []);

  const restored = session.restoreState({
    ...session.getState(),
    currentLocationId: "home",
    vars: {
      ...session.getState().vars,
      current_goal: "restored_goal",
    },
  });
  assert.equal(restored.scene, null);
  assert.equal(restored.state.currentLocationId, "home");
  assert.equal(restored.state.vars.current_goal, "restored_goal");
  assert.equal(session.getMode(), "free-roam");
  assert.equal(session.canTravel(), true);

  const travelStreetAgain = session.travelTo("street");
  assert.equal(travelStreetAgain.state.currentLocationId, "street");
  assert.equal(travelStreetAgain.triggeredEventId, null);
  assert.equal(travelStreetAgain.scene, null);

  const travelMarketAgain = session.travelTo("market");
  assert.equal(travelMarketAgain.state.currentLocationId, "market");
  assert.equal(travelMarketAgain.triggeredEventId, null);
  assert.equal(travelMarketAgain.scene, null);
});
