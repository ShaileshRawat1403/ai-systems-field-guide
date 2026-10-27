// Checks that every content and data file keeps its shape.
// Errors fail the run. Stale tool entries are warnings unless --strict is passed.
import { readJSON, list, parseComponent, parseTour, loadStack, fileId } from './lib.mjs';

const strict = process.argv.includes('--strict');
const STALE_MONTHS = 6;
const errors = [];
const warnings = [];
const err = m => errors.push(m);
const warn = m => warnings.push(m);

const { trunks } = readJSON('data/trunks.json');
const { layers } = readJSON('data/layers.json');
const diagram = readJSON('data/diagram.json');
const layerIds = new Set(layers.map(l => l.id));
const nodeIds = new Set(diagram.nodes.map(n => n.id));

// Layers
layers.forEach(l => { if (!trunks[l.trunk]) err(`data/layers.json: ${l.id} has unknown trunk ${l.trunk}`); });

// Components
const components = list('content/components', '.md').map(parseComponent);
const componentIds = new Set();
for (const c of components) {
  c.errors.forEach(err);
  const where = `content/components/${c.file}`;
  if (c.id !== fileId(c.file)) err(`${where}: id "${c.id}" must match the file name`);
  componentIds.add(c.id);
  for (const k of ['name', 'kind', 'trunk', 'layer']) if (c[k] === undefined) err(`${where}: missing "${k}" in frontmatter`);
  if (typeof c.ai !== 'boolean') err(`${where}: "ai" must be true or false`);
  if (c.trunk !== undefined && !trunks[c.trunk]) err(`${where}: unknown trunk ${c.trunk}`);
  if (c.layer && !layerIds.has(c.layer)) err(`${where}: unknown layer "${c.layer}" (see data/layers.json)`);
  if (!nodeIds.has(c.id)) err(`${where}: no node with this id in data/diagram.json`);
  const card = c.card || {};
  if (!card.what) err(`${where}: needs a "**What:**" line`);
  if (!card.understand) err(`${where}: needs a paragraph after the What line`);
  if (!card.check) err(`${where}: needs a "## The check" section`);
  if (!card.flags || card.flags.length === 0) err(`${where}: needs at least one bullet under "## Red flags"`);
  if (!!card.use !== !!card.skip) err(`${where}: "Use when" and "Skip when" come as a pair`);
}
for (const id of nodeIds) if (!componentIds.has(id)) err(`data/diagram.json: node "${id}" has no file in content/components`);

// Diagram edges
const edgeKey = (a, b) => [a, b].sort().join('|');
const edgeSet = new Set();
for (const e of diagram.edges) {
  if (!nodeIds.has(e.from) || !nodeIds.has(e.to)) err(`data/diagram.json: edge ${e.id} points to a missing node`);
  if (!['both', 'ai', 'trad'].includes(e.mode)) err(`data/diagram.json: edge ${e.id} has unknown mode "${e.mode}"`);
  if (e.mode !== 'trad') edgeSet.add(edgeKey(e.from, e.to));
}

// Tours
for (const f of list('content/tours', '.md')) {
  const t = parseTour(f);
  const where = `content/tours/${f}`;
  if (t.id !== fileId(f)) err(`${where}: id must match the file name`);
  if (!t.scenario) err(`${where}: needs a "**Scenario:**" line`);
  if (t.steps.length === 0) err(`${where}: needs numbered "## 1. Title" steps`);
  t.steps.forEach((s, i) => {
    const at = `${where} step ${i + 1}`;
    if (s.nodes.length === 0) err(`${at}: needs a "Path:" line`);
    s.nodes.forEach(n => { if (!nodeIds.has(n)) err(`${at}: unknown component "${n}"`); });
    s.edges.forEach(([a, b]) => { if (!edgeSet.has(edgeKey(a, b))) err(`${at}: no edge between ${a} and ${b}`); });
    if (!s.text) err(`${at}: needs narration`);
    if (!s.fail) err(`${at}: needs a "**What can go wrong:**" line`);
  });
}

// Stack entries
const now = new Date();
const monthsOld = ym => {
  const [y, m] = ym.split('-').map(Number);
  return (now.getUTCFullYear() - y) * 12 + (now.getUTCMonth() + 1 - m);
};
for (const s of loadStack()) {
  const where = `data/stack/${s.file}`;
  if (s.layer !== fileId(s.file)) err(`${where}: "layer" must match the file name`);
  if (!layerIds.has(s.layer)) err(`${where}: unknown layer "${s.layer}"`);
  if (!Array.isArray(s.categories) || s.categories.length === 0) { err(`${where}: needs categories`); continue; }
  for (const c of s.categories) {
    const at = `${where} › ${c.id || '(no id)'}`;
    for (const k of ['id', 'name', 'what']) if (!c[k]) err(`${at}: missing "${k}"`);
    const opts = c.options || [];
    if (opts.length === 0) err(`${at}: needs options`);
    const names = opts.map(o => String(o.name || ''));
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }));
    if (names.join('|') !== sorted.join('|')) err(`${at}: options must be in alphabetical order so order never implies ranking`);
    for (const o of opts) {
      const ot = `${at} › ${o.name || '(no name)'}`;
      for (const k of ['name', 'kind', 'url', 'good_for', 'watch_for', 'verified', 'source']) if (!o[k]) err(`${ot}: missing "${k}"`);
      if (o.kind && !['open-source', 'commercial', 'cloud-service', 'standard'].includes(o.kind)) err(`${ot}: unknown kind "${o.kind}"`);
      if (o.verified && !/^\d{4}-\d{2}$/.test(String(o.verified))) err(`${ot}: "verified" must look like 2026-10`);
      else if (o.verified && monthsOld(String(o.verified)) > STALE_MONTHS) warn(`${ot}: last verified ${o.verified}, older than ${STALE_MONTHS} months`);
    }
    if (c.clouds) for (const k of ['aws', 'azure', 'gcp']) if (!Array.isArray(c.clouds[k])) err(`${at}: clouds.${k} must be a list (use [] if none)`);
  }
}

warnings.forEach(w => console.warn('warn  ' + w));
errors.forEach(e => console.error('error ' + e));
const failed = errors.length > 0 || (strict && warnings.length > 0);
console.log(`\n${components.length} components, ${list('content/tours', '.md').length} tours, ${loadStack().length} stack files. ${errors.length} errors, ${warnings.length} warnings.`);
process.exit(failed ? 1 : 0);
