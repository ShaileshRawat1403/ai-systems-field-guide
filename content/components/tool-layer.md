---
id: tool-layer
name: "Tool layer"
kind: "ACTIONS · MCP"
trunk: 2
layer: tools-and-protocols
ai: true
---

# Tool layer

**What:** The controlled set of actions a model may request: look up a record, create a ticket, run a query. MCP is a standard way to expose these to AI clients.

The model never touches a system directly. It asks to call a tool with arguments; your code validates the request, checks permissions and executes it. Each tool is an API contract plus a description the model reads to decide when to use it.

## Use when

The AI must read live data or take action. Start read-only.

## Skip when

Retrieval over documents already answers the question.

## The check

Ask the assistant to do something its user is not allowed to do. The tool layer, not the prompt, should refuse.

## Red flags

- Write or delete tools with no approval step.
- Tool descriptions so vague the model guesses.
- Tool output passed back unfiltered, so text inside a record can instruct the model.
