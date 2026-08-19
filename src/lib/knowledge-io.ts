import { z } from "zod";
import { KNOWLEDGE_BASE } from "./knowledge-base";
import type { KnowledgeCategory } from "./types";
import { makeId } from "./utils";

// ─────────────────────────────────────────────────────────────────────────────
// FORMATO DE INTERCAMBIO DE LA BIBLIOTECA DE CONOCIMIENTO
//
// Un "documento" de conocimiento es un marco (Systems Thinking, BPM, Theory of
// Constraints...) con su idea fundamental, su fuente y sus conceptos. El
// formato está pensado para dos cosas:
//
//   1. EXPORTAR lo que ya hay, para tener una copia y para poder enseñarle la
//      estructura exacta a un LLM.
//   2. IMPORTAR investigación hecha fuera (ChatGPT, Claude, notas propias) sin
//      tener que tocar código.
//
// Reglas de diseño del formato:
//   - Solo 4 campos son obligatorios (nombre, ideaFundamental, fuente.obraOMarco
//     y conceptos). Todo lo demás es opcional, para que un import parcial no
//     falle por un campo que el LLM no rellenó.
//   - `clase` es el contenido principal: una clase larga en prosa continua,
//     no una ficha trinchada en campos sueltos. El resto de campos
//     (resumen, aplicacion, ejemplos...) son apoyo secundario de consulta
//     rápida, no un sustituto de la clase.
//   - `id` se genera solo si no viene, y nunca puede pisar uno de los 7 marcos
//     de serie: un import no debe poder sobrescribir la base curada.
//   - La regla FUENTE → CONCEPTO → INTERPRETACIÓN del proyecto se sostiene
//     obligando a declarar siempre una fuente.
// ─────────────────────────────────────────────────────────────────────────────

export const KNOWLEDGE_FORMAT_ID = "system-content-studio/conocimiento";
export const KNOWLEDGE_FORMAT_VERSION = 1;

const ConceptoImportSchema = z.object({
  id: z.string().optional(),
  termino: z.string().min(1),
  definicion: z.string().min(1),
});

const FuenteImportSchema = z.object({
  autor: z.string().optional(),
  obraOMarco: z.string().min(1),
  nota: z.string().optional(),
});

const CategoriaImportSchema = z.object({
  id: z.string().optional(),
  nombre: z.string().min(1),
  ideaFundamental: z.string().min(1),
  fuente: FuenteImportSchema,
  conceptos: z.array(ConceptoImportSchema).min(1),

  clase: z.string().optional(),
  resumen: z.string().optional(),
  aplicacion: z.string().optional(),
  ejemplos: z.array(z.string()).optional(),
  erroresComunes: z.array(z.string()).optional(),
  preguntasDiagnostico: z.array(z.string()).optional(),
  ideasContenido: z.array(z.string()).optional(),
});

// Se aceptan tres envoltorios distintos para que dé igual cómo lo devuelva el
// LLM: un array pelado, {categorias: [...]} o {categories: [...]}.
const ImportFileSchema = z.union([
  z.array(CategoriaImportSchema),
  z.object({ categorias: z.array(CategoriaImportSchema) }),
  z.object({ categories: z.array(CategoriaImportSchema) }),
]);

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "marco"
  );
}

const RESERVED_IDS = new Set(KNOWLEDGE_BASE.map((c) => c.id));

export class KnowledgeImportError extends Error {}

/**
 * Saca el JSON de lo que sea que haya pegado el usuario. En la práctica un LLM
 * casi nunca devuelve JSON pelado: lo envuelve en ```json, le pone una frase
 * antes ("Aquí tienes...") y a veces se cuelan comillas tipográficas o una coma
 * de más. Se intentan varias limpiezas en orden, de menos a más agresiva, y se
 * devuelve el primer resultado que parsee. undefined si nada funciona.
 */
