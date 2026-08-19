"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Lightbox, ExpandOverlay } from "@/components/ui/Lightbox";
import { useStudioStore } from "@/lib/store";
import { useAllGeneratedVisuals, type VisualWithSource } from "@/lib/relations";
import { VisualThumb } from "@/components/ui/VisualThumb";
import { isPlayableVisual, VISUAL_RESOURCE_LABELS, type VisualResourceKind } from "@/lib/types";
import { makeId } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  Captions,
  Download,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

// Biblioteca de recursos visuales, dividida por tipo. Cada sección lee un
// subconjunto de `useAllGeneratedVisuals()` (que ya agrega los `visuals` de
// todos los guiones) salvo "Subtítulos", que no nace de un guion — es un
// asset de identidad de canal — y "Fotos de referencia", que el usuario sube
// a mano en vez de generarse.
//
// Todo lo que se puede ver en grande (imagen, animación, estilo de
// subtítulos) se abre en el mismo <Lightbox>, controlado por un único estado
// `open` en esta página: así solo hay una pieza de UI que sepa "cómo se ve
// algo a tamaño completo", en vez de una por sección.

const SECCIONES: { kinds: VisualResourceKind[]; titulo: string; descripcion: string }[] = [
  {
    kinds: ["animacion"],
    titulo: "Animaciones",
    descripcion:
      "Motion graphics renderizados con Remotion (papel + objetos fotográficos + paralaje), ancladas a una frase concreta del guion del que salieron.",
  },
  {
    kinds: ["infografia"],
    titulo: "Infografías",
    descripcion: "Diagramas y comparaciones generados con Kie.ai para acompañar un capítulo o un tablero.",
  },
  {
    kinds: ["imagen-contexto"],
    titulo: "Imágenes de contexto",
    descripcion: "Metáforas visuales e ilustraciones de apoyo — los recortes fotográficos que luego se animan.",
  },
  {
    kinds: ["imagen-usuario"],
    titulo: "Imágenes con tu foto",
    descripcion: "Composiciones generadas a partir de una foto tuya de la biblioteca de referencia.",
  },
  {
    kinds: ["documento-pdf", "presentacion", "otro"],
    titulo: "Documentos y presentaciones",
    descripcion: "PDFs, presentaciones de apoyo y cualquier otro recurso que no encaje en las categorías de arriba.",
  },
];

type OpenItem =
  | { kind: "media"; src: string; isVideo: boolean; title: string; subtitle?: string }
  | { kind: "subtitulo"; label: string; filePath: string; previewSrc: string | null; notes: string };

