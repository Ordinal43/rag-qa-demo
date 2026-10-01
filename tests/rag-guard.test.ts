import { describe, expect, it, vi } from "vitest";

// Checks a behavior rather than an answer: for an unsupported question, the
// LLM must not be called at all. A mock lets us assert on calls, which a real
// LLM cannot.
//
// Only the LLM is mocked. Embedding and Qdrant are still real, so this still
// needs Qdrant running and ingested documents.

// Mock the LLM so this test never makes a real Gemini request.
vi.mock("../src/llm.js", () => ({
  askLLM: vi.fn(),
}));

// Imported after vi.mock so these get the mocked version. (vitest hoists
// vi.mock to the top of the file anyway.)
import { askLLM } from "../src/llm.js";
import { answerQuestion } from "../src/rag.js";

describe("RAG guards", () => {
  it("does not call the LLM when no relevant context is found", async () => {
    const answer = await answerQuestion("Do you accept Bitcoin?");

    // No relevant context means the RAG flow should stop early.
    expect(answer).toBeNull();

    // Gemini should never be called for unsupported questions.
    expect(askLLM).not.toHaveBeenCalled();
  });
});
