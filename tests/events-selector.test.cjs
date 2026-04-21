const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getCandidateEvents,
  selectEvent,
  selectFirstEvent,
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
  assert.equal(selectFirstEvent([]), null);
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
