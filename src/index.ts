import fs from "node:fs/promises";
import { askLLM } from "./llm.js";

async function main() {
  const refundPolicy = await fs.readFile(
    "documents/refund-policy.txt",
    "utf-8",
  );

  const question = "How long do I have to return an item?";

  const prompt = `
You are a customer support assistant.

Answer the question using only the company policy below.
If the answer is not in the policy, say you don't know.

COMPANY POLICY:
${refundPolicy}

QUESTION:
${question}
`;

  const answer = await askLLM(prompt);

  console.log(answer);
}

main();
