---
id: leave-question
title: "Follow a question"
diagram: core
---

# Follow a question

**Scenario:** An HR assistant at a company with offices in India. One employee, one question.

Each step lists the path the request takes across the diagram. The site animates that path; here you can read it straight through.

## 1. Priya asks a question

Path: user → frontend

An employee in the Pune office types into the HR assistant: “How many leave days can I carry into next year?” The frontend captures the text and nothing else.

**What can go wrong:** If the assistant lives in a new app nobody opens, the pipeline below never runs. Put it where people already work.

## 2. The request reaches the backend

Path: frontend → backend

The frontend sends an HTTPS request carrying the question and Priya’s session token. It makes no decision about what she is allowed to see.

**What can go wrong:** If the frontend calls the model directly, the API key ships to every browser that loads the page.

## 3. Who is asking?

Path: backend → auth

The backend checks the token with the company’s identity provider. Now the system knows this is Priya, India entity, standard employee grade. That identity travels with every step that follows.

**What can go wrong:** Drop the identity here and retrieval later searches every document, including ones she has no right to read.

## 4. Load the facts the system already holds

Path: backend → database

The backend reads her employee ID and the last few turns of the conversation from the database. These are exact facts, so they come from the record of truth, not from a model.

**What can go wrong:** Conversation history with no length limit slowly fills the context window and raises the cost of every turn.

## 5. Hand off to the orchestrator

Path: backend → orchestrator

The backend passes the question, Priya’s identity and the recent history to the orchestrator. From here the orchestrator runs the AI work, still inside the rules the backend set.

**What can go wrong:** If the orchestrator receives a shared service identity instead of Priya’s, every permission check after this point is meaningless.

## 6. Find the relevant policy

Path: orchestrator → retriever → vector-index

The retriever turns the question into an embedding and searches the policy index, filtered to India policies Priya may read. Five passages come back, led by Leave Policy 2026, section 4.2.

**What can go wrong:** If the right section never arrives, the model answers from general knowledge. Fluently, and wrong.

## 7. The model reads, and asks for data

Path: orchestrator → llm

The orchestrator sends instructions, the retrieved passages and the question. The model sees that the policy caps carry-over at 8 days, but it can’t answer without her balance. So instead of an answer, it returns a tool request: get_leave_balance.

**What can go wrong:** Without a tool, the model may guess a balance. A guessed number in an HR answer becomes a support ticket, or a grievance.

## 8. A governed action

Path: orchestrator → tool-layer → client-systems

The tool layer checks the request: read-only, and only for Priya’s own employee ID. It calls the HR system’s API, which reports 11 unused days.

**What can go wrong:** If the tool accepts any employee ID the model supplies, one cleverly worded question can read a colleague’s record.

## 9. Write the answer

Path: orchestrator → llm

With the policy and her balance both in context, the model drafts the reply: 11 unused days, up to 8 carry over under section 4.2, and the remaining 3 lapse on 31 December.

**What can go wrong:** If citations aren’t required, the model may drop the source, and nobody can verify the answer without asking HR.

## 10. Check, then record

Path: orchestrator → backend → logs

Before anything reaches Priya, the orchestrator confirms the cited section exists and the numbers match the tool result. The backend logs the prompt, passages, tool call, model version, latency and cost.

**What can go wrong:** Skip the check and a wrong number goes out with full confidence. Skip the log and nobody can explain afterwards why it happened.

## 11. The answer arrives

Path: backend → frontend → user

Priya sees the answer with a link to section 4.2. Every component on this diagram took part in it, and she saw a single text box. Making that gap invisible is the work.

**What can go wrong:** If she can’t see where the answer came from, she emails HR anyway, and adoption quietly stalls.
