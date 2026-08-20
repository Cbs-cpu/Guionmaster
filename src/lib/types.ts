// Core domain types for System Content Studio.

export type Servicio = "odoo" | "entrenadores" | "general";

export type ScriptType = "reel" | "youtube" | "carrusel";

export const SCRIPT_TYPE_LABELS: Record<ScriptType, string> = {
  reel: "Reel",
  youtube: "YouTube",
  carrusel: "Carrusel",
};

export type ScriptStatus = "idea" | "borrador" | "listo" | "grabado" | "publicado";

export const SCRIPT_STATUSES: ScriptStatus[] = [
  "idea",
  "borrador",
  "listo",
  "grabado",
  "publicado",
];

export const STATUS_LABELS: Record<ScriptStatus, string> = {
  idea: "Idea",
  borrador: "Borrador",
  listo: "Listo",
  grabado: "Grabado",
  publicado: "Publicado",
};

export const SERVICIO_LABELS: Record<Servicio, string> = {
  odoo: "Sistemas con Odoo",
  entrenadores: "Apps para entrenadores",
  general: "General / marca personal",
};

export type HookType =
  | "problema"
  | "curiosity_gap"
  | "contrarian"
  | "pregunta"
  | "error_comun"
  | "historia"
  | "resultado"
  | "directo";

export const HOOK_TYPE_LABELS: Record<HookType, string> = {
  problema: "Problema",
  curiosity_gap: "Curiosity gap",
  contrarian: "Contrarian",
  pregunta: "Pregunta",
  error_comun: "Error común",
  historia: "Historia",
  resultado: "Resultado",
  directo: "Directo",
};

export interface HookOption {
  id: string;
  tipo: HookType;
  texto: string;
}

export type ReelBeatKey =
  | "hook"
  | "problema"
  | "consecuencia"
  | "insight"
  | "sistema"
  | "beneficio"
  | "cta";

export const REEL_BEAT_LABELS: Record<ReelBeatKey, string> = {
  hook: "Hook",
  problema: "Problema",
  consecuencia: "Consecuencia",
  insight: "Insight",
  sistema: "Sistema / Solución",
  beneficio: "Beneficio",
  cta: "CTA",
};

export const REEL_BEAT_ORDER: ReelBeatKey[] = [
  "hook",
  "problema",
  "consecuencia",
  "insight",
  "sistema",
  "beneficio",
  "cta",
];

export interface ReelBeat {
  id: string;
  key: ReelBeatKey;
  textoHablado: string;
  tiempoAprox: string;
  visualSugerido: string;
  textoPantalla: string;
}

export type YoutubeVideoType =
  | "educativo"
  | "analisis"
  | "caso_practico"
  | "storytelling"
  | "explicacion"
  | "opinion"
  | "tutorial";

export const YOUTUBE_TYPE_LABELS: Record<YoutubeVideoType, string> = {
  educativo: "Educativo",
  analisis: "Análisis",
  caso_practico: "Caso práctico",
  storytelling: "Storytelling",
  explicacion: "Explicación",
  opinion: "Opinión",
  tutorial: "Tutorial",
};

export type BoardDepth = "quick" | "standard" | "deep" | "exhaustive";

export const BOARD_DEPTH_LABELS: Record<BoardDepth, string> = {
  quick: "Rápido (3-6 frames)",
  standard: "Estándar (6-12 frames)",
  deep: "Profundo (10-20 frames)",
  exhaustive: "Exhaustivo (20+ frames)",
};

// El guion del tablero (formato canvas-guionizador, skill `guionizador`)
// vive aquí como texto markdown. El tablero Miro en sí se construye en la
// app privada `miropriv`, no en esta app: esto es solo el board-script.md.
export interface ChapterBoard {
  needed: boolean;
  script?: string;
  depth?: BoardDepth;
  updatedAt?: string;
}

export interface YoutubeChapter {
  id: string;
  titulo: string;
  resumen: string;
  guion: string;
  visual: {
    queMostrar: string;
    queExplicar: string;
    bRoll: string;
    capturas: string;
    diagramas: string;
  };
  board?: ChapterBoard;
}

// ─── Carrusel de Instagram ──────────────────────────────────────────────────
// El formato sigue las reglas de diseño de carruseles: 4:5, alternancia de
// fondos claro/oscuro para dar ritmo al swipe, portada que frena el scroll y
// último slide con CTA sobre degradado y sin flecha.

export type CarouselSlideKind =
  | "portada"
  | "problema"
  | "solucion"
  | "claves"
  | "detalle"
  | "pasos"
  | "item"
  | "cta";

export const CAROUSEL_SLIDE_LABELS: Record<CarouselSlideKind, string> = {
  portada: "Portada",
  problema: "Problema",
  solucion: "Solución",
  claves: "Claves",
  detalle: "Detalle",
  pasos: "Pasos",
  item: "Punto",
  cta: "CTA",
};

