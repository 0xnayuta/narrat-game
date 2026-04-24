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
  assert.equal(finishWalk.scene?.nodeId, "node_market_done");

  const leaveMarket = session.choose("leave_market_for_now");
  assert.equal(leaveMarket.scene?.nodeId, "node_market_done_end");
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

test("fresh demo path should allow reaching the oddities stall and unlocking the vendor stall tip", () => {
  const session = createDemoSession();

  const street = session.travelTo("street");
  assert.equal(street.triggeredEventId, "evt_street_arrival");

  const goMarket = session.choose("go_market");
  assert.equal(goMarket.state.quests.quest_intro_walk?.status, "active");
  assert.equal(goMarket.state.quests.quest_intro_walk?.currentStepId, "step_go_market");
  session.closeScene();

  const market = session.travelTo("market");
  assert.equal(market.triggeredEventId, "evt_market_morning");
  assert.equal(market.scene?.nodeId, "node_market_morning");
  assert.deepEqual(market.scene?.choices, [
    { id: "inspect_oddities_stall", text: "Check the oddities stall in the corner" },
    { id: "finish_walk", text: "Look around the stalls" },
  ]);

  const inspectStall = session.choose("inspect_oddities_stall");
  assert.equal(inspectStall.triggeredEventId, null);
  assert.equal(inspectStall.scene?.nodeId, "node_stall_discovery");

  const exploreStall = session.choose("explore_stall");
  assert.equal(exploreStall.triggeredEventId, null);
  assert.equal(exploreStall.state.flags.stall_discovered, true);
  assert.equal(exploreStall.state.quests.quest_intro_walk?.currentStepId, "step_examine_stall");
  assert.equal(exploreStall.scene?.nodeId, "node_stall_examined");

  const leaveStall = session.choose("leave_stall");
  assert.equal(leaveStall.triggeredEventId, null);
  assert.equal(leaveStall.scene?.nodeId, "node_stall_left");
  session.closeScene();

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].label, "Ask about the oddities stall");
});

test("market morning wrong turn should still preserve a clear path back to the oddities stall", () => {
  const session = createDemoSession();

  const street = session.travelTo("street");
  assert.equal(street.triggeredEventId, "evt_street_arrival");

  session.choose("go_market");
  session.closeScene();

  const market = session.travelTo("market");
  assert.equal(market.triggeredEventId, "evt_market_morning");

  const finishWalk = session.choose("finish_walk");
  assert.equal(finishWalk.scene?.nodeId, "node_market_done");
  assert.deepEqual(finishWalk.scene?.choices, [
    { id: "inspect_oddities_stall_after_walk", text: "Take a closer look at the oddities stall before leaving" },
    { id: "leave_market_for_now", text: "Leave the market floor for now" },
  ]);

  const recoverToStall = session.choose("inspect_oddities_stall_after_walk");
  assert.equal(recoverToStall.triggeredEventId, null);
  assert.equal(recoverToStall.scene?.nodeId, "node_stall_discovery");
});

test("vendor should still be available later in the day once the market intro path is complete", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 19, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      vendor_met: false,
    },
    quests: {
      quest_intro_walk: { status: "completed", currentStepId: "step_go_market" },
    },
    inventory: {},
    vars: { current_goal: "market_visited", gold: 35 },
  });

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].label, "Talk to Vendor");
});

test("re-entering the market after completing the intro should trigger an eventHistory-driven return glance", () => {
  const session = createDemoSession();

  const street = session.travelTo("street");
  assert.equal(street.triggeredEventId, "evt_street_arrival");

  session.choose("go_market");
  session.closeScene();

  const market = session.travelTo("market");
  assert.equal(market.triggeredEventId, "evt_market_morning");

  const finishWalk = session.choose("finish_walk");
  assert.equal(finishWalk.state.quests.quest_intro_walk?.status, "completed");
  session.choose("leave_market_for_now");
  session.closeScene();

  const streetAgain = session.travelTo("street");
  assert.equal(streetAgain.triggeredEventId, null);

  const marketReturn = session.travelTo("market");
  assert.equal(marketReturn.triggeredEventId, "evt_market_return_glance");
  assert.equal(marketReturn.scene?.nodeId, "node_market_return_glance");
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

test("vendor stall tip should let the player return to the oddities stall after leaving without buying", () => {
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
    vars: { current_goal: "examine_stall", gold: 35, reputation: 1 },
  });

  const stallTip = session.interactWithNpc("npc_vendor_01");
  assert.equal(stallTip.scene?.nodeId, "node_vendor_stall_tip");
  assert.deepEqual(stallTip.scene?.choices, [
    { id: "return_to_oddities_stall", text: "Go back and take another look at the oddities stall" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const returnToStall = session.choose("return_to_oddities_stall");
  assert.equal(returnToStall.triggeredEventId, null);
  assert.equal(returnToStall.state.vars.current_goal, "examine_stall");
  assert.equal(returnToStall.scene?.nodeId, "node_stall_examined");
});

test("low gold stall path should still guide the player toward the vendor fallback lead", () => {
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
    vars: { current_goal: "examine_stall", gold: 5, reputation: 1 },
  });

  session.interactWithNpc("npc_vendor_01");
  const returnToStall = session.choose("return_to_oddities_stall");
  assert.equal(returnToStall.scene?.nodeId, "node_stall_examined");
  assert.deepEqual(returnToStall.scene?.choices, [
    { id: "cannot_afford_compass", text: "Admit you cannot afford the compass and ask about it instead" },
    { id: "examine_compass", text: "Pick up the compass for a closer look" },
    { id: "leave_stall", text: "Step back from the stall" },
  ]);

  const tooExpensive = session.choose("cannot_afford_compass");
  assert.equal(tooExpensive.state.flags.compass_examined, true);
  assert.equal(tooExpensive.state.vars.current_goal, "ask_about_compass");
  assert.equal(tooExpensive.scene?.nodeId, "node_compass_too_expensive");
});

test("examining the compass without buying it should still provide a fallback into the black sail lead", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 90 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_owned: false,
      compass_examined: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
    },
    inventory: {},
    vars: { current_goal: "examine_stall", gold: 5, reputation: 1 },
  });

  const stallTip = session.interactWithNpc("npc_vendor_01");
  assert.equal(stallTip.scene?.nodeId, "node_vendor_stall_tip");
  assert.deepEqual(stallTip.scene?.choices, [
    { id: "describe_examined_compass", text: "Describe the strange compass you handled at the stall" },
    { id: "return_to_oddities_stall", text: "Go back and take another look at the oddities stall" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const fallbackLead = session.choose("describe_examined_compass");
  assert.equal(fallbackLead.state.flags.compass_vendor_reacted, true);
  assert.equal(fallbackLead.state.quests.quest_black_sail_trail?.status, "active");
  assert.equal(fallbackLead.state.quests.quest_black_sail_trail?.currentStepId, "step_find_mira");
  assert.equal(fallbackLead.triggeredEventId, "evt_compass_lead");
  assert.equal(fallbackLead.scene?.nodeId, "node_compass_lead");
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
    { id: "return_to_oddities_stall", text: "Go back and take another look at the oddities stall" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const showCompass = session.choose("show_compass");
  assert.equal(showCompass.state.flags.compass_vendor_reacted, true);
  assert.equal(showCompass.state.quests.quest_black_sail_trail?.status, "active");
  assert.equal(showCompass.state.quests.quest_black_sail_trail?.currentStepId, "step_find_mira");
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
    { id: "return_to_oddities_stall", text: "Go back and take another look at the oddities stall" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);

  const pressLead = session.choose("press_for_harbor_watch");
  assert.equal(pressLead.state.flags.compass_vendor_reacted, true);
  assert.equal(pressLead.state.quests.quest_black_sail_trail?.status, "active");
  assert.equal(pressLead.state.quests.quest_black_sail_trail?.currentStepId, "step_find_mira");
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
    { id: "return_to_oddities_stall", text: "Go back and take another look at the oddities stall" },
    { id: "thank_vendor", text: "Thank the vendor" },
  ]);
});

