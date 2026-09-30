import { askLLM } from "./llm.js";
import { findRelevantDocument } from "./search.js";

async function main() {
  const question = "How long does delivery take?";

  const document = await findRelevantDocument(question);

  if (!document) {
    console.log("No relevant document found.");
    return;
  }

  const prompt = `
You are a customer support assistant.

Answer the question using only the company policy below.
If the answer is not in the policy, say you don't know.

COMPANY POLICY:
${document}

QUESTION:
${question}
`;

  const answer = await askLLM(prompt);

  console.log(answer);
}

main();
