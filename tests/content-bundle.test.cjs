const test = require("node:test");
const assert = require("node:assert/strict");

const { loadDemoContentBundle } = require("../.tmp-demo-tests/content/demo/loader.js");
const { validateContentBundle } = require("../.tmp-demo-tests/engine/content/validation.js");

test("demo content bundle should pass minimal validation", () => {
  const bundle = loadDemoContentBundle();
  const validated = validateContentBundle(bundle);

  assert.equal(validated.id, "demo-content-pack");
  assert.equal(validated.title, "Prototype Demo Pack");
  assert.equal(validated.version, 1);
  assert.ok(validated.locations.length >= 3);
  assert.ok(validated.events.length >= 1);
  assert.ok(validated.quests.length >= 1);
  assert.equal(typeof validated.narrative.startNodeId, "string");
});
