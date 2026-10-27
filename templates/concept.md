---
id: concept-id                 # must match the file name
name: "Concept name"
layer: application-and-apis    # its one home, see data/layers.json
phase: 2                       # where the default path reaches it, 1 to 5 (see docs/design.md)
components: [backend]          # boxes on the explorer this concept lives inside
related: [http, mcp]           # other concept ids
apply: simulator               # simulator | example | trace
---

# Concept name

**What:** One sentence a newcomer can repeat back.

A short explanation that builds understanding: how it works, and the one idea people usually miss. Keep it to one paragraph.

## Use when

The situation where this concept earns its place.

## Skip when

The situation where it adds cost without value.

## The check

One hands-on test that produces evidence, not an opinion.

## Red flags

- What failure looks like in a real project.

## In three systems

Include this section when the concept shows up in ordinary software as well as AI systems. Each block uses the same Nimbus Freight systems, so readers recognize them from page to page.

### Web app

**Who calls:** who or what uses the concept in the leave portal.

What happens, in two to four sentences.

Path: user → portal → api → backend → database

Carries: what identity or data travels along the path

1. First step, in plain words.
2. Next step.

### AI assistant

**Who calls:** ...

Path: user → assistant → model → assistant → api

Carries: ...

1. ...

### Agent with MCP

**Who calls:** ...

Path: user → mcp-client → mcp-server → api

Carries: ...

1. ...

## Across all three

What stayed the same across the three systems, what changed, and why that difference matters in production.
