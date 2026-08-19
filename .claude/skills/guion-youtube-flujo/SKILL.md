---
name: guion-youtube-flujo
description: >
  Flujo de trabajo para escribir guiones de vídeos de YouTube (largos, con
  capítulos) dentro de System Content Studio (guionmaster), a partir de la
  biblioteca de conocimiento del proyecto o de un vídeo que el usuario pasa
  para analizar. Úsala siempre que el usuario pida escribir, generar o
  mejorar un guion de YouTube en conversación con Claude Code (no solo desde
  la app), cuando pida analizar un vídeo para sacar un guion de él, o cuando
  mencione "tablero" o "PDF" como recurso que va a producir a partir de este
  proyecto.
---

# GUION YOUTUBE — FLUJO DE TRABAJO

Esta skill no sustituye a la app (`/api/ai/youtube-script` sigue existiendo
para generar desde la interfaz). Es el protocolo que sigue Claude Code
cuando el usuario le pide directamente, en conversación, que escriba o
mejore un guion de YouTube, que analice un vídeo, o que decida si algo se
convierte en tablero.

## 1. Antes de escribir un guion de YouTube: pregunta "¿tableros, sí o no?"

Nunca empieces a escribir el guion completo de un vídeo de YouTube sin antes
preguntar explícitamente si ese vídeo (o alguno de sus capítulos) va a tener
también un tablero estilo Miro. Es una pregunta corta, no un formulario:

> "¿Este vídeo lleva tablero (sí/no)? Y si es que sí, ¿de todo el vídeo o solo de algún capítulo?"

- Si la respuesta es **no**: escribe el guion normal, sin más.
- Si la respuesta es **sí**: al terminar el guion, usa la skill `guionizador`
  para producir el `board-script.md` de los capítulos indicados (ver §3), y
  guárdalo en el campo `board` del capítulo correspondiente (ver
  `src/lib/types.ts` → `YoutubeChapter.board`) para que se pueda leer luego
  en "Modo tableros" dentro del editor.

No preguntes esto si el usuario ya lo ha dicho sin que se lo pidas ("hazme
el guion y el tablero de tal capítulo", "este no lleva tablero"). La regla
es no asumir en silencio, no interrumpir dos veces por lo mismo.

## 2. Si el usuario dice que va a hacer un tablero o un PDF

Cuando el usuario anuncie que va a producir un tablero o un PDF a partir de
contenido de este proyecto (sin que tú lo hayas preguntado), no lo des por
sentado: pregunta qué tipo de recurso exactamente, porque cambia cómo lo
preparas.

- **Tablero** → pregunta (o infiere si es obvio, según las reglas de la
  propia skill `guionizador` en su §8-11): objetivo, audiencia, profundidad
  (`quick` / `standard` / `deep` / `exhaustive`) y si es de todo un vídeo o
  de un capítulo concreto. Después invoca `guionizador`.
- **PDF, presentación, infografía o imagen suelta** → usa la skill
  `recursos-visuales`, que tiene el protocolo completo de preguntas para
  cada tipo de recurso y sabe generar las imágenes con Kie.ai.

## 3. Guionizar un tablero desde un capítulo de YouTube

1. Reúne el contenido del capítulo (guion ya escrito + los documentos de
   conocimiento de los que nace, campo `knowledgeIds` del guion — prioriza
   el campo `clase` de esos documentos, no los fragmentos sueltos).
2. Invoca la skill `guionizador` con esa información como fuente.
3. Guarda el `board-script.md` resultante en `script.chapters[i].board.script`
   y marca `script.chapters[i].board.needed = true`.
4. Recuerda al usuario que el tablero en sí (el canvas Miro) se construye en
   la otra app (`miropriv`), no aquí: aquí solo vive el guion del tablero,
   listo para pasarlo.

## 4. Generar el guion de un vídeo a partir de conocimiento

Cuando el usuario pida "escríbeme el guion de un vídeo sobre X basándote en
el conocimiento que tengo guardado":

1. Busca en la biblioteca (`src/lib/knowledge-base.ts` + los documentos
   importados) los marcos relevantes. Usa el campo `clase` (la clase larga)
   como fuente principal de contenido, no solo `conceptos` o `resumen` —
   son el índice rápido, no el material de partida.
2. Sigue las reglas centrales del proyecto (`src/lib/ai/systemPrompt.ts`):
   enseñar antes de vender, cero lenguaje corporativo vacío, frases
   concretas, no inventar datos ni estadísticas.
3. Antes de dar el guion por terminado, pasa el texto hablado (no las notas
   de producción) por la skill `ai-text-humanizer` para quitar tics de
   escritura de IA y que suene a persona real hablando a cámara, no a texto
   generado.
4. Pregunta lo del §1 (tableros sí/no) antes de considerar el guion cerrado.

## 5. Cuando el usuario pase un vídeo para analizar

Usa la skill `watch` para descargar/leer el vídeo, sacar la transcripción y
mirar los fotogramas. A partir de ahí puedes:

- Usarlo como fuente para escribir un guion nuevo inspirado o derivado de él
  (aplicando igualmente los pasos de humanización del §4).
- Añadirlo como `ContentSource` en `src/lib/sources-io.ts` / la sección
  "Fuentes" de la app, con su transcripción, para que quede archivado y
  buscable, no solo comentado en el chat.

No inventes contenido del vídeo que no esté en la transcripción o en lo que
se ve en los fotogramas — la misma regla de "no alucinar" que rige el resto
del proyecto.