export type CarouselBackground = "claro" | "oscuro" | "degradado";

export interface CarouselSlide {
  id: string;
  kind: CarouselSlideKind;
  fondo: CarouselBackground;
  etiqueta: string;
  titular: string;
  cuerpo: string;
  puntos: string[];
  notaVisual: string;
}

export type CarouselSequence = "estandar" | "listicle" | "tutorial" | "comparacion";

export const CAROUSEL_SEQUENCE_LABELS: Record<CarouselSequence, string> = {
  estandar: "Estándar (portada → problema → solución → claves → pasos → CTA)",
  listicle: "Lista (X errores, X señales, X herramientas)",
  tutorial: "Tutorial (contexto → pasos → resultado)",
  comparacion: "Comparación (opción A vs opción B → veredicto)",
};

export interface CarruselInputs {
  servicio: Servicio;
  publico: string;
  problema: string;
  concepto: string;
  objetivo: string;
  secuencia: CarouselSequence;
  numSlides: number;
  tono: string;
}

export interface ReelInputs {
  servicio: Servicio;
  publico: string;
  problema: string;
  concepto: string;
  objetivo: string;
  duracion: string;
  tono: string;
}

export interface YoutubeInputs {
  tema: string;
  publico: string;
  objetivo: string;
  conceptos: string;
  duracion: string;
  tipo: YoutubeVideoType;
}

export interface ScriptRecord {
  id: string;
  type: ScriptType;
  title: string;
  service: Servicio;
  concepts: string[];
  status: ScriptStatus;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;

  // Reel-specific
  reelInputs?: ReelInputs;
  hooks?: HookOption[];
  selectedHookId?: string;
  beats?: ReelBeat[];

  // YouTube-specific
  youtubeInputs?: YoutubeInputs;
  titleOptions?: string[];
  selectedTitle?: string;
  youtubeHook?: string;
  promesa?: string;
  chapters?: YoutubeChapter[];

  // Carrusel-specific
  carruselInputs?: CarruselInputs;
  slides?: CarouselSlide[];
  caption?: string;

  // shared
  notes?: string;
  resources?: ResourceLink[];
  visuals?: VisualResource[];
  /** Recursos de `visuals` enlazados a un tiempo concreto del vídeo ya grabado — ver AnclaTemporal. */
  anclasTemporales?: AnclaTemporal[];

  // Entrelazado de documentos: de qué marcos de conocimiento nace este
  // contenido y con qué otros contenidos forma familia (un vídeo de YouTube,
  // los reels que salen de él, el carrusel que lo resume). `relatedScriptIds`
  // se mantiene simétrico desde el store: si A apunta a B, B apunta a A.
  knowledgeIds?: string[];
  relatedScriptIds?: string[];
}

// ─── Recursos visuales (Kie.ai) ─────────────────────────────────────────────
// Infografías, imágenes de contexto e imágenes compuestas con fotos de
// referencia del usuario, generadas con Kie.ai y guardadas en disco
// (data/media, servidas por /api/media/...). Los PDFs y presentaciones que
// Claude ensambla a partir de estas imágenes se registran igual, con
// `filePath` apuntando al documento final en vez de a una imagen suelta.

export type VisualResourceKind =
  | "infografia"
  | "imagen-contexto"
  | "imagen-usuario"
  | "animacion"
  | "documento-pdf"
  | "presentacion"
  | "otro";

export const VISUAL_RESOURCE_LABELS: Record<VisualResourceKind, string> = {
  infografia: "Infografía",
  "imagen-contexto": "Imagen de contexto",
  "imagen-usuario": "Imagen con foto tuya",
  animacion: "Animación",
  "documento-pdf": "PDF",
  presentacion: "Presentación",
  otro: "Otro",
};

/** Los recursos que se reproducen (vídeo) en vez de mostrarse como imagen fija. */
export function isPlayableVisual(visual: Pick<VisualResource, "kind" | "filePath">): boolean {
  return visual.kind === "animacion" || /\.(mp4|webm|mov)$/i.test(visual.filePath);
}

export interface VisualResource {
  id: string;
  kind: VisualResourceKind;
  prompt: string;
  model: string;
  /** Ruta relativa dentro de data/media (p. ej. "generated/xyz.png"). */
  filePath: string;
  /** Si acompaña a un capítulo concreto de un vídeo de YouTube. */
  chapterId?: string;
  notes?: string;
  createdAt: string;
}

// ─── Anclas temporales (SRT del vídeo ya grabado) ──────────────────────────
// Distintas de la ancla `[[clave|frase]]` de script-marks.ts: aquella enlaza
// una animación a una FRASE del guion ESCRITO, antes de grabar. Esta enlaza
// un `VisualResource` a un TIEMPO concreto de la TRANSCRIPCIÓN REAL del
// vídeo ya grabado y editado (después de cortar silencios) — lo que permite
// al panel de Premiere insertar el recurso en el minuto exacto donde debe
// ir, en vez de que el usuario lo arrastre a mano.