test("compass lead should continue into a minimal harbor watch follow-up", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: false,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_find_mira" },
    },
    inventory: {},
    vars: { current_goal: "investigate_compass", gold: 35 },
  });

  const harborArrival = session.travelTo("harbor");
  assert.equal(harborArrival.triggeredEventId, "evt_harbor_arrival");
  assert.equal(harborArrival.scene?.nodeId, "node_harbor_arrival");
  session.closeScene();

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].npcId, "npc_harbor_watch_01");
  assert.equal(npcs[0].label, "Ask for Mira at the harbor watch");

  const miraIntro = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraIntro.scene?.nodeId, "node_harbor_watch_intro");
  assert.deepEqual(miraIntro.scene?.choices, [
    { id: "show_compass_to_mira", text: "Show the compass and repeat the vendor's warning" },
  ]);

  const miraChoice = session.choose("show_compass_to_mira");
  assert.equal(miraChoice.triggeredEventId, null);
  assert.equal(miraChoice.state.flags.harbor_watch_contacted, true);
  assert.equal(miraChoice.state.quests.quest_black_sail_trail?.currentStepId, "step_search_signal_tower");
  assert.equal(miraChoice.scene?.nodeId, "node_harbor_watch_clue");
  session.closeScene();

  const repeatNpcs = session.getAvailableNpcs();
  assert.equal(repeatNpcs.length, 1);
  assert.equal(repeatNpcs[0].label, "Speak with Mira again");
});

 test("returning to harbor after Mira's clue should trigger a small patrol-glance follow-up before the tower", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "market",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_search_signal_tower" },
    },
    inventory: {},
    vars: { current_goal: "investigate_signal_tower", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: { evt_harbor_arrival: true },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const harborReturn = session.travelTo("harbor");
  assert.equal(harborReturn.triggeredEventId, "evt_harbor_return_patrol_glance");
  assert.equal(harborReturn.scene?.nodeId, "node_harbor_return_patrol_glance");
  assert.deepEqual(harborReturn.scene?.choices, [
    { id: "mark_the_quieter_route_to_the_tower", text: "Mark the quieter route toward the old signal tower before moving on" },
  ]);

  const markRoute = session.choose("mark_the_quieter_route_to_the_tower");
  assert.equal(markRoute.triggeredEventId, null);
  assert.equal(markRoute.state.flags.harbor_patrol_gap_noted, true);
  assert.equal(markRoute.state.vars.current_goal, "investigate_signal_tower");
  assert.equal(markRoute.scene?.nodeId, "node_harbor_return_patrol_glance_end");
});

test("returning to the signal tower after noting the harbor gap should trigger a quiet-approach follow-up", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 10, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      harbor_patrol_gap_noted: true,
      signal_tower_clue_found: false,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_search_signal_tower" },
    },
    inventory: {},
    vars: { current_goal: "investigate_signal_tower", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_harbor_arrival: true,
        evt_harbor_return_patrol_glance: true,
        evt_signal_tower_arrival: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const towerReturn = session.travelTo("signal_tower");
  assert.equal(towerReturn.triggeredEventId, "evt_signal_tower_return_approach");
  assert.equal(towerReturn.scene?.nodeId, "node_signal_tower_return_approach");
  assert.deepEqual(towerReturn.scene?.choices, [
    { id: "keep_to_the_shadowed_stair", text: "Keep to the shadowed stair and fix the quiet approach before searching" },
  ]);

  const quietApproach = session.choose("keep_to_the_shadowed_stair");
  assert.equal(quietApproach.triggeredEventId, null);
  assert.equal(quietApproach.state.flags.signal_tower_quiet_approach_noted, true);
  assert.equal(quietApproach.state.vars.current_goal, "investigate_signal_tower");
  assert.equal(quietApproach.scene?.nodeId, "node_signal_tower_return_approach_end");
});

test("harbor watch lead should continue into the old signal tower", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_search_signal_tower" },
    },
    inventory: {},
    vars: { current_goal: "investigate_signal_tower", gold: 35 },
  });

  const towerArrival = session.travelTo("signal_tower");
  assert.equal(towerArrival.triggeredEventId, "evt_signal_tower_arrival");
  assert.equal(towerArrival.scene?.nodeId, "node_signal_tower_arrival");
  assert.deepEqual(towerArrival.scene?.choices, [
    { id: "search_signal_tower", text: "Search the lantern room" },
  ]);

  const towerChoice = session.choose("search_signal_tower");
  assert.equal(towerChoice.triggeredEventId, null);
  assert.equal(towerChoice.state.flags.signal_tower_clue_found, true);
  assert.equal(towerChoice.state.vars.current_goal, "signal_tower_investigated");
  assert.equal(towerChoice.scene?.nodeId, "node_signal_tower_clue");
});

test("signal tower clue should lead back to Mira and unlock a night harbor signal", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 21, minute: 45 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_search_signal_tower" },
    },
    inventory: {},
    vars: { current_goal: "signal_tower_investigated", gold: 35 },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
  assert.deepEqual(miraRepeat.scene?.choices, [
    { id: "report_signal_tower_clue", text: "Show Mira the oilskin scrap from the tower" },
  ]);

  const reportClue = session.choose("report_signal_tower_clue");
  assert.equal(reportClue.triggeredEventId, null);
  assert.equal(reportClue.state.quests.quest_black_sail_trail?.currentStepId, "step_watch_harbor_at_night");
  assert.equal(reportClue.scene?.nodeId, "node_harbor_watch_night_tip");
  session.closeScene();

  const toTower = session.travelTo("signal_tower");
  assert.equal(toTower.triggeredEventId, null);
  assert.equal(toTower.scene, null);

  const backToHarbor = session.travelTo("harbor");
  assert.equal(backToHarbor.triggeredEventId, "evt_harbor_night_signal");
  assert.equal(backToHarbor.scene?.nodeId, "node_harbor_night_signal");
  assert.deepEqual(backToHarbor.scene?.choices, [
    { id: "follow_pier_signal", text: "Head for the far pier before the light disappears" },
  ]);
});

test("harbor watch repeat should stay available for active black sail quest even when current_goal is outside the old whitelist", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 3, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_watch_harbor_at_night" },
    },
    inventory: {},
    vars: { current_goal: "rest", gold: 35 },
  });

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].npcId, "npc_harbor_watch_01");
  assert.equal(npcs[0].label, "Speak with Mira again");

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
  assert.match(miraRepeat.scene?.text ?? "", /Bring me something concrete from the tower, the piers, or the berth/i);
  assert.deepEqual(miraRepeat.scene?.choices, []);
});

test("waiting at harbor after Mira's night tip should trigger the night signal without leaving location", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 21, minute: 55 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_watch_harbor_at_night" },
    },
    inventory: {},
    vars: { current_goal: "wait_for_harbor_signal", gold: 35 },
  });

  const waited = session.wait(10);
  assert.equal(waited.triggeredEventId, "evt_harbor_night_signal");
  assert.equal(waited.scene?.nodeId, "node_harbor_night_signal");
  assert.deepEqual(waited.scene?.choices, [
    { id: "follow_pier_signal", text: "Head for the far pier before the light disappears" },
  ]);
});

