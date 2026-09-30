import { describe, expect, it } from "vitest";
import { createEmbedding } from "../src/embedding.js";
import { qdrant } from "../src/qdrant.js";
import { COLLECTION_NAME } from "../src/constants.js";

describe("RAG retrieval", () => {
  it("retrieves the shipping fee policy for a refundability question", async () => {
    const question = "Are shipping fees refundable?";

    const questionEmbedding = await createEmbedding(question);

    const result = await qdrant.query(COLLECTION_NAME, {
      query: questionEmbedding,
      limit: 1,
      with_payload: true,
    });

    const bestMatch = result.points[0];

    expect(bestMatch).toBeDefined();
    expect(bestMatch?.payload?.content).toBe(
      "Shipping fees are non-refundable.",
    );
  });

  it("retrieves shipping time for a delivery question", async () => {
    const question = "How long until my package arrives?";

    const questionEmbedding = await createEmbedding(question);

    const result = await qdrant.query(COLLECTION_NAME, {
      query: questionEmbedding,
      limit: 1,
      with_payload: true,
    });

    const bestMatch = result.points[0];

    expect(bestMatch).toBeDefined();
    expect(bestMatch?.payload?.content).toContain("shipping");
  });

  it("does not return a strong match for an unsupported question", async () => {
    const question = "Do you accept Bitcoin?";

    const questionEmbedding = await createEmbedding(question);

    const result = await qdrant.query(COLLECTION_NAME, {
      query: questionEmbedding,
      limit: 1,
      with_payload: true,
    });

    const bestMatch = result.points[0];

    expect(bestMatch).toBeDefined();
    expect(bestMatch!.score).toBeLessThan(0.7);
  });
});
