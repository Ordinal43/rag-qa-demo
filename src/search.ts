// Legacy from README step 7, and not used by the current flow (index.ts uses
// retrieval.ts + Qdrant). Kept as a reference for the naive approach.
//
// It works, but re-embeds every whole document on every question, and picks
// only one best file. That is the problem Qdrant and chunking later solved.
import fs from "node:fs/promises";
import { createEmbedding } from "./embedding.js";
import { cosineSimilarity } from "./similarity.js";

const documents = [
  "documents/refund-policy.txt",
  "documents/shipping-policy.txt",
];

export async function findRelevantDocument(question: string) {
  const questionEmbedding = await createEmbedding(question);

  let bestMatch: {
    path: string;
    content: string;
    score: number;
  } | null = null;

  for (const path of documents) {
    const content = await fs.readFile(path, "utf-8");

    const documentEmbedding = await createEmbedding(content);

    const score = cosineSimilarity(questionEmbedding, documentEmbedding);

    console.log(`${path}: ${score}`);

    if (!bestMatch || score > bestMatch.score) {
      bestMatch = {
        path,
        content,
        score,
      };
    }
  }

  return bestMatch;
}
