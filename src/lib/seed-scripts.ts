import { makeId } from "./utils";
import type { HookType, ReelBeat, ScriptRecord, YoutubeChapter } from "./types";

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

const YOUTUBE_TOC: ScriptRecord = {
  id: makeId("script"),
  type: "youtube",
  title: "Tu equipo no es el problema. Es el cuello de botella que nadie ha encontrado.",
  service: "odoo",
  concepts: ["Cuellos de botella", "Sistema", "Optimización"],
  status: "listo",
  favorite: true,
  createdAt: daysAgo(6),
  updatedAt: daysAgo(1),
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
}

function buildReel(spec: SeedReelSpec, createdDaysAgo: number): ScriptRecord {
  const now = daysAgo(createdDaysAgo);
  const selectedHookId = makeId("hook");
  return {
    id: makeId("script"),
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
  };
}

const REEL_SILOS = buildReel(
  {
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
    beats: [
      { key: "hook", textoHablado: "Si tu empresa va lenta, lo último que deberías hacer es contratar a alguien más. En serio.", tiempoAprox: "0-3s", visualSugerido: "A cámara, tono directo, sin rodeos.", textoPantalla: "No contrates todavía" },
      { key: "problema", textoHablado: "La reacción automática cuando algo se atasca es 'necesitamos más manos'. Pero casi nunca el problema es la cantidad de gente.", tiempoAprox: "3-12s", visualSugerido: "Cara a cámara.", textoPantalla: "" },
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

export const SEED_SCRIPTS: ScriptRecord[] = [
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
];
