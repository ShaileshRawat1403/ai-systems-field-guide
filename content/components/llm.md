---
id: llm
name: "LLM"
kind: "MODEL"
trunk: 2
layer: models-and-serving
ai: true
---

# LLM

**What:** The model that reads text and generates text. It predicts likely output. It does not look facts up.

The same input can produce different output. The model knows its training data plus whatever you place in the context window, which is limited and billed by the token. A hallucination is the model filling a gap fluently.

## Use when

Language work: summarizing, drafting, extracting, classifying, reasoning over text you provide.

## Skip when

Arithmetic, exact lookups, and decisions a plain rule can make.

## The check

Run the same prompt ten times. Measure how often the answer changes, and whether any version is wrong.

## Red flags

- The model treated as the source of truth.
- No pinned model version, so behavior shifts silently.
- The largest model chosen before anyone measured whether a smaller one passes.
