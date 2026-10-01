import { answerQuestion } from "./rag.js";
import { checkQdrantSetup } from "./qdrant.js";

// Command line entry point (pnpm dev). The RAG logic itself lives in rag.ts.
async function main() {
  const setup = await checkQdrantSetup();

  if (!setup.ready) {
    console.log(`RAG setup is not ready: ${setup.reason}`);
    console.log("Run: pnpm ingest");
    return;
  }

  // Hard-coded for now. Change it to try different questions.
  const question = "Are shipping fees refundable?";

  const answer = await answerQuestion(question);

  // null means retrieval found nothing relevant enough, so the LLM was skipped.
  if (!answer) {
    console.log("No relevant information found.");
    return;
  }

  console.log(answer);
}

main();
