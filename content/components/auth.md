---
id: auth
name: "Auth"
kind: "IDENTITY"
trunk: 1
layer: identity
ai: false
---

# Auth

**What:** Authentication confirms who someone is. Authorization decides what they may do.

Much of enterprise AI risk sits here. When an assistant searches documents or calls tools, it must act with the permissions of the person asking, not a shared admin account. Retrieval that ignores permissions leaks data politely.

## Use when

Always, for anything that touches real data. Use the client’s identity provider (Entra ID, Okta, Google).

## Skip when

Only for public content with nothing to protect. Never build your own login.

## The check

Log in as a low-permission user and ask about a document only managers can see. The assistant should not know it exists.

## Red flags

- One service account with access to everything.
- Permissions checked at login but not on each tool call.
- Tokens stored in browser storage or printed in logs.
