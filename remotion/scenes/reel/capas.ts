import { staticFile } from "remotion";
import manifiesto from "./capas.generadas.json";

// Traduce el nombre con sentido de un recorte ("moneda_frontal") al archivo
// que devolvió Kie.ai ("generated/visual_xxx.png").
//
// El manifiesto lo escribe `scripts/gen-capas-reel.mjs`, así que regenerar una
// imagen no obliga a tocar ninguna escena: cambia sola la ruta. Se resuelve
// contra data/media, que es el publicDir que recibe el renderizador.

const RUTAS = manifiesto as Record<string, string>;

export type ClaveCapa = keyof typeof manifiesto;

export function capa(clave: string): string {
  const ruta = RUTAS[clave];
  if (!ruta) {
    throw new Error(
      `Falta la capa "${clave}" en capas.generadas.json. Genérala con:\n` +
        `  node scripts/gen-capas-reel.mjs ${clave}`
    );
  }
  return staticFile(ruta);
}

/** Claves presentes ahora mismo, para avisar en el estudio si falta alguna. */
export const CAPAS_DISPONIBLES = Object.keys(RUTAS);
