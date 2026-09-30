# RAG QA Demo

A hands-on QA automation project for learning how to test LLM and RAG applications.

The goal of this project is to learn AI/LLM testing from a software engineering and QA perspective, without requiring a machine learning background.

## What This Project Will Cover

Eventually, this project will cover:

- Calling an LLM API
- Supplying custom documents to an LLM
- Searching for relevant documents
- RAG (Retrieval-Augmented Generation)
- Vector search
- Automated LLM testing
- Hallucination testing
- Retrieval quality testing
- Regression testing
- API testing
- Prompt injection testing
- AI-related performance monitoring

## Tech Stack

- Node.js
- TypeScript
- pnpm
- Vitest
- Gemini API

Additional tools will be added as the project grows.

## Project Structure

```text
rag-qa-demo/
├── src/
│   └── index.ts
├── tests/
├── documents/
├── .env
├── .gitignore
├── package.json
└── tsconfig.json
```

## Setup

Install dependencies:

```bash
pnpm install
```

Run the project:

```bash
pnpm dev
```

Run tests:

```bash
pnpm test
```

## Environment Variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

The `.env` file is ignored by Git and should never be committed.

## Learning Notes

### What is an LLM API?

From this project's perspective, an LLM API is just another API:

```text
request
   ↓
LLM provider
   ↓
response
```

We send text and receive generated text. More advanced concepts will be introduced one at a time.

## Learning Progress

### Step 1 — Project Setup

Created a basic Node.js + TypeScript project.

Installed:

```bash
pnpm add -D typescript tsx @types/node vitest
```

Initialized TypeScript:

```bash
pnpm exec tsc --init
```

Created the initial folders:

```text
src/
tests/
documents/
```

### Step 2 — Connect to an LLM

Installed the Gemini SDK and dotenv:

```bash
pnpm add @google/genai dotenv
```

Created a reusable `askLLM()` function in `src/llm.ts`.

### Step 3 — Give the LLM Our Own Document

Created:

```text
documents/refund-policy.txt
```

Example policy:

```text
Customers may return unused products within 30 days of purchase.

Products must be in their original condition.

Shipping fees are non-refundable.
```

The application now reads the document and sends it to the LLM with the user's question.

### Important Concept

This is **not RAG yet**. We are still manually sending the full document to the LLM, which works for small inputs but does not scale well.

### Step 4 — Add Basic Document Retrieval

Added a second document:

```text
documents/shipping-policy.txt
```

Created:

```text
src/search.ts
```

The application now checks the user's question and chooses a relevant document before calling the LLM. For now, that matching is still keyword-based.

### Why This Matters

This is our first simple version of **retrieval**: instead of always sending the same document, the application first decides which one is relevant.

Right now the search uses hard-coded keywords:

```text
"refund" or "return"
→ refund-policy.txt

"shipping" or "delivery"
→ shipping-policy.txt
```

This works for simple cases, but it has an obvious weakness. For example:

```text
"When will my package arrive?"
```

may not match because the code only knows specific keywords. The next step is to replace that with a smarter search method that can recognize similar meaning even when the exact words are different.

### Step 5 — Generate Our First Embedding

Created:

```text
src/embedding.ts
```

The application can now send text to Gemini's embedding model and receive a numeric representation of that text.

Example:

```text
"How long does shipping take?"
        ↓
embedding model
        ↓
[0.0096, 0.0009, -0.0128, ...]
```

In our test, the embedding contained:

```text
3072 numbers
```

### What Is an Embedding?

For this project, we can think of an embedding as a **meaning fingerprint**: a long list of numbers that can later be compared with other text. We do not need to interpret the individual numbers; we only care that similar text produces similar fingerprints.

Example:

```text
"How long until my package arrives?"
```

should be more closely related to:

```text
"Standard shipping takes 3-5 business days."
```

than to:

```text
"Customers may return products within 30 days."
```

We are **not using a vector database yet**. The next step is to compare multiple embeddings and see whether the application can identify which sentence is closest in meaning to a user's question.

### Step 6 — Compare Embeddings by Meaning

Created:

```text
src/similarity.ts
```

The application can now compare two embeddings and return a similarity score. For this project, we can think of the score as:

> How closely related are these two pieces of text?

Example:

```text
Question:
"How long until my package arrives?"

Shipping policy:
"Standard shipping takes 3-5 business days."

Refund policy:
"Customers may return products within 30 days."
```

Result:

```text
Shipping similarity: 0.7104
Refund similarity:   0.5669
```

The shipping text received the higher score, which means it was considered more relevant to the question. The similarity score is **not a percentage of correctness**.

```text
0.71
```

does not mean:

```text
71% correct
```

It is simply a score used to compare which text is more closely related.

This is the basic idea behind vector search.

We are still doing everything in memory and are not using a vector database yet.

### Step 7 — Retrieve the Most Relevant Real Document

