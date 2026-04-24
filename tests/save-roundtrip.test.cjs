const test = require("node:test");
const assert = require("node:assert/strict");

const {
  CURRENT_SAVE_VERSION,
} = require("../.tmp-save-tests/save/constants.js");
const {
  serializeGameState,
  deserializeSaveFile,
} = require("../.tmp-save-tests/save/serializer.js");

test("save serialize/deserialize should round-trip GameState", () => {
  const gameState = {
    player: {
      id: "player",
      name: "Player",
      stats: { health: 95, stamina: 80 },
      flags: { tired: true },
    },
    time: { day: 2, hour: 23, minute: 15 },
    currentLocationId: "street",
    flags: { intro_done: true },
    quests: {
      q_intro: { status: "active", currentStepId: "step_1" },
    },
    inventory: { apple: 2, coin: 12 },
    vars: {
      mood: "ok",
      stress: 3,
      rested: false,
      "event.cooldown.evt_market_morning.lastTriggeredMinute": 505,
    },
  };

  const saveFile = serializeGameState({
    slotId: "slot-1",
    state: gameState,
    savedAt: "2026-04-21T12:00:00.000Z",
  });

  assert.equal(saveFile.version, CURRENT_SAVE_VERSION);
  assert.equal(saveFile.slotId, "slot-1");

  const restored = deserializeSaveFile(saveFile);
  assert.deepEqual(restored, {
    ...gameState,
    eventHistory: {
      onceTriggeredByEventId: {},
      cooldownLastTriggeredMinuteByEventId: {
        evt_market_morning: 505,
      },
      triggerScopes: {},
    },
  });
  assert.equal(restored.vars["event.cooldown.evt_market_morning.lastTriggeredMinute"], 505);
});

test("save deserialize should accept optional eventHistory slice", () => {
  const saveFile = {
    version: CURRENT_SAVE_VERSION,
    savedAt: "2026-04-22T08:00:00.000Z",
    slotId: "slot-2",
    state: {
      player: {
        id: "player",
        name: "Player",
        stats: { health: 90, stamina: 70 },
        flags: {},
      },
      time: { day: 1, hour: 9, minute: 0 },
      currentLocationId: "street",
      flags: {},
      quests: {},
      inventory: {},
      vars: {},
      eventHistory: {
        onceTriggeredByEventId: { evt_once_demo: true },
        cooldownLastTriggeredMinuteByEventId: { evt_cd_demo: 540 },
      },
    },
  };

  const restored = deserializeSaveFile(saveFile);
  assert.deepEqual(restored.eventHistory, {
    onceTriggeredByEventId: { evt_once_demo: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_demo: 540 },
    triggerScopes: {},
  });
});

test("save deserialize should migrate legacy event history keys into eventHistory slice", () => {
  const saveFile = {
    version: CURRENT_SAVE_VERSION,
    savedAt: "2026-04-22T09:00:00.000Z",
    slotId: "slot-legacy",
    state: {
      player: {
        id: "player",
        name: "Player",
        stats: { health: 88, stamina: 66 },
        flags: {},
      },
      time: { day: 1, hour: 10, minute: 0 },
      currentLocationId: "street",
      flags: {
        "event.once.evt_once_legacy": true,
      },
      quests: {},
      inventory: {},
      vars: {
        "event.cooldown.evt_cd_legacy.lastTriggeredMinute": 555,
      },
    },
  };

  const restored = deserializeSaveFile(saveFile);
  assert.deepEqual(restored.eventHistory, {
    onceTriggeredByEventId: { evt_once_legacy: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_legacy: 555 },
    triggerScopes: {},
  });
});
