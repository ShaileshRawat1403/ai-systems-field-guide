---
id: logs
name: "Logs & metrics"
kind: "OBSERVABILITY"
trunk: 3
layer: observability-and-tracing
ai: false
---

# Logs & metrics

**What:** The record of what the system did, and the alerts when it misbehaves.

In an AI system, logs are also evidence. For each answer you want the prompt, the retrieved passages, the tool calls, the model version, latency and cost. Without them, a complaint about a wrong answer can’t be investigated.

## Use when

From the first day of a pilot.

## Skip when

Never. Skipping it saves a day and costs the post-mortem.

## The check

Pick a response from yesterday. Can you reconstruct exactly what the model saw and why it answered that way?

## Red flags

- Personal data in logs with no retention policy.
- Errors swallowed and replaced with a friendly message.
- Token cost first discovered on the monthly invoice.
