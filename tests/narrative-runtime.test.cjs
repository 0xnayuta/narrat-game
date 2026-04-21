const test = require("node:test");
const assert = require("node:assert/strict");

const { NarrativeRuntime } = require("../.tmp-demo-tests/engine/narrative/NarrativeRuntime.js");

const graph = {
  startNodeId: "intro",
  nodes: [
    {
      id: "intro",
      text: "Intro text",
      choices: [
        {
          id: "next",
          text: "Continue",
          nextNodeId: "second",
          effects: { setFlags: { intro_seen: true } },
        },
      ],
    },
    {
      id: "second",
      text: "Second text",
      choices: [],
    },
  ],
};

test("NarrativeRuntime should expose current node, text and view", () => {
  const runtime = new NarrativeRuntime(graph);

  assert.equal(runtime.getCurrentNode().id, "intro");
  assert.equal(runtime.getCurrentText(), "Intro text");
  assert.deepEqual(runtime.getCurrentView(), {
    nodeId: "intro",
    text: "Intro text",
    choices: [{ id: "next", text: "Continue" }],
  });
});

test("NarrativeRuntime should choose and jump between nodes", () => {
  const runtime = new NarrativeRuntime(graph);

  const choiceResult = runtime.choose("next");
  assert.equal(choiceResult.node.id, "second");
  assert.deepEqual(choiceResult.effects, { setFlags: { intro_seen: true } });
  assert.equal(runtime.getCurrentNode().id, "second");

  const jumped = runtime.jumpTo("intro");
  assert.equal(jumped.id, "intro");
});

test("NarrativeRuntime should reject invalid start node and invalid choices", () => {
  assert.throws(
    () => new NarrativeRuntime({ startNodeId: "missing", nodes: graph.nodes }),
    /Start node not found/,
  );

  const runtime = new NarrativeRuntime(graph);
  assert.throws(() => runtime.choose("missing"), /Choice not found/);
  assert.throws(() => runtime.jumpTo("missing"), /Node not found/);
});
