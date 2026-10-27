---
id: user
name: "User"
kind: "PERSON"
trunk: 1
layer: interface
ai: false
---

# User

**What:** The person, or another system, whose action starts every request.

Architecture begins here, not at the model. Who the user is decides what they may see, where the interface should live, and what a wrong answer costs. An internal analyst and a customer on a phone need very different systems behind the same feature.

## The check

Name the one action this user takes most often. Trace it through the diagram before discussing any model.

## Red flags

- Requirements written about “users” in general.
- Nobody can say who is harmed when the system is wrong.
- The pilot audience is chosen for enthusiasm, not for representing real usage.
