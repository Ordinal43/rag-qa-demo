import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

// The "generation" step of RAG. This function knows nothing about retrieval.
// It just sends a prompt and returns the text, so all the RAG logic lives in
// how the prompt is built (see index.ts).
export async function askLLM(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
  });

  return response.text;
}
