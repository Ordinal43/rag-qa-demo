import { askLLM } from "./llm.js";
import { findRelevantDocument } from "./search.js";

async function main() {
  const question = "How long until my package arrives?";

  const match = await findRelevantDocument(question);

  if (!match) {
    console.log("No relevant document found.");
    return;
  }

  console.log("\nSelected document:", match.path);
  console.log("Similarity score:", match.score);

  const prompt = `
You are a customer support assistant.

Answer the question using only the company policy below.
If the answer is not in the policy, say you don't know.

COMPANY POLICY:
${match.content}

QUESTION:
${question}
`;

  const answer = await askLLM(prompt);

  console.log("\nAnswer:");
  console.log(answer);
}

main();
