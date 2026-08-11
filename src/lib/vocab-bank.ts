// Banco de conceptos seleccionables — spec §5.
// La IA debe comprender el concepto y usarlo solo cuando sea relevante,
// nunca insertarlo de forma artificial. Se ofrece como inspiración
// seleccionable, no como texto a insertar literalmente.

export interface VocabBank {
  dolor: string[];
  solucion: string[];
  resultados: string[];
}

export const VOCAB_BANK: VocabBank = {
  dolor: [
    "Descentralización",
    "Datos dispersos",
    "Información duplicada",
    "Herramientas desconectadas",
    "Silos",
    "Falta de cohesión",
    "Falta de trazabilidad",
    "Procesos manuales",
    "Cuellos de botella",
    "Handoffs",
    "Esperas",
    "Errores",
    "Descontrol",
    "Falta de visibilidad",
  ],
  solucion: [
    "Centralización",
    "Cohesión",
    "Integración",
    "Interoperabilidad",
    "Automatización",
    "Estandarización",
    "Trazabilidad",
    "Orquestación",
    "Optimización",
    "Escalabilidad",
    "Arquitectura",
    "Flujo",
    "Sistema",
  ],
  resultados: [
    "Menos fricción",
    "Menos errores",
    "Menos tareas manuales",
    "Más control",
    "Más visibilidad",
    "Mejor información",
    "Mejor toma de decisiones",
    "Mayor velocidad",
    "Escalabilidad",
    "Mejor experiencia del cliente",
  ],
};
