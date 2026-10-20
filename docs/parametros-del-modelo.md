# Parámetros del modelo

Este documento describe cómo calcula la glucosa el juego. Sirve para revisarlo, ajustarlo y para que un profesional de la salud pueda validarlo.

> ⚠️ **Todos los valores son parámetros de juego, no mediciones clínicas.** Suponen porciones habituales y ausencia de otras variables. No deben usarse fuera del juego. Ver el [aviso de salud](../AVISO-DE-SALUD.md).

## Tiempo

- Un día va de las 8:00 a las 20:00 (720 minutos simulados).
- Velocidad: **normal = 4 minutos de juego por segundo real** (el día dura unos 3 minutos sin pausas) y **tranquilo = 2,5 min/s** (unos 5 minutos). Con ventanas, mensajes y pausas, una partida lleva de 5 a 8 minutos. El tiempo se detiene mientras hay una ventana abierta.
- La glucosa se registra cada 5 minutos de juego para el gráfico final.

## Zonas

| Zona | Rango (mg/dL) |
|---|---|
| Baja | menos de 70 |
| Verde | 70 a 180 |
| Alta | más de 180 |

La glucosa del juego se limita entre 35 y 320 mg/dL. Parte de 115 mg/dL.

## Comidas

Cada comida agrega una **subida** repartida en el tiempo con una curva triangular: empieza a los *d* minutos, llega al máximo en *tp* y termina a los *dur* minutos. La subida total se multiplica por **1,3** (parámetro `AMP`) para que las curvas se noten en la pantalla.

| Alimento | | Velocidad | Subida base | Inicio / pico / fin (min) | Pico mostrado | Duración mostrada | Cerraduras (llaves) |
|---|---|---|---|---|---|---|---|
| Agua | 💧 | Sin subida | — | — | — | — | 0 |
| Manzana | 🍎 | Lenta | 40 | 10 / 60 / 150 | 45–90 min | 2–3 h | 40 |
| Banana | 🍌 | Media (madura o verde-amarilla) | 45 | 10 / 55 / 150 | 30–90 min | 2–3 h | 45 |
| Yogur con avena | 🥣 | Lenta | 35 | 15 / 90 / 200 | 60–120 min | 3–4 h | 35 |
| Leche con pan integral | 🥛 | Media | 55 | 10 / 65 / 180 | 45–90 min | 2–4 h | 55 |
| Pollo con ensalada | 🍗 | Lenta (con o sin almidón) | 30 | 30 / 120 / 240 | variable | variable | 30 |
| Fideos con salsa | 🍝 | Media | 90 | 15 / 90 / 210 | 60–120 min | 3–4 h | 45 + 45 |
| Pizza | 🍕 | Tardía (grasa) | 100 | 40 / 170 / 330 | 90–240 min | 4–6 h o más | 50 + 50 |
| Galletitas rellenas | 🍪 | Rápida (con rebote 12) | 60 | 5 / 55 / 170 | 30–90 min | 2–4 h | 60 |
| Alfajor | 🍫 | Tardía (azúcar y grasa, rebote 10) | 110 | 10 / 85 / 240 | 45–120 min | 3–5 h | 55 + 55 |
| Torta | 🍰 | Media, variable (rebote 18) | 140 | 10 / 80 / 240 | 45–120 min | 3–5 h | 70 + 70 |
| Gaseosa | 🥤 | Rápida (rebote 25) | 120 | 0 / 30 / 100 | 15–45 min | 1–2 h | 60 + 60 |
| Jugo | 🧃 | Rápida (rescate) | 50 | 0 / 12 / 45 | 10–20 min | 1 h | — |
| Azúcar | 🍬 | Rápida (rescate) | 30 | 0 / 10 / 40 | 10–15 min | 1 h | — |

- **Rebote:** algunas comidas con mucha azúcar agregan una bajada pasajera de ese tamaño (en mg/dL): empieza 10 minutos después del pico y dura 90 minutos.
- **Cerraduras:** cada comida con cerraduras las suma a la barriga de Gluco; cada cerradura se abre con la llave y agrega insulina ilustrativa de ese tamaño (unidades de juego, **no son unidades reales de insulina**).
- **Plenitud:** cada comida llena un poco (0,2 a 2). Gluco se llena a 4 y se vacía lentamente.
- **Banana:** al azar, madura (sube más rápido y más) o verde-amarilla (más despacio).
- **Pollo:** al azar, solo con ensalada (casi no sube) o con papas o arroz (sube un poco y tarde).

## Insulina (ilustrativa)

Curva triangular genérica de insulina rápida: **inicio a los 25 min, mayor efecto a los 130 min, fin a los 300 min** (referencias generales de 15–30 min, 1–3 h y 3–5 h). Cada llave abierta se suma a la anterior (insulina activa). Una glucosa baja **nunca** se corrige con la llave: el juego lo impide y explica que se toma algo dulce.

## Otros efectos sobre la glucosa

| Situación | Efecto |
|---|---|
| Tristeza o enojo | +0,45 mg/dL por minuto de juego mientras dura |
| Resfrío | +0,3 mg/dL por minuto de juego mientras dura |
| Pelota / gimnasia | −1,1 mg/dL por minuto de juego mientras se juega |
| Más de 150 min sin comer | −0,2 mg/dL por minuto (si está por encima de 60) |
| Agua con glucosa alta | −8 mg/dL |

## Ritmo de ventanas

- Hay al menos **100 minutos de juego** entre una ventana (pregunta, adivinanza, situación, falta de apetito, glucosa baja) y la siguiente.
- No se abre una ventana mientras Gluco come, juega, tiene un mensaje en pantalla o está triste, enojado o enfermo.
- Por día: 2 preguntas de mito/realidad, 1 adivinanza (a partir de las 10:00), 1 situación, 1 emoción y, si falta apetito, 1 ventana de apetito.

## Puntaje

- Estrellas: 3 si pasó el 75% del tiempo en verde, 2 si pasó el 50%, 1 en otro caso. Si no se comió a lo largo del día, se limitan.
- Mejor día: solo cuenta si se comió en las tres franjas (desayuno, almuerzo y merienda).
- Los textos no nombran una cantidad fija de comidas.

## Cómo cambiar parámetros

Los valores están en `src/game.js`: `FOODS`, `INS`, `AMP`, `GAP`, `SPEEDS`, y en `step()` los efectos de emociones y movimiento. Después de cambiar algo:

1. `npm run all`.
2. Actualizá este documento.
3. Pedí una nueva [revisión profesional](revision-profesional.md).
