// Minimal Jest-style globals (test/expect) backed by node:test + node:assert.
// Lets the contact-schema unit test run under `node --test` via tsx, without
// pulling in a full test framework for this content/marketing site.
import { test as nodeTest } from "node:test";
import assert from "node:assert/strict";

globalThis.test = (name, fn) => nodeTest(name, fn);

globalThis.expect = (received) => ({
  toBe: (expected) => assert.strictEqual(received, expected),
  toEqual: (expected) => assert.deepStrictEqual(received, expected),
});
