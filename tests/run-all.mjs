// Ejecuta todas las pruebas automáticas sobre dist/gluco-standalone.dev.html (corré antes: npm run build)
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = dirname(fileURLToPath(import.meta.url));
if (!existsSync(join(dir, '..', 'dist', 'gluco-standalone.dev.html'))) {
  console.error('Falta dist/. Corré primero: npm run build');
  process.exit(1);
}
const suites = [
  ['smoke.cjs', 'Recorrido completo de un día'],
  ['situations.cjs', 'Situaciones: gimnasia, cumpleaños, resfrío y falta de apetito'],
  ['features.cjs', 'Funciones: glucosa baja, adivinanzas, logros, ritmo entre ventanas'],
  ['fuzz.cjs', 'Acciones al azar (robustez)'],
  ['smoke.cjs', 'Versión minificada (dist/gluco-standalone.html)', 'gluco-standalone.html'],
];
let bad = 0;
for (const [file, name, html] of suites) {
  const t = Date.now();
  const r = spawnSync(process.execPath, [join(dir, file)], { cwd: dir, encoding: 'utf8', timeout: 15 * 60 * 1000, env: { ...process.env, ...(html ? { GLUCO_HTML: join(dir, '..', 'dist', html) } : {}) } });
  const okRun = r.status === 0;
  console.log(`${okRun ? '✓' : '✗'} ${name} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
  if (!okRun) { bad++; console.log((r.stdout || '').split('\n').slice(-12).join('\n')); console.log(r.stderr || ''); }
}
console.log(bad ? `\n${bad} grupo(s) con fallas` : '\nTodas las pruebas pasaron');
process.exit(bad ? 1 : 0);
