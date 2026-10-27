# AI Systems Field Guide

**The model is one box. This is the rest of the diagram.**

So most of the AI explanations I kept running into either stopped at the model, like the model was the whole system, or they went so deep into one framework that you came out knowing a lot about a tool and very little about how anything fits together, and in client work it's the second kind of knowledge you end up needing every single day.

When someone asks a company's HR assistant how many leave days they can carry into next year, what they see is one line of text, but behind it there's a frontend and a backend and an identity check and a database and a retriever and a model and a tool that quietly calls the HR system, and any one of those can be the reason the answer comes back wrong.

This guide is my attempt to map that whole picture, the ordinary software and the parts AI adds on top of it, in a way that someone without a computer science degree can actually use, whether they're scoping a pilot, reviewing an architecture or trying to work out why a demo that looked great fell over the first week in production.

It's written for practitioners, so every concept connects back to something you can check, a choice you'll have to make, or a way it tends to fail, and it stays neutral about vendors because the useful thing is understanding the trade-off rather than being handed a winner.

## What's inside

| | |
|---|---|
| **Architecture explorer** | A tappable diagram of an AI-integrated system. Toggle between plain software and the version with AI to see exactly what AI adds. Open [`site/public/index.html`](site/public/index.html) in a browser. |
| **Component cards** | Twelve components, each with what it is, when to use it, when to skip it, one hands-on check and the red flags that show up in real projects. See [`content/components`](content/components). |
| **Concept pages** | Each concept explained once, then shown working in three systems at one fictional company: a web app, an AI assistant and an agent using MCP. Every page has three views: Understand, Visualize and Apply. The first is [APIs and REST](content/concepts/apis-and-rest.md), with an HTTP simulator you can break on purpose. |
| **Guided tours** | One request followed step by step across the diagram, with what can go wrong at each step. Start with [Follow a question](content/tours/leave-question.md). |
| **The stack map** | Nineteen layers of the current stack, from interface to adoption, with tools, cloud equivalents and trade-offs. In progress, see [`content/README.md`](content/README.md). |

## How it's organized

Everything hangs off four questions:

1. **How software works**: the frontend, backend, data, integration and infrastructure every system still needs.
2. **How AI changes it**: models, orchestration, retrieval, tools and memory.
3. **How to build and operate it**: delivery, observability, evaluation and cost.
4. **How to deploy it into an organization**: security, governance, adoption and handover.

## How the repo works

Content lives as plain Markdown and YAML, and the site is generated from those same files, so the repo reads well on GitHub and the explorer never drifts from it.

```
content/
  components/     one Markdown card per component on the diagram
  concepts/       one page per concept, with its three systems and its views
  tours/          guided tours, readable top to bottom
data/
  diagram.json    positions and connections for the explorer
  layers.json     the nineteen layers of the stack map
  stack/          tool landscapes per layer, each entry dated and sourced
docs/design.md    the decisions behind the guide and the full concept inventory
templates/        copy these to add a component, a concept or a stack layer
scripts/          validate.mjs checks every file's shape, build.mjs builds the site
site/
  src/            page templates and Apply experiments
  public/         the built site
```

Tool lists go stale fast, so every tool entry records the month it was last verified and the source it was checked against. The validator warns when an entry is more than six months old.

## Run it locally

You need Node 20 or later.

```bash
npm install
npm run check    # validate the content, then rebuild everything in site/public
```

Then open `site/public/index.html` in a browser. There's no server and no framework yet.

## Status

Prototype 0.2. The explorer, twelve component cards, one tour and the first concept page are in place. The full concept inventory and build order are in [docs/design.md](docs/design.md). The stack map is being filled in one trunk at a time, starting with how AI changes the system.

## Contributing

Corrections, sharper red flags and better checks are all welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) first, because the card format and the neutrality rules are what keep this useful.

## License

Content is [CC BY 4.0](LICENSE-CONTENT.md). Code is [MIT](LICENSE). Product names belong to their owners, and listing one is not an endorsement.
