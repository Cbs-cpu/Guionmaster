# System Content Studio

Workspace personal y privado para crear contenido (Reels/Shorts y vídeos de
YouTube) que enseña **"una empresa es un sistema"** y construye autoridad para
dos servicios: implantaciones de sistemas con **Odoo** y **apps para
entrenadores personales**.

No es un SaaS ni un "AI writer" genérico: es una herramienta local de guionización
con una metodología concreta (biblioteca de conocimiento, generadores, editor de
3 columnas y biblioteca de guiones), pensada para un único usuario.

## Qué incluye

1. **Biblioteca de conocimiento** (`/conocimiento`) — un documento por marco
   (Systems Thinking, BPM, Value Stream, Theory of Constraints, Information
   Silos, Enterprise Architecture, Process Mining), cada uno con su fuente
   citada, navegable como archivos independientes, con modo lectura a pantalla
   completa y apuntes propios por documento. Se puede **importar y exportar**
   (ver más abajo) para ampliar la biblioteca con investigación hecha fuera.
2. **Generador de Reels** (`/reels/nuevo`) — inputs → 5 hooks tipados → estructura
   completa (Hook → Problema → Consecuencia → Insight → Sistema → Beneficio → CTA).
3. **Generador de YouTube** (`/youtube/nuevo`) — inputs → 5 títulos → hook, promesa,
   capítulos, guion y visuales por sección.
4. **Generador de carruseles** (`/carrusel/nuevo`) — inputs → 4-10 slides en 4:5
   listos para Instagram, con vista previa deslizable tipo feed y pie de
   publicación. El ritmo visual (portada clara → alternancia claro/oscuro →
   cierre sobre degradado, con barra de progreso y flecha de swipe en cada
   slide) lo impone la app, no el modelo.
5. **Editor** (`/editor/[id]`) — workspace de 3 columnas: Estructura (navegación
   y metadatos), Guion (edición, **modo lectura** tipo teleprompter y **modo
   guion** con las marcas de edición reveladas) y Recursos (documentos
   entrelazados + enlaces de apoyo). Sin dependencia de IA: para reescribir o
   generar contenido se usa el chat de Claude Code directamente (ver la skill
   `guion-studio` más abajo).
6. **Biblioteca** (`/biblioteca`) — todos los guiones con estado, favoritos,
   duplicar/eliminar. Trae precargados reels, vídeos de YouTube y un carrusel
   de ejemplo (ver `src/lib/seed-scripts.ts`) escritos a mano con la metodología
   del estudio, para que la biblioteca no arranque vacía.
7. **Fuentes** (`/fuentes`) — archivo del contenido que ya existe (reels, vídeos
   de YouTube y carruseles, propios o de referencia) guardado con su
   transcripción completa, para poder buscar por una frase suelta y recuperar de
   qué pieza salió. Arranca vacío y se rellena importando un JSON.

### Documentos entrelazados

Cada guion declara de qué marcos de conocimiento nace (`Recursos → Entrelazado →
Viene de`) y con qué otros contenidos forma familia (el vídeo largo, los reels
que salen de él, el carrusel que lo resume). Los vínculos entre contenidos son
**simétricos**: se guardan en los dos guiones a la vez desde el store, así que
desde un reel se ve su vídeo de YouTube y desde el vídeo se ven sus reels. La
ficha de cada marco de conocimiento lista, a su vez, todo el contenido que sale
de él.

### Modo guion

El texto hablado se puede anotar con una sintaxis que viaja dentro del propio
guion y solo se revela en el modo guion:

| Sintaxis | Qué hace |
| --- | --- |
| `*palabra*` | Énfasis: se subraya, se dice con intención |
| `**palabra**` | Clave: se resalta, es la idea que no se puede perder |
| `[pausa]` `[corte]` `[zoom]` | Marcas de edición sin contenido |
| `[sub: texto]` `[anim: …]` `[broll: …]` `[grafico: …]` `[nota: …]` | Marcas con contenido |

No hace falta memorizarla: bajo cada bloque de texto hay una botonera que las
inserta en el cursor (y envuelve la selección, si hay). El modo guion muestra
además las notas de producción del bloque (tiempo, texto en pantalla, visual)
en un carril lateral, y descuenta las marcas del cálculo de duración.

Todo se guarda **en el navegador** (localStorage, vía Zustand) — no hay base
de datos ni backend con estado. Las únicas llamadas de red son a la API de
Anthropic para generar contenido.

## Formato del archivo de fuentes

`/fuentes` importa un JSON con esta forma (`src/lib/sources-io.ts` es la fuente
de verdad). Solo `titulo` y `transcripcion` son obligatorios; el resto se
rellena si viene, y se aceptan tanto `{"fuentes": […]}` como `{"sources": […]}`
o un array pelado:

