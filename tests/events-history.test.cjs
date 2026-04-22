const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getEventCooldownVarKey,
  getEventTriggeredFlagId,
  hasEventCooldownActive,
  markEventCooldownTimestamp,
  migrateLegacyEventHistoryToSlice,
  readEventHistoryState,
  writeEventHistoryState,
} = require("../.tmp-demo-tests/engine/events/index.js");

function createBaseState(time) {
  return {
    player: { id: "player", name: "Player", stats: {}, flags: {} },
    time,
    currentLocationId: "street",
    flags: {},
    quests: {},
    inventory: {},
    vars: {},
  };
}

test("event history should build a stable cooldown var key", () => {
  assert.equal(
    getEventCooldownVarKey("evt_test"),
    "event.cooldown.evt_test.lastTriggeredMinute",
  );
});

test("event history should mark cooldown timestamp using absolute minutes", () => {
  const state = createBaseState({ day: 2, hour: 0, minute: 10 });
  const event = {
    id: "evt_cd",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 30,
  };

  const next = markEventCooldownTimestamp(state, event);
  assert.equal(next.vars[getEventCooldownVarKey("evt_cd")], undefined);
  assert.equal(next.eventHistory?.cooldownLastTriggeredMinuteByEventId.evt_cd, 1450);
});

test("event history should not mark cooldown when cooldown is disabled", () => {
  const state = createBaseState({ day: 1, hour: 9, minute: 0 });
  const event = {
    id: "evt_no_cd",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 0,
  };

  const next = markEventCooldownTimestamp(state, event);
  assert.equal(next, state);
});

test("event history should report cooldown active only inside cooldown window", () => {
  const event = {
    id: "evt_window",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 30,
  };

  const activeState = createBaseState({ day: 1, hour: 9, minute: 0 });
  activeState.vars[getEventCooldownVarKey("evt_window")] = 531;
  assert.equal(hasEventCooldownActive(activeState, event), true);

  const expiredState = createBaseState({ day: 1, hour: 9, minute: 0 });
  expiredState.vars[getEventCooldownVarKey("evt_window")] = 510;
  assert.equal(hasEventCooldownActive(expiredState, event), false);
});

test("event history should ignore invalid stored cooldown timestamp", () => {
  const event = {
    id: "evt_invalid",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 30,
  };

  const state = createBaseState({ day: 1, hour: 9, minute: 0 });
  state.vars[getEventCooldownVarKey("evt_invalid")] = "bad-value";

  assert.equal(hasEventCooldownActive(state, event), false);
});

test("event history adapter should read and write logical history state", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });
  state.flags[getEventTriggeredFlagId("evt_once_a")] = true;
  state.vars[getEventCooldownVarKey("evt_cd_a")] = 120;
  state.vars[getEventCooldownVarKey("evt_cd_invalid")] = "bad";

  const history = readEventHistoryState(state);
  assert.deepEqual(history, {
    onceTriggeredByEventId: { evt_once_a: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_a: 120 },
  });

  const written = writeEventHistoryState(state, {
    onceTriggeredByEventId: { evt_once_b: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_b: 180 },
  });

  assert.equal(written.flags[getEventTriggeredFlagId("evt_once_b")], undefined);
  assert.equal(written.vars[getEventCooldownVarKey("evt_cd_b")], undefined);
  assert.equal(written.flags[getEventTriggeredFlagId("evt_once_a")], true);
  assert.equal(written.vars[getEventCooldownVarKey("evt_cd_a")], 120);
  assert.deepEqual(written.eventHistory, {
    onceTriggeredByEventId: { evt_once_a: true, evt_once_b: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_a: 120, evt_cd_b: 180 },
  });
});

test("event history adapter should prefer eventHistory slice and still fallback to legacy keys", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });
  state.eventHistory = {
    onceTriggeredByEventId: { evt_once_new: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_new: 240 },
  };
  state.flags[getEventTriggeredFlagId("evt_once_legacy")] = true;
  state.vars[getEventCooldownVarKey("evt_cd_legacy")] = 180;

  const history = readEventHistoryState(state);
  assert.deepEqual(history, {
    onceTriggeredByEventId: { evt_once_legacy: true, evt_once_new: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_legacy: 180, evt_cd_new: 240 },
  });
});

test("event history adapter should support slice-only write strategy", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });

  const written = writeEventHistoryState(
    state,
    {
      onceTriggeredByEventId: { evt_slice_only: true },
      cooldownLastTriggeredMinuteByEventId: { evt_cd_slice: 300 },
    },
    "slice-only",
  );

  assert.deepEqual(written.flags, state.flags);
  assert.deepEqual(written.vars, state.vars);
  assert.deepEqual(written.eventHistory, {
    onceTriggeredByEventId: { evt_slice_only: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_slice: 300 },
  });
});

test("event history migration should project legacy keys into eventHistory slice", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });
  state.flags[getEventTriggeredFlagId("evt_once_legacy")] = true;
  state.vars[getEventCooldownVarKey("evt_cd_legacy")] = 210;

  const migrated = migrateLegacyEventHistoryToSlice(state);
  assert.deepEqual(migrated.eventHistory, {
    onceTriggeredByEventId: { evt_once_legacy: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_legacy: 210 },
  });
});
