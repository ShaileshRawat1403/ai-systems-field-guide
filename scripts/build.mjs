// Builds the site from the content and data files.
// Output goes to site/public/: the explorer (index.html) and one page per concept (concepts/<id>.html).
// The output is committed so it opens without a build.
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, readJSON, list, parseComponent, parseConcept, parseTour } from './lib.mjs';

const { trunks } = readJSON('data/trunks.json');
const { layers } = readJSON('data/layers.json');
const diagram = readJSON('data/diagram.json');
const components = Object.fromEntries(list('content/components', '.md').map(parseComponent).map(c => [c.id, c]));
const concepts = list('content/concepts', '.md').map(parseConcept);

// Escape "</" so content can never close a script tag early.
const safeJSON = o => JSON.stringify(o, null, 2).replace(/<\//g, '<\\/');
const fill = (tpl, map) => Object.entries(map).reduce((t, [k, v]) => t.split(k).join(v), tpl);

const ACRONYMS = { http: 'HTTP', https: 'HTTPS', mcp: 'MCP', rag: 'RAG', llm: 'LLM', llms: 'LLMs', sql: 'SQL', json: 'JSON', yaml: 'YAML', api: 'API', apis: 'APIs', rest: 'REST', ci: 'CI', cd: 'CD', dns: 'DNS', ui: 'UI' };
const STOP = new Set(['and', 'or', 'of', 'the', 'in', 'with']);
const nameFor = id => {
  const known = concepts.find(c => c.id === id);
  if (known) return known.name;
  return id.split('-').map((w, i) => ACRONYMS[w] || (i > 0 && STOP.has(w) ? w : i === 0 ? w[0].toUpperCase() + w.slice(1) : w)).join(' ');
};

// Explorer
const content = {
  trunks,
  layerNote: diagram.layerNote,
  nodes: diagram.nodes.map(n => {
    const c = components[n.id];
    const inside = concepts.filter(k => (k.components || []).includes(n.id)).map(k => ({ id: k.id, name: k.name }));
    return { id: n.id, name: c.name, kind: c.kind, col: n.col, row: n.row, ai: c.ai, trunk: c.trunk, layer: c.layer, card: c.card, concepts: inside };
  }),
  edges: diagram.edges,
  tours: list('content/tours', '.md').map(parseTour).map(t => ({ id: t.id, scenario: t.scenario, steps: t.steps }))
};
writeFileSync(join(ROOT, 'site/public/index.html'), fill(read('site/src/prototype.template.html'), { __CONTENT_JSON__: safeJSON(content) }));
console.log(`Built site/public/index.html from ${content.nodes.length} components and ${content.tours.length} tour(s).`);

// Concept pages
mkdirSync(join(ROOT, 'site/public/concepts'), { recursive: true });
const conceptTpl = read('site/src/concept.template.html');
for (const c of concepts) {
  const layer = layers.find(l => l.id === c.layer) || { name: c.layer, trunk: '?' };
  const exp = `site/src/experiments/${c.id}`;
  const js = existsSync(join(ROOT, exp + '.js')) ? read(exp + '.js') : '';
  const css = existsSync(join(ROOT, exp + '.css')) ? read(exp + '.css') : '';
  const data = { concept: c, layer: { name: layer.name, trunk: layer.trunk }, related: (c.related || []).map(nameFor) };
  const html = fill(conceptTpl, {
    __TITLE__: c.name,
    __CONTENT_JSON__: safeJSON(data),
    __EXPERIMENT_CSS__: css,
    __EXPERIMENT_JS__: js.replace(/<\/script/gi, '<\\/script')
  });
  writeFileSync(join(ROOT, `site/public/concepts/${c.id}.html`), html);
  console.log(`Built site/public/concepts/${c.id}.html`);
}
