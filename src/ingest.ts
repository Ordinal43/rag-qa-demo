import "dotenv/config";
import fs from "node:fs/promises";
import { chunkText } from "./chunk.js";
import { createEmbedding } from "./embedding.js";
import { COLLECTION_NAME } from "./constants.js";
import { qdrant } from "./qdrant.js";

const documents = [
  "documents/refund-policy.txt",
  "documents/shipping-policy.txt",
];

async function main() {
  // Recreate the collection so ingestion always starts from a clean slate.
  await qdrant.recreateCollection(COLLECTION_NAME, {
    vectors: {
      size: 3072,
      distance: "Cosine",
    },
  });

  const points: Array<{
    id: string;
    vector: number[];
    payload: {
      path: string;
      content: string;
    };
  }> = [];

  for (const path of documents) {
    const content = await fs.readFile(path, "utf-8");
    const chunks = chunkText(content);

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index]!;
      const vector = await createEmbedding(chunk);

      points.push({
        id: `${path}#${index + 1}`,
        vector,
        payload: {
          path,
          content: chunk,
        },
      });
    }
  }

  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  console.log(`Ingested ${points.length} chunks into ${COLLECTION_NAME}.`);
}

main();
