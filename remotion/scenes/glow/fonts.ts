import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerif } from "@remotion/google-fonts/Newsreader";

// Dos familias, cada una con un solo trabajo — regla heredada del resto del
// proyecto, nunca mezclar más de dos tipografías en una misma pieza:
//   - Inter (ya cargada en remotion/vox/fonts.ts): el cuerpo, en peso normal.
//   - Newsreader itálica: la palabra que se acentúa dentro de un rótulo, el
//     mismo contraste grotesco/serif que se ve en la referencia.
export const { fontFamily: sans } = loadSans("normal", { weights: ["400", "500"], subsets: ["latin"] });
export const { fontFamily: serif } = loadSerif("italic", { weights: ["400"], subsets: ["latin"] });
