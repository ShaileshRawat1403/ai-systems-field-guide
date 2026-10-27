# Design record

This file holds the decisions that shape the guide, so contributors and future maintainers can see why it is built the way it is. Change it when a decision changes, and say why.

## The principle

This is a practitioner's field guide, not a course and not a glossary. Every concept connects understanding to real implementation, architectural choices, failure modes and production consequences.

## The content model

### One home per concept

Each concept has exactly one page, filed under one layer. Everything else in the guide (paths, tours, architectures) points at that page instead of repeating it.

### Three views per concept

| View | What it holds | Source |
|---|---|---|
| **Understand** | What it is, use when, skip when, the check, red flags | `content/concepts/<id>.md` |
| **Visualize** | Where the concept lives in a system, with the active parts highlighted | Diagram data plus the concept's `visual` section |
| **Apply** | Something to try: a simulator, a runnable example or a recorded trace | `site/src/experiments/`, `examples/` |

### Three contexts per concept

Concepts used by both ordinary software and AI systems are explained once, then shown working in three systems that share one backend:

| Context | System at Nimbus Freight |
|---|---|
| **Web app** | The leave portal employees use in the browser |
| **AI assistant** | "Ask HR", which answers questions in chat |
| **Agent with MCP** | The HR MCP server, which exposes HR actions to any MCP client |

The context switch applies to all three views at once, so a reader can hold the concept still and watch the system around it change.

### The running example world

Nimbus Freight is a fictional mid-sized logistics company with offices in Pune and Chennai. Using one company everywhere means readers recognize the systems as they move through the guide, instead of decoding a new scenario on every page. Its people, systems and data are invented.

### Components, concepts and tools

- **Components** are the boxes on the explorer diagram (Backend, Retriever, Tool layer). There are few of them and they rarely change. `content/components/`
- **Concepts** are the ideas a practitioner needs (HTTP, embeddings, idempotency). Each one lives inside one or more components. `content/concepts/`
- **Tools** are products and frameworks (FastAPI, LangGraph, pgvector). They are listed in the stack data with a verified date and linked to the concepts they implement. They never get concept pages of their own, because concepts outlive tools. `data/stack/`

### Paths are playlists

A learning path is an ordered list of concept ids. It never owns content, so new paths can be added without moving anything. The default path is below.

### Architectures are compositions

Reference architectures and tours are built from components and concepts. They show how the pieces combine, and link back to each piece for depth.

## Apply tiers

Not everything can run in a browser, so Apply comes in three tiers:

1. **Simulator.** Runs entirely in the page. Cheap, always available. Used where interaction changes understanding, such as an HTTP request builder or a chunk-size slider.
2. **Runnable example.** Real code in `examples/<id>/`, opened in GitHub Codespaces or run locally. Used for FastAPI, Docker, Git and CI.
3. **Trace.** A recorded run of a real model or agent, replayed step by step. Used for model behavior, because a public site can't ship API keys. Bring-your-own-key live calls may come later as an option.

About fifteen concepts get a signature simulator. The rest get an example or a trace.

## Reference implementation

Examples use Python, with FastAPI and Pydantic, and TypeScript where a browser is involved. This is a reference implementation chosen for readability, not a recommendation. Stack pages stay neutral.

## Organization

Four trunks, nineteen layers. The trunks are questions a practitioner asks; layers are where concepts live.

## The default path and concept inventory

The path follows five phases. Each concept below has one home layer; the phase says when the default path reaches it.

| Phase | Goal |
|---|---|
| 1. System fundamentals | Explain how an ordinary app works end to end |
| 2. Data and interfaces | Read and define the contracts between systems |
| 3. Architecture decisions | Reason about state, failure and scale |
| 4. AI integration | Explain what AI adds and how it is controlled |
| 5. Applied system design | Build, test, troubleshoot and explain a complete system |

### 1. How software works

| Layer | Concept | Phase |
|---|---|---|
| Interface | Client and server | 1 |
| Interface | Frontend and UI state | 1 |
| Application and APIs | Request and response | 1 |
| Application and APIs | Backend and business logic | 1 |
| Application and APIs | HTTP | 2 |
| Application and APIs | APIs and REST | 2 |
| Application and APIs | Services and monoliths | 3 |
| Application and APIs | Reliability: retries, timeouts, idempotency | 3 |
| Data and contracts | JSON and YAML | 2 |
| Data and contracts | Schemas and validation | 2 |
| Data and contracts | Structured outputs | 4 |
| Identity and access | Authentication and authorization | 3 |
| Operational data | Databases and SQL | 1 |
| Operational data | State | 3 |
| Storage and caching | Caching | 3 |
| Storage and caching | Object storage | 3 |
| Integration | Webhooks | 3 |
| Integration | Queues and async work | 3 |
| Infrastructure and hosting | Networking: DNS, ports, HTTPS | 1 |
| Infrastructure and hosting | Containers | 5 |
| Infrastructure and hosting | Hosting and serverless | 5 |

### 2. How AI changes it

| Layer | Concept | Phase |
|---|---|---|
| Models and serving | LLMs | 4 |
| Models and serving | Tokens and context windows | 4 |
| Models and serving | Inference and sampling | 4 |
| Orchestration and agents | Prompts | 4 |
| Orchestration and agents | Orchestration and workflows | 4 |
| Orchestration and agents | Agents and the agent loop | 4 |
| Orchestration and agents | Human in the loop | 4 |
| Context and retrieval | Context engineering | 4 |
| Context and retrieval | Embeddings | 4 |
| Context and retrieval | RAG | 4 |
| Context and retrieval | Chunking and reranking | 4 |
| Tools and protocols | Tool calling | 4 |
| Tools and protocols | MCP | 4 |
| Memory and state | AI memory | 4 |

### 3. How to build and operate it

| Layer | Concept | Phase |
|---|---|---|
| Delivery | Version control | 5 |
| Delivery | Testing | 5 |
| Delivery | CI/CD | 5 |
| Delivery | Environments and rollback | 5 |
| Observability and tracing | Logging and tracing | 5 |
| Observability and tracing | Debugging a system | 5 |
| Evaluation and guardrails | Evaluations | 5 |
| Evaluation and guardrails | Guardrails | 5 |
| AI gateway and cost control | Cost, latency and rate limits | 5 |

### 4. How to deploy it into an organization

| Layer | Concept | Phase |
|---|---|---|
| Security and data governance | Secrets management | 3 |
| Security and data governance | Prompt injection and AI security | 5 |
| Security and data governance | Data governance and residency | 5 |
| Adoption and handover | Scoping a pilot | 5 |
| Adoption and handover | Handover and ownership | 5 |

## Build order

1. One concept end to end (APIs), to test the model on a real page.
2. The stack data for "How AI changes it", researched and dated.
3. Phase 1 and 2 concepts, since every later concept leans on them.
4. A migration from the generated single page to Astro with interactive islands, once there are enough concept pages to justify it.

## Decisions log

| Date | Decision |
|---|---|
| 2026-10-27 | Neutral catalog: trade-offs, never picks. Tools listed alphabetically. |
| 2026-10-27 | AWS, Azure and GCP equivalents for every stack category. |
| 2026-10-27 | Views instead of branches; one home per concept. |
| 2026-10-27 | Tools are implementations inside concepts, never concepts. |
| 2026-10-27 | Nimbus Freight as the single running example. |
| 2026-10-27 | Python with FastAPI and Pydantic as the reference implementation. |
| 2026-10-27 | Added the Data and contracts layer. |
