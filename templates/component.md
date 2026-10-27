---
id: component-id            # must match the file name
name: "Component name"
kind: "SHORT LABEL"         # shown above the name on the diagram, e.g. CONTEXT
trunk: 2                    # 1-4, see data/trunks.json
layer: context-and-retrieval  # see data/layers.json
ai: true                    # true if this component exists only because AI was added
---

# Component name

**What:** One sentence a newcomer can repeat back.

Two to four sentences that build understanding: how it works, where it sits, and the one idea people usually miss.

## Use when

The situation where this component earns its place.

## Skip when

The situation where it adds cost without value. Neutral, never a product recommendation.

## The check

One hands-on test a practitioner can run in under an hour. It should produce evidence, not an opinion.

## Red flags

- What failure looks like in a real project.
- Write each one so someone could spot it in a meeting or a codebase.
