import React from "react";
import { AbsoluteFill } from "remotion";
import { DefEscena, Escena } from "../../lienzo/escena";
import { PaletaProvider } from "../../lienzo/paleta";
import { Acabado } from "../../lienzo/piezas";
import { capa } from "./capas";
import { contexto, PALETA_CONTEXTO, TIPO } from "./estilo";

// Las 16 animaciones de contexto del vídeo "Tu empresa no es una lista de
// departamentos. Es un sistema." (script_2s7nio1s6a).
//
// Cada una cubre UNA frase concreta del guion hablado, no un capítulo entero:
// por eso duran 6 s y no 14. En la app, cada clave de aquí es el destino de
// una marca [[clave|texto]] dentro del texto del capítulo, de modo que al
// pasar el ratón por la frase subrayada se ve el clip que le corresponde.
//
// Reglas de la identidad, para que las 16 se lean como una sola familia:
//   - Dos líneas de texto y solo dos: una pequeña de entrada y una grande.
//   - El resalte amarillo va SIEMPRE en la línea grande, y solo en ella.
//   - Entre tres y cuatro capas por escena: una nítida al frente y el resto
//     fuera de foco a distinta profundidad. Sin eso la escena se aplana.
//   - Clips mudos: la voz la pone la grabación a cámara.

const D = contexto.duracion;

/** Atajo: la línea pequeña de entrada, siempre igual de tratada. */
const entrada = (texto: string) => ({
  tam: TIPO.linea,
  peso: 500,
  color: PALETA_CONTEXTO.tintaLinea,
  corridas: [{ texto }],
});

/** Atajo: la línea grande con el resalte amarillo de marca. */
const remate = (texto: string, tam: number = TIPO.titular) => ({
  tam,
  peso: 800,
  tracking: "-0.03em",
  resalte: true,
  corridas: [{ texto }],
});