function extractJson(input: string): unknown {
  const attempts: string[] = [];
  const push = (s: string) => {
    const t = s.trim();
    if (t && !attempts.includes(t)) attempts.push(t);
  };

  push(input);

  // 1. Contenido dentro del primer bloque ``` / ```json.
  const fence = input.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (fence?.[1]) push(fence[1]);

  // 2. Si el bloque quedó abierto (respuesta cortada), todo lo que va después.
  const openFence = input.match(/```(?:json|JSON)?\s*([\s\S]*)$/);
  if (openFence?.[1]) push(openFence[1]);

  // 3. Desde la primera llave/corchete hasta el último cierre: se quita
  //    cualquier frase de alrededor.
  for (const source of [...attempts]) {
    const start = source.search(/[[{]/);
    const end = Math.max(source.lastIndexOf("}"), source.lastIndexOf("]"));
    if (start >= 0 && end > start) push(source.slice(start, end + 1));
  }

  // 4. Variantes con comillas tipográficas normalizadas y comas finales
  //    eliminadas (dos errores habituales al copiar y pegar).
  for (const source of [...attempts]) {
    push(source.replace(/[“”„]/g, '"').replace(/[‘’]/g, "'"));
    push(source.replace(/,(\s*[}\]])/g, "$1"));
    push(
      source
        .replace(/[“”„]/g, '"')
        .replace(/[‘’]/g, "'")
        .replace(/,(\s*[}\]])/g, "$1")
    );
  }

  for (const candidate of attempts) {
    try {
      return JSON.parse(candidate);
    } catch {
      // siguiente intento
    }
  }
  return undefined;
}

export interface ImportResult {
  /** Documentos nuevos o actualizados, listos para guardar. */
  categories: KnowledgeCategory[];
  /** Nombres de los marcos de serie que venían en el archivo y se han omitido. */
  omitidosDeSerie: string[];
}

/**
 * Convierte el JSON importado en KnowledgeCategory[] listos para guardar.
 * Lanza KnowledgeImportError con un mensaje legible si el formato no encaja.
 */
export function parseImportedKnowledge(raw: string): KnowledgeCategory[] {
  return parseImportedKnowledgeDetailed(raw).categories;
}

/**
 * Igual que parseImportedKnowledge pero informando de qué se ha omitido.
 * Los marcos de serie que aparezcan en el archivo (típico al reimportar un
 * export completo) se saltan en vez de duplicarse, para que exportar y volver
 * a importar sirva como copia de seguridad sin ensuciar la biblioteca.
 */
export function parseImportedKnowledgeDetailed(raw: string): ImportResult {
  const trimmed = raw.trim();
  if (!trimmed) throw new KnowledgeImportError("El archivo está vacío.");

  const json = extractJson(trimmed);
  if (json === undefined) {
    throw new KnowledgeImportError(
      "No he encontrado ningún JSON válido en lo que has pegado. Copia la respuesta del chat otra vez, asegurándote de incluir desde la primera llave { o corchete [ hasta la última."
    );
  }

  const result = ImportFileSchema.safeParse(json);
  if (!result.success) {
    const issue = result.error.issues[0];
    const path = issue?.path?.length ? issue.path.join(" → ") : "raíz";
    throw new KnowledgeImportError(`El JSON no tiene el formato esperado. Problema en "${path}": ${issue?.message}`);
  }

  const list = Array.isArray(result.data)
    ? result.data
    : "categorias" in result.data
    ? result.data.categorias
    : result.data.categories;

  if (list.length === 0) throw new KnowledgeImportError("El archivo no contiene ningún documento.");

  const now = new Date().toISOString();
  const usedIds = new Set<string>();
  const omitidosDeSerie: string[] = [];

  const categories = list.flatMap((cat) => {
    const declaredId = cat.id?.trim();

    // Reimportar un export completo no debe duplicar los 7 marcos de serie:
    // si el id coincide con uno de ellos, ya está en la biblioteca.
    if (declaredId && RESERVED_IDS.has(declaredId)) {
      omitidosDeSerie.push(cat.nombre);
      return [];
    }

    // Un id generado tampoco puede pisar uno de serie ni chocar con otro
    // documento del mismo archivo.
    let id = declaredId || slugify(cat.nombre);
    if (RESERVED_IDS.has(id) || usedIds.has(id)) {
      id = `${slugify(cat.nombre)}-${makeId("x").split("_")[1].slice(0, 4)}`;
    }
    usedIds.add(id);

    return [{
      id,
      nombre: cat.nombre,
      ideaFundamental: cat.ideaFundamental,
      fuente: {
        autor: cat.fuente.autor,
        obraOMarco: cat.fuente.obraOMarco,
        nota: cat.fuente.nota,
      },
      conceptos: cat.conceptos.map((c) => ({
        id: c.id?.trim() || makeId("concepto"),
        categoriaId: id,
        termino: c.termino,
        definicion: c.definicion,
      })),
      clase: cat.clase,
      resumen: cat.resumen,
      aplicacion: cat.aplicacion,
      ejemplos: cat.ejemplos,
      erroresComunes: cat.erroresComunes,
      preguntasDiagnostico: cat.preguntasDiagnostico,
      ideasContenido: cat.ideasContenido,
      importado: true,
      importadoEn: now,
    } satisfies KnowledgeCategory];
  });

  if (categories.length === 0 && omitidosDeSerie.length > 0) {
    throw new KnowledgeImportError(
      "El archivo solo contiene los marcos que ya vienen de serie en la app, así que no hay nada nuevo que importar."
    );
  }

  return { categories, omitidosDeSerie };
}

/** JSON completo de la biblioteca (marcos de serie + importados). */
export function buildKnowledgeExport(customCategories: KnowledgeCategory[]): string {
  return JSON.stringify(
    {
      formato: KNOWLEDGE_FORMAT_ID,
      version: KNOWLEDGE_FORMAT_VERSION,
      exportadoEn: new Date().toISOString(),
      categorias: [...KNOWLEDGE_BASE, ...customCategories],
    },
    null,
    2
  );
}

/** Un único documento de ejemplo, para enseñar la forma sin volcar toda la biblioteca. */
export function buildSchemaExample(): string {
  return JSON.stringify(
    {
      categorias: [
        {
          nombre: "Theory of Constraints",
          ideaFundamental:
            "El rendimiento global de un sistema está limitado por una o varias restricciones.",
          fuente: {
            autor: "Eliyahu M. Goldratt",
            obraOMarco: 'Theory of Constraints ("The Goal")',
            nota: "Opcional: matiz sobre de dónde sale exactamente la idea.",
          },
          conceptos: [
            {
              termino: "Bottleneck",
              definicion:
                "El punto concreto del proceso donde se acumula el trabajo porque la capacidad es menor que la demanda.",
            },
            {
              termino: "Throughput",
              definicion:
                "La velocidad a la que el sistema genera resultado completo, no trabajo a medias.",
            },
          ],
          clase:
            "Aquí va la CLASE COMPLETA: un texto largo y desarrollado en prosa continua (como un capítulo de libro o un artículo largo, no una lista de puntos), que explica el marco de principio a fin: de dónde viene, qué problema resuelve, cómo funciona cada pieza, cómo se relacionan entre sí, cómo se aplica en la práctica con ejemplos, qué errores comete la gente y qué se lleva el lector al terminar. Sin límite de longitud artificial: tan larga como haga falta para explicarlo bien.",
          resumen:
            "Opcional: 2-5 párrafos que resumen la clase, por si se quiere repasar rápido sin leerla entera.",
          aplicacion:
            "Opcional: cómo se aplica esto concretamente a una pyme que implanta Odoo o a un negocio de entrenadores personales (si no está ya cubierto dentro de la clase).",
          ejemplos: [
            "Ventas cierra en un día pero facturación tarda una semana: el throughput real lo marca facturación.",
          ],
          erroresComunes: [
            "Contratar más gente en un punto que no es la restricción y no ver ninguna mejora.",
          ],
          preguntasDiagnostico: [
            "¿Dónde se acumula trabajo sin procesar ahora mismo?",
            "¿En qué punto tu equipo espera a que otro le responda?",
          ],
          ideasContenido: [
            "Reel: por qué contratar a más gente no arregla una empresa lenta.",
          ],
        },
      ],
    },
    null,
    2
  );
}

/**
 * Prompt listo para pegar en ChatGPT/Claude: explica el formato y pide que
 * devuelva solo el JSON, para poder importarlo tal cual en la app.
 */
export function buildResearchPrompt(tema = "[ESCRIBE AQUÍ EL TEMA QUE QUIERES INVESTIGAR]"): string {
  return `Investiga a fondo el siguiente tema y devuélvemelo estructurado como material de estudio:

TEMA: ${tema}

CONTEXTO DE PARA QUÉ LO QUIERO
Soy consultor: diseño e implanto sistemas empresariales (con Odoo) y desarrollo aplicaciones para entrenadores personales. Uso este material para entender mejor los sistemas de mis clientes y para crear contenido educativo (Reels y vídeos de YouTube) que explique cómo funciona una empresa como sistema.

REGLAS
- Responde ÚNICAMENTE con JSON válido. Sin texto antes ni después, sin bloques de markdown, sin \`\`\`.
- Cita siempre la fuente real del marco o concepto en "fuente" (autor y obra/marco). Si algo es interpretación tuya y no de una fuente concreta, dilo en "fuente.nota". No te inventes autores, libros ni estadísticas.
- Escribe en español de España, en lenguaje claro y directo, sin relleno corporativo.
- LO MÁS IMPORTANTE ES "clase": quiero una CLASE LARGA Y COMPLETA en prosa continua, no un resumen de puntos sueltos ni una ficha de apuntes trocidada en mil campos. Escríbela como si fuera un capítulo de un libro o un artículo largo bien escrito: con desarrollo, transiciones entre ideas, ejemplos integrados en el propio texto, y explicando el marco de principio a fin (de dónde viene, qué problema resuelve, cómo funciona cada pieza y cómo se relacionan, cómo se aplica, qué errores comete la gente). No la trocees en subtítulos cortos ni la conviertas en una lista — que se lea del tirón, tan larga como haga falta para explicarlo bien de verdad. No escatimes longitud.
- "conceptos" es la lista de términos clave con su definición breve, para poder buscarlos rápido — es un índice de apoyo, no sustituye a la clase.
- "resumen", "aplicacion", "ejemplos", "erroresComunes", "preguntasDiagnostico" e "ideasContenido" son opcionales y secundarios: solo un apoyo rápido de consulta si ya está todo bien explicado dentro de "clase".

FORMATO EXACTO (los campos obligatorios son nombre, ideaFundamental, fuente.obraOMarco y conceptos; "clase" no es obligatorio en el esquema pero es el que de verdad quiero que rellenes largo y bien):
${buildSchemaExample()}`;
}

export function downloadKnowledgeExport(customCategories: KnowledgeCategory[]) {
  triggerDownload(
    buildKnowledgeExport(customCategories),
    `conocimiento-${new Date().toISOString().slice(0, 10)}.json`
  );
}

function triggerDownload(content: string, filename: string) {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
