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
    vars: { mood: "ok", stress: 3, rested: false },
  };

  const saveFile = serializeGameState({
    slotId: "slot-1",
    state: gameState,
    savedAt: "2026-04-21T12:00:00.000Z",
  });

  assert.equal(saveFile.version, CURRENT_SAVE_VERSION);
  assert.equal(saveFile.slotId, "slot-1");

  const restored = deserializeSaveFile(saveFile);
  assert.deepEqual(restored, gameState);
});
