// We don't need to understand the math here.
// This function just compares two embeddings and returns
// how similar their meanings are.
//
// Only search.ts uses this now. Qdrant does the same calculation for us
// ("Cosine" distance in ingest.ts), so it is here for learning how scores work.
// Rough idea: 1 means same direction (very similar meaning), 0 unrelated.
export function cosineSimilarity(a: number[], b: number[]) {
  // Vectors of different sizes (or empty) cannot be compared.
  if (a.length !== b.length || a.length === 0) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i]! * b[i]!;
    magnitudeA += a[i]! * a[i]!;
    magnitudeB += b[i]! * b[i]!;
  }

  return dotProduct / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}
