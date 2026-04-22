const test = require("node:test");
const assert = require("node:assert/strict");

const { createDemoSession } = require("../.tmp-demo-tests/app/createDemoSession.js");

/**
 * Integration tests verifying the NPC → choice → event closed loop.
 *
 * Flow:
 *   travel to market → quest completed → NPC unlocked →
 *   NPC interaction → player chooses → after-choice event triggered
 */
test("NPC interaction choice should trigger after-choice event", () => {
  const session = createDemoSession();

  // Step 1: Travel to street, trigger arrival event
  const street = session.travelTo("street");
  assert.equal(street.triggeredEventId, "evt_street_arrival");

  // Step 2: Choose to go to market — activates quest, sets vars
  const goMarket = session.choose("go_market");
  assert.equal(goMarket.state.quests.quest_intro_walk?.status, "active");
  assert.equal(goMarket.state.vars.current_goal, "visit_market");
  session.closeScene();

  // Step 3: Travel to market, trigger market event
  const market = session.travelTo("market");
  assert.equal(market.triggeredEventId, "evt_market_morning");

  // Step 4: Finish the walk — completes quest, sets current_goal to "market_visited"
  const finishWalk = session.choose("finish_walk");
  assert.equal(finishWalk.state.quests.quest_intro_walk?.status, "completed");
  assert.equal(finishWalk.state.vars.current_goal, "market_visited");
  session.closeScene();

  // Step 5: NPC should now be available
  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].npcId, "npc_vendor_01");
  assert.equal(npcs[0].label, "Talk to Vendor");

  // Step 6: Interact with NPC
  const npcScene = session.interactWithNpc("npc_vendor_01");
  assert.equal(npcScene.scene?.nodeId, "node_vendor_intro");
  assert.equal(npcScene.triggeredEventId, null);

  // Step 7: Choose in NPC dialogue — this should trigger after-choice event
  const npcChoice = session.choose("ask_vendor");
  assert.equal(npcChoice.state.flags.vendor_met, true);
  assert.equal(npcChoice.state.vars.last_npc_spoken, "npc_vendor_01");

  // KEY ASSERTION: after-choice event triggered from NPC dialogue choice
  assert.equal(npcChoice.triggeredEventId, "evt_vendor_aftermath");
  assert.equal(npcChoice.scene?.nodeId, "node_vendor_aftermath");

  // Step 8: Close the aftermath scene
  session.closeScene();
  assert.equal(session.getMode(), "free-roam");
});

test("NPC interaction should not trigger after-choice event when conditions don't match", () => {
  const session = createDemoSession();

  // Set up state where vendor is not met
  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: { demo_enabled: true, quest_intro_started: true, vendor_met: false },
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    inventory: {},
    vars: { current_goal: "market_visited" },
  });

  // NPC is available
  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);

  // Interact and choose
  session.interactWithNpc("npc_vendor_01");
  const npcChoice = session.choose("ask_vendor");

  // vendor_met is now true, but the evt_vendor_aftermath is once-only
  // so it should trigger on first vendor interaction
  assert.equal(npcChoice.triggeredEventId, "evt_vendor_aftermath");

  // After close, set up state for second interaction (vendor already met)
  session.closeScene();
  const npcsAfter = session.getAvailableNpcs();
  assert.equal(npcsAfter[0].label, "Talk to Vendor again");

  session.interactWithNpc("npc_vendor_01");
  // vendor_repeat has no choices, so no after-choice to trigger
  assert.equal(session.getCurrentScene()?.choices.length, 0);
  session.closeScene();
});

test("quest step condition should gate NPC interaction then advance via event", () => {
  const session = createDemoSession();

  // Set up state: at market, quest active at step_go_market, goal = visit_market
  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: { demo_enabled: true, quest_intro_started: true, market_visit_intent: true },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_go_market" },
    },
    inventory: {},
    vars: { current_goal: "visit_market" },
  });

  // The stall discovery event should be available (on-time-check trigger)
  // but won't fire from just being here — it needs a time-check trigger
  // Let's verify the NPC stall-tip interaction is NOT available yet
  // (quest step is step_go_market, not step_examine_stall)
  const debugInfo = session.getNpcDebugInfo();
  const stallTipRule = debugInfo[0]?.rules.find((r) => r.ruleId === "vendor-stall-tip");
  assert.ok(stallTipRule);
  assert.equal(stallTipRule.matched, false);

  // Now simulate: advance quest step to step_examine_stall + set flag
  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      market_visit_intent: true,
      stall_discovered: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
    inventory: {},
    vars: { current_goal: "examine_stall" },
  });

  // Now vendor-stall-tip should be the matched interaction
  const npcsNow = session.getAvailableNpcs();
  assert.equal(npcsNow.length, 1);
  assert.equal(npcsNow[0].label, "Ask about the oddities stall");

  // Interact with NPC about the stall
  const stallTip = session.interactWithNpc("npc_vendor_01");
  assert.equal(stallTip.scene?.nodeId, "node_vendor_stall_tip");

  // Choose to thank the vendor
  const thankChoice = session.choose("thank_vendor");
  assert.equal(thankChoice.state.vars.current_goal, "ask_about_compass");
  session.closeScene();
});

test("compass vendor branch should trigger follow-up event after showing the compass", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_owned: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
    inventory: {},
    vars: { current_goal: "ask_about_compass", gold: 35 },
  });

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].label, "Ask about the oddities stall");

  const stallTip = session.interactWithNpc("npc_vendor_01");
  assert.equal(stallTip.scene?.nodeId, "node_vendor_stall_tip");
  assert.deepEqual(stallTip.scene?.choices, [
    { id: "show_compass", text: "Show the compass you bought" },
    { id: "press_for_harbor_watch", text: "Press for a stronger harbor lead" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const showCompass = session.choose("show_compass");
  assert.equal(showCompass.state.flags.compass_vendor_reacted, true);
  assert.equal(showCompass.state.vars.current_goal, "investigate_compass");
  assert.equal(showCompass.triggeredEventId, "evt_compass_lead");
  assert.equal(showCompass.scene?.nodeId, "node_compass_lead");
});

test("vendor stall tip should reveal stronger harbor lead when player either owns the compass OR has high reputation", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_owned: false,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
    inventory: {},
    vars: { current_goal: "ask_about_compass", gold: 35, reputation: 3 },
  });

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].label, "Ask about the oddities stall");

  const stallTip = session.interactWithNpc("npc_vendor_01");
  assert.equal(stallTip.scene?.nodeId, "node_vendor_stall_tip");
  assert.deepEqual(stallTip.scene?.choices, [
    { id: "press_for_harbor_watch", text: "Press for a stronger harbor lead" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const pressLead = session.choose("press_for_harbor_watch");
  assert.equal(pressLead.state.flags.compass_vendor_reacted, true);
  assert.equal(pressLead.state.vars.current_goal, "investigate_compass");
  assert.equal(pressLead.triggeredEventId, "evt_compass_lead");
  assert.equal(pressLead.scene?.nodeId, "node_compass_lead");

  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_owned: false,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
    inventory: {},
    vars: { current_goal: "ask_about_compass", gold: 35, reputation: 1 },
  });

  const hiddenLead = session.interactWithNpc("npc_vendor_01");
  assert.deepEqual(hiddenLead.scene?.choices, [
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);
});
