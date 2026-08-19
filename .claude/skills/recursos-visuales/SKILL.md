---
name: recursos-visuales
description: >
  Genera los recursos visuales que acompañan a un guion dentro de System
  Content Studio (guionmaster): infografías, imágenes de contexto, imágenes
  compuestas con fotos de referencia del usuario, animaciones de contexto
  (motion graphics estilo Vox, renderizadas con Remotion), y el ensamblado
  de un PDF o una presentación cuando el vídeo no lleva tablero. Usa la API
  de Kie.ai (SOLO imagen) a través de las rutas del propio proyecto. Úsala
  siempre que el usuario pida una infografía, una imagen o una animación
  para un vídeo, un PDF o una presentación de apoyo, o que "genere recursos"
  para un guion — y SIEMPRE antes de generar nada, para hacer la serie de
  preguntas de contexto.
---

# RECURSOS VISUALES — INFOGRAFÍAS, IMÁGENES Y DOCUMENTOS

Esta skill cubre el "y si no es un tablero, ¿qué?" del flujo de vídeos:
cuando `guion-youtube-flujo` pregunta "¿tableros sí o no?" y la respuesta es
no, el recurso de apoyo puede ser una infografía suelta, una serie de
imágenes de contexto, una imagen con una foto del propio usuario, un PDF o
una presentación — todo generado aquí.

Regla de oro: **nunca generes nada sin preguntar antes**. Kie.ai consume
crédito real por cada generación; no se piden variantes "por si acaso".

Antes de escribir el `prompt` de cualquier generación, pasa por la skill
`imagen-prompt-craft` — es la checklist de cómo redactar el prompt para
que no salga con pinta genérica de IA y para que un set de varias
imágenes se sienta coherente entre sí.

## 0. Cómo está montado (para no tener que redescubrirlo cada vez)

- La clave `KIE_API_KEY` vive en `.env.local` (no se toca desde el chat ni
  se pega en comandos de terminal: siempre se usa a través de las rutas del
  servidor, nunca con curl directo a `api.kie.ai`).
- `POST /api/ai/visuals/generate` — genera una imagen. Body:
  ```json
  {
    "kind": "infografia | imagen-contexto | imagen-usuario | otro",
    "prompt": "descripción completa en inglés o español, la que mejor entienda el modelo",
    "aspectRatio": "1:1 | 4:5 | 16:9 | 9:16 | ... (opcional, por defecto auto)",
    "resolution": "1K | 2K | 4K (opcional, por defecto 2K)",
    "referenceImagePaths": ["refs/xxx.png"]  // opcional, fotos ya subidas
  }
  ```
  Devuelve `{ id, kind, prompt, model, filePath, url, createdAt }`. El
  archivo ya queda descargado en `data/media/generated/` (las URLs de
  Kie.ai caducan a las 24h, por eso la ruta se encarga de bajarlo al
  momento). Tarda: normal que la llamada tarde entre 15 y 90 segundos.
- `POST /api/ai/visuals/upload-reference` — guarda localmente una foto que
  el usuario suba desde la página `/recursos` de la app (fotos de
  referencia reutilizables). No hace falta llamarla desde el chat salvo que
  el usuario te pase directamente el archivo a ti y prefiera que tú la
  subas en su nombre.
- `GET /api/media/<ruta>` — sirve cualquier archivo guardado.
- El servidor debe estar corriendo (`npm run dev`) para poder llamar a
  estas rutas.
- **Regla obligatoria: todo lo que generes se adjunta al guion, siempre,
  sin que el usuario tenga que importarlo.** Después de generar, lee el
  estado completo con `GET /api/db/state`, localiza el guion en
  `state.scripts`, añade el objeto `VisualResource` a su array `visuals`
  (con `chapterId` si es de un capítulo concreto), y guarda con
  `PUT /api/db/state` mandando `{"scripts": [...]}` con el array completo
  actualizado. Nunca dejes una imagen generada solo en `data/media/` sin
  anclarla a un guion — la página `/recursos` solo muestra lo que está en
  `visuals` de algún guion, agregado automáticamente
  (`useAllGeneratedVisuals` en `src/lib/relations.ts`); si no la adjuntas,
  el usuario no la ve ahí. Si genuinamente no hay un guion al que
  anclarla todavía, dilo explícitamente y pregunta a cuál asociarla en vez
  de dejarla huérfana. Si la app está abierta en el navegador mientras
  tanto, dile al usuario que refresque para verlo (el store de la pestaña
  no se entera solo).

