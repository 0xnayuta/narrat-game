const test = require("node:test");
const assert = require("node:assert/strict");

const { LocationService } = require("../.tmp-demo-tests/engine/world/LocationService.js");

const locations = [
  {
    id: "home",
    name: "Home",
    description: "home",
    connections: [{ to: "street", travelMinutes: 10 }],
  },
  {
    id: "street",
    name: "Street",
    description: "street",
    connections: [{ to: "home", travelMinutes: 10 }],
  },
];

const baseState = {
  player: { id: "player", name: "Player", stats: {}, flags: {} },
  time: { day: 1, hour: 8, minute: 0 },
  currentLocationId: "home",
  flags: {},
  quests: {},
  inventory: {},
  vars: {},
};

test("LocationService should expose location lookup and adjacency", () => {
  const service = new LocationService(locations);

  assert.equal(service.hasLocation("home"), true);
  assert.equal(service.hasLocation("missing"), false);
  assert.equal(service.getLocationById("street")?.name, "Street");
  assert.deepEqual(
    service.getAdjacentLocations("home").map((entry) => entry.id),
    ["street"],
  );
  assert.equal(service.canTravel("home", "street"), true);
  assert.equal(service.canTravel("street", "missing"), false);
  assert.equal(service.getTravelMinutes("home", "street"), 10);
});

test("LocationService should switch current location and preserve other state", () => {
  const service = new LocationService(locations);
  const next = service.switchCurrentLocation(baseState, "street");

  assert.equal(next.currentLocationId, "street");
  assert.equal(next.time.hour, 8);
  assert.equal(baseState.currentLocationId, "home");
});

test("LocationService should reject non-adjacent travel unless explicitly allowed", () => {
  const service = new LocationService(locations);

  assert.throws(
    () => service.switchCurrentLocation(baseState, "missing"),
    /Unknown location id/,
  );

  assert.throws(
    () => service.switchCurrentLocation({ ...baseState, currentLocationId: "street" }, "street"),
    /Cannot travel/,
  );

  const bypass = service.switchCurrentLocation(
    { ...baseState, currentLocationId: "street" },
    "home",
    { allowNonAdjacent: true },
  );
  assert.equal(bypass.currentLocationId, "home");
});
