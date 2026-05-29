import { contactSchema } from "./contact-schema";

const valid = { nombre: "Ana", empresa: "Acme", email: "ana@acme.com", telefono: "+52 55 1234 5678", industria: "bebidas", mensaje: "Quiero una demo del WMS por favor.", website: "" };

test("accepts a valid payload", () => {
  expect(contactSchema.safeParse(valid).success).toBe(true);
});
test("rejects a bad email", () => {
  expect(contactSchema.safeParse({ ...valid, email: "nope" }).success).toBe(false);
});
test("rejects when honeypot 'website' is filled", () => {
  expect(contactSchema.safeParse({ ...valid, website: "spam" }).success).toBe(false);
});
test("rejects too-short message", () => {
  expect(contactSchema.safeParse({ ...valid, mensaje: "hi" }).success).toBe(false);
});