/** .ass es texto plano; todo lo demás (.mov, .mp4…) se puede reproducir directamente. */
function esVideoWeb(path: string): boolean {
  return /\.(mp4|webm)$/i.test(path);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function RecursosPage() {
  const hydrated = useStudioStore((s) => s.hydrated);
  const referenceImages = useStudioStore((s) => s.referenceImages);
  const addReferenceImage = useStudioStore((s) => s.addReferenceImage);
  const removeReferenceImage = useStudioStore((s) => s.removeReferenceImage);
  const subtitleStyles = useStudioStore((s) => s.subtitleStyles);
  const removeSubtitleStyle = useStudioStore((s) => s.removeSubtitleStyle);
  const updateScript = useStudioStore((s) => s.updateScript);
  const scripts = useStudioStore((s) => s.scripts);
  const generated = useAllGeneratedVisuals();

  const [open, setOpen] = useState<OpenItem | null>(null);

  const porTipo = useMemo(() => {
    const map = new Map<VisualResourceKind, VisualWithSource[]>();
    for (const item of generated) {
      const list = map.get(item.visual.kind) ?? [];
      list.push(item);
      map.set(item.visual.kind, list);
    }
    return map;
  }, [generated]);

  function removeGenerated(scriptId: string, visualId: string) {
    const script = scripts.find((s) => s.id === scriptId);
    if (!script) return;
    updateScript(scriptId, { visuals: (script.visuals ?? []).filter((v) => v.id !== visualId) });
  }

  const [label, setLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const base64Data = await fileToDataUrl(file);
      const finalLabel = label.trim() || file.name;
      const res = await fetch("/api/ai/visuals/upload-reference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: finalLabel, fileName: file.name, base64Data }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "No se ha podido subir la imagen.");
      }
      const data = (await res.json()) as { filePath: string };
      addReferenceImage({
        id: makeId("ref"),
        label: finalLabel,
        filePath: data.filePath,
        addedAt: new Date().toISOString(),
      });
      setLabel("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se ha podido subir la imagen.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <PageHeader
        eyebrow="Recursos visuales"
        title="Todo lo que se ha generado, en un solo sitio"
        description="Organizado por tipo. Cada infografía, animación o imagen que se genera para cualquier guion aparece aquí sola — no hace falta importarla. Pasa el ratón por encima de cualquier miniatura y haz clic para verla en grande."
      />

      <div className="mt-10 space-y-12">
        {SECCIONES.map((seccion) => {
          const items = seccion.kinds.flatMap((k) => porTipo.get(k) ?? []);
          return (
            <GeneratedSection
              key={seccion.titulo}
              titulo={seccion.titulo}
              descripcion={seccion.descripcion}
              items={items}
              onOpen={(item) =>
                setOpen({
                  kind: "media",
                  src: `/api/media/${item.visual.filePath}`,
                  isVideo: isPlayableVisual(item.visual),
                  title: item.scriptTitle,
                  subtitle: item.chapterTitle ?? VISUAL_RESOURCE_LABELS[item.visual.kind],
                })
              }
              onRemove={(item) => removeGenerated(item.scriptId, item.visual.id)}
            />
          );
        })}

        <section>
          <div className="flex items-center gap-2 mb-1">
            <Captions className="h-4 w-4 text-accent" />
            <p className="label-caps text-[10px] text-ink-faint">Subtítulos ({subtitleStyles.length})</p>
          </div>
          <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            Blanco y amarillo, igual que las animaciones. Los animados (rebote por palabra, pensados para
            Premiere Pro) se ven en movimiento aquí mismo; los <code className="text-ink-soft">.ass</code> son
            estilo de texto estático para DaVinci Resolve, Aegisub o ffmpeg.
          </p>
          {!hydrated ? null : subtitleStyles.length === 0 ? (
            <EmptyKind mensaje="Todavía no hay ningún estilo de subtítulos." />
          ) : (
            <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {subtitleStyles.map((style) => {
                const previewSrc = esVideoWeb(style.previewPath ?? style.filePath)
                  ? `/api/media/${style.previewPath ?? style.filePath}`
                  : null;
                return (
                  <li key={style.id} className="group relative overflow-hidden rounded-sm border border-rule paper-panel">
                    <button
                      type="button"
                      onClick={() =>
                        setOpen({
                          kind: "subtitulo",
                          label: style.label,
                          filePath: style.filePath,
                          previewSrc,
                          notes: style.notes,
                        })
                      }
                      className="group/expand relative flex aspect-square w-full flex-col items-center justify-center gap-2 overflow-hidden bg-[#0B0D0B] px-3"
                    >
                      {previewSrc ? (
                        <SubtitleVideoPreview src={previewSrc} />
                      ) : (
                        <SubtitlePreview />
                      )}
                      <ExpandOverlay />
                    </button>
                    <p className="truncate px-2 py-1.5 text-[11px] text-ink-soft">{style.label}</p>
                    <a
                      href={`/api/media/${style.filePath}`}
                      download
                      aria-label="Descargar"
                      onClick={(e) => e.stopPropagation()}
                      className="press absolute left-1 top-1 rounded-sm bg-ink/80 p-1 text-paper opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                    >
                      <Download className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => removeSubtitleStyle(style.id)}
                      aria-label="Quitar estilo de subtítulos"
                      className="press absolute right-1 top-1 rounded-sm bg-ink/80 p-1 text-paper opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section>
          <p className="label-caps text-[10px] text-ink-faint mb-1">Fotos de referencia</p>
          <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-ink-soft">
            Súbelas una vez aquí. Cuando le pidas a Claude Code una imagen con tu foto, las reutiliza sin que tengas
            que volver a mandarlas.
          </p>

          <div className="paper-panel rounded-sm px-5 sm:px-6 py-5">
            <p className="label-caps text-[10px] text-ink-faint mb-3">Subir una foto</p>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <Input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Etiqueta (opcional, ej: retrato estudio 2026)"
                className="sm:flex-1"
              />
              <Button onClick={() => fileRef.current?.click()} loading={uploading} disabled={uploading}>
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Elegir imagen
              </Button>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </div>
            {error && <p className="mt-3 text-[13px] text-accent">{error}</p>}
          </div>

          {!hydrated ? null : referenceImages.length === 0 ? (
            <div className="mt-6 paper-panel rounded-sm px-6 py-10 text-center">
              <ImageIcon className="h-6 w-6 mx-auto mb-3 text-ink-faint" />
              <p className="text-sm text-ink-soft">Todavía no has subido ninguna foto de referencia.</p>
            </div>
          ) : (
            <ul className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {referenceImages.map((img) => (
                <li key={img.id} className="group relative overflow-hidden rounded-sm border border-rule paper-panel">
                  <button
                    type="button"
                    onClick={() =>
                      setOpen({ kind: "media", src: `/api/media/${img.filePath}`, isVideo: false, title: img.label })
                    }
                    className="group/expand relative block w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/api/media/${img.filePath}`} alt={img.label} className="aspect-square w-full object-cover" />
                    <ExpandOverlay />
                  </button>
                  <p className="truncate px-2 py-1.5 text-[11px] text-ink-soft">{img.label}</p>
                  <button
                    onClick={() => removeReferenceImage(img.id)}
                    aria-label="Quitar de la biblioteca"
                    className="press absolute right-1 top-1 rounded-sm bg-ink/80 p-1 text-paper opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {open?.kind === "media" && (
        <Lightbox onClose={() => setOpen(null)} title={open.title} subtitle={open.subtitle}>
          {open.isVideo ? (
            <video src={open.src} controls autoPlay loop playsInline className="max-h-[80vh] w-full object-contain" />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={open.src} alt={open.title} className="max-h-[80vh] w-full object-contain" />
          )}
        </Lightbox>
      )}

      {open?.kind === "subtitulo" && (
        <Lightbox
          onClose={() => setOpen(null)}
          title={open.label}
          subtitle={`Estilo de subtítulos · ${open.filePath.split(".").pop()}`}
        >
          <div className="flex flex-col gap-5 p-6">
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-3 overflow-hidden rounded-sm bg-[#0B0D0B]">
              {open.previewSrc ? (
                <video
                  src={open.previewSrc}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-full w-full object-contain"
                />
              ) : (
                <SubtitlePreview grande />
              )}
            </div>
            {open.previewSrc && (
              <p className="-mt-2 text-[11px] text-ink-faint">
                Esto es la previsualización web (con fondo, para verse aquí). El archivo real que se descarga es
                un vídeo con canal alfa — fondo transparente, para montar como pista encima de tu vídeo.
              </p>
            )}
            <p className="text-[13px] leading-relaxed text-ink-soft">{open.notes}</p>
            <div className="flex flex-wrap gap-2.5">
              <a href={`/api/media/${open.filePath}`} download>
                <Button size="sm">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Descargar {open.filePath.split(".").pop()}
                </Button>
              </a>
              <a href={`/api/media/${open.filePath}`} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="secondary">
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Ver el archivo
                </Button>
              </a>
            </div>
          </div>
        </Lightbox>
      )}
    </div>
  );
}

function GeneratedSection({
  titulo,
  descripcion,
  items,
  onOpen,
  onRemove,
}: {
  titulo: string;
  descripcion: string;
  items: VisualWithSource[];
  onOpen: (item: VisualWithSource) => void;
  onRemove: (item: VisualWithSource) => void;
}) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-accent" />
        <p className="label-caps text-[10px] text-ink-faint">
          {titulo} ({items.length})
        </p>
      </div>
      <p className="mb-4 max-w-2xl text-[13px] leading-relaxed text-ink-soft">{descripcion}</p>

      {items.length === 0 ? (
        <EmptyKind mensaje="Todavía no se ha generado nada en esta categoría." />
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {items.map((item) => (
            <li
              key={item.visual.id}
              className="group relative overflow-hidden rounded-sm border border-rule paper-panel"
            >
              <VisualThumb visual={item.visual} onOpen={() => onOpen(item)} />
              <Link
                href={`/editor/${item.scriptId}`}
                onClick={(e) => e.stopPropagation()}
                className="block px-2 py-1.5 text-[11px] text-ink-soft hover:text-accent"
              >
                <span className="truncate block">{item.scriptTitle}</span>
                {item.chapterTitle && <span className="truncate block text-ink-faint">{item.chapterTitle}</span>}
              </Link>
              <button
                onClick={() => onRemove(item)}
                aria-label="Quitar recurso generado"
                className="press absolute right-1 top-1 rounded-sm bg-ink/80 p-1 text-paper opacity-0 transition-opacity hover:text-accent group-hover:opacity-100"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function EmptyKind({ mensaje }: { mensaje: string }) {
  return (
    <div className="rounded-sm border border-dashed border-rule px-6 py-8 text-center">
      <p className="text-[13px] text-ink-faint">{mensaje}</p>
    </div>
  );
}

/** Maqueta CSS de las dos líneas del estilo .ass: texto normal + palabra clave sobre caja amarilla. */
function SubtitlePreview({ grande = false }: { grande?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center gap-2", grande && "gap-3")}>
      <p
        className={cn(
          "font-extrabold text-white [text-shadow:0_0_3px_#000,0_0_3px_#000,0_0_3px_#000]",
          grande ? "text-xl" : "text-[11px]"
        )}
      >
        Frase hablada normal
      </p>
      <p
        className={cn(
          "rounded-[1px] bg-[#FFC300] font-extrabold text-[#141414]",
          grande ? "px-3 py-1.5 text-xl" : "px-1.5 py-0.5 text-[11px]"
        )}
      >
        PALABRA CLAVE
      </p>
    </div>
  );
}

/** Miniatura animada de un estilo de subtítulos en vídeo: se reproduce sola en la rejilla, sin esperar al hover. */
function SubtitleVideoPreview({ src }: { src: string }) {
  return (
    <video
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="metadata"
      className="h-full w-full object-contain"
    />
  );
}
