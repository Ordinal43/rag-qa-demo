// Chunking: split a document into small pieces so each piece gets its own
// embedding. One embedding per whole file blurs several topics together, while
// small chunks let search land on the exact passage that answers a question.
//
// This is the simplest strategy: split on blank lines (one paragraph per chunk).
// Real documents often need smarter splitting, like a size limit or overlap
// between neighboring chunks so a sentence is not cut off from its context.
export function chunkText(text: string) {
  return text
    .split(/\n\s*\n/)
    // Remove stray whitespace so identical text compares equal later (dedupe).
    .map((chunk) => chunk.trim())
    // Drop empty strings left by extra blank lines.
    .filter(Boolean);
}
