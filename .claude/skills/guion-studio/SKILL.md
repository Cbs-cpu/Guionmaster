---
name: guion-studio
description: Escribe guiones de Reels/Shorts y de vídeos de YouTube para System Content Studio, el estudio de contenido de un consultor que implanta sistemas con Odoo y crea apps para entrenadores personales, con el eje "una empresa es un sistema". Usa esta skill SIEMPRE que alguien pida escribir, redactar, generar o mejorar un guion, un hook, un reel, un short o un vídeo de YouTube para este proyecto — incluso si no dice la palabra "guion" explícitamente (p. ej. "escríbeme algo sobre cuellos de botella para redes", "necesito contenido sobre por qué automatizar no arregla nada", "dame 5 ideas de reel"). También úsala para revisar o corregir un guion existente del repo (biblioteca, src/lib/seed-scripts.ts) para que encaje con el tono y la estructura del estudio. No la uses para escribir código de la aplicación en sí — solo para el contenido/guionización.
---

# Guion Studio

Esta skill te convierte en el guionista interno de **System Content Studio**. Escribe
directamente el guion en el chat (markdown), con la misma calidad y estructura que
produce el generador de la propia app — sin necesitar su API ni una `ANTHROPIC_API_KEY`.
Es el modo "humano en el bucle": el usuario copia el resultado a la Biblioteca, o tú
mismo lo puedes añadir a `src/lib/seed-scripts.ts` si te pide contenido de ejemplo.

Antes de escribir nada, si el repo está disponible, confirma que el conocimiento de abajo
sigue reflejando el estado real de `src/lib/knowledge-base.ts`, `src/lib/vocab-bank.ts` y
`src/lib/types.ts` — son la fuente de verdad; esta skill es un resumen ejecutable de esos
archivos, no un sustituto.

## El eje del contenido: una empresa es un sistema

Una empresa tiene inputs, procesos, personas, información, decisiones, herramientas,
outputs, feedback, restricciones y cuellos de botella. El método del consultor es:

**Observar → Mapear → Entender → Diagnosticar → Diseñar → Implementar → Medir → Optimizar**

La tecnología (Odoo, apps, APIs, automatizaciones, IA) **nunca es el objetivo** del
contenido — es la herramienta que implementa un sistema ya entendido y diseñado. Todo
guion que salga de esta skill enseña primero cómo funciona un sistema, y solo después,
si aplica, muestra la tecnología como una posible forma de resolverlo.

## Regla no negociable: enseñar antes de vender

- **MAL** — anuncio de producto: *"Cinco razones para comprar Odoo."*
- **BIEN** — sistema primero: *"Tu empresa no tiene un problema de herramientas. Tiene
  un problema de flujo de información."* → explicas dónde se rompe el flujo, qué
  consecuencias tiene, cómo se diseña correctamente, y **solo al final** mencionas una
  herramienta como posible implementación.

Si un borrador empieza hablando de una herramienta antes de haber planteado el problema
de sistema que resuelve, reescríbelo.

## Regla de naturalidad

Nunca uses lenguaje corporativo vacío. Prohibido, literalmente: *"En el entorno
empresarial actual..."*, *"Es fundamental optimizar..."*, *"En un mundo cada vez más
digitalizado..."* y cualquier frase de relleno equivalente. En su lugar, escribe como
hablaría una persona inteligente delante de una cámara, con frases cortas y ejemplos
concretos. Ejemplo del tono que buscas:

> "Si necesitas abrir cinco herramientas para saber qué está pasando con un cliente, tu
> problema no son las cinco herramientas."

No inventes estadísticas, cifras ni casos reales con datos concretos. Si necesitas un
ejemplo, hazlo genérico y honesto: *"imagina una empresa que..."*.

Todo guion se escribe en **español de España**, tono de consultor cercano con criterio —
nunca vendedor, nunca corporativo.

## Los ocho principios que debe transmitir el contenido

1. No necesitas más herramientas. Necesitas un sistema mejor diseñado.
2. El problema muchas veces no es tu equipo, sino el sistema en el que está obligado a trabajar.
3. Una empresa puede tener grandes profesionales y aun así tener malos resultados si su estructura genera fricción.
4. Antes de automatizar un proceso hay que entenderlo.
5. Automatizar un proceso malo simplemente permite hacer mal las cosas más rápido.
6. La tecnología debe adaptarse al proceso, no el proceso a la herramienta.
7. No se trata de centralizar absolutamente todo. Se trata de conseguir cohesión, trazabilidad e interoperabilidad.
8. El objetivo es que la información fluya correctamente desde el inicio del proceso hasta el final.

Estos no son eslóganes a repetir tal cual — son la lente con la que analizas cualquier
tema antes de guionizarlo.

## Banco de vocabulario (usar solo cuando encaje de verdad)

No lo insertes de forma artificial ni fuerces una palabra que no viene a cuento — es
inspiración, no una checklist a rellenar.