Updated the retrieval logic so the application now reads the actual policy files instead of comparing hard-coded example strings.

Current documents:

```text
documents/
├── refund-policy.txt
└── shipping-policy.txt
```

For each user question, the application now:

1. Creates an embedding for the question.
2. Reads each policy document.
3. Creates an embedding for each document.
4. Compares the question embedding against each document embedding.
5. Selects the document with the highest similarity score.
6. Sends the selected document and the question to Gemini.
7. Generates an answer using that document as context.

### Example

Question:

```text
How long until my package arrives?
```

Retrieval result:

```text
documents/refund-policy.txt:   0.5552
documents/shipping-policy.txt: 0.6622

Selected document:
documents/shipping-policy.txt
```

Generated answer:

```text
It depends on the shipping method you chose:

- Standard shipping: 3–5 business days
- Express shipping: 1–2 business days
```

### Is This RAG?

This is now a very small working version of the basic RAG idea:

```text
Retrieve relevant information
        ↓
Add it to the LLM request
        ↓
Generate an answer
```

The current implementation is intentionally simple, and there is no vector database yet.

### Current Limitation

Every time a user asks a question, the application recreates the embeddings for every document:

```text
Question 1
   ↓
embed refund policy
embed shipping policy

Question 2
   ↓
embed refund policy again
embed shipping policy again

Question 3
   ↓
embed refund policy again
embed shipping policy again
```

This is inefficient because the policy documents usually do not change between questions, so there is no reason to repeatedly create their embeddings. The next step is to store document embeddings so they can be reused, which is where a **vector database** becomes useful.

### Step 8 — Store and Search Embeddings with Qdrant

Added a local Qdrant vector database using Docker Compose so document embeddings can be stored once and reused.

Current local service:

```text
Qdrant
http://localhost:6333
```

The project uses the `company-policies` collection.

Each stored item contains:

```text
id
vector
payload
```

Example:

```text
id: 2

vector:
[0.009, -0.014, ...]

payload:
{
  path: "documents/shipping-policy.txt",
  content: "Standard shipping takes..."
}
```

The `vector` is the document's meaning fingerprint.

The `payload` contains the document data we want back after a search.

### Why Qdrant Helps

Before Qdrant, every question required us to recreate embeddings for every document:

```text
question
   ↓
embed refund policy
embed shipping policy
   ↓
compare manually
```

Now document embeddings are created once and stored:

```text
ONE TIME

documents
   ↓
create embeddings
   ↓
store in Qdrant
```

For every new question, we only need to embed the question:

```text
question
   ↓
create question embedding
   ↓
Qdrant compares it against stored embeddings
   ↓
return closest document
```

### Step 9 — Complete the End-to-End RAG Flow

The application now performs a full small-scale RAG flow from retrieval through final answer generation.

Example question:

```text
How long until my package arrives?
```

Qdrant returned:

```text
shipping-policy.txt → 0.6622
refund-policy.txt   → 0.5552
```

The application selected the shipping policy and passed its content to Gemini.

Generated answer:

```text
It depends on the shipping method selected for your order:

- Standard shipping: 3–5 business days
- Express shipping: 1–2 business days
```

### Current RAG Flow

```text
User question
     ↓
Create question embedding
     ↓
Search Qdrant
     ↓
Find closest stored document
     ↓
Retrieve document content
     ↓
Document + question
     ↓
Gemini
     ↓
Generated answer
```

This is now a working example of **Retrieval-Augmented Generation**:

```text
Retrieval
Find relevant information in Qdrant

Augmentation
Add that information to the LLM prompt

Generation
Let Gemini generate the final answer
```

### Current Limitation

Each policy file is still stored as a single searchable item, so the next improvement is likely chunking the documents into smaller pieces.

For example:

```text
shipping-policy.txt
→ one embedding
```

This works for very small documents, but real documents may contain many unrelated topics.

For example, a larger document could contain:

```text
Shipping times
Shipping prices
International shipping
Lost packages
Refunds
Tracking
```

Representing the entire file with one embedding can make it harder to retrieve the exact section that answers a question.

The next step is **chunking**:

```text
large document
     ↓
split into smaller sections
     ↓
create an embedding for each section
     ↓
store each section separately in Qdrant
```

This will let the application retrieve the specific part of a document that is most relevant to the user's question.

### Step 10 — Split Documents into Chunks

Previously, each entire policy file was stored as one searchable item. That works for very small files, but larger documents can contain many unrelated topics, so the project now splits documents into smaller pieces before storing them.

Example:

```text id="re3d9i"
refund-policy.txt

Customers may return unused products within 30 days.

Products must be in their original condition.

Shipping fees are non-refundable.
```

becomes:

```text id="ztjh6p"
Chunk 1:
Customers may return unused products within 30 days.

Chunk 2:
Products must be in their original condition.

Chunk 3:
Shipping fees are non-refundable.
```

