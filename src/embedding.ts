import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

// No API key passed here: the SDK reads it from the environment (loaded from
// .env by dotenv above).
const ai = new GoogleGenAI({});

// Turns text into an embedding: a long list of numbers that represents its
// meaning. Text with similar meaning ends up with similar numbers, which is what
// makes search by meaning possible.
//
// The same model must embed both the documents (ingest) and the questions
// (retrieval). Vectors from different models cannot be compared.
// gemini-embedding-001 returns 3072 numbers by default, which is why the
// collection in ingest.ts is created with size 3072.
export async function createEmbedding(text: string) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-001",
    contents: text,
  });

  // Empty array if the API returned nothing. Note that an empty vector will not
  // match the collection size, so a failed embedding shows up as a Qdrant error.
  return response.embeddings?.[0]?.values ?? [];
}
