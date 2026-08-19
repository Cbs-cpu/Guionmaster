import { AiConfigError } from "./client";

// Cliente para Kie.ai (https://docs.kie.ai) — genera imágenes (infografías,
// imágenes de contexto, composiciones con fotos de referencia) que luego se
// usan para acompañar guiones y tableros. Formato verificado contra la
// documentación oficial en agosto de 2026:
//   - POST api.kie.ai/api/v1/jobs/createTask   → crea una tarea async, responde con taskId
//   - GET  api.kie.ai/api/v1/jobs/recordInfo   → consulta estado (waiting/generating/success/fail)
//   - POST kieai.redpandaai.co/api/file-base64-upload → sube un archivo local, URL temporal (~3 días)
// Ojo: la API de tareas y la de subida de archivos viven en DOMINIOS
// DISTINTOS — no es un descuido, es como Kie.ai lo tiene montado.
// Los resultados de Kie.ai (resultUrls) caducan a las 24h: por eso todo lo
// que genera este cliente se descarga a disco (src/lib/media-store.ts)
// inmediatamente después de completarse la tarea.

const KIE_JOBS_BASE = "https://api.kie.ai";
const KIE_UPLOAD_BASE = "https://kieai.redpandaai.co";

function getKieApiKey(): string {
  const key = process.env.KIE_API_KEY;
  if (!key) {
    throw new AiConfigError(
      "Falta KIE_API_KEY. Añádela a tu archivo .env.local para generar infografías e imágenes con Kie.ai."
    );
  }
  return key;
}

async function kieFetch<T>(base: string, path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getKieApiKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const raw = await res.text();
  let json: unknown;
  try {
    json = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Kie.ai [${path}] devolvió una respuesta no válida (HTTP ${res.status}): ${raw.slice(0, 300)}`);
  }
  const body = json as { code?: number; msg?: string };
  if (!res.ok || (typeof body.code === "number" && body.code !== 200)) {
    throw new Error(`Kie.ai [${path}] (HTTP ${res.status}): ${body.msg || raw.slice(0, 300)}`);
  }
  return json as T;
}

export type KieTaskState = "waiting" | "generating" | "success" | "fail";

export interface KieTaskDetail {
  taskId: string;
  model: string;
  state: KieTaskState;
  resultJson?: string;
  failMsg?: string;
}

/** Sube un archivo local (base64) a Kie.ai y devuelve una URL temporal (caduca en ~3 días). */
export async function kieUploadBase64(params: {
  base64Data: string;
  fileName: string;
  uploadPath?: string;
}): Promise<string> {
  const res = await kieFetch<{ data: { downloadUrl: string } }>(KIE_UPLOAD_BASE, "/api/file-base64-upload", {
    method: "POST",
    body: JSON.stringify({
      base64Data: params.base64Data,
      fileName: params.fileName,
      uploadPath: params.uploadPath ?? "guionmaster/referencias",
    }),
  });
  return res.data.downloadUrl;
}

export async function kieCreateTask(params: { model: string; input: Record<string, unknown> }): Promise<string> {
  const res = await kieFetch<{ data: { taskId: string } }>(KIE_JOBS_BASE, "/api/v1/jobs/createTask", {
    method: "POST",
    body: JSON.stringify({ model: params.model, input: params.input }),
  });
  return res.data.taskId;
}

export async function kieGetTask(taskId: string): Promise<KieTaskDetail> {
  const res = await kieFetch<{ data: KieTaskDetail }>(
    KIE_JOBS_BASE,
    `/api/v1/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`
  );
  return res.data;
}

/** Crea la tarea de generación y sondea hasta que termina (éxito, fallo o timeout). */
export async function kieGenerateImages(params: {
  model: string;
  input: Record<string, unknown>;
  timeoutMs?: number;
  pollMs?: number;
}): Promise<string[]> {
  const taskId = await kieCreateTask({ model: params.model, input: params.input });
  const timeoutMs = params.timeoutMs ?? 120_000;
  const pollMs = params.pollMs ?? 3000;
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const detail = await kieGetTask(taskId);
    if (detail.state === "success") {
      const parsed = detail.resultJson ? (JSON.parse(detail.resultJson) as { resultUrls?: string[] }) : {};
      if (!parsed.resultUrls?.length) {
        throw new Error("Kie.ai marcó la tarea como completada pero no devolvió ninguna imagen.");
      }
      return parsed.resultUrls;
    }
    if (detail.state === "fail") {
      throw new Error(detail.failMsg || "Kie.ai no ha podido generar la imagen.");
    }
    await new Promise((resolve) => setTimeout(resolve, pollMs));
  }
  throw new Error("Se agotó el tiempo de espera generando la imagen en Kie.ai (puedes reintentarlo).");
}

export const KIE_MODELS = {
  textToImage: "gpt-image-2-text-to-image",
  imageToImage: "gpt-image-2-image-to-image",
} as const;

export type KieAspectRatio =
  | "auto"
  | "1:1"
  | "3:2"
  | "2:3"
  | "4:3"
  | "3:4"
  | "5:4"
  | "4:5"
  | "16:9"
  | "9:16"
  | "2:1"
  | "1:2"
  | "3:1"
  | "1:3"
  | "21:9"
  | "9:21";

export type KieResolution = "1K" | "2K" | "4K";