test("night harbor signal should continue into a minimal pier investigation", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 21, minute: 55 },
    currentLocationId: "signal_tower",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_watch_harbor_at_night" },
    },
    inventory: {},
    vars: { current_goal: "wait_for_harbor_signal", gold: 35 },
  });

  const nightSignal = session.travelTo("harbor");
  assert.equal(nightSignal.triggeredEventId, "evt_harbor_night_signal");
  assert.equal(nightSignal.scene?.nodeId, "node_harbor_night_signal");
  assert.deepEqual(nightSignal.scene?.choices, [
    { id: "follow_pier_signal", text: "Head for the far pier before the light disappears" },
  ]);

  const followSignal = session.choose("follow_pier_signal");
  assert.equal(followSignal.triggeredEventId, null);
  assert.equal(followSignal.state.quests.quest_black_sail_trail?.currentStepId, "step_follow_pier_signal");
  assert.equal(followSignal.scene?.nodeId, "node_harbor_night_signal_end");
  session.closeScene();

  const pierArrival = session.travelTo("pier");
  assert.equal(pierArrival.triggeredEventId, "evt_pier_arrival");
  assert.equal(pierArrival.scene?.nodeId, "node_pier_arrival");
  assert.deepEqual(pierArrival.scene?.choices, [
    { id: "open_tin_capsule", text: "Open the tin capsule" },
  ]);

  const capsule = session.choose("open_tin_capsule");
  assert.equal(capsule.triggeredEventId, null);
  assert.equal(capsule.state.flags.pier_message_found, true);
  assert.equal(capsule.state.vars.current_goal, "pier_message_found");
  assert.equal(capsule.state.quests.quest_black_sail_trail?.currentStepId, "step_decode_pier_message");
  assert.equal(capsule.scene?.nodeId, "node_pier_capsule_clue");
});

test("night harbor signal should reveal a shadow-route branch when prior harbor and tower observations were recorded", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 21, minute: 55 },
    currentLocationId: "signal_tower",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      harbor_patrol_gap_noted: true,
      signal_tower_quiet_approach_noted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_watch_harbor_at_night" },
    },
    inventory: {},
    vars: { current_goal: "wait_for_harbor_signal", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_signal_tower_return_approach: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const nightSignal = session.travelTo("harbor");
  assert.equal(nightSignal.triggeredEventId, "evt_harbor_night_signal");
  assert.equal(nightSignal.scene?.nodeId, "node_harbor_night_signal");
  assert.deepEqual(nightSignal.scene?.choices, [
    { id: "follow_pier_signal_by_shadow_route", text: "Use the shadowed warehouse line and approach the pier from cover" },
    { id: "follow_pier_signal", text: "Head for the far pier before the light disappears" },
  ]);

  const shadowRoute = session.choose("follow_pier_signal_by_shadow_route");
  assert.equal(shadowRoute.triggeredEventId, null);
  assert.equal(shadowRoute.state.flags.black_sail_shadow_route_taken, true);
  assert.equal(shadowRoute.state.vars.current_goal, "investigate_pier_signal");
  assert.equal(shadowRoute.state.quests.quest_black_sail_trail?.currentStepId, "step_follow_pier_signal");
  assert.equal(shadowRoute.scene?.nodeId, "node_harbor_night_signal_shadow_route_end");
});

test("pier message should lead back to Mira and decode the north channel clue", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 0, minute: 15 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_decode_pier_message" },
    },
    inventory: {},
    vars: { current_goal: "pier_message_found", gold: 35 },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
  assert.deepEqual(miraRepeat.scene?.choices, [
    { id: "show_pier_message_to_mira", text: "Show Mira the note from the tin capsule" },
  ]);

  const decoded = session.choose("show_pier_message_to_mira");
  assert.equal(decoded.triggeredEventId, null);
  assert.equal(decoded.state.flags.north_channel_decoded, true);
  assert.equal(decoded.state.quests.quest_black_sail_trail?.currentStepId, "step_investigate_north_channel");
  assert.equal(decoded.scene?.nodeId, "node_harbor_watch_channel_tip");
});

test("north channel clue should continue into a minimal investigation point", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_north_channel" },
    },
    inventory: {},
    vars: { current_goal: "investigate_north_channel", gold: 35 },
  });

  const channelArrival = session.travelTo("north_channel");
  assert.equal(channelArrival.triggeredEventId, "evt_north_channel_arrival");
  assert.equal(channelArrival.scene?.nodeId, "node_north_channel_arrival");
  assert.deepEqual(channelArrival.scene?.choices, [
    { id: "inspect_channel_marker", text: "Inspect the marker and the torn sailcloth" },
  ]);

  const inspectMarker = session.choose("inspect_channel_marker");
  assert.equal(inspectMarker.triggeredEventId, null);
  assert.equal(inspectMarker.state.flags.north_channel_marker_found, true);
  assert.equal(inspectMarker.state.vars.current_goal, "north_channel_investigated");
  assert.equal(inspectMarker.scene?.nodeId, "node_north_channel_clue");
});

test("returning to the north channel after finding the marker should trigger a wake-pattern recap", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 10 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_north_channel" },
    },
    inventory: {},
    vars: { current_goal: "north_channel_investigated", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_north_channel_arrival: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
      triggerScopes: {},
    },
  });

  const wakePattern = session.travelTo("north_channel");
  assert.equal(wakePattern.triggeredEventId, "evt_north_channel_return_wake_pattern");
  assert.equal(wakePattern.scene?.nodeId, "node_north_channel_return_wake_pattern");
  assert.deepEqual(wakePattern.scene?.choices, [
    {
      id: "mark_the_channel_wake_toward_customs",
      text: "Mark the wake line leading back toward the customs-side berths",
    },
  ]);

  const markWake = session.choose("mark_the_channel_wake_toward_customs");
  assert.equal(markWake.triggeredEventId, null);
  assert.equal(markWake.state.flags.black_sail_north_channel_wake_pattern_noted, true);
  assert.equal(markWake.state.vars.current_goal, "north_channel_investigated");
  assert.equal(markWake.scene?.nodeId, "node_north_channel_return_wake_pattern_end");
});

test("north channel marker should lead back to Mira and identify the black sail berth", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 20 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_north_channel" },
    },
    inventory: {},
    vars: { current_goal: "north_channel_investigated", gold: 35 },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
  assert.deepEqual(miraRepeat.scene?.choices, [
    { id: "report_north_channel_marker", text: "Describe the torn sailcloth and marked cord from the north channel" },
  ]);

  const berthTip = session.choose("report_north_channel_marker");
  assert.equal(berthTip.triggeredEventId, null);
  assert.equal(berthTip.state.flags.black_sail_berth_identified, true);
  assert.equal(berthTip.state.quests.quest_black_sail_trail?.currentStepId, "step_investigate_black_sail_berth");
  assert.equal(berthTip.scene?.nodeId, "node_harbor_watch_black_sail_tip");
});

