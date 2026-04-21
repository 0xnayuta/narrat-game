const test = require("node:test");
const assert = require("node:assert/strict");

const {
  advanceMinutes,
  advanceHours,
  getCurrentTimeLabel,
  isInTimeRange,
  advanceGameStateMinutes,
} = require("../.tmp-tests/time/time.js");

test("advanceMinutes should carry over to next day", () => {
  const next = advanceMinutes({ day: 1, hour: 23, minute: 50 }, 20);
  assert.deepEqual(next, { day: 2, hour: 0, minute: 10 });
});

test("advanceHours should carry over multiple days", () => {
  const next = advanceHours({ day: 1, hour: 8, minute: 0 }, 49);
  assert.deepEqual(next, { day: 3, hour: 9, minute: 0 });
});

test("getCurrentTimeLabel should format stable label", () => {
  const label = getCurrentTimeLabel({ day: 2, hour: 6, minute: 5 });
  assert.equal(label, "Day 2 06:05 (morning)");
});

test("isInTimeRange should support overnight ranges", () => {
  const isNight1 = isInTimeRange(
    { day: 1, hour: 23, minute: 0 },
    { startHour: 22, endHour: 6 },
  );
  const isNight2 = isInTimeRange(
    { day: 2, hour: 3, minute: 0 },
    { startHour: 22, endHour: 6 },
  );
  const isNight3 = isInTimeRange(
    { day: 2, hour: 12, minute: 0 },
    { startHour: 22, endHour: 6 },
  );

  assert.equal(isNight1, true);
  assert.equal(isNight2, true);
  assert.equal(isNight3, false);
});

test("advanceGameStateMinutes should only update time field", () => {
  const state = {
    player: { id: "p1", name: "P", stats: { health: 100 }, flags: {} },
    time: { day: 1, hour: 23, minute: 55 },
    currentLocationId: "home",
    flags: { intro_done: true },
    quests: {},
    inventory: { apple: 2 },
    vars: { mood: "ok" },
  };

  const next = advanceGameStateMinutes(state, 10);
  assert.deepEqual(next.time, { day: 2, hour: 0, minute: 5 });
  assert.equal(next.currentLocationId, "home");
  assert.deepEqual(next.inventory, { apple: 2 });
  assert.deepEqual(state.time, { day: 1, hour: 23, minute: 55 });
});
