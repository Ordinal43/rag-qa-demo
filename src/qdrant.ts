import { QdrantClient } from "@qdrant/js-client-rest";
import { COLLECTION_NAME } from "./constants.js";

// Shared client for the local Qdrant vector database started by docker-compose.
// Qdrant stores vectors and finds the ones closest to a query vector.
export const qdrant = new QdrantClient({
  host: "localhost",
  port: 6333,
});

// Sanity check before answering questions. Without it, a missing or empty
// collection would make search fail or return nothing, and the cause would be
// hard to see. Returning a reason lets the caller print a useful message.
export async function checkQdrantSetup() {
  const collections = await qdrant.getCollections();

  const collectionExists = collections.collections.some(
    (collection) => collection.name === COLLECTION_NAME,
  );

  if (!collectionExists) {
    return {
      ready: false,
      reason: "Collection does not exist.",
    };
  }

  // Collection can exist but be empty, for example if ingestion crashed midway.
  const info = await qdrant.getCollection(COLLECTION_NAME);

  if (!info.points_count) {
    return {
      ready: false,
      reason: "Collection exists but contains no data.",
    };
  }

  return {
    ready: true,
  };
}
