# 🩸 El Día de Gluco

Juego educativo e interactivo sobre **diabetes tipo 1** para niñas y niños. Gluco es una gota que tiene diabetes y vos lo cuidás durante un día, de 8 a 20 horas: le das de comer, abrís sus cerraduras con la llave de insulina, lo ayudás a moverse y lo acompañás cuando se siente mal.

- 🌐 Se juega en el navegador, en celulares, tabletas y computadoras. No hay que instalar nada.
- 📴 Funciona sin conexión después de la primera visita.
- 🔒 No recopila datos: lo único que guarda (nombre, color, estrellas) queda en el propio navegador.
- 🇺🇾 Español rioplatense.

> ⚠️ **Es un juego educativo, no una herramienta médica.** Las curvas, los tiempos y las "llaves" son ilustrativos y simplificados. No sirven para calcular dosis, decidir tratamientos ni interpretar la glucosa de una persona real. Leé el [aviso de salud](AVISO-DE-SALUD.md).

## Qué se aprende jugando

1. La glucosa es la energía del cuerpo y la insulina es "la llave" que la deja entrar a las células.
2. No todas las comidas suben la glucosa igual: hay comidas que suben despacio, normal, rápido o tarde y por más tiempo.
3. La insulina no baja la glucosa de golpe: empieza a actuar, tiene su mayor efecto después de un par de horas y sigue trabajando varias horas.
4. Una glucosa baja se corrige con algo dulce y avisando a un adulto, **nunca** con insulina.
5. Moverse baja la glucosa; la enfermedad y las emociones fuertes pueden subirla.
6. Comer poco no es una forma de "quedar en verde": hay que comer a lo largo del día.
7. Mitos y realidades sobre la diabetes (15 preguntas).

Más detalle en la [guía para adultos](docs/guia-para-adultos.md) y en la [hoja imprimible](docs/hoja-imprimible.html).

## Cómo jugarlo

| Si querés… | Hacé esto |
|---|---|
| Jugar ya | Abrí `index.html` en el navegador, o la página publicada |
| Jugar sin internet | Abrí `dist/gluco-standalone.html` (un solo archivo, se puede mandar por mensaje) |
| Instalarlo como app | En el navegador: *Agregar a la pantalla de inicio* |
| Probarlo en tu computadora | `npm run serve` y abrí <http://localhost:8080> |

## Publicarlo en GitHub Pages

Pasos completos en [docs/publicar-en-github.md](docs/publicar-en-github.md). Resumen: subí el repositorio, en **Settings → Pages** elegí la rama `main` y la carpeta `/ (root)`.

## Para quienes quieran modificarlo

```bash
npm install        # una sola vez
npm run build      # genera index.html, assets/ y dist/ a partir de src/
npm run check      # revisiones rápidas
npm test           # pruebas automáticas (≈ 20 s)
npm run all        # todo lo anterior
```

- El código fuente legible está en `src/` (`game.js`, `style.css`, `body.html`). **Editá siempre `src/`**; `index.html`, `assets/*.min.*`, `sw.js` y `dist/` se generan solos.
- Cómo funciona el modelo de glucosa: [docs/parametros-del-modelo.md](docs/parametros-del-modelo.md).
- Cómo contribuir: [CONTRIBUTING.md](CONTRIBUTING.md).

## Estructura

```
├── index.html               Página publicada (generada)
├── assets/                  CSS y JS minificados, íconos
├── sw.js                    Modo sin conexión (generado)
├── manifest.webmanifest     Para instalarlo como app
├── favicon.svg
├── dist/                    Versiones de un solo archivo
├── src/                     Código fuente (editar acá)
├── tools/                   build, check y servidor local
├── tests/                   Pruebas automáticas (jsdom)
├── docs/                    Guías, parámetros, revisión profesional, hoja imprimible (HTML y PDF)
├── .github/                 Integración continua y plantillas
├── LICENSE                  Código: MIT
├── LICENSE-CONTENIDO.md     Textos y contenido educativo: CC BY-NC 4.0
├── AVISO-DE-SALUD.md
├── PRIVACIDAD.md
└── CHANGELOG.md
```

## Estado

Versión 1.0.0. **Pendiente:** revisión de un profesional de la salud (hay un [formulario de revisión](docs/revision-profesional.md)) y pruebas en más dispositivos reales.

## Licencias

- **Código:** [MIT](LICENSE).
- **Textos, preguntas, glosario y materiales educativos:** [CC BY-NC 4.0](LICENSE-CONTENIDO.md) (se pueden compartir y adaptar con atribución y sin fines comerciales).