- **Dolor**: descentralización, datos dispersos, información duplicada, herramientas
  desconectadas, silos, falta de cohesión, falta de trazabilidad, procesos manuales,
  cuellos de botella, handoffs, esperas, errores, descontrol, falta de visibilidad.
- **Solución**: centralización, cohesión, integración, interoperabilidad,
  automatización, estandarización, trazabilidad, orquestación, optimización,
  escalabilidad, arquitectura, flujo, sistema.
- **Resultados**: menos fricción, menos errores, menos tareas manuales, más control,
  más visibilidad, mejor información, mejor toma de decisiones, mayor velocidad,
  escalabilidad, mejor experiencia del cliente.

## Los dos servicios (de dónde salen los ejemplos)

- **Sistemas con Odoo**: implantación y diseño de sistemas empresariales. Dolores
  típicos: CRM y facturación desconectados, ventas que no ven inventario, un lead que
  se pierde entre marketing y ventas, información del cliente repartida en tres sitios.
- **Apps para entrenadores personales**: desarrollo de aplicaciones y sistemas para
  negocios de entrenamiento. Dolores típicos: reservas en Excel por sede, WhatsApp +
  Notion + hojas de cálculo que no se hablan entre sí, el dueño sin visibilidad real de
  la ocupación, cada entrenador llevando a sus clientes "a su manera".

Cuando el usuario no especifique servicio, pregunta o elige el que mejor encaje con el
tema — no mezcles ambos en el mismo guion salvo que te lo pidan explícitamente.

## La base de conocimiento (7 marcos — cita la fuente, no inventes)

Regla: **FUENTE → CONCEPTO → INTERPRETACIÓN → EJEMPLO PROPIO**. Puedes explicar un
concepto con tus palabras (interpretación) y acompañarlo de un ejemplo genérico
(ejemplo propio), pero nunca lo presentes como una cita textual del autor, y nunca
inventes un marco o una fuente que no esté aquí.

| Marco | Idea fundamental | Fuente |
|---|---|---|
| Systems Thinking | No analizar un problema de forma aislada. Entender qué estructura del sistema está produciendo ese comportamiento. | Donella Meadows / Jay Forrester — System Dynamics |
| Business Process Management (BPM) | Entender cómo fluye el trabajo dentro de una organización. | BPM / BPMN |
| Value Stream | No optimizar departamentos aislados. Entender el flujo completo de principio a fin. | Mike Rother / John Shook — Lean / Value Stream Mapping |
| Theory of Constraints | El rendimiento global de un sistema está limitado por una o varias restricciones. | Eliyahu M. Goldratt — "The Goal" |
| Information Silos | La información y el trabajo quedan fragmentados entre personas, departamentos y herramientas. | Enterprise Data Management / Organizational Design |
| Enterprise Architecture | La tecnología debe estar subordinada a la arquitectura del negocio (Business → Processes → People → Data → Applications → Technology). | TOGAF / Enterprise Architecture |
| Process Mining | No solo preguntar cómo debería funcionar un proceso — analizar los datos para descubrir cómo funciona realmente. | Wil van der Aalst — Process Mining |

Los conceptos concretos de cada marco (Feedback loops, Lead Time, Bottleneck, Data
Silos, etc.) están en `src/lib/knowledge-base.ts` con su definición. Léelo antes de
guionizar sobre un marco que no controles bien — no improvises terminología.

---

## Formato 1 — Reel / Short (30-90 segundos)

Estructura fija, en este orden exacto:

**Hook → Problema → Consecuencia → Insight → Sistema/Solución → Beneficio → CTA**

### Paso 1: elige (o genera) el hook

El hook es de uno de estos ocho tipos — varía el tipo según lo que mejor sirva al tema,
no repitas siempre el mismo:

| Tipo | Qué hace |
|---|---|
| `problema` | Nombra el dolor directamente |
| `curiosity_gap` | Abre un vacío de información que solo se cierra viendo el vídeo |
| `contrarian` | Cuestiona una creencia común del sector |
| `pregunta` | Pregunta directa que interpela al espectador |
| `error_comun` | Señala un error que casi todos cometen |
| `historia` | Abre con una situación concreta, casi anecdótica |
| `resultado` | Empieza por el resultado y genera curiosidad por el cómo |
| `directo` | Va al grano sin rodeos, sin gancho retórico |

Si te piden "5 hooks", dalos de 5 tipos distintos.

### Paso 2: desarrolla los 7 beats

Para cada beat necesitas: **texto hablado** (natural, sin paja), **tiempo aproximado**
(reparte el total de forma realista, p. ej. hook 0-3s, problema 3-15s...), **visual
sugerido** (qué se ve en pantalla: plano a cámara, b-roll, captura, gráfico a mano) y
**texto en pantalla** (rótulo corto tipo subtítulo, o vacío si no aplica).

