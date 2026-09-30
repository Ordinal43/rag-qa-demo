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
