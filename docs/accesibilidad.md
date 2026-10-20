# Accesibilidad

El juego busca poder usarse con distintas capacidades y dispositivos.

## Lo que ya incluye

| Área | Qué hay |
|---|---|
| Texto | Modo **texto grande** con mensajes más cortos (menú ☰). |
| Color | La velocidad de subida de cada comida usa **color y forma** (círculo, cuadrado, rombo y círculo con centro hueco). Zonas con etiquetas numéricas (70 y 180). La flecha de tendencia tiene texto ("sube", "estable", "baja"). |
| Contraste | Bordes oscuros y fondos claros; tema oscuro automático según el dispositivo. |
| Movimiento | Respeta «reducir movimiento» del sistema: se desactivan las animaciones continuas. |
| Teclado | Botones nativos, orden lógico, foco visible, `Esc` cierra las ventanas. |
| Lectores de pantalla | Etiquetas `aria` en controles, mensajes en una región `role="status"`, ventanas con `role="dialog"`. Mientras hay una ventana abierta, el resto queda inerte. |
| Pantallas | Se adapta a celulares, tabletas y computadoras, en vertical y horizontal. |
| Sonido | Se puede silenciar (efectos, música o nada); nada depende solo del sonido. |
| Ritmo | Dos velocidades y pausa automática cuando hay una ventana abierta. |

## Pendiente / ideas

- Prueba con lectores de pantalla en dispositivos reales (TalkBack, VoiceOver, NVDA).
- Modo de alto contraste adicional.
- Opción de tiempo por turnos (cada acción avanza 15 o 30 minutos) para quienes necesitan más tiempo.
- Subtítulos de los sonidos.

Si encontrás una barrera, abrí un *Issue* contando el dispositivo, el navegador y qué intentabas hacer.
