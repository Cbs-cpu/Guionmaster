import type { PalabraTranscrita } from "@/lib/ai/whisper";

// Convierte una transcripción con timestamp por palabra en líneas de
// subtítulo — la pieza que falta entre "Whisper devolvió 400 palabras
// sueltas" y "remotion/scenes/subtitulos/ sabe pintar 6 líneas con su
// entrada y su salida".
//
// El criterio de corte NO es solo contar palabras: una pausa real al hablar
// (más de `pausaCorteSeg`) es la señal más fiable de "aquí se puede cortar
// sin que se note", así que se prioriza sobre el límite de palabras — cortar
// a mitad de una frase corrida porque tocaba la palabra 8 se nota mucho más
// que dejar una línea de 5 o de 9.

export interface TokenLinea {
  texto: string;
  clave?: boolean;
}

export interface LineaGenerada {
  /** Segundos desde el arranque del audio. */
  inicioSeg: number;
  duracionSeg: number;
  tokens: TokenLinea[];
}

export interface OpcionesAgrupado {
  /** Palabras por línea antes de forzar un corte, aunque no haya pausa. */
  maxPalabras?: number;
  /** Segundos de línea antes de forzar un corte. */
  maxDuracionSeg?: number;
  /** Silencio entre dos palabras a partir del cual se considera un corte natural. */
  pausaCorteSeg?: number;
  /**
   * Palabras a marcar como clave (mayúsculas/minúsculas indiferente). Sin
   * esto, ninguna palabra lleva el tratamiento de acento — decidir CUÁL es
   * la palabra que no se puede perder de una frase es un juicio de
   * contenido, no algo que un agrupador mecánico deba inventar solo.
   */
  claves?: string[];
}

const POR_DEFECTO: Required<Omit<OpcionesAgrupado, "claves">> = {
  maxPalabras: 7,
  maxDuracionSeg: 3.2,
  pausaCorteSeg: 0.6,
};

export function agruparEnLineas(
  palabras: PalabraTranscrita[],
  opciones: OpcionesAgrupado = {}
): LineaGenerada[] {
  // Fusión campo a campo con `??`, no `{...POR_DEFECTO, ...opciones}`: si
  // quien llama pasa un objeto con la clave presente pero en `undefined`
  // (justo lo que produce un campo opcional de Zod sin rellenar, como en
  // /api/ai/subtitulos/render), un spread normal SÍ copia esa clave — pisa
  // el valor por defecto con `undefined` en vez de dejarlo caer. Con los
  // límites a `undefined`, ninguna comparación (`>=`, `>`) del bucle de
  // abajo es nunca cierta, y la transcripción entera acaba en una sola
  // línea sin que salte ningún error.
  const cfg = {
    maxPalabras: opciones.maxPalabras ?? POR_DEFECTO.maxPalabras,
    maxDuracionSeg: opciones.maxDuracionSeg ?? POR_DEFECTO.maxDuracionSeg,
    pausaCorteSeg: opciones.pausaCorteSeg ?? POR_DEFECTO.pausaCorteSeg,
  };
  const clavesNorm = new Set((opciones.claves ?? []).map((c) => c.toLowerCase()));

  const lineas: LineaGenerada[] = [];
  let actual: PalabraTranscrita[] = [];

  const cerrarLinea = () => {
    if (!actual.length) return;
    lineas.push({
      inicioSeg: actual[0].inicio,
      duracionSeg: actual[actual.length - 1].fin - actual[0].inicio,
      tokens: actual.map((p) => ({
        texto: p.texto,
        clave: clavesNorm.has(p.texto.toLowerCase().replace(/[.,!?¿¡:;]/g, "")),
      })),
    });
    actual = [];
  };

  for (const palabra of palabras) {
    if (!palabra.texto.trim()) continue;

    const anterior = actual[actual.length - 1];
    const pausa = anterior ? palabra.inicio - anterior.fin : 0;
    const duracionSiSeAñade = actual.length ? palabra.fin - actual[0].inicio : 0;

    const debeCortarAntes =
      actual.length > 0 &&
      (pausa >= cfg.pausaCorteSeg ||
        actual.length >= cfg.maxPalabras ||
        duracionSiSeAñade > cfg.maxDuracionSeg);

    if (debeCortarAntes) cerrarLinea();
    actual.push(palabra);
  }
  cerrarLinea();

  return lineas;
}

/** Fotogramas de holgura tras la última palabra de una línea, antes de que empiece a desaparecer. */
const COLCHON_SALIDA_FRAMES = 12;
/** Fotogramas mínimos entre el final de una línea y el arranque de la siguiente. */
const HUECO_MIN_FRAMES = 6;

export interface LineaFrames {
  inicio: number;
  duracion: number;
  tokens: TokenLinea[];
}

/**
 * Pasa las líneas de segundos a fotogramas para remotion/scenes/subtitulos/,
 * y asegura que dos líneas nunca se pisan: si el hueco real entre una línea
 * y la siguiente (según sus propios timestamps) es menor que
 * `HUECO_MIN_FRAMES`, se recorta la duración de la primera en vez de dejar
 * que ambas estén en pantalla a la vez, que es justo el fallo que ya se vio
 * al probar el estilo "bloques" con datos mal agrupados.
 */
export function lineasAFrames(lineas: LineaGenerada[], fps: number): LineaFrames[] {
  const out: LineaFrames[] = lineas.map((l) => ({
    inicio: Math.round(l.inicioSeg * fps),
    duracion: Math.round(l.duracionSeg * fps) + COLCHON_SALIDA_FRAMES,
    tokens: l.tokens,
  }));

  for (let i = 0; i < out.length - 1; i++) {
    const finActual = out[i].inicio + out[i].duracion;
    const inicioSiguiente = out[i + 1].inicio;
    if (finActual + HUECO_MIN_FRAMES > inicioSiguiente) {
      out[i].duracion = Math.max(1, inicioSiguiente - HUECO_MIN_FRAMES - out[i].inicio);
    }
  }

  return out;
}