test("Mira should offer a short fresh-wake feedback after a recent north channel recap", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 35 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_north_channel_wake_pattern_noted: true,
      black_sail_berth_identified: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    inventory: {},
    vars: { current_goal: "investigate_black_sail_berth", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_north_channel_return_wake_pattern: true,
      },
      cooldownLastTriggeredMinuteByEventId: {
        evt_north_channel_return_wake_pattern: 1510,
      },
      triggerScopes: {},
    },
  });

  const freshFeedback = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(freshFeedback.scene?.nodeId, "node_harbor_watch_north_channel_fresh_feedback");
  assert.deepEqual(freshFeedback.scene?.choices, [
    { id: "note_miras_fresh_wake_warning", text: "Note Mira's warning and head for the coal berth" },
  ]);

  const noteWarning = session.choose("note_miras_fresh_wake_warning");
  assert.equal(noteWarning.triggeredEventId, null);
  assert.equal(noteWarning.state.flags.black_sail_north_channel_recent_feedback_heard, true);
  assert.equal(noteWarning.state.vars.current_goal, "investigate_black_sail_berth");
  assert.equal(noteWarning.scene?.nodeId, "node_harbor_watch_north_channel_fresh_feedback_end");
});

test("Mira fresh-wake feedback should not steal repeat interaction after the short window expires", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 2, minute: 10 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_north_channel_wake_pattern_noted: true,
      black_sail_berth_identified: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    inventory: {},
    vars: { current_goal: "investigate_black_sail_berth", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_north_channel_return_wake_pattern: true,
      },
      cooldownLastTriggeredMinuteByEventId: {
        evt_north_channel_return_wake_pattern: 1510,
      },
      triggerScopes: {},
    },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
});

test("black sail berth clue should continue into a minimal coal berth investigation", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 35 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_berth_identified: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    inventory: {},
    vars: { current_goal: "investigate_black_sail_berth", gold: 35 },
  });

  const berthArrival = session.travelTo("coal_berth");
  assert.equal(berthArrival.triggeredEventId, "evt_coal_berth_arrival");
  assert.equal(berthArrival.scene?.nodeId, "node_coal_berth_arrival");
  assert.deepEqual(berthArrival.scene?.choices, [
    { id: "search_coal_berth", text: "Search the berth and the customs-side crates" },
  ]);

  const searchBerth = session.choose("search_coal_berth");
  assert.equal(searchBerth.triggeredEventId, null);
  assert.equal(searchBerth.state.flags.coal_berth_clue_found, true);
  assert.equal(searchBerth.state.vars.current_goal, "coal_berth_investigated");
  assert.equal(searchBerth.scene?.nodeId, "node_coal_berth_clue");
});

test("coal berth ledger should let Mira confirm the black sail line and complete the quest", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 2, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_berth_identified: true,
      coal_berth_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    inventory: {},
    vars: { current_goal: "coal_berth_investigated", gold: 35 },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
  assert.deepEqual(miraRepeat.scene?.choices, [
    { id: "report_coal_berth_ledger", text: "Show Mira the ledger scrap from the coal berth" },
  ]);

  const confirmLedger = session.choose("report_coal_berth_ledger");
  assert.equal(confirmLedger.triggeredEventId, null);
  assert.equal(confirmLedger.state.flags.black_sail_network_confirmed, true);
  assert.equal(confirmLedger.state.quests.quest_black_sail_trail?.status, "completed");
  assert.equal(confirmLedger.scene?.nodeId, "node_harbor_watch_smuggling_confirmed");
  assert.deepEqual(confirmLedger.scene?.choices, [
    { id: "offer_help_with_sting", text: "Tell Mira you'll help watch the berth on the next tide" },
  ]);

  const stingPlan = session.choose("offer_help_with_sting");
  assert.equal(stingPlan.triggeredEventId, null);
  assert.equal(stingPlan.state.flags.black_sail_sting_prepared, true);
  assert.equal(stingPlan.state.vars.current_goal, "prepare_black_sail_sting");
  assert.equal(stingPlan.state.quests.quest_black_sail_sting?.status, "active");
  assert.equal(stingPlan.state.quests.quest_black_sail_sting?.currentStepId, "step_prepare_stakeout");
  assert.equal(stingPlan.scene?.nodeId, "node_harbor_watch_sting_plan");
});

test("prepared black sail sting should unlock a minimal night stakeout event", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 3, hour: 22, minute: 10 },
    currentLocationId: "coal_berth",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      black_sail_sting_prepared: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_black_sail_sting: { status: "active", currentStepId: "step_prepare_stakeout" },
    },
    inventory: {},
    vars: { current_goal: "prepare_black_sail_sting", gold: 35 },
  });

  const toHarbor = session.travelTo("harbor");
  assert.equal(toHarbor.triggeredEventId, "evt_black_sail_stakeout");
  assert.equal(toHarbor.scene?.nodeId, "node_black_sail_stakeout");
  assert.deepEqual(toHarbor.scene?.choices, [
    { id: "take_stakeout_position", text: "Take your place overlooking the coal berth" },
    { id: "reset_stakeout_plan", text: "Tell Mira you need to reset the plan and try again on another tide" },
  ]);

  const takePosition = session.choose("take_stakeout_position");
  assert.equal(takePosition.triggeredEventId, null);
  assert.equal(takePosition.state.flags.black_sail_stakeout_started, true);
  assert.equal(takePosition.state.vars.current_goal, "hold_black_sail_stakeout");
  assert.equal(takePosition.state.quests.quest_black_sail_sting?.currentStepId, "step_hold_stakeout");
  assert.equal(takePosition.scene?.nodeId, "node_black_sail_stakeout_ready");
});

