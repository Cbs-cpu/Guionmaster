import React from "react";

// La paleta que consume el motor de animación (remotion/lienzo).
//
// El motor no sabe de colores concretos: los pide por este contrato. Así el
// mismo lenguaje visual — papel, objetos fotográficos multiplicados, cámara
// con paralaje, texto letra a letra — sirve para el reel de papel marfil y
// para las animaciones de contexto en blanco y amarillo de Modula, sin
// duplicar una sola línea de lógica.

export interface Paleta {
  /** Esquina cálida del degradado del papel. */
  papelCalido: string;
  /** Tono medio, el que ocupa casi todo el lienzo. */
  papel: string;
  /** Esquina fría del degradado. */
  papelFrio: string;

  /** Retícula de fondo: se intuye, no se lee. */
  reticula: string;
  /** Curvas finísimas de una sola pasada. */
  filete: string;
  /** Banda ancha y suave que barre el fondo. */
  arco: string;

  /** Tinta del titular ya asentado. */
  tinta: string;
  /** Variante gris del titular, para escenas frías. */
  tintaGris: string;
  /** Color de la letra que todavía no ha aterrizado. */
  tintaFantasma: string;
  /** Línea pequeña sobre el titular. */
  tintaLinea: string;
  /** Párrafos diminutos de relleno. */
  tintaNota: string;

  /**
   * Color de marca. Se reserva para la barra de resalte detrás de una palabra
   * y poco más: si se reparte por toda la pieza deja de señalar nada.
   * `null` en paletas que no tienen acento (el reel clonado no lo tiene).
   */
  acento: string | null;

  /**
   * Aberración cromática del revelado de texto: la letra que entra arrastra
   * un borde por cada lado que se cierra al asentarse.
   */
  fringe: { rojo: string; cian: string };
}

const PaletaContext = React.createContext<Paleta | null>(null);

export const PaletaProvider = PaletaContext.Provider;

export function usePaleta(): Paleta {
  const paleta = React.useContext(PaletaContext);
  if (!paleta) {
    throw new Error(
      "Falta <PaletaProvider>. Toda composición que use remotion/lienzo tiene que envolver su escena con una paleta."
    );
  }
  return paleta;
}
