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
  assert.deepEqual(miraRepeat.scene?.choices, []);
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
  assert.equal(stingPlan.scene?.nodeId, "node_harbor_watch_sting_plan");
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
});
