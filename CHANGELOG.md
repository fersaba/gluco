# Cambios

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [1.0.0] — 2026-10-20

Primera versión publicable.

### Juego
- Un día de Gluco (8:00 a 20:00) con tiempo simulado y dos ritmos (tranquilo y normal).
- 12 comidas con velocidad de subida propia (lenta, media, rápida, tardía), pico y duración; jugo y azúcar para rescatar glucosas bajas.
- Insulina ilustrativa con curva (inicio, mayor efecto y duración) y barras de comida e insulina activa.
- Situaciones del día (gimnasia, cumpleaños, resfrío), falta de apetito, tristeza y enojo.
- Glucosa baja con paso a paso para practicar (parar, avisar, algo dulce, esperar).
- Adivinanzas sobre cómo sube la glucosa y 15 preguntas de mito/realidad.
- Pantalla final con logros, curva del día con comidas y llaves marcadas, frases sobre lo que pasó y pregunta para conversar.
- Clima distinto cada día, amigo invitado, accesorios que se ganan con estrellas.
- Ritmo de ventanas espaciado (al menos 100 minutos de juego entre una y otra).
- El juego no nombra una cantidad fija de comidas: se pide comer a lo largo del día.

### Accesibilidad
- Modo de texto grande, controles con teclado, formas además de colores para la velocidad de subida, respeto de «reducir movimiento».

### Técnico
- Código separado en `src/`, compilación y minificación con `npm run build`.
- Modo sin conexión (service worker) y posibilidad de instalarlo como app.
- Pruebas automáticas (recorrido completo, situaciones, funciones nuevas, acciones al azar) e integración continua.
