import { Config } from "@remotion/cli/config";

// Configuración del renderizador de las animaciones de contexto (Remotion).
// El proyecto de Remotion vive en `remotion/` y es independiente de la app
// Next: no comparte tsconfig ni bundler, solo el node_modules.

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
// El CRF NO se fija aquí a propósito: es un parámetro de codecs con pérdida
// (h264/h265/vp8/vp9) y ProRes lo rechaza de plano ("does not support the
// --crf option"). Como esta config se aplica a TODOS los renders, fijarlo
// aquí rompe cualquier composición que se exporte en ProRes (los subtítulos
// con canal alfa para Premiere, scenes/subtitulos/). Cada render en h264
// pasa su propio --crf=18 explícito (ver scripts/render-*.mjs).
