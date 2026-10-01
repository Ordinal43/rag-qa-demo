import { createEmbedding } from "./embedding.js";
import { qdrant } from "./qdrant.js";
import { COLLECTION_NAME, MIN_SIMILARITY_SCORE } from "./constants.js";

export async function retrieveContext(question: string) {
  const questionEmbedding = await createEmbedding(question);

  const result = await qdrant.query(COLLECTION_NAME, {
    query: questionEmbedding,
    limit: 3,
    with_payload: true,
  });

  const relevantPoints = result.points.filter(
    (point) => point.score >= MIN_SIMILARITY_SCORE,
  );

  const chunks = relevantPoints
    .map((point) => point.payload?.content)
    .filter((content): content is string => typeof content === "string");

  return [...new Set(chunks)];
}
