# Cómo contribuir

¡Gracias por querer mejorar *El Día de Gluco*! Este juego es para niñas y niños, así que **la claridad, la sencillez y la seguridad** pesan más que sumar funciones.

## Principios

1. **Simple primero.** Si algo agrega botones, textos o pasos a la pantalla principal, probablemente no va.
2. **Una cosa a la vez.** No mostrar varias ventanas, preguntas o mensajes al mismo tiempo.
3. **Nada que parezca una indicación médica.** Nunca enseñar dosis; una glucosa baja se corrige con algo dulce y avisando a un adulto.
4. **Los valores son ilustrativos.** Si cambiás curvas o parámetros, actualizá [docs/parametros-del-modelo.md](docs/parametros-del-modelo.md) y marcá el cambio para revisión profesional.
5. **Accesible.** Teclado, lectores de pantalla, contraste, texto grande y «reducir movimiento».

## Flujo de trabajo

```bash
npm install
# editá archivos en src/
npm run all     # compila, revisa y corre las pruebas
```

- Editá solo `src/`. Lo demás (`index.html`, `assets/*.min.*`, `sw.js`, `dist/`) se genera con `npm run build`: **incluí los archivos generados en el mismo commit**. La integración continua falla si no coinciden.
- Agregá o ajustá pruebas en `tests/` cuando cambies el comportamiento.
- Probá en un celular real si tocás el arrastre de comidas o el diseño.

## Textos

- Español rioplatense, con voseo ("arrastrá", "tocá", "fijate").
- Oraciones cortas, sin tecnicismos; si hace falta uno, explicarlo en el glosario.
- No nombrar una cantidad fija de comidas.

## Reportar errores

Usá la plantilla de *Issues*. Contá en qué dispositivo y navegador pasó y, si podés, qué estabas haciendo.

## Licencias

Al contribuir aceptás que tu aporte se publique bajo [MIT](LICENSE) (código) y [CC BY-NC 4.0](LICENSE-CONTENIDO.md) (contenido).
