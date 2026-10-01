import { describe, expect, it } from "vitest";
import { retrieveContext } from "../src/retrieval.js";

describe("RAG retrieval", () => {
  it("retrieves the shipping fee policy", async () => {
    const chunks = await retrieveContext("Are shipping fees refundable?");

    expect(chunks).toContain("Shipping fees are non-refundable.");
  });

  it("retrieves shipping time", async () => {
    const chunks = await retrieveContext("How long until my package arrives?");

    expect(
      chunks.some((chunk) => chunk.toLowerCase().includes("shipping")),
    ).toBe(true);
  });

  it("returns no context for unsupported questions", async () => {
    const chunks = await retrieveContext("Do you accept Bitcoin?");

    expect(chunks).toEqual([]);
  });
});
