import { loadFont } from "@remotion/google-fonts/Inter";

// Una sola familia en toda la pieza. Inter es el análogo libre más cercano
// a la SF Pro que ya usa la interfaz del estudio, y aguanta bien el peso 800
// con tracking negativo que pide el titular tipo Vox.
export const { fontFamily } = loadFont("normal", {
  weights: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
});