## 1. Primera pregunta siempre: ¿qué tipo de recurso es?

No asumas. Si no lo ha dicho ya, pregunta:

> "¿Esto es una infografía, una o varias imágenes de contexto, una imagen
> con una foto tuya, un PDF o una presentación?"

Y en qué guion/capítulo encaja (título del guion, y capítulo si es un
vídeo largo de YouTube).

## 2. Preguntas comunes a cualquier imagen

Antes de escribir el prompt de generación, reúne:

1. **Qué debe transmitir** — no "algo bonito de sistemas", sino la idea
   concreta (p. ej. "el cuello de botella real no es el que se ve a
   simple vista"). Si viene de un capítulo ya escrito, puedes proponerlo
   tú a partir del guion y pedir confirmación en vez de preguntar en
   blanco.
2. **Cuántas piezas** — una sola, una serie (¿cuántas?), o varias
   variantes de la misma idea para elegir.
3. **Formato/aspecto** — cuadrada (1:1) para carrusel o miniatura,
   vertical (4:5 o 9:16) para Reels/Stories, horizontal (16:9) para
   overlay dentro del vídeo de YouTube. Pregunta si no es obvio por el
   tipo de contenido.
4. **Estilo visual** — coherente con la identidad ya usada en
   `guionizador` (editorial, sobrio, tipografía tipo SF Pro, nada de
   aspecto "genérico IA"): confirma si aplica aquí o si quiere otra cosa.
5. **Texto dentro de la imagen** — si lleva texto (títulos, cifras,
   etiquetas), pide el texto EXACTO y en qué idioma. Avisa de que los
   modelos de imagen no siempre renderizan bien texto largo: para textos
   críticos, mejor generar la imagen sin texto y montarlo aparte, o
   confirmar que se acepta el riesgo.

## 3. Si es infografía

Además de lo del §2, pregunta:

- Qué datos/pasos/comparación exactos debe mostrar (no inventes cifras ni
  pasos que no estén en el guion o en la clase de conocimiento de la que
  nace — misma regla de "no alucinar" que rige el resto del proyecto).
- Si existe una estructura clara (proceso, pirámide, comparación,
  cronología), dilo en el prompt explícitamente — ayuda mucho más que
  describirlo en prosa.

`kind: "infografia"`.

## 4. Si es imagen de contexto

Pregunta qué escena o metáfora necesita ilustrarse (mismo espíritu que los
`IMAGE_SLOT` de la skill `guionizador`: rol — metáfora / apoyo / objeto /
escena —, concepto que representa, sujeto preferido, fondo). Confirma si
es foto realista o ilustración.

`kind: "imagen-contexto"`.

## 5. Si lleva una foto del usuario

1. Pregunta qué foto usar. Si ya hay alguna subida en `/recursos`
   (biblioteca de fotos de referencia), ofrécele elegir entre esas antes de
   pedirle que suba una nueva.
2. Pregunta la composición final: dónde aparece, haciendo qué, con qué
   fondo o elementos alrededor, con qué tono (profesional, cercano,
   editorial...).
3. Llama a `/api/ai/visuals/generate` con `referenceImagePaths` apuntando a
   la(s) foto(s) elegidas (rutas relativas tipo `refs/xxx.png`, máximo 16)
   — esto activa el modelo image-to-image en vez de texto a imagen.

`kind: "imagen-usuario"`.

## 6. Si es un PDF

Esta skill no genera el PDF en sí (no hay un endpoint de Kie.ai para eso):
tú generas las imágenes que necesite con `/api/ai/visuals/generate` y
luego ensamblas el documento (apóyate en la skill `pdf-design` si está
disponible para el formato final). Antes de escribir nada, pregunta:

- Tipo de documento: guía completa, chuleta de una página, checklist,
  lead magnet para captar contactos, material para enviar a un cliente...
- Extensión aproximada (páginas).
- Si lleva marca/logo y qué paleta de color.
- Qué imágenes generadas debe incluir (de las de este guion, o hace falta
  generar alguna específica para el documento).

Guarda el PDF final en `data/media/documents/` y regístralo como
`VisualResource` con `kind: "documento-pdf"` y `filePath` apuntando al PDF.

## 7. Si es una presentación

Igual que el PDF: tú escribes el contenido y generas las imágenes que
hagan falta; el ensamblado final (diapositivas) lo decides con el usuario.
Pregunta antes:

- Para qué es (apoyo para grabar el vídeo, material para repartir,
  entregable a un cliente) — cambia mucho el nivel de acabado.
- Número aproximado de diapositivas.
- Si sigue el guion capítulo a capítulo o tiene su propia estructura.

Guarda con `kind: "presentacion"`.

## 8. Si es una animación de contexto (motion graphics)

Clips mudos de 16:9 para montar **encima** de la grabación a cámara, en el
estilo de los explainers de Vox (collage de papel: fondo crema, tinta
carbón, un solo acento rojo, tipografía editorial pesada). La voz la pone
el propio vídeo: estas piezas **no llevan audio ni locución incrustada**.

**Reparto de trabajo (importante, no lo mezcles):**

- **Kie.ai genera SOLO imágenes fijas.** Nunca vídeo. Son las ilustraciones
  recortadas que después se mueven.
- **Remotion hace la animación.** Todo lo estructural — anillos, flechas,
  bucles, cajas, tipografía, tachones — va en vector nativo de Remotion,
  que sale nítido y se puede animar fotograma a fotograma. A Kie se le
  piden solo los objetos ilustrados (metáforas, cosas recortadas).

**Cómo está montado:**

- El proyecto vive en `remotion/`, aparte de la app Next (tsconfig propio,
  excluido del tsconfig raíz). `remotion/vox/` es el sistema de diseño
  (paleta muestreada de las imágenes ya generadas, tipografía y el
  vocabulario de movimiento: `slamIn`, `paperSettle`, `ripReveal`,
  `strokeDraw`, `StrikeThrough`). `remotion/scenes/` es una escena por
  capítulo y `remotion/Root.tsx` las registra.
- `remotion/capas.ts` traduce nombre con sentido → archivo de Kie
  (`generated/visual_xxx.png`). Cuando regeneres una imagen, cambia la ruta
  ahí y no escena por escena.
- **Truco imprescindible:** las imágenes de Kie vienen con fondo casi
  blanco. Para que no se vea un recuadro blanco sobre el papel crema se
  pintan con `mixBlendMode: multiply`, y el blend tiene que ir en un div
  exterior **sin** `transform`, `filter` ni `clip-path` — esos tres crean un
  stacking context y dentro de él la capa se queda blanca. El componente
  `LineArt` ya lo encapsula: úsalo y no lo reimplementes.
- Renderizar y enganchar es **un solo comando**, para que no queden
  archivos huérfanos:

  ```
  npm run anim:render -- <composicion> --script=<id> --chapter=<id> --notes="..."
  ```

  Vuelve a lanzarlo sobre la misma composición y reemplaza el vídeo y su
  registro en vez de duplicarlos.
- `npm run anim` abre el estudio de Remotion para previsualizar mientras se
  diseña (mucho más rápido que renderizar para ver un cambio).
- Duración típica 12-16 s a 30 fps, 1920×1080. El último plano se queda
  fijo un rato: déjalo legible, que en el montaje se congela.

**Antes de animar, lee las notas de producción del capítulo**
(`chapters[i].visual`, campos `bRoll` y `diagramas`): normalmente ya dicen
qué animación hace falta, y conviene respetarlas en vez de inventar otra.

## 9. Después de generar

Enseña el resultado (ruta del archivo, o la imagen si el canal lo permite)
antes de darlo por bueno. Si no convence, pregunta qué cambiar
concretamente en el prompt en vez de regenerar a ciegas — cada intento
cuesta crédito real de la cuenta de Kie.ai.