test("started black sail stakeout should lead into a minimal contact and net-closing beat", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 3, hour: 22, minute: 25 },
    currentLocationId: "coal_berth",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      black_sail_sting_prepared: true,
      black_sail_stakeout_started: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_black_sail_sting: { status: "active", currentStepId: "step_hold_stakeout" },
    },
    inventory: {},
    vars: { current_goal: "hold_black_sail_stakeout", gold: 35 },
  });

  const backToHarbor = session.travelTo("harbor");
  assert.equal(backToHarbor.triggeredEventId, "evt_black_sail_contact");
  assert.equal(backToHarbor.scene?.nodeId, "node_black_sail_contact");
  assert.deepEqual(backToHarbor.scene?.choices, [
    { id: "signal_mira_to_close_net", text: "Give Mira the go-ahead to close the net" },
  ]);

  const closeNet = session.choose("signal_mira_to_close_net");
  assert.equal(closeNet.triggeredEventId, null);
  assert.equal(closeNet.state.flags.black_sail_net_closing, true);
  assert.equal(closeNet.state.vars.current_goal, "close_black_sail_net");
  assert.equal(closeNet.state.quests.quest_black_sail_sting?.currentStepId, "step_close_the_net");
  assert.equal(closeNet.scene?.nodeId, "node_black_sail_net_closing");
  assert.deepEqual(closeNet.scene?.choices, [
    { id: "help_secure_the_berth", text: "Help the watch secure the berth after the rush" },
  ]);

  const resolveSting = session.choose("help_secure_the_berth");
  assert.equal(resolveSting.triggeredEventId, null);
  assert.equal(resolveSting.state.flags.black_sail_sting_resolved, true);
  assert.equal(resolveSting.state.vars.current_goal, "black_sail_sting_resolved");
  assert.equal(resolveSting.state.quests.quest_black_sail_sting?.status, "completed");
  assert.equal(resolveSting.scene?.nodeId, "node_black_sail_sting_resolved");
  assert.deepEqual(resolveSting.scene?.choices, [
    { id: "ask_what_the_watch_caught", text: "Ask Mira what the watch actually seized" },
  ]);

  const aftermath = session.choose("ask_what_the_watch_caught");
  assert.equal(aftermath.triggeredEventId, null);
  assert.equal(aftermath.state.flags.black_sail_courier_captured, true);
  assert.equal(aftermath.state.vars.current_goal, "review_black_sail_aftermath");
  assert.equal(aftermath.scene?.nodeId, "node_black_sail_aftermath_report");
  assert.deepEqual(aftermath.scene?.choices, [
    { id: "ask_where_the_stub_points", text: "Ask Mira what the ledger stub points to next" },
  ]);

  const nextLead = session.choose("ask_where_the_stub_points");
  assert.equal(nextLead.triggeredEventId, null);
  assert.equal(nextLead.state.flags.black_sail_next_lead_found, true);
  assert.equal(nextLead.state.vars.current_goal, "trace_black_sail_next_lead");
  assert.equal(nextLead.scene?.nodeId, "node_black_sail_next_lead");
  assert.deepEqual(nextLead.scene?.choices, [
    { id: "ask_what_drowned_lantern_is", text: "Ask Mira what the Drowned Lantern actually is" },
  ]);

  const clarifyLead = session.choose("ask_what_drowned_lantern_is");
  assert.equal(clarifyLead.triggeredEventId, null);
  assert.equal(clarifyLead.state.flags.drowned_lantern_identified_as_contact, true);
  assert.equal(clarifyLead.state.vars.current_goal, "trace_drowned_lantern_contact");
  assert.equal(clarifyLead.scene?.nodeId, "node_black_sail_next_lead_clarified");
  assert.deepEqual(clarifyLead.scene?.choices, [
    { id: "ask_where_to_start_tracking_drowned_lantern", text: "Ask where to start tracking the Drowned Lantern contact" },
  ]);

  const startTracking = session.choose("ask_where_to_start_tracking_drowned_lantern");
  assert.equal(startTracking.triggeredEventId, null);
  assert.equal(startTracking.state.flags.drowned_lantern_search_started, true);
  assert.equal(startTracking.state.vars.current_goal, "search_customs_sheds_contact_line");
  assert.equal(startTracking.state.quests.quest_drowned_lantern?.status, "active");
  assert.equal(startTracking.state.quests.quest_drowned_lantern?.currentStepId, "step_search_customs_sheds");
  assert.equal(startTracking.scene?.nodeId, "node_drowned_lantern_start_point");
  assert.deepEqual(startTracking.scene?.choices, [
    { id: "search_customs_sheds_for_drowned_lantern_trace", text: "Search the customs-side sheds for any trace of the contact" },
  ]);

  const searchSheds = session.choose("search_customs_sheds_for_drowned_lantern_trace");
  assert.equal(searchSheds.triggeredEventId, null);
  assert.equal(searchSheds.state.flags.drowned_lantern_shed_trace_found, true);
  assert.equal(searchSheds.state.vars.current_goal, "inspect_drowned_lantern_shed_trace");
  assert.equal(searchSheds.state.quests.quest_drowned_lantern?.currentStepId, "step_trace_dawn_exchange");
  assert.equal(searchSheds.scene?.nodeId, "node_drowned_lantern_shed_trace");
  assert.deepEqual(searchSheds.scene?.choices, [
    { id: "ask_mira_to_decode_dawn_exchange", text: "Ask Mira what the dawn-side exchange note means" },
  ]);

  const decodeExchange = session.choose("ask_mira_to_decode_dawn_exchange");
  assert.equal(decodeExchange.triggeredEventId, null);
  assert.equal(decodeExchange.state.flags.drowned_lantern_exchange_window_found, true);
  assert.equal(decodeExchange.state.vars.current_goal, "identify_drowned_lantern_exchange_window");
  assert.equal(decodeExchange.state.quests.quest_drowned_lantern?.currentStepId, "step_identify_drowned_lantern_contact");
  assert.equal(decodeExchange.scene?.nodeId, "node_drowned_lantern_exchange_window");
  assert.deepEqual(decodeExchange.scene?.choices, [
    { id: "ask_who_handles_the_dawn_exchange", text: "Ask Mira who is most likely handling that dawn exchange" },
  ]);

  const defaultBoundary = session.choose("ask_who_handles_the_dawn_exchange");
  assert.equal(defaultBoundary.triggeredEventId, null);
  assert.equal(defaultBoundary.state.flags.drowned_lantern_contact_suspect_identified, true);
  assert.equal(defaultBoundary.state.vars.current_goal, "verify_drowned_lantern_contact_suspect");
  assert.equal(defaultBoundary.state.quests.quest_drowned_lantern?.currentStepId, "step_identify_drowned_lantern_contact");
  assert.equal(defaultBoundary.scene?.nodeId, "node_drowned_lantern_exchange_window_default_boundary");
  assert.deepEqual(defaultBoundary.scene?.choices, [
    { id: "use_the_default_dawn_runner_profile", text: "Use the dawn-runner profile to name the most likely contact" },
  ]);

  const identifySuspect = session.choose("use_the_default_dawn_runner_profile");
  assert.equal(identifySuspect.triggeredEventId, null);
  assert.equal(identifySuspect.state.flags.drowned_lantern_contact_suspect_identified, true);
  assert.equal(identifySuspect.state.vars.current_goal, "verify_drowned_lantern_contact_suspect");
  assert.equal(identifySuspect.state.quests.quest_drowned_lantern?.currentStepId, "step_identify_drowned_lantern_contact");
  assert.equal(identifySuspect.scene?.nodeId, "node_drowned_lantern_contact_suspect");
  assert.deepEqual(identifySuspect.scene?.choices, [
    { id: "mark_brine_lark_as_the_next_target", text: "Mark Brine Lark as the next target to trace" },
  ]);

  const confirmTarget = session.choose("mark_brine_lark_as_the_next_target");
  assert.equal(confirmTarget.triggeredEventId, null);
  assert.equal(confirmTarget.state.flags.brine_lark_identified_as_target, true);
  assert.equal(confirmTarget.state.vars.current_goal, "trace_brine_lark_network");
  assert.equal(confirmTarget.state.quests.quest_drowned_lantern?.status, "completed");
  assert.equal(confirmTarget.scene?.nodeId, "node_drowned_lantern_contact_confirmed");
  assert.deepEqual(confirmTarget.scene?.choices, [
    { id: "close_the_drowned_lantern_file", text: "Close the Drowned Lantern file before following Brine Lark" },
  ]);

  const caseBoundary = session.choose("close_the_drowned_lantern_file");
  assert.equal(caseBoundary.triggeredEventId, null);
  assert.equal(caseBoundary.state.quests.quest_drowned_lantern?.status, "completed");
  assert.equal(caseBoundary.scene?.nodeId, "node_drowned_lantern_case_boundary");
  assert.deepEqual(caseBoundary.scene?.choices, [
    { id: "ask_where_brine_lark_runs_goods", text: "Ask where Brine Lark is most likely to surface next" },
  ]);

  const followBrineLark = session.choose("ask_where_brine_lark_runs_goods");
  assert.equal(followBrineLark.triggeredEventId, null);
  assert.equal(followBrineLark.state.flags.brine_lark_followup_started, true);
  assert.equal(followBrineLark.state.vars.current_goal, "track_brine_lark_route");
  assert.equal(followBrineLark.state.quests.quest_brine_lark?.status, "active");
  assert.equal(followBrineLark.state.quests.quest_brine_lark?.currentStepId, "step_search_tide_warehouse");
  assert.equal(followBrineLark.scene?.nodeId, "node_brine_lark_start_point");
  assert.deepEqual(followBrineLark.scene?.choices, [
    { id: "search_tide_warehouse_for_brine_lark_trace", text: "Search the tide warehouse behind the customs ropeshed" },
  ]);

  const searchWarehouse = session.choose("search_tide_warehouse_for_brine_lark_trace");
  assert.equal(searchWarehouse.triggeredEventId, null);
  assert.equal(searchWarehouse.state.flags.brine_lark_warehouse_trace_found, true);
  assert.equal(searchWarehouse.state.vars.current_goal, "inspect_brine_lark_warehouse_trace");
  assert.equal(searchWarehouse.state.quests.quest_brine_lark?.currentStepId, "step_watch_shift_change");
  assert.equal(searchWarehouse.scene?.nodeId, "node_brine_lark_warehouse_trace");
  assert.deepEqual(searchWarehouse.scene?.choices, [
    { id: "ask_mira_what_the_warehouse_mark_implies", text: "Ask Mira what the warehouse mark implies" },
  ]);

  const routeWindow = session.choose("ask_mira_what_the_warehouse_mark_implies");
  assert.equal(routeWindow.triggeredEventId, null);
  assert.equal(routeWindow.state.flags.brine_lark_route_window_identified, true);
  assert.equal(routeWindow.state.vars.current_goal, "watch_brine_lark_shift_change");
  assert.equal(routeWindow.state.quests.quest_brine_lark?.currentStepId, "step_identify_exchange_contact");
  assert.equal(routeWindow.scene?.nodeId, "node_brine_lark_route_window");
  assert.deepEqual(routeWindow.scene?.choices, [
    { id: "commit_to_watch_brine_lark_shift_change", text: "Agree to watch the rear loading door before dawn" },
  ]);

  const watchPlan = session.choose("commit_to_watch_brine_lark_shift_change");
  assert.equal(watchPlan.triggeredEventId, null);
  assert.equal(watchPlan.state.flags.brine_lark_shift_watch_committed, true);
  assert.equal(watchPlan.state.vars.current_goal, "watch_brine_lark_rear_door");
  assert.equal(watchPlan.scene?.nodeId, "node_brine_lark_watch_plan");
  assert.deepEqual(watchPlan.scene?.choices, [
    { id: "keep_watch_through_shift_change", text: "Keep watch through the shift change" },
  ]);

  const observeHandoff = session.choose("keep_watch_through_shift_change");
  assert.equal(observeHandoff.triggeredEventId, null);
  assert.equal(observeHandoff.state.flags.brine_lark_shift_change_observed, true);
  assert.equal(observeHandoff.state.vars.current_goal, "assess_brine_lark_handoff");
  assert.equal(observeHandoff.scene?.nodeId, "node_brine_lark_shift_change_observed");
});

