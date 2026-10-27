# The stack map

Nineteen layers, grouped under the guide's four questions. Each layer will get a page covering what it does, the concepts inside it, the current tool landscape with AWS, Azure and GCP equivalents, neutral trade-offs and red flags. Components already on the explorer diagram are linked.

The tool landscapes live in [`data/stack/`](../data/stack) and render as the stack map page (`site/public/stack.html`). "In progress" means the landscape is published and the layer's concept pages are still being written.

**Status key:** planned · in progress · published

## 1. How software works

| Layer | On the diagram | Status |
|---|---|---|
| Interface | [User](components/user.md), [Frontend](components/frontend.md) | planned |
| Application and APIs | [Backend](components/backend.md) | planned |
| Data and contracts | | planned |
| Identity and access | [Auth](components/auth.md) | planned |
| Operational data | [Database](components/database.md) | planned |
| Storage and caching | | planned |
| Integration | [Client systems](components/client-systems.md) | planned |
| Infrastructure and hosting | | planned |

## 2. How AI changes it

| Layer | On the diagram | Status |
|---|---|---|
| Models and serving | [LLM](components/llm.md) | in progress |
| Orchestration and agent frameworks | [Orchestrator](components/orchestrator.md) | in progress |
| Context and retrieval | [Retriever](components/retriever.md), [Vector index](components/vector-index.md) | in progress |
| Tools and protocols | [Tool layer](components/tool-layer.md) | in progress |
| Memory and state | | in progress |

## 3. How to build and operate it

| Layer | On the diagram | Status |
|---|---|---|
| Delivery | | planned |
| Observability and tracing | [Logs & metrics](components/logs.md) | planned |
| Evaluation and guardrails | | planned |
| AI gateway and cost control | | planned |

## 4. How to deploy it into an organization

| Layer | On the diagram | Status |
|---|---|---|
| Security and data governance | | planned |
| Adoption and handover | | planned |

## Tours

- [Follow a question](tours/leave-question.md): one HR question traced through every component.
