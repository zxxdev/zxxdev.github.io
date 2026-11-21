---
title: Web personal
summary: "Esta web: un portfolio estático con un diseño basado en tokens, tema claro y oscuro, y una CI que comprueba cada cambio antes de publicarlo."
cover: La página de inicio de esta web en inglés, en tema oscuro, con el titular y una breve presentación.
---

## El problema

Quería un sitio que enseñara lo que construyo y el estado real de cada proyecto. No podía costar
nada alojarlo, no debía dejar nada que parchear y tenía que leerse bien en el móvil.

## Cómo funciona

- Cada página se genera una sola vez, al compilar la web, y se publica como ficheros sin más en
  GitHub Pages. Detrás no hay servidor ni base de datos.
- Cada proyecto es un fichero Markdown que se comprueba contra un esquema. Si a un fichero le falta
  un campo o nombra una tecnología que la web no conoce, la compilación se para y dice qué fichero y
  qué campo.
- La web está en inglés y en español, cada idioma con sus propias direcciones. Las palabras de cada
  idioma están en un solo sitio, y un test falla si una página o un proyecto no existe en los dos.
- Las tecnologías de la página de inicio se recogen de los proyectos, así que no aparece ninguna que
  no use algún proyecto.
- El filtro de la página de Proyectos es un script pequeño. Sin JavaScript se sigue viendo la lista
  completa.
- Las fechas, estrellas, versiones y lenguajes de estas páginas salen de la API de GitHub al
  compilar la web, nunca desde el navegador de quien la visita. Si GitHub no responde, la
  compilación usa una copia guardada, publica igual y lo dice debajo de las cifras.
- Cada cambio pasa por un pull request con linter, comprobación de tipos, tests unitarios,
  auditoría de dependencias y una compilación completa antes de poder fusionarse.

## Decisiones

Los documentos están en inglés.

- [Astro para una web estática](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0001-use-astro-for-a-static-site.md):
  una web de contenido necesita HTML, no un servidor en marcha.
- [Tokens de diseño y tema](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0002-design-tokens-and-theme.md):
  cada color se define una vez, con su valor claro y oscuro uno al lado del otro.
- [Rediseño nítido y tonos por proyecto](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0003-sharp-redesign-and-project-tones.md):
  un color por tipo de proyecto, de una lista cerrada de cuatro.
- [Proyectos como colección de contenido](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0004-projects-as-a-content-collection.md):
  un fichero Markdown por proyecto, con un esquema que la compilación hace cumplir.
- [Datos de GitHub al compilar](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0005-github-data-at-build-time.md):
  sin límite de la API ni token en el navegador, y una caída de GitHub nunca para una publicación.
- [Español e inglés](https://github.com/zxxdev/zxxdev.github.io/blob/main/docs/adr/0007-spanish-and-english.md):
  el inglés conserva sus direcciones y el español va bajo `/es/`.

## Lo que falta

Tests de punta a punta y de accesibilidad, y un buscador. Están en orden en la
[hoja de ruta](https://github.com/zxxdev/zxxdev.github.io#limitations-and-roadmap), en inglés.
