---
id: retriever
name: "Retriever"
kind: "CONTEXT"
trunk: 2
layer: context-and-retrieval
ai: true
---

# Retriever

**What:** The component that finds the passages most relevant to a question and hands them to the model.

In RAG, answer quality is capped by retrieval quality. Documents are split into chunks, turned into embeddings and searched by similarity, often blended with keyword search and a reranker. If the right chunk never arrives, no prompt will rescue the answer.

## Use when

Answers must come from the client’s own documents, or the content changes often.

## Skip when

The knowledge is small and stable enough to fit in the prompt.

## The check

Write 20 real questions with known source passages. Measure how often the right passage lands in the top five before judging any answer.

## Red flags

- Chunks cut through the middle of a table or clause.
- No citations back to the source.
- Documents indexed once and never refreshed.
