import assert from "node:assert/strict";
import test from "node:test";
import { canTransition, getValidTransitions } from "./order-state-machine.js";

test("allows the normal order fulfillment path", () => {
  assert.equal(canTransition("pending", "preparing"), true);
  assert.equal(canTransition("preparing", "ready"), true);
  assert.equal(canTransition("ready", "served"), true);
  assert.equal(canTransition("served", "completed"), true);
});

test("rejects loose client-controlled status jumps", () => {
  assert.equal(canTransition("pending", "completed"), false);
  assert.equal(canTransition("preparing", "served"), false);
  assert.equal(canTransition("completed", "cancelled"), false);
  assert.equal(canTransition("cancelled", "pending"), false);
});

test("returns valid next actions for active statuses", () => {
  assert.deepEqual(getValidTransitions("pending"), ["preparing", "cancelled"]);
  assert.deepEqual(getValidTransitions("ready"), ["served", "cancelled"]);
  assert.deepEqual(getValidTransitions("completed"), []);
});
