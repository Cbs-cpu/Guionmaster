---
name: imagen-prompt-craft
description: >
  Cómo escribir prompts que dan buenas imágenes en Kie.ai (modelos
  gpt-image-2-text-to-image / gpt-image-2-image-to-image) para infografías,
  imágenes de contexto e imágenes con foto de referencia, y cómo mantener un
  set de imágenes coherente entre sí en vez de piezas sueltas con estilos
  distintos. Úsala en conjunto con `recursos-visuales` justo antes de
  escribir el campo "prompt" de cualquier llamada a
  /api/ai/visuals/generate — no la sustituye, la complementa.
---

# CÓMO PEDIR BUENAS IMÁGENES (KIE.AI)

Un prompt vago da una imagen genérica con pinta de "hecha por IA". Esta
skill es la checklist para que no pase eso.

## 1. Estructura del prompt

Todo prompt bueno responde, en este orden, a:

1. **Qué es** — el sujeto exacto, no una categoría vaga. "Un embudo con
   tres niveles etiquetados" en vez de "una infografía de ventas".
2. **Estilo** — una etiqueta de estilo concreta y consistente (ver §2).
3. **Composición** — centrado / con espacio negativo alrededor / regla de
   tercios / vista frontal, isométrica, etc.
4. **Color** — 2-3 colores como máximo, no "colores vivos". Si el proyecto
   ya tiene un acento (ver `guionizador` §113.6, estética SF Pro/editorial),
   nómbralo explícitamente.
5. **Qué excluir** — sin texto salvo que lo pidas expresamente, sin marcas
   de agua, sin logos inventados, sin gente genérica de stock photo.

Ejemplo malo: *"infografía moderna sobre sistemas empresariales, colores
vivos, estilo profesional"*.

Ejemplo bueno: *"Diagrama de flujo minimalista, vista frontal, tres cajas
rectangulares conectadas por flechas curvas de izquierda a derecha,
etiquetas 'Input', 'Proceso', 'Output', estilo editorial de línea plana,
un solo color de acento sobre fondo blanco, sin sombras ni degradados, sin
texto adicional, mucho espacio en blanco alrededor."*

## 2. Etiquetas de estilo que funcionan bien y que NO usar

Usa etiquetas de estilo concretas y repetibles:

- `flat vector icon, single-color line art, no gradients, no shadows` —
  para diagramas/iconos de tablero (encaja con la estética editorial del
  proyecto).
- `minimal editorial illustration, muted palette, generous negative space`
  — para imágenes de contexto/metáfora.
- `photoreal, natural lighting, unposed` — para imágenes con foto de
  referencia del usuario, cuando se busca que no se note "generado".

Evita adjetivos de hype que no aportan control real y suelen producir el
aspecto genérico de IA que se quiere evitar: *cinematic, ray-traced,
hyperdetailed, 8K, trending on artstation, dramatic lighting, epic*. Son
la misma señal de "escrito por una IA" que ya se evita en el texto de los
guiones (ver reglas de `src/lib/ai/systemPrompt.ts`) — aplica igual a
imágenes.

## 3. Coherencia entre varias imágenes de un mismo set

Cuando generes más de una imagen para el mismo vídeo o tablero:

- Reutiliza literalmente la misma frase de estilo en todos los prompts del
  set (mismo string de §2, palabra por palabra). Es lo que hace que un
  tablero se sienta un sistema y no una colección de piezas sueltas
  (`guionizador` §113-114).
- Si necesitas que dos imágenes compartan composición o un elemento visual
  recurrente (p. ej. el mismo icono de "reloj de arena" en dos frames
  distintos), genera la primera, y para la segunda usa
  **image-to-image** pasando la primera como `referenceImagePaths` con un
  prompt que diga qué cambiar — mantiene mucho más la coherencia que dos
  llamadas independientes de texto a imagen.
- Antes de lanzar el set completo, genera una primera imagen "ancla" y
  enséñasela al usuario. Si el estilo convence, generas el resto con la
  misma fórmula; si no, ajustas la fórmula una vez en vez de corregir
  imagen por imagen.

## 4. Aspect ratio y resolución por uso

- **Image slot de tablero** (`guionizador`): normalmente `1:1` o `4:5`,
  salvo que el guion pida explícitamente `16:9` (protagonista horizontal).
- **Overlay/b-roll dentro de un vídeo de YouTube**: `16:9`.
- **Reels/Stories/carrusel**: `9:16` o `4:5`.
- **Resolución**: `2K` por defecto. Sube a `4K` solo si va a imprimirse
  (PDF, presentación) o a ocuparse a pantalla completa; `1K` basta para
  miniaturas o pruebas rápidas de estilo antes de generar la versión final.

## 5. Imágenes con foto de referencia (image-to-image)

Además de §1-2, sé explícito sobre qué se conserva y qué cambia:

- Qué se conserva de la foto original (la cara, la postura) frente a qué
  cambia (fondo, ropa, escena, iluminación) — decirlo mejora mucho el
  resultado frente a un prompt genérico tipo "pon a esta persona en una
  oficina".
- Si el resultado va a convivir con imágenes generadas desde cero en el
  mismo set, usa el mismo bloque de estilo de §2 también aquí para que no
  desentone.

## 6. Antes de dar por bueno un resultado

Pregúntate (o pregúntale al usuario si tienes dudas):

- ¿Se lee bien en miniatura, no solo a tamaño grande?
- ¿El texto, si lleva, es legible y correcto? (los modelos de imagen fallan
  a menudo con texto largo — para texto crítico, mejor generar sin texto y
  montarlo aparte).
- ¿Encajaría al lado de las demás piezas del mismo set sin desentonar?

Si la respuesta a alguna es no, ajusta el prompt (no regeneres a ciegas
con el mismo prompt esperando suerte: cada intento cuesta crédito real).
