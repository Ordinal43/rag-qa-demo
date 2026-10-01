import { describe, expect, it } from "vitest";
import { answerQuestion } from "../src/rag.js";

// Tests the full flow including the real LLM call, so it needs a Gemini key,
// Qdrant running and ingested documents. It is slower and can cost money, and
// the answer wording changes between runs, so assertions must stay loose.
describe("RAG generation", () => {
  it("answers using the retrieved shipping fee policy", async () => {
    const answer = await answerQuestion("Are shipping fees refundable?");

    // The answer can be phrased differently on each run,
    // so we check for the important fact instead of exact wording.
    // Not null also confirms retrieval found the policy chunk.
    expect(answer).not.toBeNull();
    expect(answer?.toLowerCase()).toContain("non-refundable");
  });
});
