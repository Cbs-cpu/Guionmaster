import type { KnowledgeCategory } from "./types";

// Base de conocimiento local — spec §3.
// FUENTE → CONCEPTO → INTERPRETACIÓN. No se inventa información: cada categoría
// declara el marco / autor de origen en `fuente`. El campo `definicion` de cada
// concepto es una interpretación propia para uso en guiones, no una cita textual.

export const KNOWLEDGE_BASE: KnowledgeCategory[] = [
  {
    id: "systems-thinking",
    nombre: "Systems Thinking",
    ideaFundamental:
      "No analizar un problema de forma aislada. Entender qué estructura del sistema está produciendo ese comportamiento.",
    fuente: {
      autor: "Donella Meadows / Jay Forrester",
      obraOMarco: "Systems Thinking — System Dynamics",
      nota: "Marco general de pensamiento sistémico aplicado a organizaciones.",
    },
    conceptos: [
      { id: "st-systems", categoriaId: "systems-thinking", termino: "Systems", definicion: "Un conjunto de partes interconectadas que producen un comportamiento como conjunto, no como suma de partes." },
      { id: "st-components", categoriaId: "systems-thinking", termino: "Components", definicion: "Los elementos individuales del sistema: personas, herramientas, datos, reglas." },
      { id: "st-inputs", categoriaId: "systems-thinking", termino: "Inputs", definicion: "Lo que entra al sistema: información, recursos, solicitudes, materia prima." },
      { id: "st-outputs", categoriaId: "systems-thinking", termino: "Outputs", definicion: "Lo que produce el sistema: un producto, una decisión, un servicio entregado." },
      { id: "st-dependencies", categoriaId: "systems-thinking", termino: "Dependencies", definicion: "Relaciones donde un componente necesita de otro para funcionar." },
      { id: "st-feedback", categoriaId: "systems-thinking", termino: "Feedback loops", definicion: "Ciclos donde el resultado de un proceso vuelve a influir en el propio proceso." },
      { id: "st-delays", categoriaId: "systems-thinking", termino: "Delays", definicion: "El tiempo entre una acción y su efecto visible, que suele ocultar la causa real de un problema." },
      { id: "st-boundaries", categoriaId: "systems-thinking", termino: "System boundaries", definicion: "Los límites de lo que se considera parte del sistema y lo que queda fuera." },
      { id: "st-emergent", categoriaId: "systems-thinking", termino: "Emergent behavior", definicion: "Comportamientos que surgen de la interacción de las partes y que no se explican mirando una parte sola." },
      { id: "st-stocks", categoriaId: "systems-thinking", termino: "Stocks & flows", definicion: "Lo que se acumula (stock: pedidos pendientes, caja, inventario) frente a lo que se mueve (flow: ritmo de entrada y salida)." },
    ],
  },
  {
    id: "bpm",
    nombre: "Business Process Management",
    ideaFundamental: "Entender cómo fluye el trabajo dentro de una organización.",
    fuente: {
      obraOMarco: "BPM / BPMN (Business Process Model and Notation)",
      nota: "Disciplina de gestión y notación estándar para modelar procesos.",
    },
    conceptos: [
      { id: "bpm-process", categoriaId: "bpm", termino: "Process", definicion: "Una secuencia de actividades que transforma un input en un output con valor." },
      { id: "bpm-owner", categoriaId: "bpm", termino: "Process owner", definicion: "La persona responsable del resultado de un proceso de principio a fin, no de una sola tarea." },
      { id: "bpm-workflow", categoriaId: "bpm", termino: "Workflow", definicion: "La secuencia operativa concreta de pasos, aprobaciones y responsables." },
      { id: "bpm-business-process", categoriaId: "bpm", termino: "Business Process", definicion: "Un proceso con impacto directo en el negocio y en el cliente, no solo una tarea interna." },
      { id: "bpm-bpm", categoriaId: "bpm", termino: "BPM", definicion: "La disciplina de diseñar, ejecutar, medir y mejorar procesos de forma continua." },
      { id: "bpm-bpmn", categoriaId: "bpm", termino: "BPMN", definicion: "Una notación estándar para representar procesos con símbolos (eventos, tareas, decisiones, flujos)." },
      { id: "bpm-mapping", categoriaId: "bpm", termino: "Process mapping", definicion: "El ejercicio de dibujar cómo ocurre realmente un proceso, paso a paso." },
      { id: "bpm-lifecycle", categoriaId: "bpm", termino: "Process lifecycle", definicion: "Diseñar → ejecutar → medir → optimizar, como ciclo continuo, no como proyecto único." },
      { id: "bpm-optimization", categoriaId: "bpm", termino: "Process optimization", definicion: "Reducir fricción, tiempo y error en un proceso ya entendido, no antes." },
    ],
  },
  {
    id: "value-stream",
    nombre: "Value Stream",
    ideaFundamental: "No optimizar departamentos aislados. Entender el flujo completo de principio a fin.",
    fuente: {
      autor: "Mike Rother / John Shook",
      obraOMarco: "Lean Manufacturing — Value Stream Mapping",
    },
    conceptos: [
      { id: "vs-value-stream", categoriaId: "value-stream", termino: "Value Stream", definicion: "Todos los pasos, con o sin valor añadido, necesarios para llevar algo desde la solicitud hasta la entrega." },
      { id: "vs-vsm", categoriaId: "value-stream", termino: "Value Stream Mapping", definicion: "Técnica visual para representar ese flujo completo, incluyendo esperas y traspasos." },
      { id: "vs-current", categoriaId: "value-stream", termino: "Current State", definicion: "Cómo funciona el proceso hoy, con sus ineficiencias reales." },
      { id: "vs-future", categoriaId: "value-stream", termino: "Future State", definicion: "El diseño objetivo del proceso una vez eliminado el desperdicio." },
      { id: "vs-flow", categoriaId: "value-stream", termino: "Flow", definicion: "El grado en que el trabajo avanza sin interrupciones ni esperas entre pasos." },
      { id: "vs-waste", categoriaId: "value-stream", termino: "Waste", definicion: "Cualquier actividad que consume tiempo o recursos sin aportar valor al resultado final." },
      { id: "vs-lead-time", categoriaId: "value-stream", termino: "Lead Time", definicion: "El tiempo total desde que algo se solicita hasta que se entrega." },
      { id: "vs-cycle-time", categoriaId: "value-stream", termino: "Cycle Time", definicion: "El tiempo que tarda un paso concreto en completarse una vez empieza." },
      { id: "vs-handoffs", categoriaId: "value-stream", termino: "Handoffs", definicion: "Los traspasos de trabajo entre personas o equipos, donde suele perderse información." },
    ],
  },
  {
    id: "toc",
    nombre: "Theory of Constraints",
    ideaFundamental: "El rendimiento global de un sistema está limitado por una o varias restricciones.",
    fuente: {
      autor: "Eliyahu M. Goldratt",
      obraOMarco: "Theory of Constraints (\"The Goal\")",
    },
    conceptos: [
      { id: "toc-constraint", categoriaId: "toc", termino: "Constraint", definicion: "El elemento que limita cuánto puede producir o entregar el sistema en su conjunto." },
      { id: "toc-bottleneck", categoriaId: "toc", termino: "Bottleneck", definicion: "El punto concreto del proceso donde se acumula el trabajo porque la capacidad es menor que la demanda." },
      { id: "toc-throughput", categoriaId: "toc", termino: "Throughput", definicion: "La velocidad a la que el sistema genera resultado (ventas, entregas) completo, no trabajo a medias." },
      { id: "toc-restriction", categoriaId: "toc", termino: "Restriction", definicion: "Cualquier política, recurso o regla que impide que el sistema rinda más." },
      { id: "toc-system-optimization", categoriaId: "toc", termino: "System optimization", definicion: "Mejorar el sistema completo enfocándose en su restricción, en vez de optimizar partes que no son el cuello de botella." },
    ],
  },
  {
    id: "information-silos",
    nombre: "Information Silos",
    ideaFundamental: "La información y el trabajo quedan fragmentados entre personas, departamentos y herramientas.",
    fuente: {
      obraOMarco: "Enterprise Data Management / Organizational Design",
    },
    conceptos: [
      { id: "silo-data", categoriaId: "information-silos", termino: "Data Silos", definicion: "Datos que existen en un sistema y no son accesibles ni útiles para el resto de la organización." },
      { id: "silo-information", categoriaId: "information-silos", termino: "Information Silos", definicion: "Conocimiento que queda atrapado en un equipo o persona y no fluye al resto del sistema." },
      { id: "silo-organizational", categoriaId: "information-silos", termino: "Organizational Silos", definicion: "Departamentos que operan con objetivos e incentivos aislados, sin visión de conjunto." },
      { id: "silo-application", categoriaId: "information-silos", termino: "Application Silos", definicion: "Herramientas que no se comunican entre sí y obligan a duplicar trabajo manualmente." },
      { id: "silo-fragmentation", categoriaId: "information-silos", termino: "Fragmentation", definicion: "El estado resultante: ninguna vista única y fiable del negocio." },
      { id: "silo-duplication", categoriaId: "information-silos", termino: "Duplication", definicion: "El mismo dato introducido varias veces en varios sitios, con riesgo de que cada copia diverja." },
      { id: "silo-interoperability", categoriaId: "information-silos", termino: "Lack of interoperability", definicion: "La incapacidad de los sistemas de intercambiar datos automáticamente entre sí." },
    ],
  },
  {
    id: "enterprise-architecture",
    nombre: "Enterprise Architecture",
    ideaFundamental: "La tecnología debe estar subordinada a la arquitectura del negocio.",
    fuente: {
      obraOMarco: "TOGAF / Enterprise Architecture",
      nota: "Relación jerárquica: Business → Processes → People → Data → Applications → Technology.",
    },
    conceptos: [
      { id: "ea-business", categoriaId: "enterprise-architecture", termino: "Business", definicion: "La estrategia y el modelo de negocio: qué se ofrece y a quién." },
      { id: "ea-processes", categoriaId: "enterprise-architecture", termino: "Processes", definicion: "Cómo se ejecuta ese negocio en el día a día, paso a paso." },
      { id: "ea-people", categoriaId: "enterprise-architecture", termino: "People", definicion: "Quién ejecuta y decide en cada proceso." },
      { id: "ea-data", categoriaId: "enterprise-architecture", termino: "Data", definicion: "La información que las personas necesitan para ejecutar y decidir." },
      { id: "ea-applications", categoriaId: "enterprise-architecture", termino: "Applications", definicion: "El software que gestiona y expone esos datos." },
      { id: "ea-technology", categoriaId: "enterprise-architecture", termino: "Technology", definicion: "La infraestructura que soporta las aplicaciones. La capa más subordinada de todas." },
    ],
  },
  {
    id: "process-mining",
    nombre: "Process Mining",
    ideaFundamental: "No solamente preguntar cómo debería funcionar un proceso. Analizar los datos para descubrir cómo funciona realmente.",
    fuente: {
      autor: "Wil van der Aalst",
      obraOMarco: "Process Mining",
    },
    conceptos: [
      { id: "pm-event-logs", categoriaId: "process-mining", termino: "Event Logs", definicion: "El registro de cada paso real que ha ocurrido en un proceso, con quién y cuándo lo hizo." },
      { id: "pm-discovery", categoriaId: "process-mining", termino: "Process Discovery", definicion: "Reconstruir el proceso real a partir de esos registros, no de lo que la gente cree que pasa." },
      { id: "pm-conformance", categoriaId: "process-mining", termino: "Conformance Checking", definicion: "Comparar el proceso real con el proceso diseñado para ver dónde se desvía." },
      { id: "pm-analysis", categoriaId: "process-mining", termino: "Process Analysis", definicion: "Identificar cuellos de botella, retrabajo y variantes a partir de los datos reales." },
      { id: "pm-optimization", categoriaId: "process-mining", termino: "Process Optimization", definicion: "Rediseñar el proceso con evidencia real, no con suposiciones." },
    ],
  },
];

