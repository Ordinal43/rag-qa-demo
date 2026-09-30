import { askLLM } from "./llm.js";
import { createEmbedding } from "./embedding.js";
import { qdrant } from "./qdrant.js";

async function main() {
  const question = "Are shipping fees refundable?";

  // Turn the user's question into an embedding.
  const questionEmbedding = await createEmbedding(question);

  // Retrieve the most relevant chunks from Qdrant.
  const result = await qdrant.query("company-policies", {
    query: questionEmbedding,
    limit: 3,
    with_payload: true,
  });

  // Extract readable chunk content from the returned points.
  const chunks = result.points
    .map((point) => point.payload?.content)
    .filter((content): content is string => typeof content === "string");

  const uniqueChunks = [...new Set(chunks)];

  const context = uniqueChunks.join("\n\n");

  if (!context) {
    console.log("No relevant information found.");
    return;
  }

  console.log("Retrieved context:");
  console.log(context);

  // Give Gemini only the chunks that Qdrant considered relevant.
  const prompt = `
You are a customer support assistant.

Answer the question using only the provided context.
If the answer is not supported by the context, say you don't know.

CONTEXT:
${context}

QUESTION:
${question}
`;

  const answer = await askLLM(prompt);

  console.log("\nAnswer:");
  console.log(answer);
}

main();
