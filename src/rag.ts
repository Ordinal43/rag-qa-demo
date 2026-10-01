import { askLLM } from "./llm.js";
import { retrieveContext } from "./retrieval.js";

// The whole query side of RAG in one function, so the CLI (index.ts) and the
// tests can share it:
//   question -> retrieve chunks -> build prompt with context -> LLM -> answer
// Returns null when there is nothing relevant to answer from.
// Documents must already be ingested (pnpm ingest).
export async function answerQuestion(question: string) {
  // Retrieve only information that passed our similarity threshold.
  const chunks = await retrieveContext(question);

  // Do not call the LLM if our knowledge base cannot support the question.
  if (chunks.length === 0) {
    return null;
  }

  // Join the chunks into one block of text to paste into the prompt.
  const context = chunks.join("\n\n");

  // The "augmented" part of RAG: retrieved text is pasted into the prompt.
  // The prompt explicitly tells Gemini not to rely on knowledge
  // outside of the retrieved company policies, and to admit when it does not
  // know. That is what keeps the model grounded instead of answering from memory.
  const prompt = `
You are a customer support assistant.

Answer the question using only the provided context.
If the answer is not supported by the context, say you don't know.

CONTEXT:
${context}

QUESTION:
${question}
`;

  return askLLM(prompt);
}