Each chunk receives its own embedding and is stored separately in Qdrant.

### Why Chunking Helps

Without chunking:

```text id="hqgl7h"
question
   ↓
find relevant document
```

With chunking:

```text id="19tpvg"
question
   ↓
find relevant part of a document
```

This allows Qdrant to retrieve a specific sentence or paragraph instead of returning an entire file.

### Example Retrieval

Question:

```text id="9k4w38"
Are shipping fees refundable?
```

Qdrant returned:

```text id="o5n4un"
Shipping fees are non-refundable.
→ score: 0.9143

Shipping fees are non-refundable.
→ score: 0.9143

Products must be in their original condition.
→ score: 0.6516
```

The first two results were identical because the same sentence existed in both policy files.

This showed that the vector search was working correctly, but also introduced a duplicate-context problem.

### Step 11 — Retrieve Multiple Relevant Chunks

Instead of retrieving only one result, the application now retrieves the top few matching chunks.

Current flow:

```text id="n3rqz3"
User question
     ↓
Create question embedding
     ↓
Search Qdrant
     ↓
Retrieve top matching chunks
     ↓
Combine chunks into context
     ↓
Send context + question to Gemini
     ↓
Generate answer
```

For example:

```text id="bmjkoc"
Question:
Are shipping fees refundable?
```

Retrieved context:

```text id="jd8pgm"
Shipping fees are non-refundable.

Shipping fees are non-refundable.

Products must be in their original condition.
```

Generated answer:

```text id="7mjllw"
No, shipping fees are non-refundable.
```

### Step 12 — Remove Duplicate Context

Because the same information may exist in multiple documents, retrieval can return duplicate chunks.

Before cleanup:

```text id="3evxu3"
Shipping fees are non-refundable.

Shipping fees are non-refundable.

Products must be in their original condition.
```

The application now removes duplicate chunk text before sending the context to Gemini.

After cleanup:

```text id="hb2bxl"
Shipping fees are non-refundable.

Products must be in their original condition.
```

This keeps the prompt cleaner and avoids unnecessarily sending the same information multiple times.

### Current RAG Flow

The project now performs:

```text id="weq9qs"
Documents
   ↓
Split into chunks
   ↓
Create embeddings
   ↓
Store chunks in Qdrant


User question
   ↓
Create question embedding
   ↓
Search Qdrant
   ↓
Retrieve top matching chunks
   ↓
Remove duplicate chunks
   ↓
Build context
   ↓
Send context + question to Gemini
   ↓
Generate answer
```

### What We Have Learned So Far

A RAG system is not just an LLM call.

There are several separate steps that can succeed or fail independently:

```text id="6wvf1m"
Document loading
      ↓
Chunking
      ↓
Embedding
      ↓
Storage
      ↓
Retrieval
      ↓
Context preparation
      ↓
LLM generation
```

From a QA perspective, each of these steps can be tested separately.

The next step is to test what happens when the user's question cannot actually be answered by any of the stored documents.

### Step 13 — Add a Minimum Retrieval Score

Vector search will usually return the closest matches even when none of them are useful enough to answer the user's question.

For example:

```text
Question:
Do you ship internationally?
```

Qdrant may still return shipping-related chunks such as:

```text
Express shipping takes 1-2 business days.

Shipping fees are non-refundable.
```

Those chunks are related to shipping, but they do not answer the question.

To avoid passing weak context to the LLM, the application now uses a minimum similarity score.

Example:

```ts
const MIN_SIMILARITY_SCORE = 0.7;

const relevantPoints = result.points.filter(
  (point) => point.score >= MIN_SIMILARITY_SCORE,
);
```

The retrieval flow is now:

```text
User question
     ↓
Create embedding
     ↓
Search Qdrant
     ↓
Get closest chunks
     ↓
Check similarity scores
     ↓
Remove weak matches
     ↓
No good matches?
     │
     ├── Yes → Stop
     │          "No relevant information found."
     │
     └── No → Continue
               ↓
          Build context
               ↓
             Gemini
```

Example result:

```text
Question:
Do you ship internationally?

Result:
No relevant information found.
```

This prevents the application from sending unrelated or weakly related information to the LLM.

### Important Note About the Threshold

The value:

```text
0.7
```

is not a universal rule.

Different embedding models, document types, chunk sizes, and datasets can produce different similarity score patterns, so the threshold should be tested and adjusted using real example questions.

From a QA perspective, this means creating known test cases such as:

```text
Question                         Should retrieve?
--------------------------------------------------
Are shipping fees refundable?   Yes
How long does delivery take?    Yes
Can I return an item?           Yes
Do you ship internationally?    No
Do you accept Bitcoin?          No
```

The goal is to find a threshold that keeps useful results while rejecting unrelated ones.

This introduces an important RAG testing concept:

```text
closest result
      ≠
relevant enough result
```
