const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCandidateEvents,
  selectEvent,
  selectResolvedEvent,
} = require("../.tmp-demo-tests/engine/events/index.js");

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 9, minute: 0 },
  currentLocationId: "street",
  flags: { intro_done: true },
  quests: {},
  inventory: {},
  vars: {},
};

const events = [
  {
    id: "street-morning",
    type: "ambient",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 8, endHour: 12 },
      flags: { intro_done: true },
    },
  },
  {
    id: "street-once",
    type: "ambient",
    trigger: "on-location-enter",
    once: true,
    conditions: {
      locationIds: ["street"],
      timeRange: { startHour: 8, endHour: 12 },
    },
  },
  {
    id: "market-event",
    type: "ambient",
    trigger: "on-location-enter",
    conditions: {
      locationIds: ["market"],
    },
  },
];

test("event selector should filter by trigger and conditions", () => {
  const candidates = getCandidateEvents(events, baseState, "on-location-enter");
  assert.deepEqual(
    candidates.map((event) => event.id),
    ["street-morning", "street-once"],
  );

  const selected = selectEvent(events, baseState, "on-location-enter");
  assert.equal(selected?.id, "street-morning");
  assert.equal(selectResolvedEvent([]), null);
});

test("event selector should skip once events already marked as triggered", () => {
  const state = {
    ...baseState,
    flags: {
      ...baseState.flags,
      "event.once.street-once": true,
    },
  };

  const candidates = getCandidateEvents(events, state, "on-location-enter");
  assert.deepEqual(candidates.map((event) => event.id), ["street-morning"]);
});

test("event selector should prioritize higher priority while keeping stable tie order", () => {
  const priorityEvents = [
    {
      id: "low-priority-first",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-priority-second",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-priority-third",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selectedHigh = selectEvent(priorityEvents, baseState, "on-location-enter");
  assert.equal(selectedHigh?.id, "high-priority-second");

  const defaultPriorityEvents = [
    {
      id: "default-priority-a",
      type: "ambient",
      trigger: "on-location-enter",
      conditions: { locationIds: ["street"] },
    },
    {
      id: "default-priority-b",
      type: "ambient",
      trigger: "on-location-enter",
      conditions: { locationIds: ["street"] },
    },
  ];

  const selectedDefault = selectEvent(defaultPriorityEvents, baseState, "on-location-enter");
  assert.equal(selectedDefault?.id, "default-priority-a");
});

test("event selector should apply weight only within same highest priority group", () => {
  const weightedEvents = [
    {
      id: "high-weight-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "high-weight-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 3,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "lower-priority-ignored",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 1,
      weight: 999,
      conditions: { locationIds: ["street"] },
    },
  ];

  const pickA = selectEvent(weightedEvents, baseState, "on-location-enter", () => 0.0);
  assert.equal(pickA?.id, "high-weight-a");

  const pickB = selectEvent(weightedEvents, baseState, "on-location-enter", () => 0.9);
  assert.equal(pickB?.id, "high-weight-b");
});

test("event selector should resolve equal weights predictably with injected random", () => {
  const equalWeightEvents = [
    {
      id: "equal-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "equal-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const pickA = selectEvent(equalWeightEvents, baseState, "on-location-enter", () => 0.49);
  assert.equal(pickA?.id, "equal-a");

  const pickB = selectEvent(equalWeightEvents, baseState, "on-location-enter", () => 0.5);
  assert.equal(pickB?.id, "equal-b");
});

test("event selector should keep deterministic fallback order when total weight is zero", () => {
  const zeroWeightEvents = [
    {
      id: "zero-a",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 0,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "zero-b",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 0,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(zeroWeightEvents, baseState, "on-location-enter", () => 0.99);
  assert.equal(selected?.id, "zero-a");
});

test("event selector should treat invalid weights as zero", () => {
  const invalidWeightEvents = [
    {
      id: "invalid-negative",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: -5,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "valid-positive",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 2,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "invalid-nan",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: Number.NaN,
      conditions: { locationIds: ["street"] },
    },
  ];

  const selected = selectEvent(invalidWeightEvents, baseState, "on-location-enter", () => 0.5);
  assert.equal(selected?.id, "valid-positive");
});

test("event selector should apply once filtering before weight selection", () => {
  const weightedOnceEvents = [
    {
      id: "once-weighted",
      type: "ambient",
      trigger: "on-location-enter",
      once: true,
      priority: 10,
      weight: 100,
      conditions: { locationIds: ["street"] },
    },
    {
      id: "repeatable-weighted",
      type: "ambient",
      trigger: "on-location-enter",
      priority: 10,
      weight: 1,
      conditions: { locationIds: ["street"] },
    },
  ];

  const state = {
    ...baseState,
    flags: {
      ...baseState.flags,
      "event.once.once-weighted": true,
    },
  };

  const selected = selectEvent(weightedOnceEvents, state, "on-location-enter", () => 0.0);
  assert.equal(selected?.id, "repeatable-weighted");
});
