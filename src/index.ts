import { askLLM } from "./llm.js";
import { createEmbedding } from "./embedding.js";
import { qdrant } from "./qdrant.js";

async function main() {
  const question = "How long until my package arrives?";

  // Convert the user's question into the same kind of
  // numeric "meaning fingerprint" we stored for our documents.
  const questionEmbedding = await createEmbedding(question);

  // Ask Qdrant to find the stored document whose embedding
  // is most similar to the question embedding.
  const result = await qdrant.query("company-policies", {
    query: questionEmbedding,
    limit: 1,
    with_payload: true,
  });

  // Since we only asked for one result, the first point
  // should be our best matching document.
  const bestMatch = result.points[0];

  if (!bestMatch?.payload) {
    console.log("No relevant document found.");
    return;
  }

  // The payload contains the original document data
  // that we stored together with its embedding.
  const content = bestMatch.payload.content;

  if (typeof content !== "string") {
    console.log("Matched document has no readable content.");
    return;
  }

  console.log("Matched document:", bestMatch.payload.path);
  console.log("Similarity score:", bestMatch.score);

  // Give Gemini only the retrieved policy instead of
  // sending every document we have.
  const prompt = `
You are a customer support assistant.

Answer the question using only the company policy below.
If the answer is not in the policy, say you don't know.

COMPANY POLICY:
${content}

QUESTION:
${question}
`;

  // Generate the final answer using the retrieved document
  // as context.
  const answer = await askLLM(prompt);

  console.log("\nAnswer:");
  console.log(answer);
}

main();
