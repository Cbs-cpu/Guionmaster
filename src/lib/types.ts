// Core domain types for System Content Studio.

export type Servicio = "odoo" | "entrenadores" | "general";

export type ScriptType = "reel" | "youtube";

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

  // shared
  notes?: string;
  resources?: ResourceLink[];
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
