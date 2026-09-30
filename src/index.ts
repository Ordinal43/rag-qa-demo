import { createEmbedding } from "./embedding.js";

async function main() {
  const embedding = await createEmbedding("How long does shipping take?");

  console.log("Embedding size:", embedding.length);
  console.log("First 10 values:", embedding.slice(0, 10));
}

main();
