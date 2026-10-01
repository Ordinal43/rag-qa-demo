import "dotenv/config";
import fs from "node:fs/promises";
import { chunkText } from "./chunk.js";
import { createEmbedding } from "./embedding.js";
import { COLLECTION_NAME } from "./constants.js";
import { qdrant } from "./qdrant.js";

// Indexing side of RAG. Run once (pnpm ingest) whenever the documents change:
//   read files -> chunk -> embed each chunk -> store in Qdrant
// Questions are handled separately in retrieval.ts, so documents are embedded
// once instead of on every question (which is what search.ts used to do).

const documents = [
  "documents/refund-policy.txt",
  "documents/shipping-policy.txt",
];

async function main() {
  // Recreate the collection so ingestion always starts from a clean slate.
  await qdrant.recreateCollection(COLLECTION_NAME, {
    vectors: {
      // Must match the embedding model output length.
      size: 3072,
      // How closeness is measured. Cosine compares the direction of two vectors,
      // so it focuses on meaning rather than text length. Score is about -1 to 1,
      // higher means more similar.
      distance: "Cosine",
    },
  });

  // A "point" is one row in Qdrant: id + vector + payload.
  const points: Array<{
    id: number;
    vector: number[];
    // Payload is the data we get back with a search hit. The vector is only used
    // for matching, so the original text has to be stored here to use it later.
    payload: {
      path: string;
      content: string;
    };
  }> = [];

  // Ids restart at 1 every run, which is safe because the collection is
  // recreated above.
  let pointId = 1;

  for (const path of documents) {
    const content = await fs.readFile(path, "utf-8");
    const chunks = chunkText(content);

    for (let index = 0; index < chunks.length; index++) {
      const chunk = chunks[index]!;
      // One API call per chunk. Fine for a demo, slow for large document sets.
      const vector = await createEmbedding(chunk);

      points.push({
        id: pointId++,
        vector,
        payload: {
          path,
          content: chunk,
        },
      });
    }
  }

  // Upsert = insert, or update if the id already exists.
  // wait: true blocks until the data is written, so a query right after
  // ingestion will see it.
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points,
  });

  console.log(`Ingested ${points.length} chunks into ${COLLECTION_NAME}.`);
}

main();
