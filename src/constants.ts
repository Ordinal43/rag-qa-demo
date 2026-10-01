// A Qdrant collection is roughly a table: one place where related vectors live.
// Ingestion writes to it and retrieval reads from it, so both must use this name.
export const COLLECTION_NAME = "company-policies";
// Cutoff for "relevant enough". Vector search always returns the closest chunks,
// even when none of them answer the question, so we throw away weak matches.
// 0.7 is a guess that worked for this model and these documents. Tune it by
// running questions you know should and should not match (see the tests).
export const MIN_SIMILARITY_SCORE = 0.7;