test("Mira should offer a Black Sail aftermath feedback before following the ledger stub", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 3, hour: 22, minute: 45 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      black_sail_sting_prepared: true,
      black_sail_stakeout_started: true,
      black_sail_sting_resolved: true,
      black_sail_courier_captured: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_black_sail_sting: { status: "completed", currentStepId: "step_close_the_net" },
    },
    inventory: {},
    vars: { current_goal: "review_black_sail_aftermath", gold: 35 },
  });

  const aftermathFeedback = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(aftermathFeedback.scene?.nodeId, "node_harbor_watch_black_sail_aftermath_feedback");
  assert.deepEqual(aftermathFeedback.scene?.choices, [
    {
      id: "note_miras_black_sail_aftermath_read",
      text: "Note Mira's read on the seizure and return to the ledger stub",
    },
  ]);

  const noteRead = session.choose("note_miras_black_sail_aftermath_read");
  assert.equal(noteRead.triggeredEventId, null);
  assert.equal(noteRead.state.flags.black_sail_aftermath_feedback_heard, true);
  assert.equal(noteRead.state.vars.current_goal, "review_black_sail_aftermath");
  assert.equal(noteRead.state.quests.quest_black_sail_sting?.status, "completed");
  assert.equal(noteRead.scene?.nodeId, "node_harbor_watch_black_sail_aftermath_feedback_end");
});

test("Mira Black Sail aftermath feedback should not steal repeat after it was heard", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 3, hour: 22, minute: 55 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      black_sail_sting_prepared: true,
      black_sail_stakeout_started: true,
      black_sail_sting_resolved: true,
      black_sail_courier_captured: true,
      black_sail_aftermath_feedback_heard: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_black_sail_sting: { status: "completed", currentStepId: "step_close_the_net" },
    },
    inventory: {},
    vars: { current_goal: "review_black_sail_aftermath", gold: 35 },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
});

test("returning to the coal berth during the drowned lantern shed search should trigger a route recap", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 8, minute: 30 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      drowned_lantern_identified_as_contact: true,
      drowned_lantern_search_started: true,
      drowned_lantern_shed_trace_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_trace_dawn_exchange" },
    },
    inventory: {},
    vars: { current_goal: "inspect_drowned_lantern_shed_trace", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_coal_berth_arrival: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
      triggerScopes: {},
    },
  });

  const routeRecap = session.travelTo("coal_berth");
  assert.equal(routeRecap.triggeredEventId, "evt_drowned_lantern_coal_berth_route_recap");
  assert.equal(routeRecap.scene?.nodeId, "node_drowned_lantern_coal_berth_route_recap");
  assert.deepEqual(routeRecap.scene?.choices, [
    {
      id: "mark_the_coal_berth_to_sheds_route",
      text: "Mark the lane between the coal berth and customs sheds as part of the Drowned Lantern route",
    },
  ]);

  const markRoute = session.choose("mark_the_coal_berth_to_sheds_route");
  assert.equal(markRoute.triggeredEventId, null);
  assert.equal(markRoute.state.flags.drowned_lantern_coal_berth_route_noted, true);
  assert.equal(markRoute.state.vars.current_goal, "inspect_drowned_lantern_shed_trace");
  assert.equal(markRoute.scene?.nodeId, "node_drowned_lantern_coal_berth_route_recap_end");
});

test("Mira should offer fresh Drowned Lantern route feedback after a recent coal berth recap", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 8, minute: 50 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      drowned_lantern_identified_as_contact: true,
      drowned_lantern_search_started: true,
      drowned_lantern_shed_trace_found: true,
      drowned_lantern_coal_berth_route_noted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_trace_dawn_exchange" },
    },
    inventory: {},
    vars: { current_goal: "inspect_drowned_lantern_shed_trace", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_drowned_lantern_coal_berth_route_recap: true,
      },
      cooldownLastTriggeredMinuteByEventId: {
        evt_drowned_lantern_coal_berth_route_recap: 1950,
      },
      triggerScopes: {},
    },
  });

  const routeFeedback = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(routeFeedback.scene?.nodeId, "node_harbor_watch_drowned_lantern_coal_route_feedback");
  assert.deepEqual(routeFeedback.scene?.choices, [
    {
      id: "note_miras_coal_route_warning",
      text: "Note Mira's route warning and keep tracing the dawn exchange",
    },
  ]);

  const noteWarning = session.choose("note_miras_coal_route_warning");
  assert.equal(noteWarning.triggeredEventId, null);
  assert.equal(noteWarning.state.flags.drowned_lantern_coal_route_feedback_heard, true);
  assert.equal(noteWarning.state.vars.current_goal, "inspect_drowned_lantern_shed_trace");
  assert.equal(noteWarning.state.quests.quest_drowned_lantern?.currentStepId, "step_trace_dawn_exchange");
  assert.equal(noteWarning.scene?.nodeId, "node_harbor_watch_drowned_lantern_coal_route_feedback_end");
});

