import path from "node:path";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { z } from "zod";
import { agruparEnLineas, lineasAFrames } from "@/lib/subtitulos/agrupar";
import { mediaAbsolutePath, mediaPublicUrl } from "@/lib/media-store";
import { makeId } from "@/lib/utils";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

// Convierte una transcripción ya guardada (por /api/ai/subtitulos/transcribir)
// en los dos archivos reales de un estilo de subtítulos: el .mp4 de
// previsualización y el .mov con canal alfa para Premiere.
//
// El agrupado (transcripción → líneas) se hace AQUÍ, en TypeScript normal.
// El RENDER (bundle + Chromium) se delega a scripts/render-subtitulos.mjs
// como proceso aparte — @remotion/bundler no se puede importar dentro de una
// ruta de Next.js: arrastra esbuild, y el bundler de desarrollo de Next
// (Turbopack) se atraganta con los paquetes de plataforma de esbuild
// (@esbuild/win32-x64/README.md) al intentar tipar todo lo que hay dentro.
// Ver el comentario de cabecera de ese script para el detalle completo.

export const runtime = "nodejs";
export const maxDuration = 600;

const execFileAsync = promisify(execFile);

const InputSchema = z.object({
  transcriptPath: z.string().min(1),
  estiloId: z.string().min(1),
  claves: z.array(z.string()).optional(),
  maxPalabras: z.number().int().positive().optional(),
  maxDuracionSeg: z.number().positive().optional(),
  pausaCorteSeg: z.number().positive().optional(),
});

export async function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  let tempPath: string | null = null;
  try {
    const body = InputSchema.parse(await req.json());

    const transcriptAbs = mediaAbsolutePath(body.transcriptPath);
    const transcriptRaw = await fs.readFile(transcriptAbs, "utf8").catch(() => {
      throw new Error(`No existe la transcripción: ${body.transcriptPath}`);
    });
    const transcripcion = JSON.parse(transcriptRaw) as {
      palabras: { texto: string; inicio: number; fin: number }[];
    };

    if (!transcripcion.palabras?.length) {
      return NextResponse.json(
        { error: "Esa transcripción no tiene ninguna palabra con marca de tiempo." },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const lineasSeg = agruparEnLineas(transcripcion.palabras, {
      maxPalabras: body.maxPalabras,
      maxDuracionSeg: body.maxDuracionSeg,
      pausaCorteSeg: body.pausaCorteSeg,
      claves: body.claves,
    });
    const lineas = lineasAFrames(lineasSeg, 30);

    const id = makeId("subs");
    const root = process.cwd();
    tempPath = path.join(root, "data", "media", "generated", `.lineas-${id}.json`);
    await fs.mkdir(path.dirname(tempPath), { recursive: true });
    await fs.writeFile(tempPath, JSON.stringify({ lineas, estiloId: body.estiloId }));

    const script = path.join(root, "scripts", "render-subtitulos.mjs");
    const { stdout } = await execFileAsync(
      process.execPath,
      [script, `--lineas=${tempPath}`, `--estilo=${body.estiloId}`, `--out=${id}`],
      { cwd: root, maxBuffer: 32 * 1024 * 1024, timeout: 590_000 }
    );

    const ultimaLinea = stdout.trim().split("\n").filter(Boolean).pop();
    if (!ultimaLinea) throw new Error("El proceso de render no devolvió ningún resultado.");
    const resultado = JSON.parse(ultimaLinea) as {
      ok: boolean;
      estiloId: string;
      lineas: number;
      duracionFrames: number;
      previewPath: string;
      filePath: string;
    };

    return NextResponse.json(
      {
        id,
        estiloId: resultado.estiloId,
        lineas: resultado.lineas,
        duracionFrames: resultado.duracionFrames,
        previewPath: resultado.previewPath,
        filePath: resultado.filePath,
        previewUrl: mediaPublicUrl(resultado.previewPath),
        url: mediaPublicUrl(resultado.filePath),
      },
      { headers: CORS_HEADERS }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Entrada inválida.", details: error.issues },
        { status: 400, headers: CORS_HEADERS }
      );
    }
    const message =
      error && typeof error === "object" && "stderr" in error
        ? String((error as { stderr?: string }).stderr).slice(-2000)
        : error instanceof Error
          ? error.message
          : "Error inesperado renderizando los subtítulos.";
    console.error("[subtitulos/render]", error);
    return NextResponse.json({ error: message }, { status: 500, headers: CORS_HEADERS });
  } finally {
    if (tempPath) await fs.rm(tempPath, { force: true });
  }
}
