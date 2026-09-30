import { askLLM } from "./llm.js";

async function main() {
  const answer = await askLLM("Explain what RAG is in one simple sentence.");

  console.log(answer);
}

main();
