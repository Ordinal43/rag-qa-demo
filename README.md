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
