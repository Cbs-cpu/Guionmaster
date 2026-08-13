import { makeId } from "./utils";
import type { CarouselSlide, HookType, ReelBeat, ScriptRecord, YoutubeChapter } from "./types";

// Contenido de ejemplo precargado la primera vez que se abre la app en un
// navegador nuevo (biblioteca vacía). Escrito a mano siguiendo la skill
// privada del proyecto (.claude/skills/guion-studio) para que sirva de
// referencia real de lo que debería producir el generador: un vídeo de
// YouTube en profundidad sobre uno de los marcos de la base de
// conocimiento (Theory of Constraints), y diez reels que tocan dolores
// concretos ligados a esos mismos marcos.

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function reelBeats(
  beats: Array<Omit<ReelBeat, "id">>
): ReelBeat[] {
  return beats.map((b) => ({ ...b, id: makeId("beat") }));
}

function chapters(list: Array<Omit<YoutubeChapter, "id">>): YoutubeChapter[] {
  return list.map((c) => ({ ...c, id: makeId("chapter") }));
}

function carouselSlides(list: Array<Omit<CarouselSlide, "id">>): CarouselSlide[] {
  return list.map((s) => ({ ...s, id: makeId("slide") }));
}

const YOUTUBE_TOC: ScriptRecord = {
  id: "seed-youtube-toc",
  type: "youtube",
  title: "Tu equipo no es el problema. Es el cuello de botella que nadie ha encontrado.",
  service: "odoo",
  concepts: ["Cuellos de botella", "Sistema", "Optimización"],
  status: "listo",
  favorite: true,
  createdAt: daysAgo(6),
  updatedAt: daysAgo(1),
  knowledgeIds: ["toc"],
  relatedScriptIds: ["seed-reel-cuello-botella", "seed-carrusel-toc"],
  youtubeInputs: {
    tema: "Theory of Constraints: por qué el rendimiento de una empresa lo marca un único punto",
    publico: "Dueños y gerentes de pymes que sienten que 'todo va lento' y creen que la solución es contratar más gente",
    objetivo: "Que entiendan qué es un cuello de botella de sistema antes de pensar en contratar o automatizar",
    conceptos: "Theory of Constraints, cuellos de botella, throughput, Value Stream Mapping, handoffs",
    duracion: "12 minutos",
    tipo: "educativo",
  },
  titleOptions: [
    "Tu equipo no es el problema. Es el cuello de botella que nadie ha encontrado.",
    "Por qué contratar a más gente no arregla una empresa que va lenta",
    "El error que comete casi cualquier pyme cuando algo va lento",
    "Cómo encontrar el punto exacto que está frenando toda tu empresa",
    "¿Por qué automatizar un proceso lento lo empeora todavía más?",
  ],
  selectedTitle: "Tu equipo no es el problema. Es el cuello de botella que nadie ha encontrado.",
  youtubeHook:
    "Hay una frase que he escuchado en casi todas las empresas que he visitado, con distintas palabras pero siempre el mismo fondo: \"aquí todos vamos con la lengua fuera\". Y casi siempre, la primera conclusión a la que llega el dueño es la misma: necesitamos más gente. El problema es que casi nunca es verdad — y hoy te voy a explicar por qué.",
  promesa:
    "Al final de este vídeo vas a saber identificar el punto exacto de tu empresa que está limitando todo lo demás, y por qué arreglar ese único punto vale más que mejorar cualquier otra cosa.",
  chapters: chapters([
    {
      titulo: "El síntoma que confundimos con la causa",
      resumen: "Por qué 'vamos lentos' se traduce mal en 'necesitamos más gente', y qué tiene que ver esto con el sistema en el que trabaja tu equipo.",
      guion:
        "Cuando una empresa va lenta, lo normal es mirar al equipo. Pero el equipo casi nunca es el problema — el problema es el sistema en el que ese equipo está obligado a trabajar. Puedes tener a las personas más competentes del sector y aun así tener resultados mediocres, si la estructura por la que pasa el trabajo genera fricción en algún punto.\n\nY aquí está la parte importante: en cualquier sistema — no solo en una empresa, en cualquier sistema con pasos encadenados — casi siempre hay un único punto que determina cuánto puede producir el conjunto. No son cinco problemas. No son diez. Casi siempre es uno. Y hasta que no lo encuentras, cualquier otra mejora que hagas es, como mucho, cosmética.\n\nA ese punto se le llama restricción, o cuello de botella. Y de eso va este vídeo: de cómo encontrarlo, por qué casi nadie lo encuentra a la primera, y qué hacer una vez que lo tienes delante.",
      visual: {
        queMostrar: "Plano a cámara, cercano, tono conversacional. Pausa breve tras 'no es verdad' para dar énfasis.",
        queExplicar: "Por qué el equipo casi nunca es la causa real de que todo vaya lento.",
        bRoll: "Imágenes genéricas de una oficina con gente trabajando rápido, notificaciones, bandejas de entrada llenas.",
        capturas: "Ninguna todavía — este capítulo es conceptual, sin herramientas en pantalla.",
        diagramas: "Dibujo simple en pizarra: una fila de cajas conectadas por flechas, con una caja más estrecha que las demás marcando el cuello de botella.",
      },
    },
    {
      titulo: "Qué es realmente un cuello de botella",
      resumen: "La Teoría de las Restricciones de Eliyahu Goldratt, explicada con un ejemplo de ventas rápidas y facturación lenta.",
      guion:
        "Esta idea no me la he inventado yo. Viene de un físico israelí llamado Eliyahu Goldratt, que en los años 80 escribió un libro llamado \"La Meta\", origen de lo que hoy se conoce como la Teoría de las Restricciones — Theory of Constraints.\n\nLa idea central es esta: el rendimiento global de cualquier sistema está limitado por una o varias restricciones. No por la suma de todos sus problemas. Por su restricción. Nosotros, en el día a día, lo llamamos cuello de botella: el punto concreto del proceso donde se acumula el trabajo, porque ahí la capacidad es menor que la demanda que le llega.\n\nImagina una empresa donde el equipo comercial cierra ventas en un día. Pero facturación tarda una semana en emitir cada factura, porque depende de que alguien revise a mano un pedido en una hoja de cálculo distinta a la que usa ventas. Da igual lo rápido que vendan. Da igual cuánto mejores el marketing o cuánto formes al equipo comercial. La velocidad real de esa empresa — lo que Goldratt llamaba throughput — la marca facturación. Punto.\n\nEso es un cuello de botella: el sitio donde el sistema entero se pone al ritmo del paso más lento.",
      visual: {
        queMostrar: "A cámara, con texto en pantalla mostrando la definición de 'restricción' mientras se dice en voz alta.",
        queExplicar: "Qué es una restricción/cuello de botella según Goldratt, con el ejemplo de ventas rápidas y facturación lenta.",
        bRoll: "Dibujo o animación sencilla de un embudo: muchas entradas arriba, un cuello estrecho en el medio, poca salida abajo.",
        capturas: "Ninguna — mantener el ejemplo genérico, sin mostrar herramientas todavía.",
        diagramas: "LEAD → VENTA (caja ancha) → FACTURACIÓN (caja estrecha, marcada como cuello de botella) → CLIENTE, en pizarra.",
      },
    },
    {
      titulo: "Por qué mejorar todo lo demás no sirve de nada",
      resumen: "El principio contraintuitivo de la optimización de sistemas: una hora ganada fuera del cuello de botella es una ilusión.",
      guion:
        "Y aquí viene la parte que casi todo el mundo se salta, así que quiero que la escuches con calma: si mejoras cualquier parte de tu empresa que no sea el cuello de botella, el resultado global no cambia.\n\nPuedes hacer que ventas cierre el doble de contratos. Si facturación sigue tardando una semana por contrato, ahora simplemente tienes el doble de contratos esperando en la cola de facturación. No has generado más ingresos reales — has generado más trabajo acumulado delante del mismo cuello de botella. A veces incluso empeora las cosas, porque ahora hay más gente esperando respuesta y más confusión.\n\nEsto es contraintuitivo porque vivimos pensando que 'mejorar' siempre es mejorar, en cualquier punto que sea. Pero un sistema no funciona así. Una hora que ganas en el cuello de botella es una hora que gana todo el sistema. Una hora que ganas en cualquier otro punto es, la mayoría de las veces, una ilusión — trabajo que simplemente se mueve más rápido hasta chocar con el mismo muro de siempre.\n\nPor eso automatizar el paso equivocado no solo no ayuda — a veces hace más visible el problema sin arreglarlo. Automatizas la parte que ya iba rápida, y el cuello de botella sigue exactamente donde estaba, ahora con más presión encima.",
      visual: {
        queMostrar: "A cámara, tono más directo. Texto en pantalla con la frase clave: 'una hora ganada fuera del cuello de botella es una ilusión'.",
        queExplicar: "Por qué mejorar procesos que no son el cuello de botella no cambia el resultado global.",
        bRoll: "Visualización de una cola creciendo: elementos apilándose delante de una puerta estrecha.",
        capturas: "Ninguna.",
        diagramas: "El mismo diagrama del capítulo anterior, ahora con ventas duplicada y la cola delante de facturación todavía más larga.",
      },
    },
    {
      titulo: "Cómo encontrar tu cuello de botella real",
      resumen: "Un método práctico de tres pasos: dónde se acumula el trabajo, dónde espera el equipo, y el mapa de flujo de principio a fin.",
      guion:
        "¿Cómo lo encuentras? No hace falta un software carísimo ni un análisis de tres meses para dar con el primero.\n\nPrimero, observa dónde se acumula el trabajo. No dónde la gente está más estresada — dónde hay una cola física o digital esperando: pedidos sin facturar, leads sin contactar, tickets sin resolver. Ahí donde algo se amontona antes de pasar al siguiente paso, casi siempre tienes tu candidato.\n\nSegundo, pregúntale a tu equipo dónde se sienten atascados — no dónde trabajan más duro, sino dónde tienen que esperar a que otra persona, otro departamento o otra herramienta les devuelva algo antes de poder seguir. Esos puntos de espera y de traspaso — lo que se llama un handoff — son sospechosos habituales.\n\nTercero, mapea el flujo completo de principio a fin, no departamento por departamento. Esto es lo que en Lean se llama Value Stream Mapping: coges un caso real — un lead, un pedido, un cliente — y sigues su recorrido completo, apuntando cuánto tiempo pasa en cada paso y cuánto tiempo simplemente espera entre paso y paso. Casi siempre te vas a llevar una sorpresa: la mayor parte del tiempo total no se va en hacer el trabajo — se va esperando a que alguien lo recoja.\n\nCon esos tres pasos, el cuello de botella deja de ser una sospecha y se convierte en algo que puedes señalar con el dedo.",
      visual: {
        queMostrar: "A cámara, tono práctico. Ir enumerando los 3 pasos con texto en pantalla (1, 2, 3) a medida que se explican.",
        queExplicar: "El método práctico para encontrar el cuello de botella real.",
        bRoll: "Alguien tomando notas en una pizarra o cuaderno, mapeando un proceso con post-its.",
        capturas: "Ninguna.",
        diagramas: "Un Value Stream Map simple: bloques de 'trabajo' cortos y bloques de 'espera' mucho más largos entre ellos.",
      },
    },
    {
      titulo: "Qué haces una vez que lo tienes claro",
      resumen: "El orden correcto — entender, diseñar y solo entonces elegir herramienta — con Odoo como ejemplo de implementación, no de venta.",
      guion:
        "Una vez que lo tienes identificado, la tentación es lanzarte a arreglarlo con la primera herramienta que se te ocurra. Y aquí quiero ser muy claro: la tecnología no resuelve un cuello de botella que no has entendido todavía. Automatizar un proceso mal diseñado simplemente te permite hacer mal las cosas más rápido.\n\nLo que sí funciona es diseñar primero cómo debería fluir la información alrededor de ese punto — quién necesita ver qué, en qué momento, sin tener que pedirlo ni copiarlo a mano de un sitio a otro — y solo después buscar la herramienta que ejecute ese diseño.\n\nEn el ejemplo de antes, la solución no es 'contratar a alguien más en facturación'. La solución de sistema es que, en el momento en que ventas cierra un contrato, la información llegue ya estructurada a quien tiene que facturar, sin que nadie la reintroduzca a mano. Ahí es donde algo como Odoo puede servir de verdad — no como la solución en sí, sino como la herramienta que conecta ventas y facturación en un único sistema, para que ese traspaso que antes tardaba una semana pase a ser inmediato.\n\nPero ese orden importa: primero entiendes el sistema, luego diseñas cómo debería fluir, y solo al final decides con qué herramienta lo implementas. Si le das la vuelta a ese orden, lo único que consigues es una versión más cara y más rápida del mismo problema.\n\nAsí que la próxima vez que sientas que todo va lento en tu empresa, no preguntes primero qué herramienta necesitas. Pregúntate dónde, exactamente, se está atascando todo lo demás.",
      visual: {
        queMostrar: "A cámara. Hacia el final, una captura breve de Odoo mostrando un pedido de venta pasando a factura sin reintroducir datos — después de explicar el diseño, no antes.",
        queExplicar: "El orden correcto: entender el sistema, diseñar el flujo de información, y solo entonces elegir la herramienta.",
        bRoll: "Transición visual de la pizarra (diseño a mano) a la pantalla (herramienta), para reforzar que la herramienta llega después del diseño.",
        capturas: "Captura de pantalla de Odoo: un pedido de venta convertido en factura sin pasos manuales intermedios.",
        diagramas: "El diagrama LEAD → VENTA → FACTURACIÓN → CLIENTE, ahora con cajas del mismo ancho y flecha continua, sin cuello estrecho.",
      },
    },
  ]),
  notes: "Guion de ejemplo escrito con la skill privada guion-studio, sin pasar por la API — pensado como referencia de calidad para el generador.",
};

