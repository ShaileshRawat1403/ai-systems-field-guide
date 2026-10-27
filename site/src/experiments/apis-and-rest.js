// Apply experiment for "APIs and REST": an HTTP request builder against a simulated
// Nimbus Freight HR API. Everything runs in the page; nothing leaves the browser.
// Responses mirror what FastAPI and Pydantic return, though exact wording varies by version.
window.FG_EXPERIMENT = (() => {
  // Diagram for the Visualize view: three callers converging on one API.
  const diagram = {
    viewBox: '0 0 360 470',
    nodes: [
      { id: 'user', name: 'Priya', kind: 'EMPLOYEE', x: 180, y: 14, w: 100, pill: true },
      { id: 'portal', name: 'Leave portal', kind: 'WEB APP', x: 58, y: 92, w: 100 },
      { id: 'assistant', name: 'Ask HR', kind: 'ORCHESTRATOR', x: 180, y: 92, w: 100, ai: true },
      { id: 'mcp-client', name: 'MCP client', kind: 'ANY AI APP', x: 302, y: 92, w: 100, ai: true },
      { id: 'model', name: 'Model', kind: 'LLM', x: 150, y: 172, w: 84, ai: true },
      { id: 'mcp-server', name: 'HR MCP server', kind: 'MCP', x: 302, y: 172, w: 100, ai: true },
      { id: 'api', name: 'HR API', kind: 'REST · THE CONTRACT', x: 180, y: 252, w: 120, focus: true },
      { id: 'backend', name: 'Backend', kind: 'APPLICATION', x: 180, y: 332, w: 100 },
      { id: 'database', name: 'Database', kind: 'RECORD', x: 180, y: 412, w: 100 }
    ],
    edges: [
      { from: 'user', to: 'portal', d: 'M 150 60 C 150 78, 58 74, 58 92' },
      { from: 'user', to: 'assistant', d: 'M 180 60 L 180 92' },
      { from: 'user', to: 'mcp-client', d: 'M 210 60 C 210 78, 302 74, 302 92' },
      { from: 'assistant', to: 'model', d: 'M 150 138 L 150 172' },
      { from: 'mcp-client', to: 'mcp-server', d: 'M 302 138 L 302 172' },
      { from: 'portal', to: 'api', d: 'M 58 138 L 58 275 L 120 275' },
      { from: 'assistant', to: 'api', d: 'M 210 138 L 210 252' },
      { from: 'mcp-server', to: 'api', d: 'M 302 218 L 302 275 L 240 275' },
      { from: 'api', to: 'backend', d: 'M 180 298 L 180 332' },
      { from: 'backend', to: 'database', d: 'M 180 378 L 180 412' }
    ]
  };

  const HOST = 'hr-api.nimbusfreight.example';
  const CALLER = {
    web: { label: 'the leave portal', ua: 'Mozilla/5.0 (Nimbus leave portal)', auth: v => `Cookie: session=${v}`, good: 's_7f3c9a21d4', bad: 's_7f3c9a21d4 (expired)' },
    assistant: { label: 'the Ask HR orchestrator', ua: 'ask-hr-orchestrator/1.4', auth: v => `Authorization: Bearer ${v}`, good: 'eyJhbGciOi…priya', bad: 'eyJhbGciOi…priya (expired)' },
    mcp: { label: 'the HR MCP server', ua: 'hr-mcp-server/0.9', auth: v => `Authorization: Bearer ${v}`, good: 'mcp_oauth_…priya', bad: 'mcp_oauth_…priya (expired)' }
  };
  const CTX_NAME = { web: 'the web app', assistant: 'the AI assistant', mcp: 'the MCP agent' };
  const STATUS = { 200: 'OK', 201: 'Created', 204: 'No Content', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 422: 'Unprocessable Content', 429: 'Too Many Requests' };

  const PATHS = [
    { value: '/v1/employees/me/leave-balance', label: '/v1/employees/me/leave-balance' },
    { value: '/v1/employees/E-2077/leave-balance', label: '/v1/employees/E-2077/leave-balance (a colleague)' },
    { value: '/v1/leave-requests', label: '/v1/leave-requests' },
    { value: '/v1/leave-requests/LR-3391', label: '/v1/leave-requests/LR-3391' },
    { value: '/v1/leave-balance', label: '/v1/leave-balance (a wrong address)' }
  ];
  const PRESETS = {
    valid: { label: 'Valid', body: '{\n  "start_date": "2026-12-22",\n  "end_date": "2026-12-24",\n  "leave_type": "annual"\n}' },
    missing: { label: 'Missing field', body: '{\n  "start_date": "2026-12-22",\n  "leave_type": "annual"\n}' },
    order: { label: 'End before start', body: '{\n  "start_date": "2026-12-24",\n  "end_date": "2026-12-22",\n  "leave_type": "annual"\n}' },
    type: { label: 'Unknown leave type', body: '{\n  "start_date": "2026-12-22",\n  "end_date": "2026-12-24",\n  "leave_type": "holiday"\n}' },
    broken: { label: 'Broken JSON', body: '{\n  "start_date": "2026-12-22",\n  "end_date": "2026-12-24",\n  leave_type: annual\n}' }
  };
  const EXISTING = { id: 'LR-3391', start_date: '2026-11-16', end_date: '2026-11-18', leave_type: 'annual', days: 3, status: 'approved' };

  // The reference implementation shown under "Server side". Tags link lines to outcomes.
  const CODE = [
    ['from datetime import date'],
    ['from typing import Literal'],
    ['from fastapi import Depends, FastAPI, HTTPException'],
    ['from pydantic import BaseModel, model_validator'],
    [''],
    ['app = FastAPI()'],
    [''],
    ['class LeaveRequest(BaseModel):'],
    ['    start_date: date', 'f-start_date'],
    ['    end_date: date', 'f-end_date'],
    ['    leave_type: Literal["annual", "sick", "unpaid"]', 'f-leave_type'],
    [''],
    ['    @model_validator(mode="after")', 'v-order'],
    ['    def end_after_start(self):', 'v-order'],
    ['        if self.end_date < self.start_date:', 'v-order'],
    ['            raise ValueError("end_date must be on or after start_date")', 'v-order'],
    ['        return self'],
    [''],
    ['# current_user (not shown) reads the cookie or bearer token', 'auth'],
    ['# and raises 401 when it is missing or expired.', 'auth'],
    [''],
    ['@app.get("/v1/employees/{employee_id}/leave-balance")', 'r-balance'],
    ['def leave_balance(employee_id: str, user=Depends(current_user)):', 'auth-balance'],
    ['    if employee_id not in ("me", user.id):', 'deny'],
    ['        raise HTTPException(403, "You can only view your own leave balance")', 'deny'],
    ['    return balances.for_employee(user.id)', 'ok-balance'],
    [''],
    ['@app.post("/v1/leave-requests", status_code=201)', 'r-requests'],
    ['def create_leave_request(body: LeaveRequest, user=Depends(current_user)):', 'auth-requests body'],
    ['    return leave_requests.create(user.id, body)', 'ok-create'],
    [''],
    ['@app.delete("/v1/leave-requests/{request_id}", status_code=204)', 'r-request'],
    ['def cancel_leave_request(request_id: str, user=Depends(current_user)):', 'auth-request'],
    ['    leave_requests.cancel(user.id, request_id)', 'ok-cancel'],
    [''],
    ['# The GET routes for listing and reading requests are left out to keep this short.', 'omitted']
  ];

  // What each outcome means, plus how it plays out in each system.
  const EXPLAIN = {
    ok: {
      text: 'Success. The request matched a route, the credentials checked out, and the backend returned data in the shape the contract promises.',
      web: 'The page turns this JSON into a number on screen. It never sees the database.',
      assistant: 'This JSON goes back to the model, which writes the answer from it. The model saw the result, never the credentials.',
      mcp: 'The MCP server hands this back as the tool result to whichever client called it.'
    },
    created: {
      text: 'Created. The body passed validation, so the backend stored a new leave request and said where to find it in the Location header.',
      web: 'In the portal, Priya pressed Submit, so the intent is clearly hers.',
      assistant: 'This call changed data. In a governed assistant, Priya confirms the request before the orchestrator sends it, because a model misreading “next week” should never file leave on its own.',
      mcp: 'MCP clients usually ask the user to approve tool calls that change data. Keeping write tools separate from read tools lets them be approved separately.'
    },
    deleted: {
      text: 'Done, with nothing to send back. The leave request was cancelled, and 204 means success with an empty body.',
      web: 'The portal removes the request from the list.',
      assistant: 'Cancelling is a write action too, so it belongs behind the same confirmation step as creating.',
      mcp: 'Destructive tools deserve their own approval prompt in every MCP client.'
    },
    noauth: {
      text: 'Not authenticated. The API doesn’t know who is calling, so it refuses before doing anything else.',
      web: 'The session ended or the cookie wasn’t sent. The portal should send Priya back to sign in.',
      assistant: 'The orchestrator didn’t pass Priya’s token. If an assistant still “works” without one, it is using a shared key, which means it can read data Priya shouldn’t see.',
      mcp: 'The client hasn’t finished the OAuth sign-in, so the MCP server has no user to act for.'
    },
    expired: {
      text: 'The token has expired. The caller should get a fresh one, usually by refreshing it in the background, without asking for a password again.',
      web: 'The portal can refresh the session silently, or ask Priya to sign in again if that fails.',
      assistant: 'Long conversations outlive short tokens. The orchestrator needs to refresh Priya’s token, not fall back to a service account.',
      mcp: 'MCP clients refresh OAuth tokens themselves. If refresh fails, the right move is to ask Priya to reconnect.'
    },
    forbidden: {
      text: 'Forbidden. The API knows exactly who is calling, and the answer is still no. A 401 asks “who are you?”, and a 403 says “I know who you are, and you can’t do this.”',
      web: 'The portal never shows a link to a colleague’s balance, but hiding the link isn’t security. This check is.',
      assistant: 'This is the check that stops a cleverly worded question like “what’s Rahul’s balance?” from working. It has to live in the API, because no prompt can enforce it.',
      mcp: 'One rule in the API protects every MCP client at once, because it sits behind the server rather than inside each client.'
    },
    notfound: {
      text: 'Not found. No route matches this address. The real one is /v1/employees/me/leave-balance.',
      web: 'A typo in the frontend code, caught by the first test that calls this endpoint.',
      assistant: 'If a hand-written tool description has the wrong path, the model keeps calling an address that doesn’t exist. Generating tool definitions from the API specification stops that drift.',
      mcp: 'The MCP server hides paths from clients, so a 404 here is a bug in the server’s mapping, not in the client.'
    },
    method: {
      text: 'Method not allowed. The address exists, but not for this verb. The Allow header lists what it accepts.',
      web: 'Usually a frontend bug, such as a form posting to a read-only address.',
      assistant: 'Tool definitions fix the method per tool, so the model can’t pick the wrong verb. If it happens, the tool was defined by hand and drifted.',
      mcp: 'Each MCP tool maps to one method, so this points to a mistake in the server’s mapping.'
    },
    invalid: {
      text: 'Unprocessable. The request reached the right place with valid credentials, but the body broke the contract. FastAPI and Pydantic list every problem with its exact location, so the caller can fix it.',
      web: 'The portal should show each message next to the field it belongs to, not a generic “something went wrong”.',
      assistant: 'Feed this error back to the model. A precise error lets it correct its own tool call on the next try, while a vague one makes it guess.',
      mcp: 'MCP clients pass tool errors back to their model too, so the same precision pays off for every client.'
    },
    limited: {
      text: 'Too many requests. The API limits how often one user can call it, and this caller went over. Retry-After says how many seconds to wait.',
      web: 'People rarely hit this by hand. When they do, the frontend is usually calling in a loop.',
      assistant: 'Agents retry when things fail, and a looping agent can flood an API in seconds. A well-built orchestrator reads Retry-After and backs off instead of hammering.',
      mcp: 'An agent connected through MCP can loop just as easily. The limit protects the HR API for everyone else while it does.'
    }
  };
  const CODE_NOTE = {
    ok_balance: 'The dependency found Priya, the ownership check passed, and the function returned her balance. FastAPI turned the return value into JSON.',
    ok_other: 'This response comes from one of the GET routes left out of the snippet.',
    created: 'Pydantic checked the body against LeaveRequest before the function ran, so the function only ever sees valid data.',
    deleted: 'status_code=204 tells FastAPI to send success with an empty body.',
    noauth: 'The current_user dependency runs before the function body. Without valid credentials it raises 401, and the function never runs.',
    forbidden: 'Authentication passed. These lines are the authorization check, and they live in the API, where no prompt can talk its way around them.',
    invalid: 'FastAPI validates the body against the LeaveRequest model before calling the function, and reports every error at once.',
    notfound: 'No route matches, so FastAPI answers 404 before any of this code runs.',
    method: 'The address exists only with the methods declared in these decorators. FastAPI answers 405 on its own.',
    limited: 'Rate limits usually live in middleware or an API gateway in front of this code, so none of these lines ran.'
  };

  let root = null, ctx = 'web', $ = null;

  const escHTML = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pretty = o => JSON.stringify(o, null, 2);

  function route(path) {
    let m;
    if ((m = path.match(/^\/v1\/employees\/([^/]+)\/leave-balance$/))) return { name: 'balance', methods: ['GET'], param: m[1], tag: 'r-balance' };
    if (/^\/v1\/leave-requests$/.test(path)) return { name: 'requests', methods: ['GET', 'POST'], tag: 'r-requests' };
    if ((m = path.match(/^\/v1\/leave-requests\/([^/]+)$/))) return { name: 'request', methods: ['GET', 'DELETE'], param: m[1], tag: 'r-request' };
    return null;
  }

  const isDate = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && !isNaN(Date.parse(v + 'T00:00:00Z'))
    && new Date(v + 'T00:00:00Z').toISOString().slice(0, 10) === v;

  function validate(raw) {
    let body;
    try { body = JSON.parse(raw); } catch (e) {
      return { errors: [{ type: 'json_invalid', loc: ['body', 0], msg: 'JSON decode error', input: {}, ctx: { error: 'Expecting property name enclosed in double quotes' } }], tags: ['body'] };
    }
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return { errors: [{ type: 'model_attributes_type', loc: ['body'], msg: 'Input should be a valid dictionary or object to extract fields from', input: body }], tags: ['body'] };
    }
    const errors = [], tags = [];
    for (const f of ['start_date', 'end_date']) {
      if (!(f in body)) { errors.push({ type: 'missing', loc: ['body', f], msg: 'Field required', input: body }); tags.push('f-' + f); }
      else if (!isDate(body[f])) { errors.push({ type: 'date_from_datetime_parsing', loc: ['body', f], msg: 'Input should be a valid date or datetime, invalid date format', input: body[f] }); tags.push('f-' + f); }
    }
    if (!('leave_type' in body)) { errors.push({ type: 'missing', loc: ['body', 'leave_type'], msg: 'Field required', input: body }); tags.push('f-leave_type'); }
    else if (!['annual', 'sick', 'unpaid'].includes(body.leave_type)) {
      errors.push({ type: 'literal_error', loc: ['body', 'leave_type'], msg: "Input should be 'annual', 'sick' or 'unpaid'", input: body.leave_type, ctx: { expected: "'annual', 'sick' or 'unpaid'" } });
      tags.push('f-leave_type');
    }
    if (errors.length) return { errors, tags };
    if (body.end_date < body.start_date) {
      return { errors: [{ type: 'value_error', loc: ['body'], msg: 'Value error, end_date must be on or after start_date', input: body }], tags: ['v-order'] };
    }
    return { body };
  }

  // Simulate one request and describe the outcome.
  function simulate(req) {
    const r = route(req.path);
    if (!r) return { status: 404, body: { detail: 'Not Found' }, key: 'notfound', tags: [], note: CODE_NOTE.notfound };
    if (!r.methods.includes(req.method)) {
      return { status: 405, headers: { allow: r.methods.join(', ') }, body: { detail: 'Method Not Allowed' }, key: 'method', tags: [r.tag], note: CODE_NOTE.method };
    }
    const authTags = ['auth', 'auth-' + r.name];
    if (req.identity === 'none') {
      return { status: 401, headers: ctx === 'web' ? {} : { 'www-authenticate': 'Bearer' }, body: { detail: 'Not authenticated' }, key: 'noauth', tags: authTags, note: CODE_NOTE.noauth };
    }
    if (req.identity === 'expired') {
      return { status: 401, headers: ctx === 'web' ? {} : { 'www-authenticate': 'Bearer error="invalid_token"' }, body: { detail: 'Token expired' }, key: 'expired', tags: authTags, note: CODE_NOTE.noauth };
    }
    if (r.name === 'balance') {
      if (!['me', 'E-1042'].includes(r.param)) return { status: 403, body: { detail: 'You can only view your own leave balance' }, key: 'forbidden', tags: ['deny'], note: CODE_NOTE.forbidden };
      return { status: 200, body: { employee_id: 'E-1042', year: 2026, unused_days: 11, carry_over_limit: 8, lapses_on: '2026-12-31' }, key: 'ok', tags: ['ok-balance'], note: CODE_NOTE.ok_balance };
    }
    if (r.name === 'requests' && req.method === 'GET') {
      return { status: 200, body: { items: [EXISTING] }, key: 'ok', tags: ['omitted'], note: CODE_NOTE.ok_other };
    }
    if (r.name === 'requests' && req.method === 'POST') {
      const v = validate(req.body);
      if (v.errors) return { status: 422, body: { detail: v.errors }, key: 'invalid', tags: v.tags, note: CODE_NOTE.invalid };
      const days = Math.round((Date.parse(v.body.end_date) - Date.parse(v.body.start_date)) / 864e5) + 1;
      return {
        status: 201, headers: { location: '/v1/leave-requests/LR-3412' },
        body: { id: 'LR-3412', start_date: v.body.start_date, end_date: v.body.end_date, leave_type: v.body.leave_type, days, status: 'pending_approval' },
        key: 'created', tags: ['r-requests', 'ok-create'], note: CODE_NOTE.created
      };
    }
    if (r.name === 'request' && req.method === 'GET') {
      if (r.param !== EXISTING.id) return { status: 404, body: { detail: 'Leave request not found' }, key: 'notfound', tags: ['omitted'], note: CODE_NOTE.ok_other };
      return { status: 200, body: EXISTING, key: 'ok', tags: ['omitted'], note: CODE_NOTE.ok_other };
    }
    return { status: 204, body: null, key: 'deleted', tags: ['r-request', 'ok-cancel'], note: CODE_NOTE.deleted };
  }

  function readRequest() {
    return { method: $('#simMethod').value, path: $('#simPath').value, identity: $('#simIdentity').value, body: $('#simBody').value };
  }

  function requestText(req) {
    const c = CALLER[ctx];
    const lines = [`${req.method} ${req.path} HTTP/1.1`, `Host: ${HOST}`];
    if (req.identity !== 'none') lines.push(c.auth(req.identity === 'expired' ? c.bad : c.good));
    lines.push(`User-Agent: ${c.ua}`);
    if (req.method === 'POST') lines.push('Content-Type: application/json', '', req.body);
    return lines.join('\n');
  }

  function codeHTML(tags) {
    const on = new Set(tags);
    const tok = /("[^"]*")|(#.*$)|(@[\w.]+)|\b(from|import|class|def|return|if|not|in|raise)\b/g;
    return CODE.map(([line, t = '']) => {
      const hl = t.split(' ').some(x => x && on.has(x));
      const html = escHTML(line).replace(/&quot;/g, '"').replace(tok, (m, s, c, d, k) => {
        if (s) return `<span class="tok-s">${s.replace(/"/g, '&quot;')}</span>`;
        if (c) return `<span class="tok-c">${c}</span>`;
        if (d) return `<span class="tok-d">${d}</span>`;
        return `<span class="tok-k">${k}</span>`;
      });
      return `<span class="ln${hl ? ' hl' : ''}">${html || ' '}</span>`;
    }).join('');
  }

  function responseHTML(res, burst) {
    const cls = res.status < 300 ? 'ok' : res.status === 429 ? 'limit' : 'bad';
    const head = [`HTTP/1.1 ${res.status} ${STATUS[res.status]}`];
    if (res.body !== null) head.push('content-type: application/json');
    Object.entries(res.headers || {}).forEach(([k, v]) => head.push(`${k}: ${v}`));
    const text = head.join('\n') + (res.body !== null ? '\n\n' + pretty(res.body) : '');
    const ex = EXPLAIN[res.key];
    let h = '';
    if (burst) h += `<ul class="burst">${burst.map(b => `<li><span>${b.range}</span><span class="pill ${b.cls}">${b.status}</span> ${STATUS[b.status]}</li>`).join('')}</ul>`;
    h += `<div class="status"><span class="pill ${cls}">${res.status}</span><span>${STATUS[res.status]}</span></div>`;
    h += `<pre class="http">${escHTML(text)}</pre>`;
    h += `<div class="why"><p class="eyebrow">What happened</p><p>${escHTML(ex.text)}</p>`;
    h += `<p class="ctx-note"><span>In ${CTX_NAME[ctx]}:</span> ${escHTML(ex[ctx])}</p></div>`;
    h += `<details class="server"><summary>Server side: the FastAPI code behind this response</summary>`;
    h += `<pre class="code">${codeHTML(res.tags)}</pre><p class="code-note">${escHTML(res.note)}</p></details>`;
    return h;
  }

  function send() {
    const res = simulate(readRequest());
    $('#simRes').innerHTML = responseHTML(res);
  }

  function burst() {
    const first = simulate(readRequest());
    const limited = { status: 429, headers: { 'retry-after': '47', 'x-ratelimit-limit': '10', 'x-ratelimit-remaining': '0' }, body: { detail: 'Rate limit exceeded: 10 requests per minute' }, key: 'limited', tags: [], note: CODE_NOTE.limited };
    const log = [
      { range: 'Requests 1 to 10', status: first.status, cls: first.status < 300 ? 'ok' : 'bad' },
      { range: 'Requests 11 to 15', status: 429, cls: 'limit' }
    ];
    $('#simRes').innerHTML = responseHTML(limited, log);
  }

  function refresh() {
    const req = readRequest();
    $('#bodyWrap').hidden = req.method !== 'POST';
    $('#simPreview').textContent = requestText(req);
    $('#simCaller').textContent = CALLER[ctx].label;
  }

  function mount(el, opts) {
    root = el; ctx = (opts && opts.context) || 'web';
    $ = sel => root.querySelector(sel);
    root.innerHTML = `
      <div class="sim">
        <p class="sim-intro">Send requests to Nimbus Freight’s HR API as <strong id="simCaller"></strong>. Switch the system above to change the caller. The errors teach more than the successes, so try breaking things.</p>
        <div class="sim-grid">
          <div class="sim-req">
            <div class="field-row">
              <div class="field"><label for="simMethod">Method</label>
                <select id="simMethod"><option>GET</option><option>POST</option><option>DELETE</option></select></div>
              <div class="field"><label for="simPath">Address</label>
                <select id="simPath">${PATHS.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}</select></div>
            </div>
            <div class="field"><label for="simIdentity">Identity</label>
              <select id="simIdentity"><option value="priya">Priya, signed in</option><option value="expired">Priya, token expired</option><option value="none">No credentials</option></select></div>
            <div class="field" id="bodyWrap" hidden><label for="simBody">Body (JSON)</label>
              <textarea id="simBody" rows="6" spellcheck="false">${PRESETS.valid.body}</textarea>
              <div class="presets" role="group" aria-label="Example bodies">${Object.entries(PRESETS).map(([k, p]) => `<button type="button" class="preset" data-preset="${k}">${p.label}</button>`).join('')}</div>
            </div>
            <div class="field"><span class="flabel">Request</span><pre class="http" id="simPreview"></pre></div>
            <div class="sim-actions"><button class="btn primary" id="simSend">Send request</button><button class="btn" id="simBurst">Send 15 in a row</button></div>
            <p class="sim-note">Simulated in your browser. Responses follow FastAPI and Pydantic conventions; exact wording varies by version.</p>
          </div>
          <div class="sim-res" id="simRes" aria-live="polite"></div>
        </div>
      </div>`;
    ['#simMethod', '#simPath', '#simIdentity', '#simBody'].forEach(s => $(s).addEventListener('input', refresh));
    $('#simSend').addEventListener('click', send);
    $('#simBurst').addEventListener('click', burst);
    root.querySelector('.presets').addEventListener('click', ev => {
      const b = ev.target.closest('[data-preset]'); if (!b) return;
      $('#simBody').value = PRESETS[b.dataset.preset].body; refresh();
    });
    refresh();
    send();
  }

  function setContext(c) { ctx = c; if (root) { refresh(); send(); } }

  return { diagram, mount, setContext };
})();
