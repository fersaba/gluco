# Publicar en GitHub Pages

*El Día de Gluco* es un sitio estático: no necesita servidor ni base de datos.

## 1. Crear el repositorio

1. Creá una cuenta en <https://github.com> si no tenés.
2. **New repository** → nombre sugerido: `dia-de-gluco` → **Public** → no marques «Add a README» (ya hay uno).
3. Subí todo el contenido de esta carpeta (arrastrando los archivos en la web, o con Git):

```bash
git init
git add .
git commit -m "El Día de Gluco 1.0.0"
git branch -M main
git remote add origin https://github.com/TU-USUARIO/dia-de-gluco.git
git push -u origin main
```

> Antes de subir: revisá que el nombre de la autoría en `LICENSE` y `LICENSE-CONTENIDO.md` sea el correcto.

## 2. Activar GitHub Pages

1. En el repositorio: **Settings → Pages**.
2. En *Build and deployment* elegí **Deploy from a branch**.
3. Rama: `main`. Carpeta: `/ (root)`. **Save**.
4. En uno o dos minutos aparece la dirección: `https://TU-USUARIO.github.io/dia-de-gluco/`.

El archivo `.nojekyll` evita que GitHub procese los archivos y deja todo tal cual.

## 3. Comprobar

- Abrí la dirección en el celular y en la computadora.
- Desconectate de internet y recargá: debería seguir funcionando (modo sin conexión).
- En el navegador del celular, *Agregar a la pantalla de inicio* para instalarlo como app.

## 4. Mantenerlo

- Editá solo `src/`, corré `npm run all` y subí también los archivos generados (`index.html`, `assets/`, `sw.js`, `dist/`).
- La integración continua ([.github/workflows/ci.yml](../.github/workflows/ci.yml)) corre las pruebas en cada cambio y avisa si los archivos generados no están al día.
- Para que los dispositivos tomen una versión nueva, no hace falta nada: el nombre de los archivos lleva una huella y el modo sin conexión se renueva solo.

## Código QR para el aula

Generá un QR con la dirección (por ejemplo en <https://www.qrcode-monkey.com>) e imprimilo junto a la [hoja imprimible](hoja-imprimible.html).

## Tipografías sin Google

Por defecto se cargan *Fredoka* y *Nunito* desde Google Fonts. Para no depender de Google:

1. Descargá las fuentes desde <https://fonts.google.com> (licencia SIL OFL, se pueden alojar).
2. Copialas a una carpeta `assets/fonts/`.
3. En `src/style.css` agregá reglas `@font-face` que apunten a esos archivos.
4. En `tools/build.mjs` quitá las líneas de `fonts.googleapis.com` y `fonts.gstatic.com`.
5. Agregá los archivos de fuente a la lista `FILES` del service worker (en `tools/build.mjs`).

## Otras opciones de alojamiento

Cualquier hosting estático sirve (Netlify, Cloudflare Pages, el servidor de la escuela): copiá el contenido de la carpeta tal cual. También podés compartir solo `dist/gluco-standalone.html`, que es un único archivo.
