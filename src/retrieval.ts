import { createEmbedding } from "./embedding.js";
import { qdrant } from "./qdrant.js";
import { COLLECTION_NAME, MIN_SIMILARITY_SCORE } from "./constants.js";

// The "retrieval" step of RAG: question in, relevant text chunks out.
//   embed question -> nearest-neighbor search -> drop weak matches -> dedupe
export async function retrieveContext(question: string) {
  // Embed the question with the same model used for the documents, so the two
  // live in the same vector space and can be compared.
  const questionEmbedding = await createEmbedding(question);

  const result = await qdrant.query(COLLECTION_NAME, {
    query: questionEmbedding,
    // Top 3 closest chunks. More gives the LLM more to work with but also more
    // noise and a bigger prompt.
    limit: 3,
    // Without this we would get ids and scores but not the chunk text.
    with_payload: true,
  });

  // Closest is not the same as relevant. Even an unrelated question gets its
  // 3 nearest chunks, so filter by score.
  const relevantPoints = result.points.filter(
    (point) => point.score >= MIN_SIMILARITY_SCORE,
  );

  // Pull the text out of each hit. The type guard keeps TypeScript happy since
  // payload values are untyped.
  const chunks = relevantPoints
    .map((point) => point.payload?.content)
    .filter((content): content is string => typeof content === "string");

  // Same sentence can exist in several documents (both policies say shipping
  // fees are non-refundable). A Set removes exact duplicates so the prompt does
  // not repeat itself.
  return [...new Set(chunks)];
}
