import { askLLM } from "./llm.js";
import { checkQdrantSetup } from "./qdrant.js";
import { retrieveContext } from "./retrieval.js";

async function main() {
  const setup = await checkQdrantSetup();

  if (!setup.ready) {
    console.log(`RAG setup is not ready: ${setup.reason}`);
    console.log("Run: pnpm ingest");
    return;
  }

  const question = "Are shipping fees refundable?";

  const chunks = await retrieveContext(question);

  if (chunks.length === 0) {
    console.log("No relevant information found.");
    return;
  }

  const context = chunks.join("\n\n");

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
