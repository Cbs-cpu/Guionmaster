import { staticFile } from "remotion";
import manifiesto from "./capas.generadas.json";

// Traduce el nombre con sentido de un recorte ("cajas_pila") al archivo que
// devolvió Kie.ai ("generated/visual_xxx.png").
//
// El manifiesto lo escribe `scripts/gen-capas-contexto.mjs`, así que regenerar
// una imagen no obliga a tocar ninguna escena: cambia sola la ruta. Se
// resuelve contra data/media, que es el publicDir del renderizador.

const RUTAS = manifiesto as Record<string, string>;

/**
 * Devuelve `null` en vez de reventar cuando falta la imagen.
 *
 * Es deliberado: las 51 fotos se generan por lotes y a veces se cae alguna
 * (cola de Kie.ai, saldo). Si esto lanzara, una sola imagen pendiente dejaría
 * las 16 composiciones sin poder abrirse en el estudio, y no se podría revisar
 * el movimiento hasta tenerlas todas. En su lugar la escena pinta un hueco
 * marcado en rojo, que es imposible confundir con material terminado.
 */
export function capa(clave: string): string | null {
  const ruta = RUTAS[clave];
  return ruta ? staticFile(ruta) : null;
}

export const CAPAS_DISPONIBLES = Object.keys(RUTAS);

/** Claves que una lista de escenas necesita y todavía no existen. */
export function capasQueFaltan(claves: string[]): string[] {
  return [...new Set(claves)].filter((c) => !RUTAS[c]).sort();
}
