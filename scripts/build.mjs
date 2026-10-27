// Builds the prototype page from the content and data files.
// Output: site/public/index.html, self-contained and committed so it opens without a build.
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, read, readJSON, list, parseComponent, parseTour } from './lib.mjs';

const { trunks } = readJSON('data/trunks.json');
const diagram = readJSON('data/diagram.json');
const byId = Object.fromEntries(list('content/components', '.md').map(parseComponent).map(c => [c.id, c]));

const content = {
  trunks,
  layerNote: diagram.layerNote,
  nodes: diagram.nodes.map(n => {
    const c = byId[n.id];
    return { id: n.id, name: c.name, kind: c.kind, col: n.col, row: n.row, ai: c.ai, trunk: c.trunk, layer: c.layer, card: c.card };
  }),
  edges: diagram.edges,
  tours: list('content/tours', '.md').map(parseTour).map(t => ({ id: t.id, scenario: t.scenario, steps: t.steps }))
};

// Escape "</" so content can never close the script tag early.
const json = JSON.stringify(content, null, 2).replace(/<\//g, '<\\/');
const html = read('site/src/prototype.template.html').replace('__CONTENT_JSON__', json);
writeFileSync(join(ROOT, 'site/public/index.html'), html);
console.log(`Built site/public/index.html from ${content.nodes.length} components and ${content.tours.length} tour(s).`);
