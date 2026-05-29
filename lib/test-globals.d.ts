// Ambient declarations for the Jest-style globals provided by lib/test-setup.mjs.
// Lets the contact-schema unit test typecheck without a full test framework.
declare function test(name: string, fn: () => void | Promise<void>): void;

interface ExpectMatchers {
  toBe(expected: unknown): void;
  toEqual(expected: unknown): void;
}

declare function expect(received: unknown): ExpectMatchers;
