// Servidor local mínimo para probar el sitio: npm run serve  →  http://localhost:8080
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
createServer(async (req, res) => {
  let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  if (path.endsWith('/') || path === '') path = join(path, 'index.html');
  try { const d = await readFile(join(root, path)); res.writeHead(200, { 'Content-Type': T[extname(path)] || 'application/octet-stream' }); res.end(d); }
  catch { res.writeHead(404); res.end('No encontrado'); }
}).listen(8080, () => console.log('Abrí http://localhost:8080'));
