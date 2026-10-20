// Construye el sitio a partir de src/: minifica CSS y JS, genera index.html,
// el service worker (modo sin conexión) y una versión de un solo archivo.
import { transform } from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const p = (...a) => join(root, ...a);
const read = (f) => readFileSync(p(f), 'utf8');
const write = (f, c) => { mkdirSync(dirname(p(f)), { recursive: true }); writeFileSync(p(f), c); };

const css = (await transform(read('src/style.css'), { loader: 'css', minify: true })).code;
const js = (await transform(read('src/game.js'), { loader: 'js', minify: true, target: 'es2018' })).code;
const body = read('src/body.html').trim();
const pkg = JSON.parse(read('package.json'));

const hash = createHash('sha1').update(css).update(js).update(body).digest('hex').slice(0, 8);
const FONTS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;700;800&display=swap';
const TITLE = 'El Día de Gluco';
const DESC = 'Juego educativo e interactivo sobre diabetes tipo 1 para niñas y niños: cuidá a Gluco durante un día, de 8 a 20 horas.';

const headCommon = (extra) => `<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${TITLE}</title>
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#EAF1FF">
<meta property="og:title" content="${TITLE}">
<meta property="og:description" content="${DESC}">
<meta property="og:type" content="website">
<link rel="icon" type="image/svg+xml" href="favicon.svg">${extra}`;

// 1) Sitio publicable (GitHub Pages): archivos separados, con caché y modo sin conexión
write('assets/style.min.css', css);
write('assets/game.min.js', js);
write('index.html', `<!doctype html>
<html lang="es" data-sw="1">
<head>
${headCommon(`
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png">
<link rel="manifest" href="manifest.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${FONTS}">
<link rel="stylesheet" href="assets/style.min.css?v=${hash}">`)}
</head>
<body>
${body}
<script src="assets/game.min.js?v=${hash}"></script>
</body>
</html>
`);

// 2) Service worker: guarda los archivos propios para poder jugar sin conexión
write('sw.js', `/* Generado por tools/build.mjs: no editar a mano */
const CACHE = 'gluco-${pkg.version}-${hash}';
const FILES = ['./', 'index.html', 'assets/style.min.css?v=${hash}', 'assets/game.min.js?v=${hash}', 'favicon.svg', 'manifest.webmanifest', 'assets/apple-touch-icon.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((n) => n !== CACHE).map((n) => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: false }).then((hit) => hit || fetch(e.request).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
`);

// 3) Versión de un solo archivo (para compartir por mensaje o abrir sin internet)
write('dist/gluco-standalone.html', `<!doctype html>
<html lang="es">
<head>
${headCommon(`
<link rel="stylesheet" href="${FONTS}">
<style>${css}</style>`)}
</head>
<body>
${body}
<script>${js}</script>
</body>
</html>
`);

// 4) Versión legible de un solo archivo, usada por las pruebas
write('dist/gluco-standalone.dev.html', `<!doctype html>
<html lang="es">
<head>
${headCommon(`
<style>${read('src/style.css')}</style>`)}
</head>
<body>
${body}
<script>${read('src/game.js')}</script>
</body>
</html>
`);

