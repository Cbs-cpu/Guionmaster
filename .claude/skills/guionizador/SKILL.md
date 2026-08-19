---
name: canvas-guionizador
description: >
  Convierte información bruta, PDFs, documentos, notas, URLs o ideas en un guión
  estructurado y ejecutable para crear un Private AI Canvas. Define la narrativa
  completa del tablero, sus frames, jerarquía, contenido, diagramas, evidencias,
  imágenes necesarias, relaciones y recorrido visual, pero NO construye el tablero.
  El resultado se guarda como un archivo board-script.md que posteriormente puede
  consumir canvas-diseño para construir el canvas y canvas-imagenes para generar
  los assets necesarios.
---

# CANVAS GUIONIZADOR
## Sistema de guionización y arquitectura narrativa de tableros visuales

Esta skill actúa ANTES de:

- `canvas-diseño`
- `canvas-imagenes`

Su trabajo es convertir información en una especificación clara de QUÉ debe contar
el tablero y CÓMO debe estructurarse conceptualmente.

NO debe:

- construir el canvas;
- posicionar objetos finales;
- generar imágenes;
- diseñar componentes de la app;
- escribir código React;
- llamar a Higgsfield;
- crear assets visuales;
- decidir microdetalles de UI.

Debe producir el guión que posteriormente utilizará `canvas-diseño`.

---

# 1. PIPELINE GENERAL

La arquitectura del sistema es:

