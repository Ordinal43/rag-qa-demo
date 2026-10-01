import { askLLM } from "./llm.js";
import { checkQdrantSetup } from "./qdrant.js";
import { retrieveContext } from "./retrieval.js";

// Query side of RAG, the full flow:
//   question -> retrieve chunks -> build prompt with context -> LLM -> answer
// Documents must already be ingested (pnpm ingest).
async function main() {
  const setup = await checkQdrantSetup();

  if (!setup.ready) {
    console.log(`RAG setup is not ready: ${setup.reason}`);
    console.log("Run: pnpm ingest");
    return;
  }

  // Hard-coded for now. Change it to try different questions.
  const question = "Are shipping fees refundable?";

  const chunks = await retrieveContext(question);

  // Nothing passed the similarity threshold. Stop here instead of asking the LLM
  // with no context, which invites it to make something up.
  if (chunks.length === 0) {
    console.log("No relevant information found.");
    return;
  }

  const context = chunks.join("\n\n");

  // The "augmented" part of RAG: retrieved text is pasted into the prompt.
  // The instruction to use only the context (and admit when it does not know)
  // is what keeps the model grounded instead of answering from memory.
  const prompt = `
You are a customer support assistant.

Answer the question using only the provided context.
If the answer is not supported by the context, say you don't know.

CONTEXT:
${context}

QUESTION:
${question}
`;

  const answer = await askLLM(prompt);

  console.log("Retrieved context:");
  console.log(context);

  console.log("\nAnswer:");
  console.log(answer);
}

main();