// 5) Hoja imprimible: se genera con las mismas preguntas del juego para que nunca queden desfasadas
const gameSrc = read('src/game.js');
const qSrc = gameSrc.match(/var QUESTIONS=(\[[\s\S]*?\n\]);/)[1];
const QUESTIONS = new Function('return ' + qSrc)();
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const rows = QUESTIONS.map((q, i) => `<tr><td class="n">${i + 1}</td><td>${esc(q.t)}</td><td class="c"><span class="box"></span> Mito</td><td class="c"><span class="box"></span> Realidad</td></tr>`).join('\n');
const answers = QUESTIONS.map((q, i) => `<li><b>${i + 1}. ${q.a === 'mito' ? 'Mito' : 'Realidad'}.</b> ${esc(q.why)}</li>`).join('\n');
write('docs/hoja-imprimible.html', `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>El Día de Gluco — Hoja imprimible</title>
<style>
  :root{--ink:#16204A;--line:#16204A;--soft:#EAF1FF}
  *{box-sizing:border-box}
  body{font:16px/1.45 "Nunito",system-ui,-apple-system,"Segoe UI",sans-serif;color:var(--ink);margin:0;background:#f5f7fc}
  main{max-width:800px;margin:0 auto;background:#fff;padding:28px 36px}
  h1{font-size:2rem;margin:.2em 0 0} h2{font-size:1.25rem;margin:1.4em 0 .4em;border-bottom:3px solid var(--line);padding-bottom:4px}
  .sub{color:#4a5680;margin:.2em 0 1em}
  table{width:100%;border-collapse:collapse} td,th{border:2px solid var(--line);padding:7px 9px;vertical-align:middle;text-align:left}
  th{background:var(--soft)} td.n{width:34px;text-align:center;font-weight:800} td.c{width:108px;white-space:nowrap}
  .box{display:inline-block;width:16px;height:16px;border:2.5px solid var(--line);border-radius:4px;vertical-align:-3px;margin-right:4px}
  .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:.6em 0}
  .steps div{border:3px solid var(--line);border-radius:14px;padding:10px;text-align:center;background:var(--soft);font-weight:800}
  .steps span{display:block;font-size:2rem}
  .note{border:3px dashed var(--line);border-radius:12px;padding:10px 12px;margin:1em 0;font-size:.95rem}
  .lines p{border-bottom:2px solid #9aa5c9;height:1.9em;margin:.2em 0}
  .qr{width:130px;height:130px;border:3px dashed var(--line);border-radius:10px;display:grid;place-items:center;text-align:center;font-size:.8rem;padding:6px}
  .top{display:flex;gap:18px;align-items:flex-start;justify-content:space-between}
  ul{padding-left:1.1em} li{margin:.25em 0}
  .answers{font-size:.92rem;page-break-before:always}
  footer{margin-top:1.5em;font-size:.8rem;color:#4a5680}
  @media print{body{background:#fff} main{padding:0;max-width:none} h2{break-after:avoid} tr,.steps div{break-inside:avoid}}
</style>
</head>
<body>
<main>
  <div class="top">
    <div>
      <h1>💧 El Día de Gluco</h1>
      <p class="sub">Hoja para jugar, aprender y conversar</p>
      <p><b>Nombre:</b> ______________________________ &nbsp; <b>Fecha:</b> ______________</p>
    </div>
    <div class="qr">Pegá acá el código QR del juego</div>
  </div>

  <h2>1. Mito o realidad</h2>
  <p>Marcá si cada frase es un <b>mito</b> (no es cierto) o una <b>realidad</b> (es cierto). Las respuestas están en la última página.</p>
  <table>
    <thead><tr><th>#</th><th>Frase</th><th colspan="2">¿Qué es?</th></tr></thead>
    <tbody>
${rows}
    </tbody>
  </table>

  <h2>2. Si la glucosa está baja</h2>
  <p>Cuando alguien tiembla, suda, está pálido o muy cansado, la glucosa puede estar baja. Los 4 pasos, en orden:</p>
  <div class="steps">
    <div><span>✋</span>1. Parar lo que estoy haciendo</div>
    <div><span>🧑‍🧒</span>2. Avisar a un adulto</div>
    <div><span>🧃</span>3. Tomar algo dulce, como jugo o azúcar</div>
    <div><span>⏱️</span>4. Esperar y volver a mirar mi nivel</div>
  </div>
  <p class="note"><b>Importante:</b> una glucosa baja <b>nunca</b> se corrige con insulina. La insulina y su dosis las indica siempre el equipo de salud.</p>

  <h2>3. Mirá la curva del día</h2>
  <p>Después de jugar, mirá la curva de la pantalla final y completá:</p>
  <div class="lines">
    <p>La comida que más subió mi glucosa fue: </p>
    <p>La que subió más despacio fue: </p>
    <p>Mi glucosa bajó cuando: </p>
  </div>

  <h2>4. Para conversar</h2>
  <ul>
    <li>¿Qué fue lo más difícil de cuidar a Gluco hoy?</li>
    <li>¿Qué hacés si alguien está temblando, sudado o muy cansado?</li>
    <li>¿Cuándo te sentís triste o enojado? ¿Qué te ayuda?</li>
    <li>¿Qué le diríamos a un compañero que cree que la diabetes se contagia?</li>
    <li>¿Por qué comer poquito no es buena idea para «estar en verde»?</li>
  </ul>

  <p class="note">El Día de Gluco es un juego educativo. Las curvas y los tiempos son ilustrativos y <b>no reemplazan las indicaciones del equipo de salud</b>. Si una persona está confundida, muy dormida o no puede tragar, llamá a emergencias (en Uruguay, 911).</p>

  <section class="answers">
    <h2>Respuestas</h2>
    <ul>
${answers}
    </ul>
  </section>
  <footer>Contenido bajo licencia CC BY-NC 4.0 · Basado en «El Día de Gluco» de Fernando Sabaño.</footer>
</main>
</body>
</html>
`);