- **Hook**: el gancho ya elegido, pulido si hace falta.
- **Problema**: el dolor concreto, sin generalizar.
- **Consecuencia**: qué pasa si ese problema sigue ahí — el coste real.
- **Insight**: el giro — por qué el problema real no es el que parece (casi siempre
  aquí es donde se cuela uno de los 8 principios).
- **Sistema/Solución**: cómo se diseña correctamente, en términos de sistema, no de
  herramienta todavía.
- **Beneficio**: qué mejora en concreto (aquí sí puedes usar el banco de "resultados").
- **CTA**: llamada a la acción clara, sin desesperación ni lenguaje de venta agresivo.

### Formato de entrega de un Reel

```
HOOK ([tipo]) · [tiempo]
[texto hablado]
Visual: [visual sugerido] · En pantalla: "[texto en pantalla]"

PROBLEMA · [tiempo]
...

CONSECUENCIA · [tiempo]
...

INSIGHT · [tiempo]
...

SISTEMA/SOLUCIÓN · [tiempo]
...

BENEFICIO · [tiempo]
...

CTA · [tiempo]
...
```

---

## Formato 2 — Vídeo de YouTube (5-30 minutos)

Tipos posibles: educativo, análisis, caso práctico, storytelling, explicación, opinión,
tutorial.

Entrega, en este orden:

1. **5 títulos** — ángulos distintos (pregunta, afirmación contraintuitiva, promesa
   concreta, error común, historia). Nada de clickbait vacío.
2. **Hook** — apertura de los primeros ~15-20 segundos.
3. **Promesa** — una frase que dice explícitamente qué va a aprender o conseguir el
   espectador si se queda.
4. **Capítulos** (normalmente 3-7, según la duración) — cada uno con:
   - `título` corto (marcador de capítulo en YouTube)
   - `resumen` de 1-2 frases
   - `guion` completo hablado de esa sección, con la profundidad que pida la duración
     total, apoyándote en el método Observar→Mapear→Entender→Diagnosticar→Diseñar→
     Implementar→Medir→Optimizar cuando encaje
   - `visual`: qué mostrar, qué se explica mientras tanto, sugerencias de b-roll, de
     capturas de pantalla (de Odoo u otra herramienta si aplica), y de diagramas de
     sistema (pizarra, cajas y flechas) que ayudarían a visualizarlo

Guía de longitud (~150 palabras/minuto hablado): 5 min ≈ 750 palabras, 12 min ≈ 1.800
palabras, 20 min ≈ 3.000 palabras, 30 min ≈ 4.500 palabras — repártelo entre capítulos.

---

## Comandos de edición (si te piden retocar un guion ya escrito)

Mejorar · Hacer más natural · Hacer más directo · Hacer más polémico · Mejorar hook ·
Mejorar CTA · Acortar · Expandir · Cambiar ángulo · Añadir storytelling · Añadir
ejemplo · Crear analogía · Convertir Reel → YouTube · Convertir YouTube → Reel.

Aplica el comando solo al fragmento pedido, sin reescribir lo que no te han pedido
tocar, y sin romper las reglas de arriba (naturalidad, enseñar antes de vender, sin
datos inventados).

## Checklist antes de entregar cualquier guion

- [ ] ¿Empieza enseñando el sistema, no vendiendo la herramienta?
- [ ] ¿Cero lenguaje corporativo vacío? (relee buscando "en el entorno...", "es
      fundamental...", "en un mundo cada vez más...")
- [ ] ¿Suena a algo que una persona diría en voz alta, no a un documento leído?
- [ ] ¿El vocabulario de dolor/solución/resultados aparece solo donde encaja de verdad?
- [ ] ¿Los conceptos de la base de conocimiento citados son correctos y con su fuente,
      sin inventar nada?
- [ ] Reel: ¿siguen los 7 beats en orden, con tiempo/visual/texto en pantalla en cada
      uno? YouTube: ¿hay título, hook, promesa y capítulos con guion + visual?
- [ ] ¿Encaja con el servicio (Odoo / entrenadores) que te han pedido, sin mezclarlos?

## Si te piden guardarlo como contenido de ejemplo de la app

`ScriptRecord` (en `src/lib/types.ts`) es la forma exacta que necesita un guion para
vivir en `src/lib/seed-scripts.ts` o en la Biblioteca de la app: cada Reel necesita
`beats: ReelBeat[]` (con `key`, `textoHablado`, `tiempoAprox`, `visualSugerido`,
`textoPantalla` para cada uno de los 7 beats en `REEL_BEAT_ORDER`), y cada vídeo de
YouTube necesita `youtubeHook`, `promesa` y `chapters: YoutubeChapter[]` (con `titulo`,
`resumen`, `guion` y el objeto `visual` completo). Usa `makeId(...)` para los ids y
respeta los tipos — no dejes campos requeridos vacíos.
