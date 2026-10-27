---
id: client-systems
name: "Client systems"
kind: "INTEGRATION"
trunk: 1
layer: integration
ai: false
---

# Client systems

**What:** The systems the client already runs: CRM, ERP, ticketing, HR, document stores.

These are the systems of record, and they existed long before the AI project. Most production effort goes into working with them: their APIs, rate limits, data quality and owners.

## Use when

Always present in enterprise work. The real question is which ones the pilot needs.

## Skip when

Systems that are nice to have. One well-integrated system beats four shallow ones.

## The check

For each system in scope, name the API, the person who approves access and the rate limit. Get all three before committing to a timeline.

## Red flags

- “We’ll sort out API access later.”
- Integration through screen scraping.
- Nobody on the client side owns the data.
