---
summary: "Addon de World of Warcraft: Forever para subir de nivel: guías de misiones, flecha y marcas en el mapa propias, talentos y mazmorras."
cover: "La ventana de pasos de TrailMate en el juego: 33-34 Stranglethorn Vale, paso 22 de 92, hacer Bloody Bone Necklaces, con los pasos siguientes, los botones Done y Skip, y debajo una barra que avisa de que las bolsas están llenas, con un botón Take me."
---

## El problema

Subir de nivel un personaje obliga a decidir una y otra vez qué misiones coger, adónde ir después,
qué aprender en el instructor de clase y qué vender. Sin ayuda, eso significa parar el juego para
buscarlo. TrailMate da esos consejos dentro del juego y explica cada recomendación.

## Cómo funciona

- **Aconseja, nunca juega.** Lee lo que el juego muestra y dibuja texto, una flecha y marcas en el
  mapa. Nunca pulsa teclas, mueve al personaje, compra, vende ni entrena.
- **Guías de misiones** para las dos facciones del nivel 1 al 60, y una ruta montada a partir del
  registro de misiones cuando no hay guía.
- **Flecha y marcas en el mapa propias.** No necesita ningún otro addon.
- **Consejos en el instructor y en el vendedor:** qué aprender, qué saltarse o dejar para más tarde,
  y qué vender, guardar o llevar a la casa de subastas, cada cosa con su motivo.
- **Un compañero con IA, opcional.** Un addon no puede salir a internet, así que un pequeño programa
  en Go, en el PC del jugador, lleva los mensajes a través de ficheros que el juego ya escribe. El
  compañero solo responde preguntas: no tiene herramientas.

El addon está escrito en Lua y se comprueba con luacheck y busted. El puente está escrito en Go y se
comprueba con `go vet` y sus tests. Los dos pasan por la CI en cada pull request.

## Decisiones

- [El puente del compañero](https://github.com/zxxdev/TrailMate/blob/main/docs/adr/0001-companion-bridge.md)
  (en inglés): cómo salen los mensajes del juego sin conexión de red, y por qué. La idea viene de
  [Witchcraft](https://github.com/Geraldlol/witchcraft).

## Estado

Alfa. Se juega y se prueba con un solo personaje, así que tendrá fallos. Los problemas conocidos
están en el [repositorio](https://github.com/zxxdev/TrailMate#known-issues), en inglés.
