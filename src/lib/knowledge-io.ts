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

  let json: unknown;
  try {
    json = JSON.parse(trimmed);
  } catch {
    throw new KnowledgeImportError(
      "El contenido no es JSON válido. Si lo has copiado de un chat, asegúrate de no incluir el texto de alrededor ni las comillas de bloque (```)."
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
          resumen:
            "Explicación en prosa del marco, de 2 a 5 párrafos, para poder estudiarlo del tirón.",
          aplicacion:
            "Cómo se aplica esto concretamente a una pyme que implanta Odoo o a un negocio de entrenadores personales.",
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
- "conceptos" es la lista de términos clave con su definición breve. Incluye todos los que sean relevantes (normalmente entre 5 y 12).
- "resumen" es una explicación en prosa (2-5 párrafos) para poder estudiar el marco del tirón.
- "aplicacion" explica cómo aplica concretamente a una pyme o a un negocio de entrenadores personales.

FORMATO EXACTO (los campos obligatorios son nombre, ideaFundamental, fuente.obraOMarco y conceptos; el resto son opcionales pero mejor si los rellenas):
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
