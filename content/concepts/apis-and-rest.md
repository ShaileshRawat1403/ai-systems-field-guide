---
id: apis-and-rest
name: "APIs and REST"
layer: application-and-apis
phase: 2
components: [frontend, backend, orchestrator, tool-layer]
related: [http, schemas-and-validation, authentication-and-authorization, tool-calling, mcp]
apply: simulator
---

# APIs and REST

**What:** An API is a contract that lets one program ask another for data or actions without knowing how the other one works inside.

The contract says which addresses exist, which methods each one accepts, what inputs it needs and what shape the reply will take. REST is the most common style for web APIs. It treats things as resources with addresses, like `/v1/leave-requests`, and uses HTTP methods as verbs: GET reads, POST creates, PUT and PATCH update, DELETE removes. As long as the contract holds, either side can be rewritten without breaking the other, which is the whole reason APIs exist.

## Use when

Two systems owned by different teams, or built at different times, need to exchange data or trigger actions.

## Skip when

Both parts live in one codebase and always change together, where a plain function call is simpler. Also skip it for high-volume event streams, where a queue fits better than request and response.

## The check

Find the API's written specification, usually an OpenAPI document or a docs page. Make one successful call, then repeat it with an expired token and with a required field missing. You should get a 401 and a 422 (or 400), each with an error message that tells the caller what to fix.

## Red flags

- There is no written contract, and the documentation is "ask the developer".
- Every error comes back as 200 with a message inside, or as 500 for everything.
- Breaking changes ship without a new version, so callers find out in production.
- Endpoints return whole database rows, including fields the caller should never see.

## In three systems

### Web app

**Who calls:** the leave portal, from the employee's browser.

When Priya opens the leave page, the frontend sends `GET /v1/employees/me/leave-balance` along with her session cookie. The backend checks the session, reads the database and returns a small JSON object, which the page turns into a number on screen. The browser never touches the database. The API is the only way in.

Path: user → portal → api → backend → database

Carries: session cookie

1. Priya opens the leave page in her browser.
2. The portal calls the HR API with her session cookie.
3. The backend confirms the session belongs to Priya.
4. It reads her balance from the database.
5. JSON comes back, and the page shows 11 days.

### AI assistant

**Who calls:** the Ask HR orchestrator, on Priya's behalf.

When Priya asks the assistant how many days she can carry over, the model can't read the HR database, so the orchestrator offers it a tool built on the same endpoint. The model asks for the tool, the orchestrator makes the HTTP call with Priya's token rather than a shared key, and the JSON goes back to the model to write the answer. The API's schema often becomes the tool's description too, so a clear contract makes the model better at using it.

Path: user → assistant → model → assistant → api → backend → database

Carries: Priya's token

1. Priya asks Ask HR a question in chat.
2. The orchestrator sends it to the model with a list of available tools.
3. The model replies with a tool request, not an answer.
4. The orchestrator calls the same HR API, passing Priya's token.
5. The backend checks the token, reads the database and returns JSON.
6. The model writes the answer from that JSON.

### Agent with MCP

**Who calls:** any approved MCP client, such as a desktop assistant or an internal agent, through the HR MCP server.

The HR MCP server wraps the same endpoint as a tool called `get_leave_balance`, with a name, a description and an input schema that any client can discover by asking the server which tools it offers. Underneath, it makes the same REST call. What MCP adds is discovery and a standard way to call tools, so one integration serves every compatible client instead of one custom integration per assistant. Priya signs in through OAuth, so the server acts with her permissions and nobody else's.

Path: user → mcp-client → mcp-server → api → backend → database

Carries: OAuth token

1. Priya uses an AI app that is connected to the HR MCP server.
2. The app asks the MCP server which tools it offers and finds get_leave_balance.
3. When she asks about her leave, the app calls that tool through MCP.
4. The MCP server translates the call into the same REST request.
5. The backend checks her OAuth token and returns JSON.

## Across all three

The endpoint never changed. Three callers used one contract, and what differed was who made the call and how Priya's identity travelled with it: a session cookie from the browser, a token passed along by the orchestrator, an OAuth grant through MCP. When an AI integration leaks data, it is usually because that identity got dropped somewhere along the way and a shared key took its place.