interface SeedReelSpec {
  id: string;
  title: string;
  service: ScriptRecord["service"];
  concepts: string[];
  status: ScriptRecord["status"];
  favorite: boolean;
  duracion: string;
  publico: string;
  problema: string;
  objetivo: string;
  concepto: string;
  hookTipo: HookType;
  beats: Array<Omit<ReelBeat, "id">>;
  knowledgeIds?: string[];
  relatedScriptIds?: string[];
}

function buildReel(spec: SeedReelSpec, createdDaysAgo: number): ScriptRecord {
  const now = daysAgo(createdDaysAgo);
  const selectedHookId = makeId("hook");
  return {
    id: spec.id,
    type: "reel",
    title: spec.title,
    service: spec.service,
    concepts: spec.concepts,
    status: spec.status,
    favorite: spec.favorite,
    createdAt: now,
    updatedAt: now,
    reelInputs: {
      servicio: spec.service,
      publico: spec.publico,
      problema: spec.problema,
      concepto: spec.concepto,
      objetivo: spec.objetivo,
      duracion: spec.duracion,
      tono: "Directo, cercano, sin vender",
    },
    hooks: [{ id: selectedHookId, tipo: spec.hookTipo, texto: spec.beats[0].textoHablado }],
    selectedHookId,
    beats: reelBeats(spec.beats),
    knowledgeIds: spec.knowledgeIds ?? [],
    relatedScriptIds: spec.relatedScriptIds ?? [],
  };
}

const REEL_SILOS = buildReel(
  {
    id: "seed-reel-silos",
    title: "El cliente que existe tres veces en tu empresa",
    service: "odoo",
    concepts: ["Silos", "Cohesión"],
    status: "listo",
    favorite: true,
    duracion: "60 segundos",
    publico: "Gerentes de pymes con CRM, ventas y facturación en herramientas separadas",
    problema: "El mismo cliente tiene una versión distinta de sus datos en cada herramienta",
    objetivo: "Que entiendan que el problema es de arquitectura de datos, no de disciplina del equipo",
    concepto: "silos de información y punto único de verdad",
    hookTipo: "problema",
    knowledgeIds: ["information-silos"],
    beats: [
      { key: "hook", textoHablado: "Tu CRM dice una cosa. Tu Excel de ventas dice otra. Y facturación tiene una tercera versión del mismo cliente.", tiempoAprox: "0-4s", visualSugerido: "Primer plano a cámara, cara seria, corte rápido al empezar.", textoPantalla: "3 versiones del mismo cliente" },
      { key: "problema", textoHablado: "No es un caso raro. Es lo normal en empresas que han ido añadiendo herramientas con los años sin que se hablen entre ellas.", tiempoAprox: "4-15s", visualSugerido: "Cortes rápidos mostrando pantallas genéricas de hoja de cálculo y CRM.", textoPantalla: "Cada equipo, su versión" },
      { key: "consecuencia", textoHablado: "Cuando alguien pregunta en qué punto está un cliente, nadie tiene la respuesta completa — solo su trozo. Se pierden ventas y se duplican tareas.", tiempoAprox: "15-28s", visualSugerido: "Simulación de una llamada confusa, gesto de frustración a cámara.", textoPantalla: "Nadie tiene la foto completa" },
      { key: "insight", textoHablado: "El problema no es que falte disciplina. Es que la información no tiene un único sitio al que ir. Eso se llama un silo.", tiempoAprox: "28-38s", visualSugerido: "Texto grande en pantalla con la palabra clave mientras se explica.", textoPantalla: "Eso se llama un silo" },
      { key: "sistema", textoHablado: "La solución no es pedir que la gente se comunique mejor. Es diseñar un único punto de verdad para cada cliente, que todos consulten y actualicen ahí.", tiempoAprox: "38-50s", visualSugerido: "Diagrama en pizarra: varias cajas sueltas convergiendo en una caja central.", textoPantalla: "Un único punto de verdad" },
      { key: "beneficio", textoHablado: "Menos tiempo buscando quién tiene la versión correcta, menos errores, y un cliente que no repite su historia cada vez que habla contigo.", tiempoAprox: "50-56s", visualSugerido: "Cara a cámara, tono más calmado.", textoPantalla: "Menos fricción, más control" },
      { key: "cta", textoHablado: "Si te ha pasado esto, cuéntamelo en comentarios — seguro que no eres el único.", tiempoAprox: "56-60s", visualSugerido: "Cierre a cámara.", textoPantalla: "Cuéntamelo en comentarios" },
    ],
  },
  14
);