test("Mira Drowned Lantern route feedback should not steal repeat interaction after the short window expires", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 9, minute: 30 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      drowned_lantern_identified_as_contact: true,
      drowned_lantern_search_started: true,
      drowned_lantern_shed_trace_found: true,
      drowned_lantern_coal_berth_route_noted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_trace_dawn_exchange" },
    },
    inventory: {},
    vars: { current_goal: "inspect_drowned_lantern_shed_trace", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_drowned_lantern_coal_berth_route_recap: true,
      },
      cooldownLastTriggeredMinuteByEventId: {
        evt_drowned_lantern_coal_berth_route_recap: 1950,
      },
      triggerScopes: {},
    },
  });

  const miraRepeat = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRepeat.scene?.nodeId, "node_harbor_watch_repeat");
});

test("returning to customs tide stairs during the drowned lantern shed search should trigger a lower-landing observation", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 8, minute: 30 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      drowned_lantern_identified_as_contact: true,
      drowned_lantern_search_started: true,
      drowned_lantern_shed_trace_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_trace_dawn_exchange" },
    },
    inventory: {},
    vars: { current_goal: "inspect_drowned_lantern_shed_trace", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_coal_berth_arrival: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const stairsGlance = session.travelTo("customs_tide_stairs");
  assert.equal(stairsGlance.triggeredEventId, "evt_customs_stairs_return_glance");
  assert.equal(stairsGlance.scene?.nodeId, "node_customs_stairs_return_glance");
  assert.deepEqual(stairsGlance.scene?.choices, [
    { id: "note_the_lower_landing_exchange_point", text: "Fix the lower landing as a secondary exchange point in memory" },
  ]);

  const noteLanding = session.choose("note_the_lower_landing_exchange_point");
  assert.equal(noteLanding.triggeredEventId, null);
  assert.equal(noteLanding.state.flags.customs_stairs_exchange_point_noted, true);
  assert.equal(noteLanding.state.vars.current_goal, "inspect_drowned_lantern_shed_trace");
  assert.equal(noteLanding.scene?.nodeId, "node_customs_stairs_return_glance_end");

  session.closeScene();

  const returnToHarbor = session.travelTo("harbor");
  assert.equal(returnToHarbor.triggeredEventId, null);

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].npcId, "npc_harbor_watch_01");
  assert.equal(npcs[0].label, "Tell Mira about the customs stairs lower landing");

  const miraRecap = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRecap.scene?.nodeId, "node_harbor_watch_customs_stairs_recap");
  assert.deepEqual(miraRecap.scene?.choices, [
    {
      id: "ask_mira_to_fold_the_stairs_into_the_dawn_exchange",
      text: "Ask Mira to fold the stairs observation into the dawn exchange note",
    },
  ]);

  const decodeExchange = session.choose("ask_mira_to_fold_the_stairs_into_the_dawn_exchange");
  assert.equal(decodeExchange.triggeredEventId, null);
  assert.equal(decodeExchange.state.flags.drowned_lantern_exchange_window_found, true);
  assert.equal(decodeExchange.state.vars.current_goal, "identify_drowned_lantern_exchange_window");
  assert.equal(decodeExchange.state.quests.quest_drowned_lantern?.currentStepId, "step_identify_drowned_lantern_contact");
  assert.equal(decodeExchange.scene?.nodeId, "node_drowned_lantern_exchange_window");
  assert.deepEqual(decodeExchange.scene?.choices, [
    {
      id: "suggest_the_customs_stairs_lower_landing",
      text: "Suggest the customs stairs lower landing as a possible exchange point",
    },
    {
      id: "ask_who_handles_the_dawn_exchange",
      text: "Ask Mira who is most likely handling that dawn exchange",
    },
  ]);
});

test("customs stairs recap interaction should not steal Mira repeat outside its exact eventHistory window", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 9, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      customs_stairs_exchange_point_noted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_trace_dawn_exchange" },
    },
    inventory: {},
    vars: { current_goal: "inspect_drowned_lantern_shed_trace", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const withoutEventHistory = session.getAvailableNpcs();
  assert.equal(withoutEventHistory.length, 1);
  assert.equal(withoutEventHistory[0].npcId, "npc_harbor_watch_01");
  assert.equal(withoutEventHistory[0].label, "Speak with Mira again");

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 9, minute: 10 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      customs_stairs_exchange_point_noted: true,
      drowned_lantern_exchange_window_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_drowned_lantern: { status: "active", currentStepId: "step_identify_drowned_lantern_contact" },
    },
    inventory: {},
    vars: { current_goal: "identify_drowned_lantern_exchange_window", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_customs_stairs_return_glance: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const afterExchangeDecoded = session.getAvailableNpcs();
  assert.equal(afterExchangeDecoded.length, 1);
  assert.equal(afterExchangeDecoded[0].npcId, "npc_harbor_watch_01");
  assert.equal(afterExchangeDecoded[0].label, "Speak with Mira again");
});

test("returning to Breaker Culvert during Brine Lark should unlock an eventHistory-gated Mira recap", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 4, hour: 7, minute: 20 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      brine_lark_followup_started: true,
      brine_lark_waterline_receiver_identified: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_brine_lark: { status: "active", currentStepId: "step_observe_breaker_culvert_activity" },
    },
    inventory: {},
    vars: { current_goal: "observe_breaker_culvert_activity", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const culvertRipple = session.travelTo("breaker_culvert");
  assert.equal(culvertRipple.triggeredEventId, "evt_brine_lark_breaker_culvert_return_ripple");
  assert.equal(culvertRipple.scene?.nodeId, "node_brine_lark_breaker_culvert_return_ripple");
  assert.deepEqual(culvertRipple.scene?.choices, [
    {
      id: "note_the_culvert_rhythm_for_mira",
      text: "Fix the culvert's short inward pull as part of the route pattern",
    },
  ]);

  const noteRhythm = session.choose("note_the_culvert_rhythm_for_mira");
  assert.equal(noteRhythm.triggeredEventId, null);
  assert.equal(noteRhythm.state.flags.brine_lark_culvert_rhythm_noted, true);
  assert.equal(noteRhythm.state.vars.current_goal, "observe_breaker_culvert_activity");
  assert.equal(noteRhythm.scene?.nodeId, "node_brine_lark_breaker_culvert_return_ripple_end");

  session.closeScene();

  const returnToHarbor = session.travelTo("harbor");
  assert.equal(returnToHarbor.triggeredEventId, null);

  const npcs = session.getAvailableNpcs();
  assert.equal(npcs.length, 1);
  assert.equal(npcs[0].npcId, "npc_harbor_watch_01");
  assert.equal(npcs[0].label, "Tell Mira about the Breaker Culvert tide rhythm");

  const miraRecap = session.interactWithNpc("npc_harbor_watch_01");
  assert.equal(miraRecap.scene?.nodeId, "node_harbor_watch_brine_lark_culvert_recap");
  assert.deepEqual(miraRecap.scene?.choices, [
    {
      id: "ask_mira_to_apply_the_culvert_rhythm_to_the_watch",
      text: "Ask Mira to apply the culvert rhythm to the next watch",
    },
  ]);

  const applyRhythm = session.choose("ask_mira_to_apply_the_culvert_rhythm_to_the_watch");
  assert.equal(applyRhythm.triggeredEventId, null);
  assert.equal(applyRhythm.state.flags.brine_lark_culvert_recap_used, true);
  assert.equal(applyRhythm.state.quests.quest_brine_lark?.currentStepId, "step_observe_breaker_culvert_activity");
  assert.equal(applyRhythm.scene?.nodeId, "node_brine_lark_breaker_culvert_activity");
  assert.deepEqual(applyRhythm.scene?.choices, [
    {
      id: "watch_what_kind_of_carrier_leaves_the_culvert",
      text: "Watch what kind of carrier leaves the culvert next",
    },
  ]);
});

