---
id: frontend
name: "Frontend"
kind: "INTERFACE"
trunk: 1
layer: interface
ai: false
---

# Frontend

**What:** The screens and controls people use. It collects input and shows results.

The frontend is untrusted territory. Anything it sends can be altered by the person using it, so it displays and collects but never decides what is allowed. Those decisions stay in the backend.

## Use when

The workflow is specific enough that existing tools can’t carry it.

## Skip when

The work already lives in Teams, Slack, email or an existing app. Meet users there.

## The check

Open the browser’s network tab, perform one action, and find the request it sends. You should be able to name the endpoint and the data.

## Red flags

- API keys visible in the page source.
- Permissions enforced only by hiding buttons.
- An AI feature with no loading, failure or “I don’t know” state.
