import { QdrantClient } from "@qdrant/js-client-rest";
import { COLLECTION_NAME } from "./constants.js";

export const qdrant = new QdrantClient({
  host: "localhost",
  port: 6333,
});

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
