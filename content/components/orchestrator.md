---
id: orchestrator
name: "Orchestrator"
kind: "CONTROL"
trunk: 2
layer: orchestration-and-agents
ai: true
---

# Orchestrator

**What:** The code that runs an AI request. It builds the context, calls the model, routes tool calls, checks results and decides the next step.

This is where an AI system actually lives. The model generates; the orchestrator decides what happens with that output. Prompts, retrieval, retries, approval gates and validation are all orchestrator decisions. It can be a framework such as LangGraph or Semantic Kernel, or plain code.

## Use when

A request involves more than one model call, any retrieval, or any tool.

## Skip when

A single call with a fixed prompt. A function is enough.

## The check

Ask what happens when the model returns malformed JSON, and when a tool times out. There should be a specific answer for both.

## Red flags

- Business rules hidden inside a prompt.
- Agent loops with no step or cost limit.
- No point where a person can approve a consequential action.
