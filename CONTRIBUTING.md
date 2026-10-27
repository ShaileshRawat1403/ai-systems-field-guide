# Contributing

This guide is useful only if it stays accurate, neutral and practical. These rules exist to protect those three things.

## What makes a good contribution

- **A red flag you've actually seen.** Write it so someone could spot it in a meeting or a codebase.
- **A sharper check.** A check is a test someone can run in under an hour that produces evidence, not an opinion.
- **A correction with a source.** If something is wrong or out of date, link to where you confirmed it.
- **A missing tool or cloud service** in a stack layer, with a source and a verified date.

## The rules

**Stay neutral.** Describe trade-offs and the conditions that tip them. Don't name a winner, and don't write marketing copy for a product you like.

**Keep tools in alphabetical order.** Order should never read as a ranking. The validator enforces this.

**Date and source every tool entry.** Each option in `data/stack/` needs `verified` (year and month) and `source` (the page you checked). Entries older than six months get flagged.

**Disclose affiliations.** If you work for, invest in or are paid by a vendor you're adding or editing, say so in the pull request.

**Keep the card format.** Components follow [`templates/component.md`](templates/component.md): What, a short explanation, Use when, Skip when, The check, Red flags. Stack layers follow [`templates/stack-layer.yaml`](templates/stack-layer.yaml).

**Write plainly.** Short sentences, everyday words and no hype. If a newcomer can't repeat the "What" line back to you, rewrite it.

## How to submit

1. Fork the repo and make your change.
2. Run `npm install` and then `npm run check`. It validates every file and rebuilds `site/public/index.html`.
3. Commit the rebuilt page together with your change, since CI fails if they drift apart.
4. Open a pull request that says what changed and why, with sources.

One topic per pull request makes review faster.

## Adding a component to the diagram

Components are the boxes on the explorer, so adding one means three changes:

1. A card in `content/components/<id>.md`, copied from the template.
2. A node in `data/diagram.json` with its grid position, plus edges to the components it talks to.
3. A layer id from `data/layers.json` in the card's frontmatter.

The diagram is meant to stay readable on a phone, so new components are rare. Most additions belong in a stack layer instead.