export const CONTENT_PRINCIPLES: string[] = [
  "No necesitas más herramientas. Necesitas un sistema mejor diseñado.",
  "El problema muchas veces no es tu equipo, sino el sistema en el que está obligado a trabajar.",
  "Una empresa puede tener grandes profesionales y aun así tener malos resultados si su estructura genera fricción.",
  "Antes de automatizar un proceso hay que entenderlo.",
  "Automatizar un proceso malo simplemente permite hacer mal las cosas más rápido.",
  "La tecnología debe adaptarse al proceso, no el proceso a la herramienta.",
  "No se trata de centralizar absolutamente todo. Se trata de conseguir cohesión, trazabilidad e interoperabilidad.",
  "El objetivo es que la información fluya correctamente desde el inicio del proceso hasta el final.",
];

export const METHODOLOGY_PIPELINE = [
  "Observar",
  "Mapear",
  "Entender",
  "Diagnosticar",
  "Diseñar",
  "Implementar",
  "Medir",
  "Optimizar",
];

export function findConceptsByTerms(terms: string[]): { termino: string; categoria: string; definicion: string }[] {
  const lower = terms.map((t) => t.toLowerCase().trim());
  const out: { termino: string; categoria: string; definicion: string }[] = [];
  for (const cat of KNOWLEDGE_BASE) {
    for (const c of cat.conceptos) {
      if (lower.some((t) => t && c.termino.toLowerCase().includes(t))) {
        out.push({ termino: c.termino, categoria: cat.nombre, definicion: c.definicion });
      }
    }
  }
  return out;
}
