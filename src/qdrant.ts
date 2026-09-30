import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrant = new QdrantClient({
  host: "localhost",
  port: 6333,
});
