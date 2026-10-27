---
id: backend
name: "Backend"
kind: "APPLICATION"
trunk: 1
layer: application-and-apis
ai: false
---

# Backend

**What:** The server-side application that validates input, applies business rules and decides what happens.

Every request lands here first. It checks who is asking, whether the input is valid and what the rules allow, then reads or writes data. When AI arrives, the backend still owns these decisions. The orchestrator works on its behalf.

## Use when

There are rules, data or secrets involved, which is almost always.

## Skip when

A static page, or a thin prototype on a platform that provides one for you.

## The check

Send one request with a missing field and one with a wrong type. A good backend rejects both with a clear 4xx error, not a 500.

## Red flags

- Validation that exists only in the frontend.
- Model output written to the database without a schema check.
- One giant endpoint that does everything.
