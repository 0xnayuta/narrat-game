const test = require("node:test");
const assert = require("node:assert/strict");

const { createGameSessionFromBundle } = require("../.tmp-demo-tests/engine/index.js");

test("ContentBundle initialVars should be set in session state", () => {
  const bundle = {
    id: "initial-vars-test",
    title: "Initial Vars Test",
    version: 1,
    locations: [
      {
        id: "home",
        name: "Home",
        description: "Test home",
        connections: [{ to: "street", travelMinutes: 5 }],
      },
      {
        id: "street",
        name: "Street",
        description: "Test street",
        connections: [{ to: "home", travelMinutes: 5 }],
      },
    ],
    events: [],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: { ready: true },
    initialVars: { gold: 100, reputation: 5, title: "wanderer" },
  };

  const session = createGameSessionFromBundle(bundle);
  const state = session.getState();

  assert.equal(state.vars.gold, 100);
  assert.equal(state.vars.reputation, 5);
  assert.equal(state.vars.title, "wanderer");
  assert.equal(state.flags.ready, true);
});

test("ContentBundle without initialVars should have empty vars", () => {
  const bundle = {
    id: "no-initial-vars-test",
    title: "No Initial Vars Test",
    version: 1,
    locations: [
      {
        id: "home",
        name: "Home",
        description: "Test home",
        connections: [],
      },
    ],
    events: [],
    narrative: {
      startNodeId: "node_start",
      nodes: [
        { id: "node_start", text: "Start", choices: [] },
      ],
    },
    quests: [],
    npcs: [],
    initialFlags: {},
  };

  const session = createGameSessionFromBundle(bundle);
  const state = session.getState();

  assert.deepEqual(state.vars, {});
});

test("demo session should start with gold from initialVars", () => {
  const { createDemoSession } = require("../.tmp-demo-tests/app/createDemoSession.js");
  const session = createDemoSession();
  const state = session.getState();

  assert.equal(state.vars.gold, 50);
});
