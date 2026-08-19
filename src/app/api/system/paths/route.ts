import { NextResponse } from "next/server";
import { mediaAbsolutePath } from "@/lib/media-store";
import { CORS_HEADERS, corsPreflight } from "@/lib/cors";

export const runtime = "nodejs";

// Rutas absolutas del sistema de archivos, para el panel de Premiere Pro.
//
// La app web sirve los recursos por HTTP (`/api/media/...`), pero Premiere
// no importa desde una URL: su API de ExtendScript (`app.project.importFiles`)
// solo acepta rutas de disco. El panel necesita traducir "generated/x.mp4" a
// "C:\...\data\media\generated\x.mp4", y esa raíz solo la conoce el servidor.
//
// Solo se expone la RAÍZ, no un listado: el panel ya sabe qué archivos
// existen porque lee el estado en /api/db/state, y así esta ruta no se
// convierte en un explorador de archivos remoto.

export async function OPTIONS() {
  return corsPreflight();
}

export async function GET() {
  return NextResponse.json(
    {
      // `mediaAbsolutePath("")` devuelve la raíz ya normalizada y validada.
      mediaRoot: mediaAbsolutePath(""),
      platform: process.platform,
      separator: process.platform === "win32" ? "\\" : "/",
    },
    { headers: CORS_HEADERS }
  );
}