```jsonc
{
  "fuentes": [
    {
      "plataforma": "youtube",        // "reel" | "youtube" | "instagram"
      "titulo": "Por qué automatizar un proceso roto no arregla nada",
      "autor": "Canal de referencia",
      "url": "https://…",
      "publicadoEn": "2026-02-14",
      "duracion": "14:20",
      "temas": ["automatización", "procesos"],
      "resumen": "Dos frases con la idea principal.",
      "transcripcion": "Texto completo de lo que se dice…"
    }
  ]
}
```

## Formato de los documentos de conocimiento

La biblioteca se puede exportar e importar en JSON, para poder pedirle a un LLM
(ChatGPT, Claude…) que investigue un tema y meter el resultado en la app sin
tocar código. En `/conocimiento` hay un botón **Exportar** (descarga toda la
biblioteca), un botón **Importar** y, dentro de él, **Copiar prompt**: un prompt
listo para pegar en ChatGPT que ya lleva el formato exacto y las reglas (citar
fuentes reales, no inventar datos, español directo).

La forma de un documento (`src/lib/knowledge-io.ts` es la fuente de verdad):

```jsonc
{
  "categorias": [
    {
      // Obligatorios
      "nombre": "Theory of Constraints",
      "ideaFundamental": "El rendimiento global de un sistema está limitado por una o varias restricciones.",
      "fuente": { "obraOMarco": "Theory of Constraints (\"The Goal\")", "autor": "Eliyahu M. Goldratt", "nota": "opcional" },
      "conceptos": [
        { "termino": "Bottleneck", "definicion": "El punto donde se acumula el trabajo porque la capacidad es menor que la demanda." }
      ],

      // Opcionales — material de estudio y de apoyo para guionizar
      "resumen": "Explicación en prosa, 2-5 párrafos.",
      "aplicacion": "Cómo aplica a una pyme con Odoo o a un negocio de entrenadores.",
      "ejemplos": ["..."],
      "erroresComunes": ["..."],
      "preguntasDiagnostico": ["..."],
      "ideasContenido": ["..."]
    }
  ]
}
```

Notas de diseño:

- Solo `nombre`, `ideaFundamental`, `fuente.obraOMarco` y `conceptos` son
  obligatorios, para que una respuesta parcial de un LLM no falle al importar.
- Se acepta tanto `{"categorias": [...]}` como `{"categories": [...]}` o un
  array pelado, porque cada LLM lo envuelve de una forma.
- El `id` se genera solo a partir del nombre si no viene, y **nunca puede pisar
  uno de los 7 marcos de serie**: si reimportas un export completo, esos 7 se
  omiten en vez de duplicarse, así que exportar/importar sirve de copia de
  seguridad.
- Los documentos importados quedan marcados como tal y se pueden eliminar desde
  su propia página; los 7 de serie viven en el código y no se tocan.

## Poner en marcha en local

```bash
npm install
cp .env.example .env.local   # añade tu ANTHROPIC_API_KEY (console.anthropic.com)
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Sin `ANTHROPIC_API_KEY` la
app funciona igual (navegación, biblioteca de conocimiento, biblioteca de
guiones con el contenido de ejemplo precargado) pero los botones de generación
con IA muestran un aviso explicando cómo activarla.

## Desplegar en Vercel

Este agente no tiene credenciales de tu cuenta de Vercel, así que el despliegue
lo haces tú en un par de clics:

1. En [vercel.com/new](https://vercel.com/new), importa el repositorio
   `Cbs-cpu/Guionmaster` (rama `claude/system-content-studio-ctto15` o la que
   hayas mergeado a tu rama principal).
2. En **Environment Variables**, añade `ANTHROPIC_API_KEY` (y opcionalmente
   `ANTHROPIC_MODEL`).
3. Deploy. Framework preset "Next.js" se detecta automáticamente.

Ten en cuenta que el spec pide una herramienta **local y privada**: el
almacenamiento vive en el navegador de cada visitante, así que si varias
personas abren la URL de Vercel, cada una tendrá su propia biblioteca vacía
en su propio navegador — no hay sincronización entre dispositivos.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Zustand (persist) ·
Anthropic SDK · Fraunces / Public Sans / IBM Plex Mono.

## Skills instaladas

Vía `npx skills@latest add …` (ver `skills-lock.json` y `.agents/skills`):
diseño e interacción de Emil Kowalski (`emilkowalski/skills`), el skill
oficial `anthropic-frontend-design`, y una selección de skills de
guionización/copywriting/estrategia de contenido usadas como referencia al
redactar los prompts de IA (`script-writer`, `scriptwriting-methodology`,
`short-form-video`, `video-script`, `content-strategy`, `content-marketing`,
`alterlab-pra-copywriter`).

Además, este repo trae su propia skill **privada** del proyecto en
`.claude/skills/guion-studio/SKILL.md`: el mismo método de guionización que usan
los generadores de la app, pero para escribir un guion directamente en el chat
con Claude Code, sin pasar por la API ni necesitar `ANTHROPIC_API_KEY`.
