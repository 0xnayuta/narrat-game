const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getEventCooldownVarKey,
  getEventTriggeredFlagId,
  getTriggerScopeKey,
  hasEventCooldownActive,
  isEventInCooldownWindow,
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
    triggerScopes: {},
  });

  const written = writeEventHistoryState(state, {
    onceTriggeredByEventId: { evt_once_b: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_b: 180 },
    triggerScopes: {},
  });

  assert.equal(written.flags[getEventTriggeredFlagId("evt_once_b")], undefined);
  assert.equal(written.vars[getEventCooldownVarKey("evt_cd_b")], undefined);
  assert.equal(written.flags[getEventTriggeredFlagId("evt_once_a")], true);
  assert.equal(written.vars[getEventCooldownVarKey("evt_cd_a")], 120);
  assert.deepEqual(written.eventHistory, {
    onceTriggeredByEventId: { evt_once_a: true, evt_once_b: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_a: 120, evt_cd_b: 180 },
    triggerScopes: {},
  });
});

test("event history adapter should prefer eventHistory slice and still fallback to legacy keys", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });
  state.eventHistory = {
    onceTriggeredByEventId: { evt_once_new: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_new: 240 },
    triggerScopes: {},
  };
  state.flags[getEventTriggeredFlagId("evt_once_legacy")] = true;
  state.vars[getEventCooldownVarKey("evt_cd_legacy")] = 180;

  const history = readEventHistoryState(state);
  assert.deepEqual(history, {
    onceTriggeredByEventId: { evt_once_legacy: true, evt_once_new: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_legacy: 180, evt_cd_new: 240 },
    triggerScopes: {},
  });
});

test("event history adapter should support slice-only write strategy", () => {
  const state = createBaseState({ day: 1, hour: 10, minute: 0 });

  const written = writeEventHistoryState(
    state,
    {
      onceTriggeredByEventId: { evt_slice_only: true },
      cooldownLastTriggeredMinuteByEventId: { evt_cd_slice: 300 },
      triggerScopes: {},
    },
    "slice-only",
  );

  assert.deepEqual(written.flags, state.flags);
  assert.deepEqual(written.vars, state.vars);
  assert.deepEqual(written.eventHistory, {
    onceTriggeredByEventId: { evt_slice_only: true },
    cooldownLastTriggeredMinuteByEventId: { evt_cd_slice: 300 },
    triggerScopes: {},
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
    triggerScopes: {},
  });
});

// --- isEventInCooldownWindow tests ---

test("isEventInCooldownWindow should return false when cooldown is disabled", () => {
  const event = {
    id: "evt_no_cd",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 0,
  };
  const state = createBaseState({ day: 1, hour: 9, minute: 0 });
  assert.equal(isEventInCooldownWindow(state, event), false);
});

test("isEventInCooldownWindow should return false when no cooldown entry exists (first trigger allowed)", () => {
  const event = {
    id: "evt_fresh",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 60,
  };
  const state = createBaseState({ day: 1, hour: 9, minute: 0 });
  assert.equal(isEventInCooldownWindow(state, event), false);
});

test("isEventInCooldownWindow should return true when inside window", () => {
  const event = {
    id: "evt_in_window",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 60,
  };
  const state = createBaseState({ day: 1, hour: 9, minute: 0 });
  state.vars[getEventCooldownVarKey("evt_in_window")] = 500; // 60 min ago, window is 60
  assert.equal(isEventInCooldownWindow(state, event), true);
});

test("isEventInCooldownWindow should return false when exactly at window boundary", () => {
  const event = {
    id: "evt_boundary",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 60,
  };
  // State at minute 560, event last triggered at 500 → difference is exactly 60
  const state = createBaseState({ day: 1, hour: 9, minute: 20 }); // day1: (1-1)*1440 + 9*60 + 20 = 560
  state.vars[getEventCooldownVarKey("evt_boundary")] = 500;       // day1: 8*60 + 20 = 500
  // 560 - 500 = 60, cooldown is 60 → NOT < 60, so false (boundary is exclusive)
  assert.equal(isEventInCooldownWindow(state, event), false);
});

test("isEventInCooldownWindow should prefer trigger-scoped entry over global", () => {
  const event = {
    id: "evt_priority",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 60,
  };
  // Global says fresh (not in cooldown) but trigger scope says 10 min ago (still cooling)
  const state = createBaseState({ day: 1, hour: 9, minute: 30 }); // minute 570
  state.vars[getEventCooldownVarKey("evt_priority")] = 570;       // just now
  state.eventHistory = {
    onceTriggeredByEventId: {},
    cooldownLastTriggeredMinuteByEventId: { "evt_priority": 570 },
    triggerScopes: { "evt_priority:on-location-enter": 560 },       // 10 min ago
  };
  // Trigger scope says 570 - 560 = 10 < 60 → in cooldown
  assert.equal(isEventInCooldownWindow(state, event), true);
});

test("isEventInCooldownWindow should fall back to global when no trigger-scoped entry", () => {
  const event = {
    id: "evt_global_fallback",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 60,
  };
  // No trigger scope entry, only global: 10 min ago (still cooling)
  const state = createBaseState({ day: 1, hour: 9, minute: 30 }); // minute 570
  state.vars[getEventCooldownVarKey("evt_global_fallback")] = 560; // 10 min ago
  state.eventHistory = {
    onceTriggeredByEventId: {},
    cooldownLastTriggeredMinuteByEventId: { "evt_global_fallback": 560 },
    triggerScopes: {},
  };
  // 570 - 560 = 10 < 60 → in cooldown
  assert.equal(isEventInCooldownWindow(state, event), true);
});

// --- Per-trigger independent cooldown tests ---

test("markEventCooldownTimestamp should write both global and trigger-scoped entries", () => {
  const event = {
    id: "evt_dual_write",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 30,
  };
  const state = createBaseState({ day: 2, hour: 0, minute: 10 }); // absolute minute = 1450

  const next = markEventCooldownTimestamp(state, event);

  assert.equal(
    next.eventHistory?.cooldownLastTriggeredMinuteByEventId["evt_dual_write"],
    1450,
  );
  assert.equal(
    next.eventHistory?.triggerScopes["evt_dual_write:on-location-enter"],
    1450,
  );
});

test("per-trigger cooldown: same event id with different triggers have independent windows", () => {
  const onEnterEvent = {
    id: "evt_multi_trigger",
    type: "ambient",
    trigger: "on-location-enter",
    cooldownMinutes: 30,
  };
  const onTimeEvent = {
    id: "evt_multi_trigger",
    type: "ambient",
    trigger: "on-time-check",
    cooldownMinutes: 30,
  };
  // State at minute 1450 (day 2, 00:10), enter event was 10 min ago (minute 1440)
  const state = createBaseState({ day: 2, hour: 0, minute: 10 }); // 1450
  state.eventHistory = {
    onceTriggeredByEventId: {},
    cooldownLastTriggeredMinuteByEventId: { "evt_multi_trigger": 1440 },
    triggerScopes: {
      "evt_multi_trigger:on-location-enter": 1440,  // 10 min ago → still cooling
      "evt_multi_trigger:on-time-check": 1300,     // 150 min ago → expired
    },
  };

  // on-location-enter: scope says 1450-1440=10 < 30 → in cooldown
  assert.equal(isEventInCooldownWindow(state, onEnterEvent), true);

  // on-time-check: scope says 1450-1300=150 >= 30 → not in cooldown
  assert.equal(isEventInCooldownWindow(state, onTimeEvent), false);
});