export const ANIMACIONES: DefEscena[] = [
  // ══ Capítulo 1 — El punto ciego ═══════════════════════════════════════
  {
    id: "parches-sueltos",
    duracion: D,
    camara: { dx: -104, dy: 74, zoom: 1.05 },
    fondo: { arco: null, semilla: "parches" },
    capas: [
      { capa: "cinta_adhesiva", x: 0.12, y: 0.9, tam: 0.28, desenfoque: 12, profundidad: 2.2, desdeY: 0.22 },
      { capa: "tornillo_suelto", x: 0.93, y: 0.84, tam: 0.24, desenfoque: 9, profundidad: 1.9, entrada: 6, desdeX: 0.14 },
      { capa: "engranaje_agrietado", x: 0.72, y: 0.3, tam: 0.3, rot: -8, desenfoque: 2, profundidad: 1.3, entrada: 3, desdeY: -0.16 },
      { capa: "tirita", x: 0.78, y: 0.6, tam: 0.26, rot: 14, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.36,
      retardo: 6,
      lineas: [entrada("La respuesta automática es"), remate("UN PARCHE")],
    },
  },
  {
    id: "problema-vuelve",
    duracion: D,
    camara: { dx: 96, dy: -68, zoom: 1.05 },
    fondo: { arco: -14, semilla: "vuelve" },
    capas: [
      { capa: "gota_agua", x: 0.16, y: 0.88, tam: 0.22, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "tapon", x: 0.9, y: 0.75, tam: 0.2, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeX: 0.14 },
      { capa: "tuberia_fuga", x: 0.74, y: 0.36, tam: 0.36, rot: -6, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.38,
      retardo: 5,
      lineas: [entrada("Tapas el síntoma y"), remate("VUELVE")],
    },
  },
  {
    id: "efecto-a-distancia",
    duracion: D,
    camara: { dx: -118, dy: -52, zoom: 1.06 },
    fondo: { arco: null, semilla: "distancia" },
    capas: [
      { capa: "cuerda_tensa", x: 0.5, y: 0.9, tam: 0.42, desenfoque: 10, profundidad: 2, desdeY: 0.18 },
      { capa: "domino_suelto", x: 0.14, y: 0.2, tam: 0.18, desenfoque: 7, profundidad: 1.7, entrada: 8, desdeY: -0.14 },
      { capa: "domino_fila", x: 0.74, y: 0.5, tam: 0.42, profundidad: 1, desdeX: 0.24 },
    ],
    titular: {
      x: 0.07,
      y: 0.34,
      retardo: 5,
      lineas: [entrada("Tocas aquí y se mueve"), remate("ALLÍ")],
    },
  },

  // ══ Capítulo 2 — Qué es el pensamiento sistémico ══════════════════════
  {
    id: "suma-de-partes",
    duracion: D,
    camara: { dx: 88, dy: 96, zoom: 1.05 },
    fondo: { arco: 10, semilla: "suma" },
    capas: [
      { capa: "engranajes_sueltos", x: 0.16, y: 0.86, tam: 0.38, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "engranaje_amarillo", x: 0.93, y: 0.24, tam: 0.24, desenfoque: 7, profundidad: 1.7, entrada: 7, desdeX: 0.14 },
      { capa: "mecanismo_montado", x: 0.73, y: 0.55, tam: 0.4, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.33,
      retardo: 5,
      lineas: [entrada("El conjunto no es"), remate("LA SUMA")],
    },
  },
  {
    id: "bucle-retroalimentacion",
    duracion: D,
    camara: { dx: -92, dy: 84, zoom: 1.06 },
    fondo: { arco: -8, semilla: "bucle" },
    capas: [
      { capa: "eslabones", x: 0.14, y: 0.87, tam: 0.32, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "cinta_bucle", x: 0.92, y: 0.72, tam: 0.26, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeX: 0.14 },
      { capa: "cuerda_bucle", x: 0.74, y: 0.34, tam: 0.36, profundidad: 1, desdeY: -0.18 },
    ],
    titular: {
      x: 0.07,
      y: 0.37,
      retardo: 5,
      lineas: [entrada("Lo que sale del proceso"), remate("VUELVE A ENTRAR", TIPO.titularLargo)],
    },
  },
  {
    id: "retrasos-delay",
    duracion: D,
    camara: { dx: 76, dy: -104, zoom: 1.05 },
    fondo: { arco: null, semilla: "retraso" },
    capas: [
      { capa: "bombilla", x: 0.88, y: 0.86, tam: 0.28, desenfoque: 10, profundidad: 2, desdeY: 0.18 },
      { capa: "interruptor", x: 0.15, y: 0.18, tam: 0.22, desenfoque: 7, profundidad: 1.7, entrada: 7, desdeY: -0.14 },
      { capa: "reloj_arena", x: 0.72, y: 0.44, tam: 0.34, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.36,
      retardo: 5,
      lineas: [entrada("Entre la causa y el efecto"), remate("HAY RETRASO", TIPO.titularLargo)],
    },
  },

  // ══ Capítulo 3 — El ejemplo ═══════════════════════════════════════════
  {
    id: "decision-aislada",
    duracion: D,
    camara: { dx: -86, dy: -92, zoom: 1.05 },
    fondo: { arco: null, semilla: "decision" },
    capas: [
      { capa: "palanca", x: 0.16, y: 0.85, tam: 0.3, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "tijeras", x: 0.9, y: 0.28, tam: 0.28, desenfoque: 8, profundidad: 1.8, entrada: 7, desdeX: 0.14 },
      { capa: "etiqueta_precio", x: 0.74, y: 0.58, tam: 0.3, rot: -10, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.35,
      retardo: 5,
      lineas: [entrada("Vista sola, es"), remate("RAZONABLE")],
    },
  },
  {
    id: "stock-acumulacion",
    duracion: D,
    camara: { dx: 104, dy: 88, zoom: 1.06 },
    fondo: { arco: 12, semilla: "stock" },
    capas: [
      { capa: "cajas_desbordadas", x: 0.18, y: 0.9, tam: 0.44, desenfoque: 11, profundidad: 2.2, desdeY: 0.22 },
      { capa: "caja_suelta", x: 0.93, y: 0.22, tam: 0.2, desenfoque: 7, profundidad: 1.7, entrada: 8, desdeY: -0.14 },
      { capa: "cajas_pila", x: 0.73, y: 0.54, tam: 0.42, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.34,
      retardo: 5,
      lineas: [entrada("Entra más rápido de lo que sale"), remate("STOCK")],
    },
  },

  // ══ Capítulo 4 — Lo que hago con Odoo ═════════════════════════════════
  {
    id: "silos-informacion",
    duracion: D,
    camara: { dx: -96, dy: 70, zoom: 1.05 },
    fondo: { arco: -10, semilla: "silos" },
    capas: [
      { capa: "carpetas", x: 0.15, y: 0.88, tam: 0.34, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "llave", x: 0.9, y: 0.8, tam: 0.18, desenfoque: 8, profundidad: 1.8, entrada: 9, desdeX: 0.12 },
      { capa: "silo_metalico", x: 0.9, y: 0.34, tam: 0.28, desenfoque: 4, profundidad: 1.4, entrada: 5, desdeY: -0.14 },
      { capa: "archivador_candado", x: 0.66, y: 0.52, tam: 0.34, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.34,
      retardo: 5,
      lineas: [entrada("Cada equipo con su versión"), remate("SILOS")],
    },
  },
  {
    id: "cuello-de-botella",
    duracion: D,
    camara: { dx: 82, dy: -96, zoom: 1.06 },
    fondo: { arco: null, semilla: "cuello" },
    capas: [
      { capa: "botella_cuello", x: 0.2, y: 0.88, tam: 0.4, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "canicas", x: 0.9, y: 0.24, tam: 0.24, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeY: -0.14 },
      { capa: "embudo", x: 0.73, y: 0.52, tam: 0.36, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.35,
      retardo: 5,
      lineas: [entrada("El punto donde se acumula"), remate("LA RESTRICCIÓN", TIPO.titularLargo)],
    },
  },
  {
    id: "optimizar-fuera-del-cuello",
    duracion: D,
    camara: { dx: -110, dy: -64, zoom: 1.05 },
    fondo: { arco: 8, semilla: "fuera" },
    capas: [
      { capa: "canicas_atascadas", x: 0.22, y: 0.9, tam: 0.42, desenfoque: 10, profundidad: 2.1, desdeY: 0.2 },
      { capa: "engranaje_veloz", x: 0.14, y: 0.2, tam: 0.16, desenfoque: 7, profundidad: 1.7, entrada: 8, desdeY: -0.12 },
      { capa: "valvula", x: 0.76, y: 0.46, tam: 0.34, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.33,
      retardo: 5,
      lineas: [entrada("Mejorar donde no es el cuello"), remate("NO MEJORA NADA", TIPO.titularLargo)],
    },
  },
  {
    id: "value-stream",
    duracion: D,
    camara: { dx: 92, dy: 82, zoom: 1.05 },
    fondo: { arco: null, semilla: "flujo" },
    capas: [
      { capa: "cinta_metrica", x: 0.16, y: 0.88, tam: 0.3, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "regla", x: 0.88, y: 0.82, tam: 0.34, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeX: 0.12 },
      { capa: "lapiz", x: 0.9, y: 0.24, tam: 0.26, rot: -18, desenfoque: 4, profundidad: 1.4, entrada: 5, desdeY: -0.14 },
      { capa: "plano_enrollado", x: 0.7, y: 0.52, tam: 0.4, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.34,
      retardo: 5,
      lineas: [entrada("Antes de tocar el software"), remate("MAPEA EL FLUJO", TIPO.titularLargo)],
    },
  },
  {
    id: "tecnologia-al-final",
    duracion: D,
    camara: { dx: -78, dy: 100, zoom: 1.06 },
    fondo: { arco: -12, semilla: "tecnologia" },
    capas: [
      { capa: "destornillador", x: 0.16, y: 0.88, tam: 0.32, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "llave_inglesa", x: 0.92, y: 0.26, tam: 0.3, rot: 20, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeY: -0.14 },
      { capa: "caja_herramientas", x: 0.73, y: 0.55, tam: 0.36, profundidad: 1, desdeX: 0.22 },
    ],
    titular: {
      x: 0.07,
      y: 0.35,
      retardo: 5,
      lineas: [entrada("La tecnología entra"), remate("AL FINAL")],
    },
  },

  // ══ Capítulo 5 — El método ════════════════════════════════════════════
  {
    id: "ocho-pasos",
    // Más larga que las demás: son ocho palabras que tienen que caer una a una
    // al ritmo al que se enumeran a cámara.
    duracion: 240,
    camara: { dx: 64, dy: -58, zoom: 1.04 },
    fondo: { arco: 6, semilla: "metodo" },
    capas: [
      { capa: "rueda_dentada", x: 0.9, y: 0.82, tam: 0.3, desenfoque: 10, profundidad: 2, desdeY: 0.18 },
      { capa: "engranaje_central", x: 0.78, y: 0.42, tam: 0.42, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.2,
      retardo: 6,
      lineas: [
        entrada("El método, en este orden"),
        { tam: TIPO.paso, peso: 800, margenSuperior: 26, corridas: [{ texto: "observar · mapear" }] },
        { tam: TIPO.paso, peso: 800, margenSuperior: 10, corridas: [{ texto: "entender · diagnosticar" }] },
        { tam: TIPO.paso, peso: 800, margenSuperior: 10, corridas: [{ texto: "diseñar · implementar" }] },
        {
          tam: TIPO.paso,
          peso: 800,
          margenSuperior: 10,
          resalte: true,
          corridas: [{ texto: "medir · optimizar" }],
        },
      ],
    },
  },
  {
    id: "medir-optimizar",
    duracion: D,
    camara: { dx: -88, dy: -86, zoom: 1.05 },
    fondo: { arco: null, semilla: "medir" },
    capas: [
      { capa: "calibre", x: 0.18, y: 0.88, tam: 0.34, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "nivel_burbuja", x: 0.88, y: 0.8, tam: 0.32, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeX: 0.12 },
      { capa: "medidor", x: 0.74, y: 0.4, tam: 0.32, profundidad: 1, desdeY: -0.16 },
    ],
    titular: {
      x: 0.07,
      y: 0.36,
      retardo: 5,
      lineas: [entrada("Los dos pasos que todos"), remate("SE SALTAN")],
    },
  },

  // ══ Capítulo 6 — Las preguntas ════════════════════════════════════════
  {
    id: "cuatro-preguntas",
    duracion: 210,
    camara: { dx: 84, dy: 76, zoom: 1.05 },
    fondo: { arco: -6, semilla: "preguntas" },
    capas: [
      { capa: "notas_adhesivas", x: 0.16, y: 0.88, tam: 0.34, desenfoque: 11, profundidad: 2.1, desdeY: 0.2 },
      { capa: "boligrafo", x: 0.9, y: 0.82, tam: 0.28, rot: -24, desenfoque: 8, profundidad: 1.8, entrada: 8, desdeX: 0.12 },
      { capa: "cuaderno", x: 0.9, y: 0.26, tam: 0.28, desenfoque: 4, profundidad: 1.4, entrada: 5, desdeY: -0.14 },
      { capa: "lupa", x: 0.68, y: 0.55, tam: 0.34, rot: 12, profundidad: 1, desdeX: 0.2 },
    ],
    titular: {
      x: 0.07,
      y: 0.3,
      retardo: 5,
      lineas: [
        entrada("Cuatro preguntas"),
        remate("HONESTAS"),
        {
          tam: TIPO.nota + 8,
          peso: 500,
          margenSuperior: 28,
          color: PALETA_CONTEXTO.tintaNota,
          corridas: [{ texto: "acumulación · espera · decisión · duplicado" }],
        },
      ],
    },
  },
];

/** Índice por id, para resolver la clave de una marca [[clave|texto]]. */
export const POR_ID = Object.fromEntries(ANIMACIONES.map((a) => [a.id, a]));

/** Todas las claves de imagen que usan las 16 escenas. */
export const CLAVES_USADAS = ANIMACIONES.flatMap((a) => a.capas.map((c) => c.capa));

/**
 * Una animación de contexto suelta: un solo plano a pantalla completa.
 *
 * A diferencia del reel, aquí cada pieza es su propia composición porque cada
 * una se monta en un punto distinto del vídeo. No hay secuenciación entre
 * ellas: son 16 clips independientes.
 */
export const Animacion: React.FC<{ def: DefEscena }> = ({ def }) => (
  <PaletaProvider value={PALETA_CONTEXTO}>
    <AbsoluteFill style={{ backgroundColor: contexto.color.papel }}>
      <Escena def={def} resolver={capa} />
      <Acabado semilla={17} />
    </AbsoluteFill>
  </PaletaProvider>
);
