# RAG QA Demo

A hands-on QA automation project for learning how to test LLM and RAG applications.

The goal of this project is to learn AI/LLM testing from a software engineering and QA perspective, without requiring a machine learning background.

## What This Project Will Cover

Eventually, this project will include:

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

Additional tools will be added gradually as the project grows.

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

We send text and receive generated text.

More advanced concepts will be introduced one at a time as the project grows.

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

Current flow:

```text
index.ts
   ↓
llm.ts
   ↓
Gemini API
   ↓
generated response
```

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

The application now reads the document and sends it to the LLM together with the user's question.

Current flow:

```text
refund-policy.txt
        +
     question
        ↓
      Gemini
        ↓
      answer
```

Example:

```text
Question:
How long do I have to return an item?

Answer:
You can return an unused product within 30 days of purchase.
```

### Important Concept

This is **not RAG yet**.

Right now we manually send the entire document to the LLM.

This works when we only have a small amount of information, but it
