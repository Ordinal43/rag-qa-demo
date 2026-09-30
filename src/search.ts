import fs from "node:fs/promises";

export async function findRelevantDocument(question: string) {
  const normalizedQuestion = question.toLowerCase();

  if (
    normalizedQuestion.includes("refund") ||
    normalizedQuestion.includes("return")
  ) {
    return fs.readFile("documents/refund-policy.txt", "utf-8");
  }

  if (
    normalizedQuestion.includes("shipping") ||
    normalizedQuestion.includes("delivery")
  ) {
    return fs.readFile("documents/shipping-policy.txt", "utf-8");
  }

  return null;
}
