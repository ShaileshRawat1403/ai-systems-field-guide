// Shared loaders. Markdown and YAML in the repo are the single source of truth;
// everything here turns them into plain objects for validation and builds.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const read = p => readFileSync(join(ROOT, p), 'utf8');
export const readJSON = p => JSON.parse(read(p));
export const list = (dir, ext) =>
  existsSync(join(ROOT, dir)) ? readdirSync(join(ROOT, dir)).filter(f => f.endsWith(ext)).sort() : [];

export function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { data: null, body: text };
  return { data: yaml.load(m[1]) || {}, body: m[2] };
}

// Split a markdown body into the title block and "## " sections.
function sections(body) {
  const out = { _intro: [] };
  let cur = '_intro';
  for (const line of body.split('\n')) {
    const h = line.match(/^## (.+)$/);
    if (h) { cur = h[1].trim(); out[cur] = []; continue; }
    out[cur].push(line);
  }
  return out;
}
const paragraphs = lines => lines.join('\n').split(/\n\s*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
const bullets = lines => lines.filter(l => /^\s*-\s+/.test(l)).map(l => l.replace(/^\s*-\s+/, '').trim());

export function parseComponent(file) {
  const errors = [];
  const { data, body } = frontmatter(read(join('content/components', file)));
  if (!data) return { errors: [`${file}: missing frontmatter`] };
  const s = sections(body);
  const intro = paragraphs(s._intro).filter(p => !p.startsWith('# '));
  const whatP = intro.find(p => p.startsWith('**What:**'));
  const understand = intro.filter(p => p !== whatP).join(' ');
  const text = key => (s[key] ? paragraphs(s[key]).join(' ') : undefined);
  const card = {
    what: whatP ? whatP.replace('**What:**', '').trim() : undefined,
    understand: understand || undefined,
    use: text('Use when'),
    skip: text('Skip when'),
    check: text('The check'),
    flags: s['Red flags'] ? bullets(s['Red flags']) : []
  };
  if (!card.use) delete card.use;
  if (!card.skip) delete card.skip;
  return { ...data, card, file, errors };
}

export const CONTEXTS = { 'Web app': 'web', 'AI assistant': 'assistant', 'Agent with MCP': 'mcp' };

export function parseConcept(file) {
  const errors = [];
  const { data, body } = frontmatter(read(join('content/concepts', file)));
  if (!data) return { errors: [`${file}: missing frontmatter`], file };
  const s = sections(body);
  const intro = paragraphs(s._intro).filter(p => !p.startsWith('# '));
  const whatP = intro.find(p => p.startsWith('**What:**'));
  const text = key => (s[key] ? paragraphs(s[key]).join(' ') : undefined);
  const card = {
    what: whatP ? whatP.replace('**What:**', '').trim() : undefined,
    understand: intro.filter(p => p !== whatP).join(' ') || undefined,
    use: text('Use when'),
    skip: text('Skip when'),
    check: text('The check'),
    flags: s['Red flags'] ? bullets(s['Red flags']) : []
  };

  // "## In three systems" holds one "### <Context>" block per context.
  const contexts = {};
  let cur = null;
  for (const line of s['In three systems'] || []) {
    const h = line.match(/^### (.+)$/);
    if (h) { cur = CONTEXTS[h[1].trim()] || h[1].trim(); contexts[cur] = []; continue; }
    if (cur) contexts[cur].push(line);
  }
  for (const [k, lines] of Object.entries(contexts)) {
    const ps = paragraphs(lines.filter(l => !/^\s*\d+\.\s+/.test(l)));
    const whoP = ps.find(p => p.startsWith('**Who calls:**')) || '';
    const pathP = ps.find(p => p.startsWith('Path:')) || '';
    const carriesP = ps.find(p => p.startsWith('Carries:')) || '';
    contexts[k] = {
      who: whoP.replace('**Who calls:**', '').trim(),
      text: ps.filter(p => ![whoP, pathP, carriesP].includes(p)).join(' '),
      path: pathP.replace('Path:', '').split('→').map(x => x.trim()).filter(Boolean),
      carries: carriesP.replace('Carries:', '').trim(),
      steps: lines.filter(l => /^\s*\d+\.\s+/.test(l)).map(l => l.replace(/^\s*\d+\.\s+/, '').trim())
    };
  }
  return { ...data, card, contexts, across: text('Across all three'), file, errors };
}

export function parseTour(file) {
  const { data, body } = frontmatter(read(join('content/tours', file)));
  const s = sections(body);
  const intro = paragraphs(s._intro);
  const scenarioP = intro.find(p => p.startsWith('**Scenario:**')) || '';
  const steps = Object.keys(s).filter(k => /^\d+\.\s/.test(k)).map(k => {
    const ps = paragraphs(s[k]);
    const pathP = ps.find(p => p.startsWith('Path:')) || '';
    const failP = ps.find(p => p.startsWith('**What can go wrong:**')) || '';
    const path = pathP.replace('Path:', '').split('→').map(x => x.trim()).filter(Boolean);
    const edges = path.slice(1).map((b, i) => [path[i], b]);
    return {
      title: k.replace(/^\d+\.\s*/, ''),
      text: ps.filter(p => p !== pathP && p !== failP).join(' '),
      fail: failP.replace('**What can go wrong:**', '').trim(),
      nodes: [...new Set(path)],
      edges
    };
  });
  return { ...(data || {}), scenario: scenarioP.replace('**Scenario:**', '').trim(), steps, file };
}

export function loadStack() {
  return list('data/stack', '.yaml').map(f => ({ file: f, ...yaml.load(read(join('data/stack', f))) }));
}

export const fileId = f => basename(f).replace(/\.(md|ya?ml|json)$/, '');
