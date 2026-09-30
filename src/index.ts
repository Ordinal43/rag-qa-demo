import { createEmbedding } from "./embedding.js";
import { cosineSimilarity } from "./similarity.js";

async function main() {
  const question = "How long until my package arrives?";

  const shipping = "Standard shipping takes 3-5 business days.";

  const refund = "Customers may return products within 30 days.";

  const questionEmbedding = await createEmbedding(question);
  const shippingEmbedding = await createEmbedding(shipping);
  const refundEmbedding = await createEmbedding(refund);

  const shippingScore = cosineSimilarity(questionEmbedding, shippingEmbedding);

  const refundScore = cosineSimilarity(questionEmbedding, refundEmbedding);

  console.log("Shipping similarity:", shippingScore);
  console.log("Refund similarity:", refundScore);
}

main();
