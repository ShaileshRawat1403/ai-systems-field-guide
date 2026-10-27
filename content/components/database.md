---
id: database
name: "Database"
kind: "RECORD"
trunk: 1
layer: operational-data
ai: false
---

# Database

**What:** The system’s record of truth: users, orders, tickets, conversation history. Usually relational, such as Postgres or SQL Server.

Exact facts live here and are queried exactly. A vector index finds what is similar; a database finds what is true. Keeping that line clear prevents a whole class of confident wrong answers.

## Use when

Anything that must be correct, joined, counted or audited.

## Skip when

Fuzzy “find related content” searches. That is the retriever’s job.

## The check

Ask what the primary key of the core entity is, and what happens when two people edit the same record at once.

## Red flags

- Exact facts like prices, balances or policy versions answered from embeddings.
- Backups that exist but have never been restored.
- A schema designed after the demo.
