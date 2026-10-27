---
id: vector-index
name: "Vector index"
kind: "SEARCH"
trunk: 2
layer: context-and-retrieval
ai: true
---

# Vector index

**What:** A store that holds embeddings and finds the ones nearest to a query. Examples: pgvector, Azure AI Search, Pinecone.

An embedding is a list of numbers that stands for meaning, so “leave policy” and “vacation rules” land close together. The index is a search structure, not a record of truth.

## Use when

Semantic search over a large text collection.

## Skip when

A separate product, when pgvector inside the existing Postgres is enough.

## The check

Change one source document and ask about it again. If the answer doesn’t change, find out how re-indexing works.

## Red flags

- Access permissions not stored alongside the chunks.
- No way to delete one document’s vectors.
- Embeddings from two different models mixed in one index.
