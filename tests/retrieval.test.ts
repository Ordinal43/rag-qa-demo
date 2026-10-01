import { describe, expect, it } from "vitest";
import { retrieveContext } from "../src/retrieval.js";

// These tests only cover retrieval, not the LLM answer. They call the real
// embedding API and need Qdrant running with data ingested, so they are closer
// to integration tests. Retrieval can be checked with plain asserts because the
// output is deterministic text chunks, unlike LLM answers.
describe("RAG retrieval", () => {
  it("retrieves the shipping fee policy", async () => {
    const chunks = await retrieveContext("Are shipping fees refundable?");

    expect(chunks).toContain("Shipping fees are non-refundable.");
  });

  // Paraphrased question with no shared keywords ("package arrives" vs
  // "shipping"). This is where embeddings beat keyword search.
  it("retrieves shipping time", async () => {
    const chunks = await retrieveContext("How long until my package arrives?");

    expect(
      chunks.some((chunk) => chunk.toLowerCase().includes("shipping")),
    ).toBe(true);
  });

  // Negative test: guards the similarity threshold. If MIN_SIMILARITY_SCORE is
  // too low, weak matches sneak in and this fails.
  it("returns no context for unsupported questions", async () => {
    const chunks = await retrieveContext("Do you accept Bitcoin?");

    expect(chunks).toEqual([]);
  });
});