export interface AnclaTemporal {
  id: string;
  /** Id del VisualResource (en `scripts[].visuals`) que se coloca aquí. */
  recursoId: string;
  /** Segundos desde el arranque del vídeo YA CORTADO (el que se transcribió). */
  tiempoSeg: number;
  /** Palabra o frase corta de la transcripción que motivó este anclaje — para mostrarla en el panel. */
  palabra: string;
  /** Por qué la IA eligió este punto (se enseña en el panel, no se usa para nada más). */
  motivo?: string;
  createdAt: string;
}

/** Fotos del usuario, subidas una vez y reutilizables como referencia en varias generaciones. */
export interface ReferenceImage {
  id: string;
  label: string;
  filePath: string;
  addedAt: string;
}

/**
 * Estilo de subtítulos descargable para cargar en un editor de vídeo
 * externo. A diferencia de un `VisualResource`, no nace de un guion ni de
 * una generación con Kie.ai: es un asset de identidad de canal, el mismo
 * para cualquier vídeo, por eso vive en su propia lista en vez de colgar de
 * `scripts[].visuals`.
 *
 * Dos formas muy distintas conviven aquí, y `filePath` es literal en ambas:
 *   - Un archivo de subtítulos de texto (`.ass`) — lo lee DaVinci
 *     Resolve/Aegisub/ffmpeg directamente. Sin animación por palabra: es
 *     estilo estático (color, caja, contorno), no vídeo.
 *   - Un CLIP DE VÍDEO con canal alfa (`.mov`, ProRes 4444) — el texto
 *     animado (rebote por palabra, caja que aparece) renderizado como
 *     overlay transparente. Premiere Pro no lee `.ass`, así que para
 *     Premiere el "estilo de subtítulos" es literalmente esto: un archivo
 *     que se arrastra a una pista por encima del vídeo, no un formato de
 *     subtítulos.
 */
export interface SubtitleStyle {
  id: string;
  label: string;
  /** Ruta relativa dentro de data/media — el archivo real que se descarga y se usa en el editor. */
  filePath: string;
  /**
   * Si `filePath` no se puede reproducir en un navegador (ProRes 4444 con
   * canal alfa no es un formato web), un MP4 con fondo que muestra el mismo
   * movimiento, para previsualizarlo en /recursos. Sin esto, la miniatura
   * cae al mockup CSS estático (caso de los `.ass`).
   */
  previewPath?: string;
  notes: string;
  createdAt: string;
}

export interface KnowledgeSource {
  autor?: string;
  obraOMarco: string;
  nota?: string;
}

export interface KnowledgeConcept {
  id: string;
  categoriaId: string;
  termino: string;
  definicion: string;
}

export interface ResourceLink {
  id: string;
  titulo: string;
  url: string;
}

export interface KnowledgeCategory {
  id: string;
  nombre: string;
  ideaFundamental: string;
  problema?: string;
  conceptos: KnowledgeConcept[];
  fuente: KnowledgeSource;

  // Contenido principal del documento: una clase larga en prosa continua
  // (varias secciones, extensión de artículo o capítulo), pensada para
  // estudiarse del tirón en modo lectura — no una lista de fragmentos
  // sueltos. Es el campo que prioriza el import cuando existe; `resumen` y
  // el resto de campos de abajo pasan a ser apoyo secundario opcional.
  clase?: string;

  // Campos ampliados, pensados para el material que se importa desde fuera
  // (por ejemplo, una investigación pedida a un LLM). Los 7 marcos que vienen
  // de serie no los usan todos, por eso son opcionales.
  resumen?: string;
  aplicacion?: string;
  ejemplos?: string[];
  erroresComunes?: string[];
  preguntasDiagnostico?: string[];
  ideasContenido?: string[];

  // Marca de procedencia: true si el documento se importó (no viene de serie).
  importado?: boolean;
  importadoEn?: string;
}

// ─── Fuentes de contenido ───────────────────────────────────────────────────
// Micro base de datos de contenido ya publicado (propio o de referencia) que
// se archiva con su transcripción para poder buscar por lo que se dijo, no
// solo por el título. La sección arranca vacía: el archivo se importa.

export type SourcePlatform = "reel" | "youtube" | "instagram";

export const SOURCE_PLATFORM_LABELS: Record<SourcePlatform, string> = {
  reel: "Reel",
  youtube: "YouTube",
  instagram: "Instagram",
};

export interface ContentSource {
  id: string;
  plataforma: SourcePlatform;
  titulo: string;
  autor?: string;
  url?: string;
  publicadoEn?: string;
  duracion?: string;
  transcripcion: string;
  resumen?: string;
  temas: string[];
  notas?: string;
  anadidoEn: string;
}
