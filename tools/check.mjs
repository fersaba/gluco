// Revisiones rápidas: sintaxis del JS, referencias de index.html y texto sensible.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => readFileSync(join(root, f), 'utf8');
let bad = 0;
const fail = (m) => { console.error('✗ ' + m); bad++; };
const ok = (m) => console.log('✓ ' + m);

try { execFileSync(process.execPath, ['--check', join(root, 'src/game.js')], { stdio: 'pipe' }); ok('Sintaxis de src/game.js'); }
catch (e) { fail('Sintaxis de src/game.js: ' + e.stderr); }

const html = read('index.html');
for (const m of html.matchAll(/(?:src|href)="((?!https?:)[^"#]+?)(?:\?[^"]*)?"/g)) {
  if (!existsSync(join(root, m[1]))) fail('Falta el archivo referenciado: ' + m[1]);
}
ok('Archivos referenciados en index.html');

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const js = read('src/game.js');
const missing = [...new Set([...js.matchAll(/\$\('([A-Za-z0-9_-]+)'\)/g)].map((m) => m[1]))].filter((i) => !ids.has(i) && !/^(acc-|pname|nameIn|colLab|accLab|spLab|lowHint|lowSteps|lowGo|sheetClose|again|adultsBtn2|diploma|dname)/.test(i));
if (missing.length) fail('Elementos pedidos por el JS que no existen en el HTML: ' + missing.join(', ')); else ok('Los elementos del HTML existen');

const dupIds = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) !== i);
if (dupIds.length) fail('Ids duplicados: ' + dupIds.join(', ')); else ok('Sin ids duplicados');

const bodyText = read('src/body.html') + js;
if (/\b(3 comidas|\/3)\b/.test(bodyText.replace(/Math\.floor\(S\.t\/3\)/g, ''))) fail('Aparece "3 comidas" o "/3" en los textos');
else ok('Los textos no nombran una cantidad fija de comidas');

// Enlaces relativos de los documentos Markdown
import { readdirSync, statSync } from 'node:fs';
const mds = [];
const walk = (d) => { for (const n of readdirSync(join(root, d))) { if (n === 'node_modules' || n.startsWith('.git')) continue; const rel = join(d, n); statSync(join(root, rel)).isDirectory() ? walk(rel) : rel.endsWith('.md') && mds.push(rel); } };
walk('.');
let links = 0;
for (const f of mds) {
  for (const m of read(f).matchAll(/\]\((?!https?:|mailto:|#)([^)#\s]+)(?:#[^)]*)?\)/g)) {
    links++;
    if (!existsSync(join(root, dirname(f), decodeURIComponent(m[1])))) fail('Enlace roto en ' + f + ': ' + m[1]);
  }
}
ok('Enlaces entre documentos (' + links + ')');


process.exit(bad ? 1 : 0);