const REEL_HERRAMIENTAS = buildReel(
  {
    id: "seed-reel-herramientas-desconectadas",
    title: "Uso WhatsApp, Excel y Notion... y no sé cuántos clientes activos tengo",
    service: "entrenadores",
    concepts: ["Herramientas desconectadas", "Integración"],
    status: "borrador",
    favorite: false,
    duracion: "75 segundos",
    publico: "Dueños de boxes o estudios de entrenamiento con varias herramientas sueltas",
    problema: "Reservas, pagos y clientes repartidos entre apps que no se comunican",
    objetivo: "Que entiendan que el problema es el diseño del flujo, no las herramientas en sí",
    concepto: "integración de sistema antes de sumar más herramientas",
    hookTipo: "historia",
    beats: [
      { key: "hook", textoHablado: "Hace poco un dueño de un box de entrenamiento me dijo: llevo las reservas en Excel, los pagos en Notion y a los clientes les hablo por WhatsApp. Le pregunté cuántos clientes activos tenía ahora mismo. Se quedó en blanco.", tiempoAprox: "0-8s", visualSugerido: "Recreación breve de la conversación, plano medio.", textoPantalla: "\"¿Cuántos clientes activos tienes?\"" },
      { key: "problema", textoHablado: "No es que no lleve las cuentas — es que las lleva en tres sitios que no se hablan entre sí.", tiempoAprox: "8-18s", visualSugerido: "Cortes mostrando de forma genérica tres apps distintas.", textoPantalla: "3 apps, 0 conexión" },
      { key: "consecuencia", textoHablado: "Así es imposible saber, en un segundo, quién ha dejado de venir, quién no ha pagado, o qué sede está más llena.", tiempoAprox: "18-32s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "Decisiones a ojo" },
      { key: "insight", textoHablado: "El problema no son las tres herramientas en sí. Es que nadie diseñó cómo debía fluir la información entre ellas antes de empezar a usarlas.", tiempoAprox: "32-45s", visualSugerido: "Texto en pantalla remarcando la frase clave.", textoPantalla: "Nadie diseñó el flujo" },
      { key: "sistema", textoHablado: "La solución no es usar una app más. Es decidir qué información vive dónde, y que todo lo demás se conecte a esa fuente única.", tiempoAprox: "45-58s", visualSugerido: "Diagrama simple: reservas, pagos y clientes convergiendo en un mismo sistema.", textoPantalla: "Una fuente única" },
      { key: "beneficio", textoHablado: "Sabes en tiempo real cuántos clientes activos tienes, qué sede rinde mejor, y a quién llamar antes de que se dé de baja.", tiempoAprox: "58-68s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "Datos reales, no sensaciones" },
      { key: "cta", textoHablado: "Si gestionas tu negocio entre tres apps que no se hablan, este es justo el tipo de problema del que hablo en este canal.", tiempoAprox: "68-75s", visualSugerido: "Cierre a cámara con mención al canal.", textoPantalla: "" },
    ],
  },
  12
);

const REEL_CUELLO_BOTELLA = buildReel(
  {
    id: "seed-reel-cuello-botella",
    title: "Contratar a más gente no va a arreglar tu empresa",
    service: "odoo",
    concepts: ["Cuellos de botella", "Sistema"],
    status: "listo",
    favorite: true,
    duracion: "45 segundos",
    publico: "Dueños de pymes que están valorando contratar para 'ir más rápido'",
    problema: "Contratar sin haber encontrado la restricción real del sistema",
    objetivo: "Que antes de contratar, busquen el cuello de botella real",
    concepto: "teoría de las restricciones aplicada a la contratación",
    hookTipo: "contrarian",
    knowledgeIds: ["toc"],
    relatedScriptIds: ["seed-youtube-toc", "seed-carrusel-toc"],
    beats: [
      { key: "hook", textoHablado: "Si tu empresa va lenta, **lo último que deberías hacer es contratar a alguien más**. [pausa] En serio. [sub: No contrates todavía]", tiempoAprox: "0-3s", visualSugerido: "A cámara, tono directo, sin rodeos.", textoPantalla: "No contrates todavía" },
      { key: "problema", textoHablado: "La reacción automática cuando algo se atasca es *necesitamos más manos*. [corte] Pero casi nunca el problema es la cantidad de gente.", tiempoAprox: "3-12s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Añades una persona más al equipo, y seis meses después sigues igual de atascado — solo que ahora con una nómina más.", tiempoAprox: "12-20s", visualSugerido: "Gesto de resignación, tono irónico controlado.", textoPantalla: "Mismo atasco, más nómina" },
      { key: "insight", textoHablado: "En cualquier empresa hay un único punto que determina cuánto puede producir todo el sistema. Mejorar cualquier otro punto no cambia nada.", tiempoAprox: "20-30s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Un único punto lo decide todo" },
      { key: "sistema", textoHablado: "Antes de contratar, encuentra ese punto: dónde se acumula el trabajo, dónde tu equipo espera a que otro departamento le responda.", tiempoAprox: "30-38s", visualSugerido: "Diagrama simple en pizarra señalando un punto concreto.", textoPantalla: "Encuentra el punto real" },
      { key: "beneficio", textoHablado: "Arreglar ese único punto suele valer más que diez contrataciones repartidas por toda la empresa.", tiempoAprox: "38-42s", visualSugerido: "Cara a cámara, tono conclusivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Le dedico un vídeo entero a cómo encontrar ese punto exacto — te dejo el enlace.", tiempoAprox: "42-45s", visualSugerido: "Cierre a cámara señalando hacia arriba/enlace.", textoPantalla: "Vídeo completo ↑" },
    ],
  },
  10
);

const REEL_HANDOFFS = buildReel(
  {
    id: "seed-reel-handoffs",
    title: "El punto donde se pierden más clientes (y no es marketing)",
    service: "odoo",
    concepts: ["Handoffs", "Trazabilidad"],
    status: "idea",
    favorite: false,
    duracion: "60 segundos",
    publico: "Responsables comerciales y de marketing de pymes con CRM propio",
    problema: "Leads que se enfrían en el traspaso entre marketing y ventas",
    objetivo: "Que revisen qué pasa exactamente en el traspaso del lead entre equipos",
    concepto: "handoffs y pérdida de información en el value stream",
    hookTipo: "error_comun",
    beats: [
      { key: "hook", textoHablado: "El error más caro que veo repetirse: el lead se pierde justo entre que marketing lo capta y ventas lo llama.", tiempoAprox: "0-4s", visualSugerido: "A cámara, tono de advertencia.", textoPantalla: "El error más caro" },
      { key: "problema", textoHablado: "Marketing genera el lead y lo apunta en un sitio. Ventas lo recibe por otro canal, a veces tarde, a veces mal copiado.", tiempoAprox: "4-16s", visualSugerido: "Animación simple mostrando el lead saltando entre dos cajas desconectadas.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Ese hueco entre un equipo y otro — un handoff — es donde se enfría un lead que costó dinero conseguir.", tiempoAprox: "16-28s", visualSugerido: "Cara a cámara, tono serio.", textoPantalla: "Se enfría ahí, en el hueco" },
      { key: "insight", textoHablado: "No es que marketing o ventas trabajen mal. Es que nadie diseñó qué pasa exactamente en el momento en que el lead cambia de manos.", tiempoAprox: "28-40s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Nadie diseñó el traspaso" },
      { key: "sistema", textoHablado: "La solución es que el lead entre en un único sistema donde ventas lo ve en el segundo en que aparece, sin que nadie lo reenvíe a mano.", tiempoAprox: "40-52s", visualSugerido: "Diagrama: lead entrando directo a un sistema compartido por marketing y ventas.", textoPantalla: "Un sistema, sin reenvíos" },
      { key: "beneficio", textoHablado: "Menos leads fríos, respuestas más rápidas, y una foto clara de cuántos se pierden en ese punto exacto.", tiempoAprox: "52-57s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Sabes cuánto tarda un lead tuyo en llegar a la persona que tiene que llamarlo? Piénsalo.", tiempoAprox: "57-60s", visualSugerido: "Cierre con pregunta directa a cámara.", textoPantalla: "¿Cuánto tarda tu lead?" },
    ],
  },
  8
);

const REEL_VISIBILIDAD = buildReel(
  {
    id: "seed-reel-visibilidad",
    title: "¿Sabes la ocupación real de tus sedes ahora mismo?",
    service: "entrenadores",
    concepts: ["Falta de visibilidad", "Más visibilidad"],
    status: "borrador",
    favorite: false,
    duracion: "60 segundos",
    publico: "Dueños de negocios de entrenamiento con más de una sede",
    problema: "La ocupación real de cada sede solo la sabe el encargado local",
    objetivo: "Que entiendan la falta de visibilidad centralizada como problema de sistema",
    concepto: "visibilidad centralizada del negocio",
    hookTipo: "pregunta",
    beats: [
      { key: "hook", textoHablado: "Si te pregunto ahora mismo qué sede tuya está más llena esta semana, ¿podrías responderme sin llamar a nadie?", tiempoAprox: "0-5s", visualSugerido: "Pregunta directa a cámara.", textoPantalla: "¿Podrías responder sin llamar a nadie?" },
      { key: "problema", textoHablado: "En la mayoría de negocios con varias sedes, esa respuesta vive en la cabeza de cada encargado local, no en un sitio central.", tiempoAprox: "5-16s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Así es imposible detectar a tiempo qué sede necesita más clases, qué horario está vacío, o dónde vas a perder clientes por saturación.", tiempoAprox: "16-30s", visualSugerido: "Gesto de preocupación, tono de constatación.", textoPantalla: "Se detecta tarde" },
      { key: "insight", textoHablado: "No te falta esfuerzo del equipo. Te falta un sistema que te dé visibilidad de todas las sedes a la vez, no sede por sede.", tiempoAprox: "30-42s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Visibilidad de conjunto" },
      { key: "sistema", textoHablado: "Cuando cada sede registra sus reservas en el mismo sistema, tú ves el conjunto completo sin tener que preguntar a nadie.", tiempoAprox: "42-52s", visualSugerido: "Diagrama: varias sedes alimentando un mismo panel central.", textoPantalla: "Un solo panel, todas las sedes" },
      { key: "beneficio", textoHablado: "Decisiones sobre horarios, personal y precios con datos reales, no con la sensación de cada encargado.", tiempoAprox: "52-57s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Si gestionas más de una sede, esto es exactamente el tipo de sistema que ayudo a construir.", tiempoAprox: "57-60s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  7
);

const REEL_PROCESOS_MANUALES = buildReel(
  {
    id: "seed-reel-procesos-manuales",
    title: "Copiar el mismo dato tres veces no es trabajo, es un síntoma",
    service: "odoo",
    concepts: ["Procesos manuales", "Automatización"],
    status: "listo",
    favorite: false,
    duracion: "45 segundos",
    publico: "Responsables de operaciones que ven a su equipo reintroducir datos a mano",
    problema: "El mismo dato se reescribe a mano en varios pasos del proceso",
    objetivo: "Que entiendan la reintroducción manual de datos como síntoma de sistema, no de esfuerzo",
    concepto: "mapeo de procesos antes de automatizar",
    hookTipo: "directo",
    beats: [
      { key: "hook", textoHablado: "Si tu equipo copia el mismo dato de una pantalla a otra tres veces al día, no tienes un problema de esfuerzo. Tienes un problema de sistema.", tiempoAprox: "0-5s", visualSugerido: "A cámara, tono directo.", textoPantalla: "No es esfuerzo, es sistema" },
      { key: "problema", textoHablado: "Pasa mucho: un pedido se apunta en un sitio, se vuelve a escribir para facturarlo, y se vuelve a escribir para el almacén.", tiempoAprox: "5-15s", visualSugerido: "Cortes rápidos simulando el mismo dato escrito varias veces.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Cada vez que un dato se reintroduce a mano, hay una oportunidad nueva de que alguien se equivoque — y tarde o temprano, alguien se equivoca.", tiempoAprox: "15-26s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "Nueva oportunidad de error" },
      { key: "insight", textoHablado: "Automatizar eso sin arreglarlo antes solo hace que el error se copie más rápido. Primero hay que entender por qué ese dato no fluye solo.", tiempoAprox: "26-35s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Automatizar mal, más rápido" },
      { key: "sistema", textoHablado: "El objetivo no es que la gente escriba más rápido. Es que el dato se escriba una vez y viaje solo por todos los pasos que lo necesitan.", tiempoAprox: "35-41s", visualSugerido: "Diagrama simple: un dato entrando una vez y fluyendo a varias cajas.", textoPantalla: "Se escribe una vez" },
      { key: "beneficio", textoHablado: "Menos errores, menos horas perdidas en tareas que no aportan nada, y un equipo que puede dedicarse a lo que sí importa.", tiempoAprox: "41-44s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Cuántas veces se reescribe el mismo dato en tu empresa? Cuéntalo esta semana.", tiempoAprox: "44-45s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "Cuéntalo esta semana" },
    ],
  },
  6
);

const REEL_DESCONTROL = buildReel(
  {
    id: "seed-reel-descontrol",
    title: "Que cada entrenador haga las cosas 'a su manera' no es flexibilidad, es riesgo",
    service: "entrenadores",
    concepts: ["Descontrol", "Estandarización"],
    status: "idea",
    favorite: false,
    duracion: "60 segundos",
    publico: "Dueños de equipos de entrenadores sin proceso común de seguimiento de clientes",
    problema: "Cada entrenador lleva a sus clientes con su propio método, sin registro común",
    objetivo: "Que entiendan la falta de proceso mínimo como riesgo de negocio, no de estilo",
    concepto: "estandarización de proceso sin perder personalidad en el trato",
    hookTipo: "contrarian",
    beats: [
      { key: "hook", textoHablado: "Que cada entrenador de tu equipo lleve a sus clientes 'a su manera' no es libertad creativa. Es un negocio que depende de que nadie se vaya de vacaciones.", tiempoAprox: "0-6s", visualSugerido: "A cámara, tono contrarian.", textoPantalla: "No es libertad, es riesgo" },
      { key: "problema", textoHablado: "Cada uno con su cuaderno, su método, su forma de hacer seguimiento — funciona mientras esa persona está.", tiempoAprox: "6-17s", visualSugerido: "Cortes mostrando distintos cuadernos/métodos de forma genérica.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "En cuanto falta, nadie sabe dónde estaba cada cliente. Y el negocio no escala, porque no hay nada repetible con un entrenador nuevo.", tiempoAprox: "17-30s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "No escala así" },
      { key: "insight", textoHablado: "No hace falta quitarle personalidad al trabajo de cada entrenador. Hace falta un proceso mínimo común, encima del cual cada uno pone su estilo.", tiempoAprox: "30-42s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Un mínimo común, no un molde" },
      { key: "sistema", textoHablado: "Defines qué información se registra siempre — de cada cliente, cada sesión — y en qué sistema, sin importar quién entrene.", tiempoAprox: "42-53s", visualSugerido: "Diagrama simple: varios entrenadores alimentando el mismo registro de clientes.", textoPantalla: "Mismo registro, cualquier entrenador" },
      { key: "beneficio", textoHablado: "Puedes cubrir una baja, incorporar a alguien nuevo, o vender el negocio, porque el conocimiento no vive solo en la cabeza de una persona.", tiempoAprox: "53-58s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Si tu negocio depende de la memoria de una sola persona, esto te interesa.", tiempoAprox: "58-60s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  5
);

const REEL_TRAZABILIDAD = buildReel(
  {
    id: "seed-reel-trazabilidad",
    title: "Le pregunté a un cliente qué pasó con su pedido y nadie supo responder",
    service: "odoo",
    concepts: ["Falta de trazabilidad", "Trazabilidad"],
    status: "grabado",
    favorite: false,
    duracion: "75 segundos",
    publico: "Responsables de operaciones que gestionan incidencias de pedidos",
    problema: "No hay rastro completo de por dónde ha pasado un pedido",
    objetivo: "Que valoren la trazabilidad como capacidad de sistema, no como lujo",
    concepto: "trazabilidad de procesos (process mining)",
    hookTipo: "curiosity_gap",
    beats: [
      { key: "hook", textoHablado: "Un cliente preguntó dónde estaba su pedido. Tardamos veinte minutos en averiguarlo. Y lo que encontramos explica muchísimos problemas parecidos.", tiempoAprox: "0-7s", visualSugerido: "A cámara, tono narrativo, como contando una anécdota real.", textoPantalla: "20 minutos para una respuesta" },
      { key: "problema", textoHablado: "El pedido había pasado por cuatro personas y tres herramientas distintas, y en ningún sitio quedaba un rastro completo de por dónde había ido.", tiempoAprox: "7-20s", visualSugerido: "Animación simple: un punto saltando entre varias cajas desconectadas.", textoPantalla: "4 personas, 3 herramientas" },
      { key: "consecuencia", textoHablado: "Sin ese rastro, cada incidencia se investiga desde cero, preguntando persona por persona, en vez de mirarlo en un solo sitio.", tiempoAprox: "20-34s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "Se investiga desde cero" },
      { key: "insight", textoHablado: "Esto tiene un nombre: trazabilidad. Y no es un lujo de empresa grande — es la diferencia entre resolver algo en un minuto o en media hora.", tiempoAprox: "34-47s", visualSugerido: "Texto en pantalla con la palabra clave.", textoPantalla: "Eso se llama trazabilidad" },
      { key: "sistema", textoHablado: "Si cada paso de un proceso queda registrado en el mismo sistema, siempre puedes reconstruir qué pasó, cuándo y quién lo hizo.", tiempoAprox: "47-60s", visualSugerido: "Diagrama: una línea de tiempo con cada paso registrado en el mismo sistema.", textoPantalla: "Todo el rastro, en un sitio" },
      { key: "beneficio", textoHablado: "Menos tiempo investigando incidencias, más confianza del cliente, y datos reales para ver dónde falla el proceso más a menudo.", tiempoAprox: "60-70s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Podrías reconstruir en un minuto qué le pasó a un pedido tuyo de hace un mes?", tiempoAprox: "70-75s", visualSugerido: "Cierre con pregunta directa a cámara.", textoPantalla: "¿En un minuto?" },
    ],
  },
  4
);

const REEL_ESPERAS = buildReel(
  {
    id: "seed-reel-esperas",
    title: "Tres días para saber si había plaza — y el cliente ya se había apuntado a otro sitio",
    service: "entrenadores",
    concepts: ["Esperas", "Menos fricción"],
    status: "borrador",
    favorite: false,
    duracion: "60 segundos",
    publico: "Negocios de entrenamiento que reciben consultas por varios canales",
    problema: "Tardan días en responder disponibilidad porque la información está repartida",
    objetivo: "Que midan cuánto tardan en responder a un lead nuevo",
    concepto: "lead time y coste de la espera para el cliente",
    hookTipo: "historia",
    beats: [
      { key: "hook", textoHablado: "Una clienta escribió preguntando si había plaza para el lunes. Le respondieron el jueves. Para entonces, ya se había apuntado a otro gimnasio.", tiempoAprox: "0-7s", visualSugerido: "Recreación breve tipo mensaje de chat en pantalla.", textoPantalla: "Respondida 3 días tarde" },
      { key: "problema", textoHablado: "No fue mala voluntad de nadie — el mensaje se perdió entre WhatsApp, recepción y una hoja de disponibilidad desactualizada.", tiempoAprox: "7-18s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Cada día de espera de más es una oportunidad de que el cliente resuelva su problema en otro sitio, no en el tuyo.", tiempoAprox: "18-30s", visualSugerido: "Gesto de constatación, tono serio.", textoPantalla: "Se va a otro sitio" },
      { key: "insight", textoHablado: "El tiempo que un cliente espera no depende de las ganas del equipo — depende de cuántos pasos y personas atraviesa esa pregunta antes de contestarse.", tiempoAprox: "30-43s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "No son las ganas, son los pasos" },
      { key: "sistema", textoHablado: "Cuando la disponibilidad está en un único sistema, cualquiera del equipo puede responder al momento, sin preguntar a otra persona antes.", tiempoAprox: "43-54s", visualSugerido: "Diagrama simple: una pregunta llegando directo a un sistema con la respuesta ya disponible.", textoPantalla: "Respuesta al momento" },
      { key: "beneficio", textoHablado: "Respuestas en minutos, no en días — y menos clientes que se van a la competencia mientras esperan.", tiempoAprox: "54-57s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Cuánto tarda de media tu negocio en responder a un lead nuevo? Es un dato que merece la pena medir.", tiempoAprox: "57-60s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  3
);

const REEL_ERRORES = buildReel(
  {
    id: "seed-reel-errores",
    title: "Cambiamos un dato en un sitio y dejamos de tener facturas mal emitidas",
    service: "odoo",
    concepts: ["Información duplicada", "Menos errores"],
    status: "publicado",
    favorite: true,
    duracion: "45 segundos",
    publico: "Gerentes que sufren errores recurrentes de facturación",
    problema: "El mismo dato fiscal se escribe a mano en varios sistemas distintos",
    objetivo: "Que apliquen el principio de dato único antes de automatizar",
    concepto: "dato único frente a duplicación manual",
    hookTipo: "resultado",
    beats: [
      { key: "hook", textoHablado: "Dejamos de tener facturas mal emitidas casi de un mes para otro. Y no cambiamos de contable — cambiamos de dónde vivía un solo dato.", tiempoAprox: "0-6s", visualSugerido: "A cámara, tono de resultado/logro medido.", textoPantalla: "De un mes para otro" },
      { key: "problema", textoHablado: "Antes, el nombre fiscal y la dirección del cliente se escribían a mano en tres sitios distintos: CRM, Excel de pedidos y facturación.", tiempoAprox: "6-16s", visualSugerido: "Cortes rápidos mostrando el mismo dato escrito varias veces de forma genérica.", textoPantalla: "3 sitios, mismo dato" },
      { key: "consecuencia", textoHablado: "Bastaba con que alguien tecleara mal una letra en uno de los tres para que la factura saliera con un error — y pasaba más de lo que nadie quería admitir.", tiempoAprox: "16-26s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "" },
      { key: "insight", textoHablado: "El error no era de la persona que escribía. Era que el mismo dato tenía tres oportunidades distintas de escribirse mal.", tiempoAprox: "26-34s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "3 oportunidades de error" },
      { key: "sistema", textoHablado: "Los datos fiscales del cliente pasaron a vivir en un único sitio, y todo lo demás — pedidos, facturas — los toma de ahí automáticamente.", tiempoAprox: "34-41s", visualSugerido: "Diagrama simple: un dato central alimentando pedidos y facturas.", textoPantalla: "Un dato, un sitio" },
      { key: "beneficio", textoHablado: "Un dato, un sitio, cero copias manuales — y las facturas mal emitidas prácticamente desaparecieron.", tiempoAprox: "41-44s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Antes de automatizar nada, pregúntate: ¿cuántas veces se escribe a mano el mismo dato en tu empresa?", tiempoAprox: "44-45s", visualSugerido: "Cierre con pregunta directa a cámara.", textoPantalla: "" },
    ],
  },
  2
);

// ─────────────────────────────────────────────────────────────────────────
// Segundo lote: 1 vídeo de YouTube + 10 reels sobre Business Process
// Management, basados en el documento de conocimiento "Business Process
// Management" que el propio usuario importó desde ChatGPT (fuente: Dumas,
// La Rosa, Mendling y Reijers — Fundamentals of Business Process
// Management). Los 10 reels parten literalmente de los erroresComunes,
// preguntasDiagnostico y ejemplos de ese documento importado, no de ángulos
// inventados aparte.
// ─────────────────────────────────────────────────────────────────────────

const YOUTUBE_BPM: ScriptRecord = {
  id: "seed-youtube-bpm",
  type: "youtube",
  title: "Antes de implantar un ERP, tienes que entender cómo funciona tu empresa",
  service: "odoo",
  concepts: ["Proceso end-to-end", "AS-IS / TO-BE", "BPM"],
  status: "listo",
  favorite: true,
  createdAt: daysAgo(1),
  updatedAt: daysAgo(0),
  knowledgeIds: ["bpm"],
  relatedScriptIds: ["seed-reel-bpm-configurar-antes", "seed-reel-bpm-medir-despues"],
  youtubeInputs: {
    tema: "Business Process Management: por qué hay que mapear el proceso antes de configurar cualquier sistema",
    publico: "Dueños y gerentes de pymes a punto de implantar un ERP o digitalizar su operación",
    objetivo: "Que mapeen su proceso end-to-end (AS-IS) antes de configurar ninguna herramienta",
    conceptos: "Business Process Management, proceso end-to-end, AS-IS, TO-BE, BPMN, monitorización",
    duracion: "15 minutos",
    tipo: "educativo",
  },
  titleOptions: [
    "Antes de implantar un ERP, tienes que entender cómo funciona tu empresa",
    "El error que cometen casi todas las pymes antes de digitalizarse",
    "Cómo mapear tu empresa completa antes de tocar Odoo",
    "¿Por qué configurar el ERP primero es siempre un error?",
    "AS-IS y TO-BE: el paso que casi todos se saltan (y no deberían)",
  ],
  selectedTitle: "Antes de implantar un ERP, tienes que entender cómo funciona tu empresa",
  youtubeHook:
    "Cada vez que alguien me llama para implantar Odoo, la primera pregunta que hago no es qué módulos necesitas. Es: enséñame cómo funciona tu empresa ahora mismo, paso a paso. Y casi siempre, esa pregunta deja a la otra persona en silencio.",
  promesa:
    "Al final de este vídeo vas a saber exactamente cómo mapear el proceso completo de tu negocio antes de tocar ningún software — y por qué saltarte este paso es el error más caro que puedes cometer.",
  chapters: chapters([
    {
      titulo: "El error que cometen casi todas las pymes",
      resumen: "Configurar el ERP antes de entender el proceso es el error número uno, y esto es lo que pasa cuando ocurre.",
      guion:
        "Voy a empezar por el error, porque es el que más veces veo, sin excepción: configurar el sistema antes de entender el proceso.\n\nPasa así. Una empresa decide implantar un ERP. Y en vez de sentarse primero a entender cómo funciona realmente su negocio — de principio a fin, no departamento por departamento — empieza directamente a configurar módulos. Ventas aquí, inventario allá, facturación más adelante. Cada equipo configura su parte según lo que cree que necesita.\n\nEl resultado, casi siempre, es una versión digital del mismo caos que ya tenían en Excel. Solo que ahora es más caro, más rígido, y más difícil de cambiar.\n\nEsto tiene un nombre en la disciplina que se llama Business Process Management, o BPM: gestión de procesos de negocio. Y la primera regla, la más básica, es esta: no se automatiza lo que no se ha entendido primero. Automatizar un proceso mal diseñado no lo arregla — simplemente te permite hacer mal las cosas más rápido, y con un contrato de software de por medio.\n\nAsí que antes de hablar de herramientas, vamos a hablar de procesos. De qué es exactamente un proceso de negocio, y por qué pensarlo departamento por departamento es, casi siempre, el segundo error.",
      visual: {
        queMostrar: "A cámara, tono directo, ligeramente de advertencia.",
        queExplicar: "El error de configurar el ERP antes de entender el proceso, y qué resulta de eso.",
        bRoll: "Pantalla genérica de un ERP con múltiples pestañas abiertas a la vez, transmitiendo caos.",
        capturas: "Ninguna todavía.",
        diagramas: "Pizarra con la palabra 'CONFIGURAR' tachada y sustituida por 'ENTENDER', como primer paso.",
      },
    },
    {
      titulo: "Qué es realmente un proceso de negocio",
      resumen: "El concepto de proceso end-to-end frente a la vista por departamentos, con la fuente académica de BPM.",
      guion:
        "Esto viene de un campo muy concreto de la gestión empresarial, BPM, que tiene incluso sus propios libros de referencia — el que yo uso es \"Fundamentals of Business Process Management\", de Dumas, La Rosa, Mendling y Reijers. Y la idea central es sencilla de decir, aunque cueste aplicarla: una empresa se puede gestionar como una serie de procesos de principio a fin, que se descubren, se modelan, se analizan, se rediseñan, se automatizan y se miden — de forma continua, no una vez y ya está.\n\nUn proceso de negocio, en este sentido, no es una tarea. Es la secuencia completa de actividades coordinadas que convierte una entrada en un resultado con valor. Y aquí está el matiz importante: \"de principio a fin\" — en inglés, end-to-end — significa que el proceso no vive dentro de un departamento. Atraviesa varios.\n\nUn ejemplo típico: lead, cualificación, llamada, propuesta, pago, alta, onboarding, prestación del servicio, seguimiento, renovación. Ese proceso pasa por marketing, por ventas, por administración, por operaciones y por atención al cliente. Si cada uno de esos departamentos optimiza solo su trozo, el cliente puede vivir una experiencia completamente incoherente, aunque cada parte por separado funcione \"bien\".\n\nEse es el error que mencionaba antes, pero dicho de otra forma: modelar departamentos en lugar de procesos end-to-end. Cuando haces eso, cada área tiene su versión de cómo van las cosas, y nadie tiene la vista completa.",
      visual: {
        queMostrar: "A cámara, con texto en pantalla citando la fuente (Dumas, La Rosa, Mendling, Reijers) al mencionar el libro.",
        queExplicar: "Qué es un proceso de negocio end-to-end frente a la vista por departamentos.",
        bRoll: "Animación simple mostrando un proceso atravesando varias cajas de 'departamento'.",
        capturas: "Ninguna.",
        diagramas: "LEAD → CUALIFICACIÓN → LLAMADA → PROPUESTA → PAGO → ALTA → ONBOARDING → PRESTACIÓN → SEGUIMIENTO → RENOVACIÓN, con las cajas de marketing/ventas/administración/operaciones marcadas debajo del flujo para mostrar que lo atraviesa.",
      },
    },
    {
      titulo: "AS-IS y TO-BE: dibuja antes de cambiar",
      resumen: "La disciplina de mapear el proceso actual antes de diseñar el futuro.",
      guion:
        "En BPM hay dos términos que uso constantemente con clientes, porque cambian completamente la conversación: AS-IS y TO-BE.\n\nAS-IS es cómo funciona el proceso ahora mismo. No cómo debería funcionar según el manual, ni cómo crees que funciona — cómo funciona de verdad, con sus atajos, sus excepciones y sus parches. TO-BE es el diseño de cómo debería funcionar después de rediseñarlo.\n\nLa razón por la que esto importa tanto es que casi nadie dibuja el AS-IS. Se pasa directamente a decidir qué herramienta comprar, que es básicamente diseñar el TO-BE sin haber entendido el AS-IS. Y cuando haces eso, lo más probable es que termines replicando en el ERP exactamente el mismo proceso roto que ya tenías — solo que ahora en pantallas en vez de en Excel.\n\nDibujar el AS-IS no tiene que ser complicado ni necesita un software especial. Puede ser una pizarra, post-its, o incluso una notación estándar como BPMN, que es simplemente un lenguaje visual compartido para representar procesos con símbolos: tareas, decisiones, eventos, flujos. Lo importante no es la herramienta con la que lo dibujas — es el ejercicio de dibujarlo con honestidad, incluyendo las partes feas.\n\nSolo cuando tienes ese mapa delante, tiene sentido preguntarse: ¿qué de esto deberíamos mantener, qué deberíamos eliminar, y qué deberíamos rediseñar desde cero? Eso es el TO-BE. Y solo entonces — solo entonces — tiene sentido hablar de qué herramienta lo va a ejecutar.",
      visual: {
        queMostrar: "A cámara, tono práctico. Texto en pantalla con 'AS-IS' y 'TO-BE' cuando se mencionan.",
        queExplicar: "La diferencia entre AS-IS y TO-BE, y por qué hay que dibujar el primero antes del segundo.",
        bRoll: "Alguien dibujando en una pizarra con post-its, tachando y reorganizando.",
        capturas: "Opcional: un diagrama BPMN simple genérico (cajas y rombos de decisión), sin datos reales.",
        diagramas: "Dos pizarras lado a lado: 'AS-IS' con un proceso desordenado y con vueltas, 'TO-BE' con el mismo proceso simplificado y lineal.",
      },
    },
    {
      titulo: "Cómo mapear el tuyo con cuatro preguntas",
      resumen: "Método práctico basado en cuatro preguntas de diagnóstico para dibujar tu propio AS-IS.",
      guion:
        "Vamos a lo práctico. No necesitas un consultor para empezar a mapear tu propio proceso — necesitas hacerte, con honestidad, cuatro preguntas.\n\nPrimera: ¿cuál es el proceso completo? No la tarea que haces tú, el proceso entero, desde que algo entra hasta que sale convertido en resultado. Si vendes un servicio, probablemente empieza en el momento en que alguien muestra interés y termina mucho después de haber cobrado — cuando ese cliente renueva, o no.\n\nSegunda: ¿quién inicia el proceso y quién recibe el resultado? Esto parece obvio y casi nunca lo es. Muchas veces el proceso lo \"empieza\" un departamento, pero el resultado lo recibe un cliente que nunca ha hablado con ese departamento directamente.\n\nTercera: ¿qué pasos no aportan valor? No me refiero a que sean inútiles para la empresa — me refiero a si el cliente notaría o le importaría que ese paso desapareciera. Muchas aprobaciones internas, revisiones duplicadas y reintroducciones manuales de datos caen aquí.\n\nCuarta: ¿dónde se producen esperas, errores o duplicidades? Esto es literalmente ir preguntando, paso a paso, dónde se atasca el trabajo, dónde se cuela un error con más frecuencia, y dónde alguien tiene que volver a escribir un dato que ya existía en otro sitio.\n\nCon esas cuatro respuestas, ya tienes un AS-IS aunque no lo hayas dibujado formalmente. Y ya puedes empezar a ver, con bastante claridad, por dónde tiene que ir el rediseño.",
      visual: {
        queMostrar: "A cámara, enumerando las 4 preguntas con texto en pantalla (1, 2, 3, 4) a medida que se explican.",
        queExplicar: "El método práctico de 4 preguntas para mapear el propio proceso.",
        bRoll: "Persona tomando notas en un cuaderno mientras repasa un proceso.",
        capturas: "Ninguna.",
        diagramas: "Una lista visual de las 4 preguntas superpuesta sobre un mapa de proceso genérico.",
      },
    },
    {
      titulo: "El proyecto no termina cuando se instala el software",
      resumen: "El ciclo continuo de BPM (medir y mejorar) y el momento correcto en el que entra la herramienta.",
      guion:
        "Hay una última pieza de BPM que casi siempre se olvida: monitorización. En la definición completa de la disciplina, gestionar procesos no es diseñar una vez y dejarlo correr — es descubrir, modelar, analizar, rediseñar, automatizar y medir, de forma continua. El ciclo no se cierra nunca del todo.\n\nEsto tiene una consecuencia directa: el proyecto no termina el día que se instala el software. Termina — si es que termina alguna vez — cuando ese sistema te permite ver, con datos reales, si el proceso rediseñado está funcionando mejor que el anterior. Cuánto tarda de verdad un lead en convertirse en cliente. Dónde sigue habiendo esperas. Qué parte del rediseño no funcionó como esperabas.\n\nY aquí es donde, por fin, entra la tecnología — no antes. Una vez que tienes el AS-IS dibujado, el TO-BE diseñado y claro qué necesitas medir, una herramienta como Odoo deja de ser una apuesta a ciegas y se convierte en la pieza que ejecuta ese diseño: conecta los pasos del proceso que ya decidiste que tenían que estar conectados, elimina las reintroducciones manuales que ya identificaste como desperdicio, y te da la visibilidad que ya sabes que necesitas medir.\n\nAsí que la próxima vez que pienses en digitalizar tu empresa, no empieces preguntando qué módulos necesitas. Empieza dibujando, con honestidad, cómo funciona tu proceso ahora mismo. Esa hora de trabajo con una pizarra vale más que cualquier decisión de software que tomes sin ella.",
      visual: {
        queMostrar: "A cámara. Hacia el final, breve captura de Odoo mostrando un flujo conectado — después de explicar el diseño, no antes.",
        queExplicar: "El ciclo continuo de BPM (medir y mejorar) y el momento correcto en el que entra la herramienta.",
        bRoll: "Transición de la pizarra a la pantalla, para reforzar que la herramienta llega después del diseño.",
        capturas: "Captura de pantalla de Odoo: un dashboard o vista de proceso conectado de principio a fin.",
        diagramas: "El ciclo BPM en pizarra: Descubrir → Modelar → Analizar → Rediseñar → Automatizar → Medir → (vuelta a Descubrir), en círculo.",
      },
    },
  ]),
  notes:
    "Basado en el documento de conocimiento importado 'Business Process Management' (fuente: Dumas, La Rosa, Mendling y Reijers). Los capítulos siguen sus erroresComunes y preguntasDiagnostico literalmente.",
};

const REEL_BPM_CONFIGURAR_ANTES = buildReel(
  {
    id: "seed-reel-bpm-configurar-antes",
    title: "El error que cometen casi todas las pymes antes de digitalizarse",
    service: "odoo",
    concepts: ["Procesos manuales", "BPM"],
    status: "listo",
    favorite: true,
    duracion: "45 segundos",
    publico: "Dueños de pymes a punto de implantar un ERP",
    problema: "Configurar el sistema antes de haber entendido el proceso que va a ejecutar",
    objetivo: "Que mapeen el proceso antes de configurar ninguna herramienta",
    concepto: "AS-IS antes de configurar cualquier sistema",
    hookTipo: "error_comun",
    knowledgeIds: ["bpm"],
    relatedScriptIds: ["seed-youtube-bpm"],
    beats: [
      { key: "hook", textoHablado: "El error más caro que veo antes de implantar cualquier sistema: configurarlo antes de entender el proceso que va a ejecutar.", tiempoAprox: "0-5s", visualSugerido: "A cámara, tono de advertencia.", textoPantalla: "El error más caro" },
      { key: "problema", textoHablado: "Una empresa decide digitalizarse y empieza directamente a configurar módulos — ventas por un lado, inventario por otro — sin haberse sentado a mapear cómo funciona realmente el negocio.", tiempoAprox: "5-15s", visualSugerido: "Cortes rápidos mostrando pantallas genéricas de configuración.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "El resultado es una versión digital del mismo caos que ya tenían en Excel. Solo que ahora es más cara, más rígida y más difícil de cambiar.", tiempoAprox: "15-26s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "Más caro, más rígido" },
      { key: "insight", textoHablado: "No se automatiza lo que no se ha entendido primero. Automatizar un proceso mal diseñado no lo arregla — simplemente permite hacer mal las cosas más rápido.", tiempoAprox: "26-37s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Mal más rápido" },
      { key: "sistema", textoHablado: "Antes de tocar cualquier herramienta, dibuja cómo funciona el proceso ahora mismo, con sus atajos y sus partes feas incluidas.", tiempoAprox: "37-42s", visualSugerido: "Pizarra con un proceso dibujado a mano.", textoPantalla: "Dibuja primero" },
      { key: "beneficio", textoHablado: "Cuando por fin configuras el sistema, lo haces sobre un diseño que ya sabes que funciona — no sobre suposiciones.", tiempoAprox: "42-45s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Si estás a punto de implantar un ERP, para. Dibuja el proceso primero.", tiempoAprox: "45-45s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_AUTOMATIZAR_ROTO = buildReel(
  {
    id: "seed-reel-bpm-automatizar-roto",
    title: "Automatizar un proceso malo no lo arregla, solo lo hace más rápido",
    service: "odoo",
    concepts: ["Automatización", "Procesos manuales"],
    status: "borrador",
    favorite: false,
    duracion: "45 segundos",
    publico: "Responsables de operaciones que ven la automatización como arreglo universal",
    problema: "Automatizar procesos que ya funcionan mal, en vez de rediseñarlos antes",
    objetivo: "Que rediseñen antes de automatizar",
    concepto: "automatizar solo lo que ya está bien diseñado",
    hookTipo: "contrarian",
    beats: [
      { key: "hook", textoHablado: "Automatizar un proceso que ya funciona mal no es una solución. Es el mismo problema, pero más rápido.", tiempoAprox: "0-5s", visualSugerido: "A cámara, tono contrarian.", textoPantalla: "El mismo problema, más rápido" },
      { key: "problema", textoHablado: "Muchas empresas ven la automatización como el arreglo universal: si algo va lento o falla, la respuesta automática es 'vamos a automatizarlo'.", tiempoAprox: "5-15s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Si el proceso de base tiene pasos innecesarios, aprobaciones redundantes o información duplicada, automatizarlo simplemente reproduce esos defectos a mayor velocidad.", tiempoAprox: "15-27s", visualSugerido: "Animación de un proceso con errores repitiéndose cada vez más rápido.", textoPantalla: "Los mismos defectos, más rápido" },
      { key: "insight", textoHablado: "La automatización no corrige el diseño. Amplifica el que ya tienes, sea bueno o malo.", tiempoAprox: "27-35s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Amplifica, no corrige" },
      { key: "sistema", textoHablado: "Primero se rediseña el proceso — qué pasos sobran, dónde se pierde información — y solo después se decide qué partes automatizar.", tiempoAprox: "35-42s", visualSugerido: "Diagrama simple: rediseño primero, automatización después.", textoPantalla: "Rediseñar, luego automatizar" },
      { key: "beneficio", textoHablado: "Automatizas menos pasos, pero los que automatizas de verdad funcionan y ahorran tiempo real.", tiempoAprox: "42-44s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "cta", textoHablado: "Antes de automatizar algo esta semana, pregúntate si ese paso debería existir siquiera.", tiempoAprox: "44-45s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_DEPARTAMENTOS = buildReel(
  {
    id: "seed-reel-bpm-departamentos-vs-proceso",
    title: "Tu empresa no tiene departamentos que optimizar. Tiene un proceso que los atraviesa",
    service: "odoo",
    concepts: ["Silos", "Proceso end-to-end"],
    status: "idea",
    favorite: false,
    duracion: "60 segundos",
    publico: "Directivos que gestionan la empresa departamento por departamento",
    problema: "Cada departamento optimiza su parte sin ver el proceso completo",
    objetivo: "Que piensen en procesos end-to-end en vez de en departamentos aislados",
    concepto: "proceso end-to-end frente a optimización por departamentos",
    hookTipo: "directo",
    beats: [
      { key: "hook", textoHablado: "Tu empresa no son departamentos que hay que optimizar por separado. Es un proceso que atraviesa a todos ellos.", tiempoAprox: "0-6s", visualSugerido: "A cámara, tono directo.", textoPantalla: "No son departamentos" },
      { key: "problema", textoHablado: "Marketing optimiza sus leads, ventas optimiza su cierre, administración optimiza su facturación — cada uno mirando solo su trozo.", tiempoAprox: "6-17s", visualSugerido: "Cortes mostrando distintos departamentos de forma genérica.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "El cliente vive el proceso completo, de principio a fin. Y aunque cada departamento funcione bien por separado, la experiencia conjunta puede ser un desastre.", tiempoAprox: "17-30s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "La experiencia conjunta" },
      { key: "insight", textoHablado: "Esto en gestión de procesos se llama pensar end-to-end: de principio a fin, no departamento por departamento.", tiempoAprox: "30-40s", visualSugerido: "Texto en pantalla con la palabra clave.", textoPantalla: "End-to-end" },
      { key: "sistema", textoHablado: "Mapea el proceso completo — desde que alguien muestra interés hasta que renueva — y diseña pensando en ese recorrido entero, no en cada parte suelta.", tiempoAprox: "40-52s", visualSugerido: "Diagrama: varios departamentos atravesados por una única línea de proceso.", textoPantalla: "Un recorrido, no partes sueltas" },
      { key: "beneficio", textoHablado: "Dejas de optimizar partes que no mejoran el resultado global, y empiezas a mejorar lo único que el cliente realmente experimenta: el conjunto.", tiempoAprox: "52-58s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Cuántos departamentos atraviesa tu proceso más importante? Cuéntalos.", tiempoAprox: "58-60s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_RESPONSABLE = buildReel(
  {
    id: "seed-reel-bpm-responsable-proceso",
    title: "Le pregunté quién era el dueño del proceso y nadie supo responder",
    service: "entrenadores",
    concepts: ["Falta de trazabilidad", "Handoffs"],
    status: "idea",
    favorite: false,
    duracion: "60 segundos",
    publico: "Equipos donde el onboarding de un cliente pasa por varias personas",
    problema: "Ningún miembro del equipo se considera responsable del proceso completo",
    objetivo: "Que definan un responsable de principio a fin, no por tramos",
    concepto: "propietario del proceso end-to-end",
    hookTipo: "historia",
    beats: [
      { key: "hook", textoHablado: "Le pregunté a un equipo quién era el responsable de que un cliente nuevo empezara bien. Se miraron entre ellos. Nadie supo responder.", tiempoAprox: "0-7s", visualSugerido: "Recreación breve de la escena, plano medio.", textoPantalla: "Nadie supo responder" },
      { key: "problema", textoHablado: "El proceso de dar de alta a un cliente nuevo pasaba por tres personas distintas, y ninguna se consideraba responsable del resultado completo.", tiempoAprox: "7-19s", visualSugerido: "Animación simple: un proceso pasando por tres personas sin dueño claro.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Cuando algo fallaba en el onboarding, cada persona defendía que su parte había ido bien — porque, de hecho, así era. El fallo estaba en las costuras entre partes.", tiempoAprox: "19-32s", visualSugerido: "Cara a cámara, tono de constatación.", textoPantalla: "El fallo está en las costuras" },
      { key: "insight", textoHablado: "Un proceso sin responsable de principio a fin no es un proceso. Es una serie de tareas sueltas que alguien coordina de memoria.", tiempoAprox: "32-43s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Tareas sueltas, no un proceso" },
      { key: "sistema", textoHablado: "Define quién inicia el proceso, quién recibe el resultado final, y quién responde por el recorrido completo — no solo por su tramo.", tiempoAprox: "43-54s", visualSugerido: "Diagrama: una persona señalada como responsable de todo el recorrido.", textoPantalla: "Un responsable, todo el recorrido" },
      { key: "beneficio", textoHablado: "Cuando algo falla, se sabe exactamente a quién preguntar, y el cliente deja de notar las costuras entre personas.", tiempoAprox: "54-58s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Quién es el responsable de principio a fin de tu proceso más importante con clientes?", tiempoAprox: "58-60s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_PASOS_SIN_VALOR = buildReel(
  {
    id: "seed-reel-bpm-pasos-sin-valor",
    title: "Esa aprobación que pides por costumbre puede no aportar nada",
    service: "odoo",
    concepts: ["Procesos manuales", "Automatización"],
    status: "borrador",
    favorite: false,
    duracion: "45 segundos",
    publico: "Responsables de operaciones con procesos llenos de aprobaciones internas",
    problema: "Pasos y aprobaciones que se mantienen por costumbre, sin aportar valor real",
    objetivo: "Que cuestionen cada paso del proceso preguntando si el cliente lo notaría",
    concepto: "eliminar pasos que no aportan valor antes de automatizar",
    hookTipo: "pregunta",
    beats: [
      { key: "hook", textoHablado: "¿Ese paso que haces en cada pedido... el cliente notaría algo si desapareciera mañana?", tiempoAprox: "0-5s", visualSugerido: "Pregunta directa a cámara.", textoPantalla: "¿El cliente lo notaría?" },
      { key: "problema", textoHablado: "Muchos procesos arrastran aprobaciones, revisiones y reintroducciones de datos que nadie recuerda ya por qué existen.", tiempoAprox: "5-15s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Cada paso de más añade tiempo, oportunidad de error, y una persona más a la que esperar antes de seguir.", tiempoAprox: "15-25s", visualSugerido: "Animación de una cola de pasos innecesarios acumulándose.", textoPantalla: "" },
      { key: "insight", textoHablado: "No todos los pasos de un proceso aportan valor. Algunos existen solo por costumbre, no por necesidad.", tiempoAprox: "25-34s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "Por costumbre, no por necesidad" },
      { key: "sistema", textoHablado: "Repasa cada paso y pregúntate honestamente si el cliente lo echaría en falta. Si la respuesta es no, es candidato a desaparecer.", tiempoAprox: "34-41s", visualSugerido: "Pizarra tachando pasos de un proceso dibujado.", textoPantalla: "Si no, fuera" },
      { key: "beneficio", textoHablado: "El proceso se acorta de verdad, no solo se automatiza, y lo que queda es exactamente lo necesario.", tiempoAprox: "41-44s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "cta", textoHablado: "Elige un proceso esta semana y tacha en voz alta cada paso que no superaría esa pregunta.", tiempoAprox: "44-45s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_TRES_PREGUNTAS = buildReel(
  {
    id: "seed-reel-bpm-tres-preguntas",
    title: "Tres preguntas para encontrar dónde se rompe tu proceso",
    service: "odoo",
    concepts: ["Esperas", "Errores"],
    status: "listo",
    favorite: false,
    duracion: "60 segundos",
    publico: "Responsables de operaciones que sienten que 'algo va lento' sin saber dónde",
    problema: "No se sabe con precisión dónde se acumula el trabajo, falla o se duplica",
    objetivo: "Que localicen puntos exactos de mejora con un método de 3 preguntas",
    concepto: "diagnóstico de esperas, errores y duplicidades en un proceso",
    hookTipo: "directo",
    beats: [
      { key: "hook", textoHablado: "Tres preguntas para encontrar exactamente dónde se rompe tu proceso: dónde espera, dónde falla y dónde se duplica.", tiempoAprox: "0-6s", visualSugerido: "A cámara, tono práctico.", textoPantalla: "3 preguntas" },
      { key: "problema", textoHablado: "La mayoría de procesos tienen puntos concretos donde el trabajo se acumula, donde se repiten los mismos errores, o donde alguien reescribe un dato que ya existía.", tiempoAprox: "6-18s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Sin identificar esos puntos exactos, cualquier mejora que hagas es genérica — y las genéricas casi nunca arreglan nada.", tiempoAprox: "18-29s", visualSugerido: "Gesto de constatación.", textoPantalla: "Las mejoras genéricas no arreglan nada" },
      { key: "insight", textoHablado: "No hace falta un análisis complejo. Basta con preguntar, paso a paso: ¿aquí se espera?, ¿aquí se equivoca la gente?, ¿aquí se repite un dato?", tiempoAprox: "29-42s", visualSugerido: "Texto en pantalla con las 3 preguntas.", textoPantalla: "¿Espera? ¿Falla? ¿Duplica?" },
      { key: "sistema", textoHablado: "Recorre tu proceso completo con esas tres preguntas y marca cada punto donde la respuesta sea sí.", tiempoAprox: "42-52s", visualSugerido: "Pizarra con un proceso y marcas rojas en los puntos problemáticos.", textoPantalla: "Marca cada punto" },
      { key: "beneficio", textoHablado: "Tienes un mapa exacto de dónde intervenir, en vez de una sensación difusa de que 'algo va lento'.", tiempoAprox: "52-57s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Hazlo con tu proceso más importante esta semana. Vas a encontrar más puntos de los que esperabas.", tiempoAprox: "57-60s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_LEAD_TO_CLIENT = buildReel(
  {
    id: "seed-reel-bpm-lead-to-client",
    title: "Tu lead pasa por 5 pasos antes de ser cliente. En cada traspaso se puede perder",
    service: "odoo",
    concepts: ["Handoffs", "Proceso end-to-end"],
    status: "borrador",
    favorite: false,
    duracion: "60 segundos",
    publico: "Equipos comerciales con proceso lead-to-client repartido entre departamentos",
    problema: "El lead se pierde en los traspasos entre marketing, ventas, administración y operaciones",
    objetivo: "Que diseñen el proceso lead-to-client como un único recorrido",
    concepto: "proceso lead-to-client de principio a fin",
    hookTipo: "curiosity_gap",
    beats: [
      { key: "hook", textoHablado: "Un lead pasa por marketing, ventas, administración y operaciones antes de convertirse en cliente. En cada uno de esos traspasos hay una forma de perderlo.", tiempoAprox: "0-8s", visualSugerido: "A cámara, tono de intriga.", textoPantalla: "4 traspasos, 4 formas de perderlo" },
      { key: "problema", textoHablado: "Cualificación, llamada, propuesta, pago, alta, onboarding, seguimiento: cada cambio de manos es una oportunidad de que algo se pierda o se retrase.", tiempoAprox: "8-20s", visualSugerido: "Animación mostrando el lead saltando entre varias cajas.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Un lead que costó dinero conseguir se enfría en un traspaso que nadie diseñó explícitamente.", tiempoAprox: "20-30s", visualSugerido: "Cara a cámara, tono serio.", textoPantalla: "Se enfría en el traspaso" },
      { key: "insight", textoHablado: "El proceso completo, de principio a fin, tiene un nombre: lead-to-client. Y hay que diseñarlo como un único recorrido, no como pasos sueltos entre departamentos.", tiempoAprox: "30-43s", visualSugerido: "Texto en pantalla con 'lead-to-client'.", textoPantalla: "Lead-to-client, un único recorrido" },
      { key: "sistema", textoHablado: "Dibuja ese recorrido completo y decide, en cada traspaso, qué información tiene que llegar automáticamente a la siguiente persona sin que nadie la reenvíe a mano.", tiempoAprox: "43-54s", visualSugerido: "Diagrama del recorrido lead-to-client completo, sin cortes entre cajas.", textoPantalla: "" },
      { key: "beneficio", textoHablado: "Menos leads perdidos por el camino, y un proceso que se puede medir de principio a fin, no por fragmentos.", tiempoAprox: "54-58s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "Dibuja tu proceso lead-to-client completo. Vas a ver los traspasos que nunca habías señalado.", tiempoAprox: "58-60s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_ENTRENADORES_RECORRIDO = buildReel(
  {
    id: "seed-reel-bpm-recorrido-entrenadores",
    title: "Cliente → evaluación → plan → entrenamiento: ¿dónde se rompe en tu negocio?",
    service: "entrenadores",
    concepts: ["Handoffs", "Proceso end-to-end"],
    status: "idea",
    favorite: false,
    duracion: "60 segundos",
    publico: "Negocios de entrenamiento con proceso de cliente repartido entre varias personas o apps",
    problema: "El recorrido cliente-evaluación-plan-entrenamiento no está diseñado como un único proceso",
    objetivo: "Que mapeen el recorrido completo del cliente para encontrar dónde se pierden",
    concepto: "proceso end-to-end aplicado a un negocio de entrenamiento",
    hookTipo: "pregunta",
    beats: [
      { key: "hook", textoHablado: "Cliente, evaluación, objetivos, planificación, entrenamiento, seguimiento, ajuste. ¿Sabes en cuál de esos pasos se te suelen ir los clientes?", tiempoAprox: "0-8s", visualSugerido: "Pregunta directa a cámara.", textoPantalla: "¿En cuál se te van?" },
      { key: "problema", textoHablado: "En un negocio de entrenamiento, ese recorrido completo pasa por varias manos — y a veces por varias herramientas — sin que nadie lo vea de principio a fin.", tiempoAprox: "8-19s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Un cliente puede completar la evaluación inicial y nunca recibir un plan a tiempo, o entrenar sin que nadie registre su progreso.", tiempoAprox: "19-31s", visualSugerido: "Gesto de constatación.", textoPantalla: "" },
      { key: "insight", textoHablado: "El problema casi nunca es la falta de esfuerzo del entrenador. Es que el proceso completo no está diseñado como un único recorrido.", tiempoAprox: "31-43s", visualSugerido: "Texto en pantalla con la idea clave.", textoPantalla: "No es esfuerzo, es diseño" },
      { key: "sistema", textoHablado: "Mapea ese recorrido entero — desde que el cliente llega hasta que renueva — y decide qué información debe fluir sola entre cada paso.", tiempoAprox: "43-54s", visualSugerido: "Diagrama del recorrido completo del cliente, de principio a fin.", textoPantalla: "" },
      { key: "beneficio", textoHablado: "Un cliente que no se pierde entre la evaluación y el primer entrenamiento, y un proceso que puedes repetir con cualquier entrenador nuevo.", tiempoAprox: "54-58s", visualSugerido: "Cara a cámara, tono resolutivo.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿En qué paso de ese recorrido se te van más clientes? Es un dato que merece la pena medir.", tiempoAprox: "58-60s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_AS_IS_TO_BE = buildReel(
  {
    id: "seed-reel-bpm-as-is-to-be",
    title: "No puedes diseñar el futuro de tu empresa sin dibujar el presente",
    service: "odoo",
    concepts: ["Descontrol", "AS-IS / TO-BE"],
    status: "listo",
    favorite: true,
    duracion: "45 segundos",
    publico: "Empresas a punto de rediseñar procesos sin haber mapeado el actual",
    problema: "Diseñar cómo debería funcionar la empresa sin dibujar antes cómo funciona de verdad",
    objetivo: "Que dibujen el AS-IS antes de diseñar ningún TO-BE",
    concepto: "AS-IS antes de TO-BE",
    hookTipo: "contrarian",
    beats: [
      { key: "hook", textoHablado: "No puedes diseñar cómo debería funcionar tu empresa si no has dibujado primero cómo funciona de verdad, con sus partes feas incluidas.", tiempoAprox: "0-7s", visualSugerido: "A cámara, tono contrarian.", textoPantalla: "Dibuja el presente primero" },
      { key: "problema", textoHablado: "Casi nadie dibuja el proceso actual antes de decidir cómo debería ser. Se pasa directamente a decidir la herramienta.", tiempoAprox: "7-17s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "El resultado casi siempre es replicar en digital el mismo proceso roto que ya tenías, solo que ahora en pantallas.", tiempoAprox: "17-27s", visualSugerido: "Gesto de constatación.", textoPantalla: "" },
      { key: "insight", textoHablado: "En gestión de procesos esto tiene nombre: AS-IS, cómo funciona ahora; TO-BE, cómo debería funcionar después. Uno no existe sin el otro.", tiempoAprox: "27-38s", visualSugerido: "Texto en pantalla con 'AS-IS' y 'TO-BE'.", textoPantalla: "AS-IS → TO-BE" },
      { key: "sistema", textoHablado: "Dibuja el AS-IS con honestidad — atajos y parches incluidos — antes de diseñar ningún TO-BE.", tiempoAprox: "38-42s", visualSugerido: "Pizarra con un proceso AS-IS dibujado con honestidad.", textoPantalla: "" },
      { key: "beneficio", textoHablado: "El rediseño se basa en lo que realmente pasa, no en lo que el manual dice que debería pasar.", tiempoAprox: "42-44s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "cta", textoHablado: "Coge una pizarra esta semana y dibuja el AS-IS de tu proceso más importante. No pienses en la solución todavía.", tiempoAprox: "44-45s", visualSugerido: "Cierre a cámara.", textoPantalla: "" },
    ],
  },
  1
);

const REEL_BPM_MEDIR_DESPUES = buildReel(
  {
    id: "seed-reel-bpm-medir-despues",
    title: "Instalar el software no es el final del proyecto. Es el principio de medirlo",
    service: "odoo",
    concepts: ["Monitorización", "Mejora continua"],
    status: "publicado",
    favorite: false,
    duracion: "45 segundos",
    publico: "Empresas que dan por terminado el proyecto al instalar el sistema",
    problema: "No se mide el proceso después de rediseñarlo e implantar el sistema",
    objetivo: "Que definan qué van a medir antes de dar el proyecto por terminado",
    concepto: "monitorización continua tras la implantación",
    hookTipo: "resultado",
    knowledgeIds: ["bpm"],
    relatedScriptIds: ["seed-youtube-bpm"],
    beats: [
      { key: "hook", textoHablado: "El día que se instala el sistema no es el final del proyecto. Es el primer día en el que por fin puedes medir si el proceso funciona.", tiempoAprox: "0-7s", visualSugerido: "A cámara, tono de resultado.", textoPantalla: "No es el final, es el principio" },
      { key: "problema", textoHablado: "Muchas empresas tratan la implantación como un proyecto que termina cuando el software ya está funcionando.", tiempoAprox: "7-16s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "consecuencia", textoHablado: "Sin medir después, nadie sabe si el proceso rediseñado es realmente mejor que el anterior, ni dónde sigue habiendo esperas.", tiempoAprox: "16-27s", visualSugerido: "Gesto de constatación.", textoPantalla: "" },
      { key: "insight", textoHablado: "Gestionar procesos no es diseñar una vez. Es un ciclo: descubrir, modelar, analizar, rediseñar, automatizar y medir — otra vez y otra vez.", tiempoAprox: "27-39s", visualSugerido: "Texto en pantalla con el ciclo BPM.", textoPantalla: "Es un ciclo, no un final" },
      { key: "sistema", textoHablado: "Define desde el principio qué vas a medir una vez el sistema esté en marcha: tiempos, esperas, errores, conversión.", tiempoAprox: "39-43s", visualSugerido: "Diagrama simple de un dashboard con métricas genéricas.", textoPantalla: "" },
      { key: "beneficio", textoHablado: "Detectas pronto si algo del rediseño no funcionó, en vez de descubrirlo meses después por quejas de clientes.", tiempoAprox: "43-44s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
      { key: "cta", textoHablado: "¿Qué vas a medir el primer mes después de tu próxima implantación? Decídelo antes de empezar.", tiempoAprox: "44-45s", visualSugerido: "Cierre con pregunta directa.", textoPantalla: "" },
    ],
  },
  1
);

// Un carrusel que resume el vídeo de Theory of Constraints: mismo marco de
// conocimiento, mismo mensaje, otro formato. Sirve además de ejemplo de cómo
// se entrelazan los documentos entre sí.
const CARRUSEL_TOC: ScriptRecord = {
  id: "seed-carrusel-toc",
  type: "carrusel",
  title: "Las 5 señales de que tienes un cuello de botella",
  service: "odoo",
  concepts: ["Cuellos de botella", "Sistema"],
  status: "borrador",
  favorite: false,
  createdAt: daysAgo(3),
  updatedAt: daysAgo(2),
  knowledgeIds: ["toc"],
  relatedScriptIds: ["seed-youtube-toc", "seed-reel-cuello-botella"],
  caption:
    "Cuando una empresa va lenta, la reacción normal es pedirle más a todo el mundo. Pero un sistema no va al ritmo de la suma de sus partes: va al ritmo de su punto más lento. Mientras no encuentres ese punto, cada mejora en el resto solo acumula más trabajo delante de él. Guarda esto y revísalo la próxima vez que alguien proponga contratar para ir más rápido.",
  slides: carouselSlides([
    {
      kind: "portada",
      fondo: "claro",
      etiqueta: "",
      titular: "Tu empresa no va lenta. Va al ritmo de su punto más lento.",
      cuerpo: "5 señales de que tienes un cuello de botella y no lo has encontrado.",
      puntos: [],
      notaVisual: "Cara a cámara o foto de un embudo real. Titular muy grande.",
    },
    {
      kind: "problema",
      fondo: "oscuro",
      etiqueta: "El problema",
      titular: "Mejorar todo a la vez no mejora nada",
      cuerpo:
        "Si aceleras una parte que no es la restricción, lo único que consigues es acumular más trabajo delante de ella.",
      puntos: [],
      notaVisual: "Diagrama de tubería con un estrechamiento marcado en rojo.",
    },
    {
      kind: "claves",
      fondo: "claro",
      etiqueta: "Las 5 señales",
      titular: "Dónde mirar",
      cuerpo: "",
      puntos: [
        "Siempre hay trabajo esperando en el mismo sitio.",
        "Una persona concreta tiene que validarlo todo.",
        "Los plazos que fallan fallan siempre en la misma fase.",
        "El resto del equipo está esperando, no saturado.",
        "Contratar en otras áreas no cambió nada.",
      ],
      notaVisual: "Lista limpia sobre fondo claro, sin iconos decorativos.",
    },
    {
      kind: "solucion",
      fondo: "oscuro",
      etiqueta: "Qué hacer",
      titular: "Primero encuéntralo. Luego protégelo.",
      cuerpo:
        "La restricción marca el ritmo de todo el sistema. Una hora perdida ahí es una hora perdida en la empresa entera.",
      puntos: [],
      notaVisual: "Cita grande centrada.",
    },
    {
      kind: "pasos",
      fondo: "claro",
      etiqueta: "Cómo empezar",
      titular: "Tres pasos esta semana",
      cuerpo: "",
      puntos: [
        "Dibuja el recorrido completo de un pedido.",
        "Marca dónde se acumula trabajo esperando.",
        "Quítale a ese punto todo lo que no sea su tarea.",
      ],
      notaVisual: "Números grandes, poco texto.",
    },
    {
      kind: "cta",
      fondo: "degradado",
      etiqueta: "",
      titular: "¿Ya sabes cuál es el tuyo?",
      cuerpo: "Guarda esto y revísalo antes de la próxima contratación.",
      puntos: [],
      notaVisual: "Cierre limpio, sin flecha de swipe.",
    },
  ]),
};

export const SEED_SCRIPTS: ScriptRecord[] = [
  CARRUSEL_TOC,
  YOUTUBE_TOC,
  REEL_ERRORES,
  REEL_ESPERAS,
  REEL_TRAZABILIDAD,
  REEL_DESCONTROL,
  REEL_PROCESOS_MANUALES,
  REEL_VISIBILIDAD,
  REEL_HANDOFFS,
  REEL_CUELLO_BOTELLA,
  REEL_HERRAMIENTAS,
  REEL_SILOS,
  YOUTUBE_BPM,
  REEL_BPM_CONFIGURAR_ANTES,
  REEL_BPM_AUTOMATIZAR_ROTO,
  REEL_BPM_DEPARTAMENTOS,
  REEL_BPM_RESPONSABLE,
  REEL_BPM_PASOS_SIN_VALOR,
  REEL_BPM_TRES_PREGUNTAS,
  REEL_BPM_LEAD_TO_CLIENT,
  REEL_BPM_ENTRENADORES_RECORRIDO,
  REEL_BPM_AS_IS_TO_BE,
  REEL_BPM_MEDIR_DESPUES,
];
