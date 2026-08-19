@AGENTS.md

# Flujo de trabajo de este proyecto (System Content Studio)

- Antes de escribir el guion completo de un vídeo de YouTube, pregunta si
  lleva tablero (sí/no). Si el usuario dice que va a hacer un tablero o un
  PDF, pregunta qué tipo de recurso es antes de prepararlo. Detalle completo
  en la skill `guion-youtube-flujo`.
- Al escribir el texto hablado de un guion, pásalo por la skill
  `ai-text-humanizer` antes de darlo por terminado.
- Cuando el usuario pase un vídeo para analizar (URL o archivo local), usa
  la skill `watch` para transcribirlo y verlo, no lo describas de oídas.
- Al usar la biblioteca de conocimiento como fuente, prioriza el campo largo
  `clase` de cada documento (`src/lib/types.ts`) sobre los fragmentos
  sueltos (`conceptos`, `resumen`).
- Para guionizar un tablero estilo Miro (consumido después por la app
  privada `miropriv`), usa la skill `guionizador`.
- Para generar infografías, imágenes de contexto, imágenes con foto del
  usuario, animaciones de contexto, PDFs o presentaciones de apoyo, usa la
  skill `recursos-visuales` — pregunta siempre el tipo de recurso y el
  contexto antes de generar nada, cada llamada consume crédito real.
- Kie.ai se usa **solo para imágenes fijas**, nunca para vídeo. Las
  animaciones se hacen con Remotion, en la carpeta `remotion/`. Detalle
  completo en `recursos-visuales` §8.
- **Todas las animaciones de vídeo van en el mismo lenguaje visual**, el del
  motor `remotion/lienzo/`: papel con retícula tenue, objetos fotográficos
  recortados sobre fondo blanco compuestos con `mixBlendMode: multiply`
  (el blanco desaparece, la sombra sobrevive), cámara con paralaje por
  profundidad de capa, y texto revelado letra a letra con aberración
  cromática. No se inventan estilos nuevos por vídeo: se cambia la paleta.
  - Identidad de Modula (por defecto para vídeos): blanco `#FAFAF7` +
    amarillo `#FFC300` + tinta `#141414` — `remotion/scenes/contexto/`.
    El amarillo aparece solo en tres sitios: la banda de fondo lavada, la
    barra de resalte detrás de UNA palabra por escena, y los propios
    objetos fotográficos (a Kie se le piden amarillos cuando el objeto lo
    admite). 16:9, mudas, para montar sobre la grabación a cámara.
  - `remotion/scenes/reel/` es la variante 9:16 sin color de marca.
- Las animaciones se anclan a una **frase concreta** del guion, no a un
  capítulo entero: `remotion/scenes/contexto/anclas.json` es la fuente de
  verdad (id de composición → capítulo + frase literal).
  `node scripts/anclar-guion.mjs` escribe las marcas `[[clave|frase]]` en
  el texto del capítulo, y en el modo guion de la app esa frase sale
  subrayada y reproduce el clip al pasar el ratón.
- Cadena completa para un vídeo nuevo:
  `gen-capas-contexto.mjs` (imágenes) → `anclar-guion.mjs` (marcas) →
  `render-contexto.mjs` (renderiza las 16 y las engancha al guion).
- Persistencia: el estado de la app (guiones, conocimiento, fuentes) vive en
  `data/studio.db` (SQLite, vía `src/lib/db/client.ts` y la ruta
  `/api/db/state`), no solo en localStorage. No lo borres sin que el usuario
  lo pida explícitamente.