// 6) Carpeta «publicar/»: todos los archivos en un mismo nivel, sin subcarpetas.
//    Sirve para subir a GitHub desde la web cuando no se pueden arrastrar carpetas.
import { copyFileSync } from 'node:fs';
const flat = (t) => t.replace(/assets\//g, '');
write('publicar/index.html', flat(read('index.html')));
write('publicar/sw.js', flat(read('sw.js')));
write('publicar/manifest.webmanifest', flat(read('manifest.webmanifest')));
for (const [from, to] of [
  ['assets/style.min.css', 'style.min.css'], ['assets/game.min.js', 'game.min.js'],
  ['assets/icon-192.png', 'icon-192.png'], ['assets/icon-512.png', 'icon-512.png'], ['assets/apple-touch-icon.png', 'apple-touch-icon.png'],
  ['favicon.svg', 'favicon.svg'], ['LICENSE', 'LICENSE'], ['LICENSE-CONTENIDO.md', 'LICENSE-CONTENIDO.md'],
  ['AVISO-DE-SALUD.md', 'AVISO-DE-SALUD.md'], ['PRIVACIDAD.md', 'PRIVACIDAD.md'],
  ['docs/hoja-imprimible.html', 'hoja-imprimible.html'], ['docs/hoja-imprimible.pdf', 'hoja-imprimible.pdf'],
]) {
  mkdirSync(p('publicar'), { recursive: true });
  // En la carpeta plana no existe docs/: los enlaces a esos documentos pasan a ser texto simple
  if (from.endsWith('.md')) write('publicar/' + to, read(from).replace(/\[([^\]]+)\]\(docs\/[^)]*\)/g, '$1'));
  else copyFileSync(p(from), p('publicar', to));
}
write('publicar/README.md', `# 🩸 El Día de Gluco

Juego educativo e interactivo sobre **diabetes tipo 1** para niñas y niños. Cuidá a Gluco durante un día, de 8 a 20 horas.

- Se juega en el navegador, en celulares, tabletas y computadoras.
- Funciona sin conexión después de la primera visita.
- No recopila datos personales (ver [PRIVACIDAD.md](PRIVACIDAD.md)).

> ⚠️ **Es un juego educativo, no una herramienta médica.** Las curvas, los tiempos y las "llaves" son ilustrativos y no sirven para calcular dosis ni decidir tratamientos. Ver [AVISO-DE-SALUD.md](AVISO-DE-SALUD.md).

Hoja para imprimir y trabajar en clase: [hoja-imprimible.html](hoja-imprimible.html) · [PDF](hoja-imprimible.pdf).

## Licencias
- Código: [MIT](LICENSE).
- Textos y materiales educativos: [CC BY-NC 4.0](LICENSE-CONTENIDO.md).

© 2026 Fernando Sabaño
`);

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1);
console.log(`Listo (${hash}): CSS ${kb(css)} KB · JS ${kb(js)} KB · HTML ${kb(body)} KB`);