test("Brine Lark culvert recap interaction should not steal Mira repeat outside its exact eventHistory window", () => {
  const session = createDemoSession();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 4, hour: 8, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      brine_lark_followup_started: true,
      brine_lark_waterline_receiver_identified: true,
      brine_lark_culvert_rhythm_noted: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_brine_lark: { status: "active", currentStepId: "step_observe_breaker_culvert_activity" },
    },
    inventory: {},
    vars: { current_goal: "observe_breaker_culvert_activity", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const withoutEventHistory = session.getAvailableNpcs();
  assert.equal(withoutEventHistory.length, 1);
  assert.equal(withoutEventHistory[0].npcId, "npc_harbor_watch_01");
  assert.equal(withoutEventHistory[0].label, "Speak with Mira again");

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 4, hour: 8, minute: 10 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      brine_lark_followup_started: true,
      brine_lark_waterline_receiver_identified: true,
      brine_lark_culvert_rhythm_noted: true,
      brine_lark_culvert_recap_used: true,
      brine_lark_breaker_culvert_activity_observed: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_brine_lark: { status: "active", currentStepId: "step_identify_culvert_carrier" },
    },
    inventory: {},
    vars: { current_goal: "identify_culvert_carrier", gold: 35 },
    eventHistory: {
      onceTriggeredByEventId: {
        evt_brine_lark_breaker_culvert_return_ripple: true,
      },
      cooldownLastTriggeredMinuteByEventId: {},
    },
  });

  const afterCulvertActivity = session.getAvailableNpcs();
  assert.equal(afterCulvertActivity.length, 1);
  assert.equal(afterCulvertActivity[0].npcId, "npc_harbor_watch_01");
  assert.equal(afterCulvertActivity[0].label, "Speak with Mira again");
});

test("black sail quest skeleton should activate and advance across key branch milestones", () => {
  const session = createDemoSession();

  assert.equal(session.getState().quests.quest_black_sail_trail?.status, "inactive");
  assert.equal(session.getState().quests.quest_black_sail_trail?.currentStepId, "step_find_mira");

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
      quest_black_sail_trail: { status: "inactive", currentStepId: "step_find_mira" },
    },
    inventory: {},
    vars: { current_goal: "ask_about_compass", gold: 35 },
  });

  session.interactWithNpc("npc_vendor_01");
  const startQuest = session.choose("show_compass");
  assert.equal(startQuest.state.quests.quest_black_sail_trail?.status, "active");
  assert.equal(startQuest.state.quests.quest_black_sail_trail?.currentStepId, "step_find_mira");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 9, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: false,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_find_mira" },
    },
    inventory: {},
    vars: { current_goal: "investigate_compass", gold: 35 },
  });

  session.interactWithNpc("npc_harbor_watch_01");
  const miraIntro = session.choose("show_compass_to_mira");
  assert.equal(miraIntro.state.quests.quest_black_sail_trail?.currentStepId, "step_search_signal_tower");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 21, minute: 45 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_search_signal_tower" },
    },
    inventory: {},
    vars: { current_goal: "signal_tower_investigated", gold: 35 },
  });

  session.interactWithNpc("npc_harbor_watch_01");
  const nightTip = session.choose("report_signal_tower_clue");
  assert.equal(nightTip.state.quests.quest_black_sail_trail?.currentStepId, "step_watch_harbor_at_night");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 1, hour: 22, minute: 5 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_watch_harbor_at_night" },
    },
    inventory: {},
    vars: { current_goal: "wait_for_harbor_signal", gold: 35 },
  });

  const nightSignal = session.travelTo("signal_tower");
  assert.equal(nightSignal.triggeredEventId, null);
  const backToHarbor = session.travelTo("harbor");
  assert.equal(backToHarbor.triggeredEventId, "evt_harbor_night_signal");
  const followSignal = session.choose("follow_pier_signal");
  assert.equal(followSignal.state.quests.quest_black_sail_trail?.currentStepId, "step_follow_pier_signal");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 0, minute: 15 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_decode_pier_message" },
    },
    inventory: {},
    vars: { current_goal: "pier_message_found", gold: 35 },
  });

  session.interactWithNpc("npc_harbor_watch_01");
  const channelTip = session.choose("show_pier_message_to_mira");
  assert.equal(channelTip.state.quests.quest_black_sail_trail?.currentStepId, "step_investigate_north_channel");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 1, minute: 20 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_north_channel" },
    },
    inventory: {},
    vars: { current_goal: "north_channel_investigated", gold: 35 },
  });

  session.interactWithNpc("npc_harbor_watch_01");
  const blackSailTip = session.choose("report_north_channel_marker");
  assert.equal(blackSailTip.state.quests.quest_black_sail_trail?.currentStepId, "step_investigate_black_sail_berth");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 2, hour: 2, minute: 0 },
    currentLocationId: "harbor",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      stall_discovered: true,
      compass_vendor_reacted: true,
      harbor_watch_contacted: true,
      signal_tower_clue_found: true,
      pier_message_found: true,
      north_channel_decoded: true,
      north_channel_marker_found: true,
      black_sail_berth_identified: true,
      coal_berth_clue_found: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "active", currentStepId: "step_investigate_black_sail_berth" },
    },
    inventory: {},
    vars: { current_goal: "coal_berth_investigated", gold: 35 },
  });

  session.interactWithNpc("npc_harbor_watch_01");
  const confirmLedger = session.choose("report_coal_berth_ledger");
  assert.equal(confirmLedger.state.flags.black_sail_network_confirmed, true);
  assert.equal(confirmLedger.state.quests.quest_black_sail_trail?.status, "completed");

  const stingQuest = session.choose("offer_help_with_sting");
  assert.equal(stingQuest.state.quests.quest_black_sail_sting?.status, "active");
  assert.equal(stingQuest.state.quests.quest_black_sail_sting?.currentStepId, "step_prepare_stakeout");
  session.closeScene();

  session.restoreState({
    player: { id: "player", name: "Player", stats: { health: 100, willpower: 100, stamina: 100 }, flags: {} },
    time: { day: 3, hour: 22, minute: 25 },
    currentLocationId: "coal_berth",
    flags: {
      demo_enabled: true,
      quest_intro_started: true,
      harbor_watch_contacted: true,
      black_sail_network_confirmed: true,
      black_sail_sting_prepared: true,
      black_sail_stakeout_started: true,
    },
    quests: {
      quest_intro_walk: { status: "active", currentStepId: "step_examine_stall" },
      quest_black_sail_trail: { status: "completed", currentStepId: "step_investigate_black_sail_berth" },
      quest_black_sail_sting: { status: "active", currentStepId: "step_hold_stakeout" },
    },
    inventory: {},
    vars: { current_goal: "hold_black_sail_stakeout", gold: 35 },
  });

  session.travelTo("harbor");
  const closeNet = session.choose("signal_mira_to_close_net");
  const resolveSting = session.choose("help_secure_the_berth");
  assert.equal(resolveSting.state.quests.quest_black_sail_sting?.status, "completed");
});