```text
FUENTES
↓
canvas-guionizador
↓
board-script.md
↓
canvas-diseño
↓
canvas-imagenes cuando sea necesario
↓
TABLERO FINAL

El archivo board-script.md es el contrato entre la información original y
la construcción visual.

2. OBJETIVO

El usuario puede proporcionar:

PDFs;
documentos;
apuntes;
texto;
markdown;
imágenes;
capturas;
transcripciones;
URLs;
investigaciones;
ideas;
guiones;
contenidos de cursos;
frameworks;
documentación interna;
una combinación de varias fuentes.

Tu trabajo es convertir esas fuentes en una narrativa visual estructurada.

No debes limitarte a resumir.

Debes decidir:

qué quiere comunicar el tablero;
qué debe aprender o entender el espectador;
cuál es el recorrido narrativo;
qué conceptos son principales;
qué conceptos son secundarios;
qué debe mostrarse como texto;
qué debe convertirse en diagrama;
qué necesita evidencia;
qué podría necesitar una imagen;
qué relación existe entre los distintos bloques;
cómo dividirlo en frames;
en qué orden debe recorrerse.
3. DIFERENCIA ENTRE RESUMIR Y GUIONIZAR

NO hagas esto:

Documento:
- Tema A
- Tema B
- Tema C
- Tema D

Eso es un resumen.

Debes hacer esto:

FRAME 01
Pregunta:
¿Por qué existe este problema?

Objetivo:
Hacer que el usuario comprenda la causa.

Idea central:
...

Representación:
Comparación visual.

Evidencia:
...

Transición:
Esto nos lleva a entender...

Guionizar significa convertir información en una experiencia.

4. PRINCIPIO FUNDAMENTAL

No diseñamos páginas.

Diseñamos un RECORRIDO DE COMPRENSIÓN.

El usuario debería avanzar mentalmente por algo parecido a:

¿QUÉ ESTÁ PASANDO?
↓
¿POR QUÉ PASA?
↓
¿CÓMO FUNCIONA?
↓
¿QUÉ CONSECUENCIAS TIENE?
↓
¿CUÁL ES EL MODELO CORRECTO?
↓
¿CÓMO SE APLICA?
↓
¿QUÉ PRUEBAS EXISTEN?
↓
¿QUÉ DEBO RECORDAR?

No es obligatorio utilizar esta estructura exacta.

Pero siempre debe existir una progresión lógica.

5. FUENTES PRIMERO

Antes de escribir el guión:

LEE TODA LA INFORMACIÓN RELEVANTE.

Si el usuario proporciona un PDF, documento o fuente accesible mediante herramientas:

úsala directamente.

No le pidas que resuma un documento que puedes leer.

Si existen varias fuentes:

identifica todas;
léelas;
cruza información;
elimina duplicados;
identifica contradicciones;
crea una visión completa.

No empieces a guionizar después de leer únicamente la primera página de un PDF largo.

6. NO ALUCINAR

La fidelidad al material original es prioritaria.

Nunca inventes:

datos;
estadísticas;
estudios;
testimonios;
citas;
resultados;
ejemplos reales;
fechas;
nombres;
conclusiones atribuidas a una fuente.

Si añades una interpretación propia, debe quedar identificada como:

Interpretación editorial

Si una afirmación importante necesita evidencia pero la fuente no la proporciona:

marca:

EVIDENCIA PENDIENTE

No rellenes el hueco inventándola.

7. TRAZABILIDAD

Cuando trabajes a partir de documentos, conserva la relación entre:

AFIRMACIÓN
↕
FUENTE

El guión debe poder indicar cuando sea útil:

source:
  file: metabolismo.pdf
  page: 14

o:

source:
  document: estrategia-historias.md
  section: Regla del 100%

No necesitas saturar cada frase con referencias.

Pero las afirmaciones importantes, datos y evidencias deben poder rastrearse.

8. PREGUNTAS INICIALES

Antes de guionizar debes comprobar si conoces:

BOARD_CONTEXT:
  objective:
  audience:
  use_case:
  depth:
  board_theme:
  accent_color:
  preferred_orientation:

No preguntes automáticamente por todo.

Infierelo del contexto cuando sea razonablemente evidente.

Pregunta únicamente aquello que cambie sustancialmente el resultado.

9. OBJETIVO DEL TABLERO

Todo tablero necesita un objetivo principal.

Ejemplos:

Enseñar una metodología.
Explicar un concepto complejo.
Convertir una investigación en material educativo.
Documentar un sistema.
Presentar una estrategia.
Crear un mapa visual de conocimiento.
Explicar un proceso paso a paso.
Persuadir acerca de una tesis.

Nunca empieces a dividir frames sin conocer el objetivo.

10. AUDIENCIA

Determina para quién se diseña.

Puede ser:

usuario privado;
clientes;
alumnos;
equipo;
prospectos;
equipo técnico;
audiencia general;
expertos;
principiantes.

La profundidad depende de la audiencia.

Una explicación para principiantes necesita:

más contexto;
analogías;
ejemplos;
definiciones.

Una explicación para expertos puede:

reducir definiciones;
aumentar densidad;
utilizar terminología especializada;
profundizar en relaciones.
11. NIVEL DE PROFUNDIDAD

Clasificar:

depth:
  quick
  standard
  deep
  exhaustive
quick

Board breve.

Aproximadamente:

3–6 frames.

standard

Explicación completa sin convertirse en enciclopedia.

Aproximadamente:

6–12 frames.

deep

Sistema educativo detallado.

Aproximadamente:

10–20 frames.

exhaustive

Mapa de conocimiento amplio.

Puede superar:

20 frames.

No fuerces estos números.

Son referencias, no límites.

12. PRIMERA PASADA — EXTRACCIÓN

Después de leer las fuentes, extrae unidades de información.

Clasifica cada unidad como:

CONTENT_UNIT:
  type:
  priority:
  content:
  source:

Tipos posibles:

concept
claim
definition
mechanism
process
cause
effect
problem
solution
example
evidence
data
case
objection
principle
rule
warning
comparison
taxonomy
timeline
quote
conclusion
action
13. PRIORIDAD DEL CONTENIDO

Clasifica cada unidad:

P0

Imprescindible.

Sin esta idea el tablero pierde su tesis.

P1

Estructural.

Necesaria para comprender correctamente P0.

P2

Apoyo.

Ejemplos, evidencia, explicación, contexto.

P3

Detalle.

Información interesante pero no esencial.

No todo lo que aparece en una fuente debe aparecer en el canvas principal.

14. SEGUNDA PASADA — DEPURACIÓN

Una vez extraído el contenido:

elimina:

redundancias;
repeticiones;
ejemplos equivalentes;
explicaciones duplicadas;
tangentes irrelevantes.

Combina ideas equivalentes.

Conserva información repetida únicamente cuando desempeñe funciones narrativas diferentes.

15. TERCERA PASADA — RELACIONES

Identifica relaciones entre conceptos.

Tipos:

A causa B
A precede B
A contradice B
A contiene B
A es ejemplo de B
A demuestra B
A depende de B
A transforma B
A se compara con B
A pertenece a B

Estas relaciones serán fundamentales para determinar los diagramas.

16. CUARTA PASADA — TESIS

Condensa todo el tablero en una frase.

Formato:

Después de recorrer este tablero, la persona debería comprender que:
[tesis]

Ejemplo:

Después de recorrer este tablero, la persona debería comprender que las historias
no son contenido accesorio, sino el mecanismo diario que mueve gradualmente a una
audiencia desde el conocimiento hasta la compra.

Esta frase funciona como brújula.

Todo frame debe contribuir a ella.

17. QUINTA PASADA — PREGUNTAS NARRATIVAS

Convierte el contenido en preguntas.

Ejemplos:

En lugar de:

Jerarquía visual

pregunta:

¿Por qué nuestros ojos miran unas cosas antes que otras?

En lugar de:

Tipos de historias

pregunta:

¿Qué tipo de secuencia necesitamos según el estado del lead?

Las preguntas ayudan a crear frames con propósito.

Cada frame debería responder a una.

18. ARQUITECTURA GLOBAL

Antes de diseñar frames individualmente, establece capítulos.

Ejemplo:

CAPÍTULO 1 — CONTEXTO

CAPÍTULO 2 — PROBLEMA

CAPÍTULO 3 — MECANISMO

CAPÍTULO 4 — SISTEMA

CAPÍTULO 5 — APLICACIÓN

CAPÍTULO 6 — EVIDENCIA

CAPÍTULO 7 — CONCLUSIÓN

No todos los boards necesitan capítulos explícitos.

Pero el guión debe conocerlos conceptualmente.

19. NÚMERO DE FRAMES

Un frame debe contener una idea principal.

No optimices por reducir artificialmente el número.

Tampoco conviertas cada párrafo en un frame.

Divide según:

cambio de pregunta;
cambio de argumento;
cambio de mecanismo;
cambio de representación;
cambio de fase narrativa.
20. ANATOMÍA DE UN FRAME

Cada frame del guión debe especificarse así:

FRAME:
  id:
  chapter:
  title:
  question:
  objective:
  key_message:
  priority:
  narrative_role:
  template:
  content:
  visual_strategy:
  diagram:
  evidence:
  images:
  transition_in:
  transition_out:

No todos los campos tienen que contener contenido.

Pero deben evaluarse.

21. ID DE FRAME

Formato recomendado:

F01
F02
F03
...

Opcionalmente:

F01-contexto
F02-problema
F03-mecanismo

El ID debe ser estable.

canvas-diseño podrá referirse a él.

22. TÍTULO DEL FRAME

El título debe comunicar.

Evita:

Introducción
Información
Concepto

Preferir:

¿Por qué las historias tienen tanto peso?
Tu audiencia no compra de golpe
Cada historia mueve el reloj
El tamaño también comunica

El título debe ayudar incluso al observar el tablero desde lejos.

23. QUESTION

Pregunta conceptual que resuelve el frame.

Ejemplo:

¿Por qué una persona necesita múltiples impactos antes de comprar?

Puede no mostrarse literalmente en el canvas.

Su función principal es guiar la escritura.

24. OBJECTIVE

Describe qué debe ocurrir en la mente del espectador.

Ejemplo:

Comprender que la conversión es acumulativa y no instantánea.

No describas el contenido.

Describe el cambio de comprensión.

25. KEY MESSAGE

Una frase.

Debe ser la idea que podría sobrevivir aunque desapareciera todo lo demás.

Ejemplo:

Cada historia desplaza ligeramente al lead hacia la compra.
26. NARRATIVE ROLE

Valores frecuentes:

hook
context
problem
tension
definition
mechanism
model
comparison
evidence
example
application
objection
resolution
summary
action

Esto ayuda a evitar diez frames explicativos iguales.

27. CONTENIDO DEL FRAME

No escribir simplemente un párrafo.

Separar:

content:
  headline:
  setup:
  core_points:
  takeaway:

Ejemplo:

content:
  headline: Cada historia mueve el reloj.
  setup: La mayoría piensa en una venta como un evento puntual.
  core_points:
    - Cada seguidor se encuentra en un nivel distinto de confianza.
    - Cada impacto puede reducir ligeramente la distancia hasta comprar.
    - La constancia importa más que una secuencia perfecta.
  takeaway: Si dejas de publicar, el reloj deja de moverse.
28. DENSIDAD DE TEXTO

El guionizador debe evitar crear frames que posteriormente obliguen a
canvas-diseño a colocar muros de texto.

Cuando exista exceso de texto:

dividir;
resumir;
convertir relaciones en visualizaciones;
mover detalles a frames secundarios.

Como referencia:

un frame debería tener aproximadamente:

1 idea central;
2–5 puntos estructurales;
1 conclusión.

No es una regla matemática.

29. VISUAL STRATEGY

Cada frame debe especificar cómo debería comunicarse visualmente.

Valores posibles:

editorial
diagram-led
image-led
evidence-led
comparison-led
process-led
taxonomy-led
timeline-led
data-led
story-led
minimal-statement

Ejemplo:

visual_strategy: diagram-led

indica a canvas-diseño que la explicación debería girar alrededor de un diagrama.

30. TEMPLATES DISPONIBLES

Puedes recomendar uno de los templates definidos conceptualmente en canvas-diseño.

A — Explicación editorial
B — Proceso
C — Jerarquía
D — Comparación
E — Taxonomía
F — Evidencia
G — Story / Caso
H — Sistema completo

También puedes indicar:

custom

cuando ninguna plantilla representa correctamente la idea.

El template es una recomendación semántica.

canvas-diseño conserva la decisión final de layout.

31. DECIDIR ENTRE TEXTO, DIAGRAMA, EVIDENCIA E IMAGEN

Para cada idea aplica este árbol.

¿Existe una prueba real?
        ↓
       SÍ
        ↓
    EVIDENCIA

       NO
        ↓

¿Existe una relación estructural?
        ↓
       SÍ
        ↓
     DIAGRAMA

       NO
        ↓

¿La idea puede expresarse claramente mediante texto?
        ↓
       SÍ
        ↓
       TEXTO

       NO / sería abstracta
        ↓
     IMAGEN

La generación de imágenes es la última herramienta, no la primera.

32. DIAGRAMAS

Cuando identifiques una estructura determinista:

especifica un DIAGRAM_SPEC.

Formato:

diagram:
  required: true
  type:
  purpose:
  nodes:
  connections:
  direction:
  emphasis:
33. TIPOS DE DIAGRAMAS

Tipos frecuentes:

flow
process
timeline
pyramid
funnel
matrix
tree
cycle
taxonomy
comparison
hierarchy
system-map
cause-effect
before-after
continuum
decision-tree
roadmap
34. EJEMPLO DE DIAGRAM_SPEC
diagram:
  required: true
  type: flow
  purpose: mostrar cómo un estímulo termina provocando una acción
  direction: left-to-right
  nodes:
    - Estímulo
    - Emoción
    - Storytelling
    - Dato
    - Razonamiento
    - Acción
  connections:
    - Estímulo -> Emoción
    - Emoción -> Storytelling
    - Emoción -> Dato
    - Storytelling -> Razonamiento
    - Dato -> Razonamiento
    - Razonamiento -> Acción
  emphasis:
    primary: Estímulo

Esto NO es una imagen.

canvas-diseño debe construirlo con objetos editables.

35. PIRÁMIDES

Si la información describe:

prioridad;
niveles;
madurez;
jerarquía;
coste-beneficio;
peso relativo;

puede recomendarse:

diagram:
  type: pyramid

Las etiquetas permanecen como texto editable.

Nunca indicar a canvas-imagenes que genere una pirámide con palabras.

36. EVIDENCIA

Cuando exista evidencia:

crear:

evidence:
  required: true
  type:
  source:
  purpose:
  crop_focus:

Tipos:

screenshot
photo
document
chart
study
message
dashboard
testimonial
case
quote
37. EJEMPLO DE EVIDENCIA
evidence:
  required: true
  type: screenshot
  source: captura-analytics-julio.png
  purpose: demostrar crecimiento real
  crop_focus: sección que muestra alcance e impresiones

Nunca sustituir evidencia real por una recreación de IA.

38. IMÁGENES

Cuando una idea se beneficie de una representación generada:

crear un IMAGE_SLOT.

El guionizador NO genera la imagen.

Solo define su función conceptual.

Formato:

images:
  - slot_id:
    role:
    concept:
    purpose:
    importance:
    preferred_subject:
    subject_position:
    negative_space:
    background:
    suggested_ratio:
39. ROLES DE IMAGEN

Compatibles con canvas-imagenes:

hero
metaphor
support
object
portrait
custom-icon
scene
texture
40. EJEMPLO DE IMAGE_SLOT
images:
  - slot_id: IMG-F04-01
    role: metaphor
    concept: representar que cada historia desplaza progresivamente al lead hacia la compra
    purpose: convertir una idea temporal abstracta en una metáfora visual inmediata
    importance: primary
    preferred_subject: reloj de arena
    subject_position: center
    negative_space: none
    background: transparent
    suggested_ratio: 16:9

canvas-imagenes recibirá posteriormente esta información.

41. NO SOBRESPECIFICAR IMÁGENES

El guionizador describe QUÉ debe representar la imagen.

No debe escribir prompts finales de Higgsfield.

Eso corresponde a canvas-imagenes.

Correcto:

Metáfora de energía limitada mediante batería.

Incorrecto:

8K cinematic ray-traced battery with dramatic blue rim lighting...
42. TRANSICIONES

Los frames no deben ser piezas aisladas.

Cada frame puede contener:

transition_in:
transition_out:

Ejemplo:

transition_out: >
  Una vez entendido que la venta es acumulativa, el siguiente frame explica
  qué tipo de contenido mueve más rápido ese proceso.

Estas transiciones ayudan a construir continuidad.

43. CONTRASTE NARRATIVO

Utiliza contrastes cuando mejoren la comprensión.

Ejemplos:

ANTES / DESPUÉS
CORRECTO / INCORRECTO
MITO / REALIDAD
PROBLEMA / SOLUCIÓN
POCO IMPACTO / ALTO IMPACTO
SÍNTOMA / CAUSA

El guion debe especificarlo.

44. STORYTELLING

Cuando una historia real ayude a explicar:

utiliza estructura:

SITUACIÓN
↓
CONFLICTO
↓
DECISIÓN
↓
TRANSFORMACIÓN
↓
RESULTADO
↓
APRENDIZAJE

No inventar elementos para hacer la historia más dramática.

45. CASOS PRÁCTICOS

Un caso puede especificarse:

CASE:
  person:
  initial_state:
  problem:
  intervention:
  result:
  lesson:
  evidence:

Si alguno de esos datos no existe:

no inventarlo.

46. RITMO DEL TABLERO

Evita crear:

texto
texto
texto
texto
texto
texto

Busca alternar:

HOOK
↓
DIAGRAMA
↓
EXPLICACIÓN
↓
EVIDENCIA
↓
COMPARACIÓN
↓
METÁFORA
↓
APLICACIÓN
↓
CONCLUSIÓN

No alternes artificialmente.

La semántica manda.

47. FRAMES DENSOS Y LIGEROS

Clasifica opcionalmente:

density:
  light
  medium
  dense
light

Una idea muy fuerte.

medium

Idea + explicación + visual.

dense

Framework o sistema complejo.

No coloques cinco frames densos seguidos si puede evitarse.

48. ZOOM SEMÁNTICO

El board debe funcionar a distintas escalas.

Cuando el usuario está alejado debería reconocer:

capítulos;
grandes frames;
títulos;
diagramas principales.

Al acercarse descubre:

explicaciones;
evidencias;
ejemplos.

El guión debe reflejar esta jerarquía.

49. ORDER OF ATTENTION

Cada frame puede especificar:

attention_order:
  - elemento 1
  - elemento 2
  - elemento 3

Ejemplo:

attention_order:
  - título "Cada historia mueve el reloj"
  - secuencia de relojes
  - explicación
  - callout final

Esto ayuda a canvas-diseño a crear jerarquía visual.

50. PUNTO FOCAL

Cada frame debe tener UN foco principal.

Puede ser:

title
diagram
image
number
evidence
quote
statement

Especificar:

focal_element: diagram

No todo puede ser protagonista.

51. CALLOUTS

Cuando exista una conclusión de alto valor:

indicar:

callout:
  text:
  importance:

Ejemplo:

callout:
  text: La constancia mueve más ventas que perseguir una secuencia perfecta.
  importance: high

canvas-diseño decidirá cómo representarlo.

52. TEXTO VISIBLE VS NOTAS DE DISEÑO

Distingue siempre:

visible_content:

de:

design_notes:

Ejemplo:

visible_content:
  headline: Cada historia mueve el reloj.

design_notes:
  - El reloj de arena debe actuar como metáfora principal.
  - No usar un funnel típico.

Las notas no deben aparecer en el tablero.

53. TONO

Respeta el tono del material y del usuario.

Puede ser:

educational
technical
editorial
persuasive
minimal
academic
conversational
executive

No conviertas automáticamente una documentación técnica en copy de marketing.

54. PRESERVAR TERMINOLOGÍA

Si la fuente define términos propios:

presérvalos.

No los renombres sin necesidad.

Especialmente:

nombres de frameworks;
metodologías;
productos;
categorías;
conceptos técnicos.
55. CLARIDAD SOBRE ORIGINALIDAD

Puedes:

reorganizar;
resumir;
jerarquizar;
reformular;
conectar;
proponer metáforas;
proponer diagramas.

No puedes presentar como dato de la fuente algo que no aparece en ella.

56. MANEJO DE INFORMACIÓN INCOMPLETA

Si falta información no crítica:

continúa y marca:

[POR DEFINIR]

Si falta información que impide diseñar el tablero correctamente:

pregunta antes de terminar el guión.

Ejemplos:

objetivo completamente ambiguo;
audiencia desconocida y determinante;
múltiples interpretaciones incompatibles;
falta el documento principal.
57. NO INTERRUMPIR EN EXCESO

No preguntes por cada detalle.

Utiliza buenas inferencias.

Ejemplo:

si el usuario entrega material claramente educativo para explicar un framework:

puedes inferir:

use_case: educational

Si no conoce color de acento:

puedes dejar:

accent_color: inherit-from-board-theme

No bloquear todo el proceso.

58. SALIDA CANÓNICA

La salida principal de esta skill será:

board-script.md

Debe ser un archivo Markdown estructurado.

Preferencia de ruta:

boards/{board-slug}/board-script.md

Ejemplo:

boards/historias-ventas/board-script.md

Si no existe una estructura boards/, puede crearse.

59. NUNCA SOBRESCRIBIR SIN CONTROL

Si ya existe:

board-script.md

no destruirlo silenciosamente.

Crear versión:

board-script-v02.md

o actualizarlo únicamente si el usuario ha pedido explícitamente modificar el guión existente.

60. ESTRUCTURA DEL ARCHIVO

El archivo debe seguir este esquema.

# BOARD SCRIPT

## 0. Metadata

...

## 1. Board thesis

...

## 2. Audience transformation

...

## 3. Sources

...

## 4. Narrative architecture

...

## 5. Frame index

...

## 6. Frames

### F01 — ...

...

### F02 — ...

...

## 7. Required evidence

...

## 8. Image slots

...

## 9. Diagram index

...

## 10. Global design notes

...

## 11. Build instructions

...
61. METADATA

Formato:

board:
  title:
  slug:
  objective:
  audience:
  use_case:
  depth:
  tone:
  preferred_flow:
  board_theme:
  accent_color:
  source_language:
  output_language:
62. BOARD THESIS

Debe incluir:

Después de recorrer este tablero, la persona debería comprender que:
...

Y opcionalmente:

Idea que debe recordar 24 horas después:
...
63. AUDIENCE TRANSFORMATION

Especificar:

ANTES DEL TABLERO

La audiencia piensa / sabe / siente:
...

DESPUÉS DEL TABLERO

La audiencia debería pensar / saber / entender:
...

Esto es muy importante.

Permite diseñar el board como transformación cognitiva y no como depósito de información.

64. SOURCES

Registrar todas las fuentes utilizadas.

Ejemplo:

## Sources

1. `historias.pdf`
   - Fuente principal del framework.

2. `captura-regla-100.png`
   - Evidencia visual del modelo.

3. Notas proporcionadas por el usuario.
   - Contexto adicional.
65. NARRATIVE ARCHITECTURE

Ejemplo:

ACTO 1 — POR QUÉ IMPORTA
F01 → F02

ACTO 2 — CÓMO FUNCIONA
F03 → F05

ACTO 3 — CÓMO APLICARLO
F06 → F09

ACTO 4 — QUÉ RECORDAR
F10

No necesitas utilizar "actos" literalmente si otro sistema encaja mejor.

66. FRAME INDEX

Antes de desarrollar los frames incluye:

F01 — El contenido no tiene el mismo peso
F02 — Las historias están más cerca de la venta
F03 — El objetivo real de una secuencia
F04 — Cada historia mueve el reloj
F05 — Estructura básica
...

Esto permite evaluar el recorrido completo de un vistazo.

67. FORMATO COMPLETO DE FRAME

Utilizar:

### FXX — Título

**Chapter:**  
...

**Narrative role:**  
...

**Question:**  
...

**Objective:**  
...

**Key message:**  
...

**Priority:**  
P0 / P1 / P2

**Density:**  
light / medium / dense

**Visual strategy:**  
...

**Recommended template:**  
...

**Focal element:**  
...

**Attention order:**
1. ...
2. ...
3. ...

#### Visible content

**Headline:**  
...

**Setup:**  
...

**Core points:**
- ...
- ...
- ...

**Takeaway:**  
...

#### Diagram

Type: ...

Purpose: ...

Nodes:
- ...

Connections:
- ...

#### Evidence

- ...

#### Image slots

- IMG-FXX-01
  - Role:
  - Concept:
  - Purpose:
  - Importance:
  - Subject:
  - Suggested ratio:
  - Background:
  - Position:
  - Negative space:

#### Callout

...

#### Transition in

...

#### Transition out

...

#### Sources

- ...

Eliminar las subsecciones vacías cuando no correspondan.

68. ÍNDICE DE EVIDENCIAS

Al final:

## Required evidence

| ID | Frame | Type | Source | Purpose |
|----|-------|------|--------|---------|
| EV01 | F03 | Screenshot | analytics.png | demostrar... |

Esto permite reunir assets antes de construir.

69. ÍNDICE DE IMAGE SLOTS

Crear:

## Image slots

| ID | Frame | Role | Concept | Ratio | Background |
|----|-------|------|---------|-------|------------|
| IMG-F04-01 | F04 | metaphor | progresión del lead | 16:9 | transparent |

Esto se convertirá después en input para canvas-imagenes.

70. ÍNDICE DE DIAGRAMAS

Crear:

## Diagrams

| ID | Frame | Type | Purpose |
|----|-------|------|---------|
| DG01 | F02 | pyramid | mostrar prioridad |
| DG02 | F06 | flow | mostrar proceso |

Esto permite a canvas-diseño conocer de inmediato qué elementos deben ser nativos.

71. GLOBAL DESIGN NOTES

No diseñes el canvas en detalle.

Pero sí puedes registrar decisiones narrativas que afectan al diseño.

Ejemplos:

- El board debe sentirse editorial y limpio.
- Priorizar diagramas nativos sobre ilustraciones.
- Evidencias reales deben conservar protagonismo.
- El capítulo 1 es más visual.
- El capítulo 2 aumenta densidad.
- El último frame debe ser extremadamente simple.
72. BUILD INSTRUCTIONS

El archivo debe terminar con instrucciones para la siguiente skill.

Ejemplo:

## Build instructions

Este archivo es el source of truth narrativo del tablero.

Al construirlo:

1. Leer `canvas-diseño`.
2. Respetar el orden y propósito de los frames.
3. Los layouts concretos pueden adaptarse siempre que mantengan la jerarquía narrativa.
4. Construir todos los `DIAGRAM_SPEC` con elementos nativos editables.
5. Utilizar evidencia real donde esté indicada.
6. No sustituir evidencia por contenido generado.
7. Para cada `IMAGE_SLOT`, utilizar `canvas-imagenes`.
8. Mantener los IDs FXX, DGXX, EVXX e IMG-FXX-XX durante la construcción.
9. No eliminar contenido P0 sin autorización.
10. Si una limitación visual exige cambiar la estructura narrativa, actualizar primero este guión.
73. ARCHIVO COMO SOURCE OF TRUTH

Una vez aprobado:

board-script.md es la fuente de verdad narrativa.

No deben existir dos versiones distintas del mismo tablero repartidas por varios documentos.

Si cambia la narrativa:

actualiza primero board-script.md.

Después actualiza el canvas.

74. SEPARAR CONTENIDO Y REPRESENTACIÓN

Ejemplo:

Contenido:

Hay tres niveles de prioridad.

Representación:

Pirámide nativa.

El guión debe conservar ambas capas.

Nunca fusionarlas en algo ambiguo como:

poner una pirámide bonita.
75. NO MICRODISEÑAR

El guionizador puede decir:

visual_strategy: comparison-led

Puede decir:

focal_element: diagram

Puede decir:

subject_position: right

Pero NO debe decidir:

x: 428
y: 731
width: 534
font-size: 31

Eso corresponde a canvas-diseño.

76. NO GENERAR PROMPTS FINALES

El guionizador puede indicar:

role: metaphor
concept: pérdida de identidad
subject: estatua sin rostro sosteniendo máscara

Pero NO debe producir el prompt detallado de generación.

Eso corresponde a canvas-imagenes.

77. NO CONSTRUIR EL BOARD

Cuando /guionizador esté activo:

tu output es el guión.

Aunque dispongas de herramientas para modificar el canvas:

NO lo hagas.

Finaliza el guión.

Después el usuario podrá solicitar:

En función de este guión, crea el tablero.
78. MODO DE REVISIÓN

Si el usuario solicita modificar un guión existente:

primero lee:

board-script.md

Después aplica únicamente los cambios solicitados.

Conserva IDs cuando sea posible.

Ejemplo:

si F05 sigue siendo el mismo concepto:

no lo renumeres innecesariamente.

La estabilidad de IDs simplifica sincronización con el canvas.

79. CAMBIOS ESTRUCTURALES

Si se elimina un frame:

marca los IDs afectados.

No renumeres automáticamente todos los siguientes si el tablero ya ha comenzado a construirse.

Puedes mantener:

F01
F02
F04

si F03 fue eliminado.

Los IDs son identificadores, no necesariamente una secuencia perfecta.

80. MODO DE EXPANSIÓN

El usuario puede pedir:

Haz este apartado mucho más profundo.

En ese caso:

localiza el frame;
evalúa si sigue siendo una única pregunta;
si no, conviértelo en varios frames;
conserva el enlace narrativo con frames vecinos;
actualiza índices.

No añadas simplemente más párrafos.

81. MODO DE REDUCCIÓN

El usuario puede pedir:

Hazlo más corto.

Entonces:

conserva todos los P0;
conserva los P1 imprescindibles;
elimina primero P3;
después P2 redundantes;
combina frames compatibles.

No reduzcas recortando arbitrariamente frases.

82. MODO "PRESERVAR TODO"

Si el usuario indica:

No te dejes nada.

No significa colocar literalmente cada frase en pantalla.

Significa:

conservar todas las ideas relevantes;
incluir detalles dentro del sistema;
crear más frames si es necesario;
preservar evidencia;
mantener trazabilidad.

Puedes reformular para evitar redundancia.

83. BOARD DE CONOCIMIENTO VS PRESENTACIÓN

No confundir.

Una presentación normalmente tiene una ruta estricta:

1 → 2 → 3 → 4

Un canvas puede tener:

ruta principal;
ramas;
anexos;
referencias;
zonas explorables.

Si el contenido lo permite, especificar:

navigation:
  primary_path:
  secondary_branches:
84. RUTA PRINCIPAL

Todo board necesita un recorrido recomendado.

Ejemplo:

F01 → F02 → F03 → F04 → F05 → F06

Aunque existan ramas secundarias.

85. RAMAS SECUNDARIAS

Puede haber:

F04
├── F04-A caso
├── F04-B evidencia
└── F04-C detalle técnico

Utilizar únicamente cuando mejora explorabilidad.

No convertir el board en un árbol arbitrariamente profundo.

86. APÉNDICES

Contenido P3 pero valioso puede trasladarse a:

Appendix

Ejemplos:

referencias;
tablas completas;
casos secundarios;
definiciones técnicas;
documentación.

Esto mantiene limpia la narrativa principal.

87. EVIDENCIA PRIMERO CUANDO CORRESPONDA

En algunos casos una evidencia fuerte puede abrir un frame.

Ejemplo:

Resultado real
↓
¿Qué explica este resultado?
↓
Mecanismo

No asumir siempre:

teoría → evidencia

El orden depende del impacto narrativo.

88. GUIONIZAR PARA JERARQUÍA VISUAL

Recuerda:

el canvas final necesita:

foco;
jerarquía;
contraste;
ritmo.

Por tanto el guión no debe otorgar la misma importancia a cada frase.

Marca claramente:

PRIMARY
SECONDARY
SUPPORT
89. MENSAJE PRIMARY

Normalmente una sola frase por frame.

Es el núcleo.

90. MENSAJE SECONDARY

Explica el primary.

Normalmente:

2–5 elementos.

91. SUPPORT

Puede incluir:

ejemplos;
evidencia;
fuentes;
detalles.

Debe poder desaparecer temporalmente durante un zoom-out sin perder el argumento principal.

92. REGLA DE SIMPLICIDAD

Si una idea puede explicarse con:

1 diagrama + 1 frase

no obligues a utilizar:

1 diagrama + 6 párrafos.

Si necesita profundidad, puede existir un frame complementario.

93. REGLA DE REDUNDANCIA MODAL

No utilizar simultáneamente:

texto;
diagrama;
imagen;
callout;

para decir exactamente lo mismo.

Cada modalidad debe aportar algo.

Ejemplo:

Texto → principio
Diagrama → relación
Imagen → metáfora
Evidencia → credibilidad
94. REGLA DE IMÁGENES

Antes de crear un IMAGE_SLOT pregunta:

¿La imagen añade comprensión?

No:

¿Queda un hueco?

No llenar espacios vacíos con imágenes.

95. REGLA DE EVIDENCIA

Si una imagen real ya demuestra la idea:

no crear un IMAGE_SLOT generado que compita con ella.

96. REGLA DE DIAGRAMA

Si existe una relación estructural:

especificarla.

No dejar que canvas-diseño tenga que inferir una estructura compleja a partir
de cinco párrafos si puedes declararla explícitamente.

97. REGLA DE CONCLUSIÓN

El tablero debe terminar con claridad.

Posibles cierres:

síntesis;
principio;
framework completo;
checklist;
acción;
pregunta;
mapa final.

Evita terminar simplemente porque se acabó el documento fuente.

98. FRAME FINAL

Normalmente debe responder:

¿Qué quiero que recuerde ahora?

Puede ser más ligero que los frames anteriores.

99. CHECKLIST DE CALIDAD — FUENTES

Antes de finalizar:

 ¿He leído todo el material necesario?
 ¿He identificado las fuentes?
 ¿Las afirmaciones importantes son trazables?
 ¿No he inventado datos?
 ¿He marcado la evidencia pendiente?
100. CHECKLIST DE CALIDAD — NARRATIVA
 ¿Existe una tesis clara?
 ¿Sé qué cambia en la mente del espectador?
 ¿Existe una ruta principal?
 ¿Cada frame responde a una pregunta?
 ¿Cada frame tiene una idea central?
 ¿Las transiciones son lógicas?
 ¿El final concluye?
101. CHECKLIST DE CALIDAD — CONTENIDO
 ¿Los P0 están presentes?
 ¿He eliminado redundancias?
 ¿Los textos son suficientemente sintéticos?
 ¿He mantenido términos importantes?
 ¿Los detalles secundarios no ahogan las ideas principales?
102. CHECKLIST DE CALIDAD — VISUALIZACIÓN
 ¿He identificado relaciones que deberían ser diagramas?
 ¿Los diagramas pueden construirse nativamente?
 ¿He identificado evidencia real?
 ¿He evitado imágenes innecesarias?
 ¿Cada IMAGE_SLOT tiene un propósito?
 ¿Existe un foco principal por frame?
 ¿El ritmo del tablero es variado?
103. CHECKLIST DE CALIDAD — HANDOFF
 ¿Existe board-script.md?
 ¿Los frames tienen IDs?
 ¿Los diagramas tienen especificación?
 ¿La evidencia está identificada?
 ¿Los image slots están identificados?
 ¿Las instrucciones para canvas-diseño están presentes?
 ¿El archivo puede entenderse sin releer todas las fuentes?
104. ANTI-PATRONES

Evitar siempre:

resumir en lugar de guionizar;
construir el canvas directamente;
generar imágenes directamente;
hacer prompts de Higgsfield;
microdiseñar posiciones;
convertir cada párrafo en un frame;
meter varios conceptos centrales en un mismo frame;
tratar todas las ideas con la misma importancia;
inventar evidencia;
recrear capturas;
utilizar imágenes donde debería haber diagramas;
crear diagramas como imágenes rasterizadas;
llenar huecos con decoración;
empezar a escribir frames antes de comprender las fuentes;
terminar el board cuando termina el documento sin crear conclusión;
perder la trazabilidad de las afirmaciones;
sobrescribir guiones aprobados sin control.
105. COMPORTAMIENTO DEL COMANDO /guionizador

Cuando el usuario invoque:

/guionizador

o solicite explícitamente guionizar un tablero:

identifica todas las fuentes proporcionadas;
léelas completamente;
comprende objetivo y audiencia;
pregunta únicamente por información crítica ausente;
extrae unidades de información;
clasifica prioridades;
identifica relaciones;
formula la tesis;
crea arquitectura narrativa;
divide en frames;
decide estrategia visual de cada frame;
identifica diagramas;
identifica evidencia;
identifica image slots;
crea board-script.md;
realiza control de calidad;
informa al usuario de la ruta del archivo.

NO construyas el tablero en esta fase.

106. SIGUIENTE COMANDO

Después de generar el guión, el usuario debería poder decir:

En función de este guión, crea el tablero.

En ese momento:

leer board-script.md;
activar canvas-diseño;
construir la arquitectura visual;
construir nativamente los diagramas;
utilizar evidencia real;
activar canvas-imagenes exclusivamente para los IMAGE_SLOT que lo necesiten;
mantener la narrativa definida en el guión.
107. PRINCIPIO DE AUTORIDAD ENTRE SKILLS

La responsabilidad se divide así:

canvas-guionizador
=
QUÉ contamos
EN QUÉ ORDEN
CON QUÉ PROPÓSITO
CON QUÉ REPRESENTACIÓN SEMÁNTICA
canvas-diseño
=
CÓMO LO DISTRIBUIMOS
CÓMO LO JERARQUIZAMOS VISUALMENTE
CÓMO CONSTRUIMOS LOS DIAGRAMAS
CÓMO COMPONEMOS LOS FRAMES
canvas-imagenes
=
CÓMO CREAMOS LOS ASSETS VISUALES
QUE NO PUEDEN RESOLVERSE MEJOR NATIVAMENTE

Una skill no debe invadir la responsabilidad de otra.

108. SOURCE OF TRUTH

La cadena de autoridad es:

FUENTES ORIGINALES
↓
board-script.md
↓
CANVAS FINAL

Las fuentes originales mandan sobre los hechos.

board-script.md manda sobre la narrativa.

El canvas manda únicamente sobre la representación visual.

109. REGLA DE SINCRONIZACIÓN

Si durante la construcción del canvas se descubre que hace falta cambiar:

la tesis;
el orden;
un frame;
un concepto;
una relación;
una evidencia importante;

debe actualizarse board-script.md.

No permitas que el canvas y el guión evolucionen como dos documentos contradictorios.

110. CRITERIO DE ÉXITO

Un buen board-script.md debe permitir entregar el archivo a otra instancia de Claude
que NO haya participado en la conversación y que esta pueda comprender:

de qué trata el tablero;
qué quiere conseguir;
quién lo va a consumir;
qué debe contener;
qué orden debe seguir;
qué frames existen;
qué debe comunicar cada frame;
qué diagramas debe construir;
qué evidencia debe utilizar;
qué imágenes necesita;
qué información no debe inventar.

Si necesita volver a preguntarle al usuario qué quería hacer, el guión es insuficiente.

111. REGLA MAESTRA

No diseñes información.

Primero diseña la comprensión.

El trabajo del guionizador es transformar:

INFORMACIÓN

en:

SECUENCIA DE COMPRENSIÓN

y esa secuencia posteriormente se transforma en:

ESPACIO VISUAL

mediante canvas-diseño.

113. COMPOSICIÓN — NO GUIONICES COLUMNAS NI CARDS

Esta sección tiene prioridad sobre cualquier otra cuando entren en conflicto.

REGLA MAESTRA

Si al leer el board-script.md el resultado natural pareciera una fila de columnas
o de tarjetas del mismo tamaño, el guión está mal resuelto.

Un mural editorial, geométrico y corporativo NO es:

A | B | C | D | E

con cinco columnas iguales.

Cada zona debe tener una geometría distinta según su contenido.

113.1 JERARQUÍA COMO TAMAÑO

La importancia narrativa se convierte en escala:

P0 → dominante
P1 → grande / medio
P2 → pequeño
P3 → apoyo

Algunos conceptos ocupan mucho más espacio; otros son bloques auxiliares
pequeños. Deben convivir elementos horizontales, verticales y agrupaciones
asimétricas, con bastante espacio negativo, y las piezas tienen que encajar
espacialmente entre sí.

No todo puede tener el mismo peso visual.

113.2 NADA DE CARDS

Deja de especificar por defecto:

rectángulo con texto;
caja con borde;
tarjeta;
columna cerrada;
grid uniforme.

El contenedor rectangular es una herramienta EXCEPCIONAL, no el layout base.
Solo se justifica cuando la caja significa algo:

el ancla P0 del tablero;
un hueco reservado que comunica "aquí falta algo";
un BLOQUE SEMÁNTICO DE COLOR EN PAREJA.

El tercero viene de una referencia que trajo el usuario. Consiste en enfrentar
siempre dos bloques del mismo tamaño con color semántico fijo:

  ROJO   = el mito / el paradigma viejo / lo que temes
  VERDE  = lo que de verdad ocurre

Funciona porque la pareja se reconoce sola en todo el tablero y el color ES el
mensaje. Reglas: siempre en pareja, siempre en el mismo orden, y con el mismo
tamaño — un bloque de color suelto vuelve a ser una card.

Recursos que sí debes usar:

texto libre;
titulares grandes;
líneas y divisores;
diagramas;
agrupaciones por proximidad;
brackets;
formas geométricas;
escalas;
timelines;
ejes;
comparaciones;
imágenes;
annotations pequeñas;
composiciones mixtas.

113.3 IMÁGENES

Cuando una imagen sea importante, guionízala grande y protagonista.

No asumas que va encerrada en un frame. Puede:

ocupar una zona propia;
sobresalir visualmente del grupo;
convivir directamente con el texto;
determinar la geometría de la composición.

113.4 IDENTIFICADORES DE ZONA

Si usas A, B, C, son únicamente texto editorial suelto:

A

Nada de círculos, badges, cápsulas ni iconos alrededor. Van fuera de la
composición principal, por encima de la zona. Tampoco es obligatorio usar
letras si otra organización funciona mejor.

113.5 CONECTORES — DOS NIVELES

Corregido tras una segunda revisión. Hay que distinguir dos cosas que antes se
trataban igual:

RUTA (obligatoria)

El tablero necesita UN recorrido explícito que enhebre las macrozonas de
principio a fin. Se declara así:

  route:
    - entrada
    - 01 ...
    - 02 ...
    - 03 ...

Se dibuja con conectores VISIBLES: largos, gruesos, en el color de acento y
CURVOS — arcos, no rectas. Una recta parece un cable; un arco parece un camino.
Viven en una banda despejada (normalmente la superior, a la altura de los
rótulos de sección), nunca cruzando contenido.

DENTRO DEL CONTENIDO (excepcional)

Ahí sigue en pie la regla anterior: flecha solo cuando la relación ES el
argumento — una cadena causal, un bucle cerrado, un reparto desde un nodo. La
navegación interna se resuelve por posición, proximidad, jerarquía y alineación.

CONECTOR LARGO ENTRE ZONAS DISTANTES

Además de la ruta, se admite algún conector largo y orgánico que salte entre
zonas no contiguas, cuando la relación existe de verdad (una rama de un
diagrama que es literalmente lo que desarrolla otra sección). Va punteado y más
fino que la ruta, para que no se confunda con ella, y debe cruzar hueco vacío,
nunca contenido.

Nunca flechas decorativas.

113.6 TIPOGRAFÍA

El lenguaje tipográfico del canvas está pensado para San Francisco / SF Pro,
usando la tipografía del sistema Apple cuando esté disponible:

-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", sans-serif

La estética debe sentirse sobria, precisa, editorial y corporativa. Evita la
apariencia genérica de contenido generado por IA.

113.7 QUÉ DEBE DECLARAR EL BOARD-SCRIPT

Para cada frame o grupo importante, añade:

visual_weight: dominant | large | medium | small
geometry_intent: free | horizontal | vertical | radial | diagrammatic | mixed
container_behavior: none | subtle | required
image_behavior: none | embedded | free-standing | dominant
spatial_role: anchor | primary | secondary | support

Son intenciones compositivas, no coordenadas. El guionizador no construye el
canvas: su trabajo es darle a canvas-diseño información suficiente para crear
una composición con jerarquía, geometría y variedad, en lugar de resolverlo
todo con tarjetas rectangulares.

113.8 CHECKLIST DE COMPOSICIÓN

Antes de entregar:

 ¿Hay al menos un elemento claramente dominante?
 ¿Hay bloques pequeños auxiliares?
 ¿Las zonas tienen anchos y alturas distintos?
 ¿Alguna zona arranca a distinta altura que sus vecinas?
 ¿He evitado especificar cajas salvo donde significan algo?
 ¿Las imágenes importantes son protagonistas?
 ¿He quitado toda flecha que no exprese una relación real?
 ¿Los identificadores de zona son texto suelto?
 ¿Queda espacio negativo de verdad, no relleno?

Si alguna respuesta es NO, la composición todavía es una retícula.

114. MACROESTRUCTURA — LA PRUEBA DE LOS 3 SEGUNDOS

Segunda corrección del mismo tablero. La composición asimétrica de §113 arregló
la jerarquía pero produjo un mural que desde lejos parecía piezas sueltas: se
veían las secciones, pero no un sistema. La asimetría sin macroestructura es
dispersión.

PRUEBA DE ACEPTACIÓN

Al alejar el zoom, en 2–3 segundos hay que poder responder:

 ¿Dónde empieza?
 ¿Por dónde sigue?
 ¿Cómo se conectan las partes?
 ¿Cuáles son las grandes secciones?

Si alguna respuesta no es inmediata, el tablero no está resuelto — por muy bien
compuesta que esté cada pieza.

114.1 ANCLAS DE SECCIÓN

Cada macrozona abre con un rótulo NUMERADO y grande:

  01   LA GRIETA

Numerado porque el número es lo que comunica el orden desde lejos, cuando el
nombre ya no se lee. Todos los rótulos a la MISMA altura, formando una banda
continua. Debajo, un filete del color de acento.

Esto sustituye a la letra suelta de §113.4 cuando el tablero tiene recorrido:
la letra identificaba, el número además ordena.

114.2 AIRE ENTRE ZONAS, DENSIDAD DENTRO

  separación ENTRE macrozonas  >>  separación DENTRO de una macrozona

Es lo que convierte un continuo de piezas en un conjunto de grupos. Si el hueco
entre dos secciones se parece al hueco entre dos bloques de la misma sección, no
hay macroestructura.

114.3 DOS COLUMNAS POR ZONA, NO CUATRO

Una macrozona repartida en tres o cuatro columnas deja de leerse como bloque y
estira el mural hasta proporciones imposibles (se midió: ratio 4,9). Con dos
columnas por zona, el contenido crece hacia abajo —que es donde se lee el
detalle— y el mural se mantiene en un ratio manejable (2,5–3,5).

114.4 QUÉ DEBE DECLARAR EL BOARD-SCRIPT

  macro_structure:
    entry: <qué es la entrada visual>
    route: [entrada, 01, 02, 03, 04, 05]
    route_style: curved-accent-arcs
    route_band: top          # dónde vive la ruta, despejada de contenido
    zone_label: numbered     # "01 LA GRIETA"
    zone_columns: 2
    zone_separation: strong
    inner_separation: compact

114.5 CHECKLIST DE ZOOM-OUT

 ¿Se distingue la entrada de todo lo demás?
 ¿Se leen los números de sección sin leer los nombres?
 ¿La ruta se ve entera de un vistazo?
 ¿La ruta cruza contenido en algún punto? (no debe)
 ¿El hueco entre secciones es visiblemente mayor que el hueco interno?
 ¿El mural cabe en un ratio razonable, o se ha estirado en una tira?

115. PRINCIPIO FINAL


Antes de añadir cualquier frame pregunta:

¿Qué necesita entender la persona aquí para poder entender correctamente lo siguiente?

Antes de añadir cualquier diagrama pregunta:

¿Existe una relación que se entiende mejor espacialmente que verbalmente?

Antes de añadir cualquier imagen pregunta:

¿Existe una idea abstracta que necesita convertirse en algo visualmente tangible?

Antes de terminar pregunta:

¿Alguien que nunca ha visto las fuentes podría construir correctamente el tablero usando únicamente este archivo?

Si la respuesta es sí:

el guión está terminado.


## Cómo lo usaría

Tu flujo en Claude Code quedaría muy limpio:

```text
/guionizador

Quiero crear un tablero con estos PDFs.
El objetivo es explicar X a Y.
Guionízamelo completo y no te dejes información importante.

Claude te genera, por ejemplo:

boards/sistema-historias/board-script.md

Después simplemente:

Lee boards/sistema-historias/board-script.md.

En función de este guión, crea el tablero completo.
Usa canvas-diseño para construirlo y canvas-imagenes cuando el
guión marque IMAGE_SLOT.