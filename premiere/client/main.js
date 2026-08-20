/**
 * Lógica del panel de System Content Studio para Premiere Pro.
 *
 * Lee los recursos del MISMO sitio que la web (`/api/db/state`), así que no
 * hay una segunda copia de la verdad: lo que generas en el estudio aparece
 * aquí sin exportar ni sincronizar nada.
 *
 * Dos detalles que explican casi todo el archivo:
 *
 *  1. La web sirve los archivos por HTTP, pero Premiere solo importa por
 *     RUTA DE DISCO. Por eso se pide `/api/system/paths` una vez y se
 *     traduce "generated/x.mp4" → "C:\...\data\media\generated\x.mp4".
 *
 *  2. Hablar con Premiere se hace con `evalScript`, que es asíncrono y solo
 *     mueve strings. `llamarHost()` lo envuelve en una promesa y parsea la
 *     respuesta JSON que devuelve host/index.jsx.
 */

// Se recuerda en localStorage (persiste entre sesiones del panel, es
// Chromium normal) para no tener que reconfigurar cada vez que se abre
// Premiere. Por defecto, el servidor local — es el caso más común.
var API = localStorage.getItem("scc_api_url") || "http://localhost:3000";
var cs = new CSInterface();

var estado = {
  mediaRoot: null,
  separador: "\\",
  recursos: [],
  estudioCompleto: null, // el state.state crudo, para agruparPorGuion (aplanarRecursos ya lo destroza)
  recursosExternosRoot: null, // ruta absoluta de data/recursos-externos, para insertar/importar desde ahí
  categoriaActiva: null,
  pistas: 0,
  vista: "recursos",
  recursosVista: "categoria", // "categoria" | "guion"
  archivoElegido: null, // { ruta, nombre }
  transcripcion: null, // { filePath, palabras }
  lineas: null, // líneas ya agrupadas (sin renderizar), para el preview en vivo
  generado: null, // { previewPath, filePath }
  archivoSilencios: null, // { ruta, nombre, pista, clipStartSeg, clipInPointSeg }
  silenciosDetectados: null, // [{inicioSeg, finSeg, duracionSeg}], tiempo del ARCHIVO de origen
};

// ── Categorías ───────────────────────────────────────────────────────────
// El orden importa: lo que más se usa al montar va primero.
var CATEGORIAS = [
  { id: "animacion", etiqueta: "Animaciones" },
  { id: "subtitulos", etiqueta: "Subtítulos" },
  { id: "infografia", etiqueta: "Infografías" },
  { id: "imagen-contexto", etiqueta: "Contexto" },
  { id: "imagen-usuario", etiqueta: "Con tu foto" },
  { id: "otros", etiqueta: "Otros" },
];

// ── Utilidades ───────────────────────────────────────────────────────────

function $(sel) {
  return document.querySelector(sel);
}

function decir(mensaje, tipo) {
  var el = $("#estado");
  el.textContent = mensaje || "";
  el.className = "estado" + (tipo ? " " + tipo : "");
}

/** Convierte una ruta relativa de data/media en ruta absoluta del sistema. */
function rutaAbsoluta(rel) {
  if (!estado.mediaRoot) return null;
  var normalizada = estado.separador === "\\" ? rel.replace(/\//g, "\\") : rel;
  return estado.mediaRoot + estado.separador + normalizada;
}

/** Llama a una función de host/index.jsx y devuelve una promesa con su resultado. */
function llamarHost(fn, args) {
  return new Promise(function (resolve, reject) {
    var lista = (args || [])
      .map(function (a) {
        return typeof a === "string" ? '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"' : String(a);
      })
      .join(", ");

    cs.evalScript(fn + "(" + lista + ")", function (bruto) {
      if (bruto === "EvalScript error.") {
        reject(new Error("ExtendScript falló al ejecutar " + fn + "."));
        return;
      }
      var res;
      try {
        res = JSON.parse(bruto);
      } catch (e) {
        reject(new Error("Respuesta ininteligible de Premiere: " + String(bruto).slice(0, 120)));
        return;
      }
      if (!res.ok) {
        reject(new Error(res.error || "Error desconocido en Premiere."));
        return;
      }
      resolve(res.datos || {});
    });
  });
}

// ── Carga de datos ───────────────────────────────────────────────────────

function esVideo(ruta) {
  return /\.(mp4|mov|webm)$/i.test(ruta);
}
function esImagen(ruta) {
  return /\.(png|jpe?g|webp|gif)$/i.test(ruta);
}

/**
 * Aplana el estado del estudio a una lista única de recursos importables.
 * Mezcla dos fuentes distintas — los `visuals` colgados de cada guion y los
 * `subtitleStyles`, que son de canal y no de guion — porque para montar en
 * Premiere esa distinción no importa: todo son archivos que quieres meter.
 */
function aplanarRecursos(st) {
  var out = [];

  var guiones = st.scripts || [];
  for (var i = 0; i < guiones.length; i++) {
    var g = guiones[i];
    var visuals = g.visuals || [];
    for (var j = 0; j < visuals.length; j++) {
      var v = visuals[j];
      var capitulo = "";
      if (v.chapterId && g.chapters) {
        for (var k = 0; k < g.chapters.length; k++) {
          if (g.chapters[k].id === v.chapterId) {
            capitulo = g.chapters[k].titulo || "";
            break;
          }
        }
      }
      out.push({
        id: v.id,
        categoria: CATEGORIAS.some(function (c) {
          return c.id === v.kind;
        })
          ? v.kind
          : "otros",
        titulo: v.id.replace(/^visual_anim_/, "").replace(/^visual_/, ""),
        meta: capitulo || g.title,
        filePath: v.filePath,
        creado: v.createdAt || "",
      });
    }
  }

  var subs = st.subtitleStyles || [];
  for (var s = 0; s < subs.length; s++) {
    out.push({
      id: subs[s].id,
      categoria: "subtitulos",
      titulo: subs[s].label,
      meta: subs[s].filePath.split(".").pop().toUpperCase(),
      filePath: subs[s].filePath,
      // Para previsualizar en el panel: el .mov con alfa no se puede pintar
      // en Chromium, pero su previewPath (mp4) sí.
      preview: subs[s].previewPath || null,
      creado: subs[s].createdAt || "",
    });
  }

  out.sort(function (a, b) {
    return a.creado < b.creado ? 1 : -1;
  });
  return out;
}

/**
 * Agrupa los `visuals` de cada guion en una "carpeta" — la vista que pidió
 * el usuario para no tener que buscar entre todos los recursos mezclados:
 * un guion, sus recursos, y si tiene AnclaTemporal (ver types.ts), el
 * tiempo exacto donde va cada uno según el SRT del vídeo ya grabado.
 *
 * A diferencia de aplanarRecursos(), aquí NO se mezclan subtitleStyles (son
 * de canal, no de guion concreto — no tienen "carpeta" a la que pertenecer)
 * ni se filtra por categoría: una carpeta de guion enseña TODOS sus
 * recursos juntos, sea cual sea su tipo.
 */
function agruparPorGuion(st) {
  var guiones = st.scripts || [];
  var out = [];
  for (var i = 0; i < guiones.length; i++) {
    var g = guiones[i];
    var visuals = g.visuals || [];
    if (!visuals.length) continue;

    var anclasPorRecurso = {};
    var anclas = g.anclasTemporales || [];
    for (var a = 0; a < anclas.length; a++) {
      anclasPorRecurso[anclas[a].recursoId] = anclas[a];
    }

    var items = [];
    for (var j = 0; j < visuals.length; j++) {
      var v = visuals[j];
      items.push({
        id: v.id,
        titulo: v.id.replace(/^visual_anim_/, "").replace(/^visual_/, ""),
        filePath: v.filePath,
        creado: v.createdAt || "",
        ancla: anclasPorRecurso[v.id] || null,
      });
    }
    items.sort(function (x, y) {
      // Con ancla: por tiempo, en el orden en que aparecen en el vídeo.
      // Sin ancla: al final, por fecha de creación.
      if (x.ancla && y.ancla) return x.ancla.tiempoSeg - y.ancla.tiempoSeg;
      if (x.ancla) return -1;
      if (y.ancla) return 1;
      return x.creado < y.creado ? 1 : -1;
    });

    out.push({
      guionId: g.id,
      titulo: g.title || g.id,
      tipo: g.type || "",
      items: items,
      totalAnclados: items.filter(function (it) {
        return it.ancla;
      }).length,
    });
  }
  out.sort(function (a, b) {
    return a.titulo < b.titulo ? -1 : 1;
  });
  return out;
}

function cargar() {
  decir("Conectando con el estudio…");
  $("#conexion").className = "aviso oculto";

  return Promise.all([
    fetch(API + "/api/system/paths").then(function (r) {
      return r.json();
    }),
    fetch(API + "/api/db/state").then(function (r) {
      return r.json();
    }),
  ])
    .then(function (res) {
      estado.mediaRoot = res[0].mediaRoot;
      estado.separador = res[0].separator || "\\";
      estado.estudioCompleto = res[1].state || {};
      estado.recursos = aplanarRecursos(estado.estudioCompleto);

      if (!estado.categoriaActiva) {
        // Arranca en la primera categoría que tenga algo, para no abrir en vacío.
        for (var i = 0; i < CATEGORIAS.length; i++) {
          if (contar(CATEGORIAS[i].id) > 0) {
            estado.categoriaActiva = CATEGORIAS[i].id;
            break;
          }
        }
        if (!estado.categoriaActiva) estado.categoriaActiva = CATEGORIAS[0].id;
      }

      pintarPestanas();
      pintarLista();
      if (estado.recursosVista === "guion") pintarGuiones();
      decir(estado.recursos.length + " recursos disponibles", "ok");
    })
    .catch(function (e) {
      $("#conexion").className = "aviso";
      $("#conexion").innerHTML =
        "No se puede conectar con System Content Studio.<br>Arranca el servidor con <code>npm run dev</code> en la carpeta del proyecto y pulsa ↻.";
      $("#lista").innerHTML = '<p class="vacio">Sin conexión con el estudio.</p>';
      decir(e.message, "error");
    });
}

function contar(categoria) {
  var n = 0;
  for (var i = 0; i < estado.recursos.length; i++) {
    if (estado.recursos[i].categoria === categoria) n++;
  }
  return n;
}

// ── Pintado ──────────────────────────────────────────────────────────────

function pintarPestanas() {
  var cont = $("#pestanas");
  cont.innerHTML = "";
  CATEGORIAS.forEach(function (cat) {
    var n = contar(cat.id);
    if (n === 0 && cat.id !== estado.categoriaActiva) return;
    var b = document.createElement("button");
    b.className = "pestana" + (cat.id === estado.categoriaActiva ? " activa" : "");
    b.textContent = cat.etiqueta + " (" + n + ")";
    b.onclick = function () {
      estado.categoriaActiva = cat.id;
      pintarPestanas();
      pintarLista();
    };
    cont.appendChild(b);
  });
}

function pintarLista() {
  var cont = $("#lista");
  cont.innerHTML = "";

  var items = estado.recursos.filter(function (r) {
    return r.categoria === estado.categoriaActiva;
  });

  if (!items.length) {
    cont.innerHTML = '<p class="vacio">Nada en esta categoría todavía.</p>';
    return;
  }

  items.forEach(function (r) {
    var fila = document.createElement("div");
    fila.className = "fila";

    var previewRel = r.preview || r.filePath;
    if (esVideo(previewRel) || esImagen(previewRel)) {
      var mini;
      if (esVideo(previewRel)) {
        mini = document.createElement("video");
        mini.muted = true;
        mini.loop = true;
        mini.autoplay = true;
        mini.playsInline = true;
      } else {
        mini = document.createElement("img");
      }
      mini.className = "miniatura";
      mini.src = API + "/api/media/" + previewRel;
      fila.appendChild(mini);
    }

    var info = document.createElement("div");
    info.className = "info";
    var t = document.createElement("div");
    t.className = "titulo";
    t.textContent = r.titulo;
    var m = document.createElement("div");
    m.className = "meta";
    m.textContent = r.meta;
    info.appendChild(t);
    info.appendChild(m);
    fila.appendChild(info);

    var acciones = document.createElement("div");
    acciones.className = "acciones";

    var bImportar = document.createElement("button");
    bImportar.className = "btn";
    bImportar.textContent = "Importar";
    bImportar.title = "Solo al bin del proyecto, sin tocar el timeline";
    bImportar.onclick = function () {
      importar([r]);
    };
    acciones.appendChild(bImportar);

    // Insertar en el timeline solo tiene sentido para vídeo/imagen; un .ass
    // es un archivo de texto y Premiere ni siquiera lo importa.
    if (esVideo(r.filePath) || esImagen(r.filePath)) {
      var bInsertar = document.createElement("button");
      bInsertar.className = "btn primario";
      bInsertar.textContent = "Insertar";
      bInsertar.title = "Importa y coloca en la pista elegida, en el cursor";
      bInsertar.onclick = function () {
        insertar(r);
      };
      acciones.appendChild(bInsertar);
    }

    fila.appendChild(acciones);
    cont.appendChild(fila);
  });
}

function pintarPistas() {
  var sel = $("#pista");
  sel.innerHTML = "";
  if (!estado.pistas) {
    var o = document.createElement("option");
    o.textContent = "sin secuencia abierta";
    o.value = "-1";
    sel.appendChild(o);
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  // Se listan de arriba abajo (V3, V2, V1): un overlay casi siempre va a la
  // pista más alta, así que es la que conviene tener a mano primero.
  for (var i = estado.pistas - 1; i >= 0; i--) {
    var opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = "V" + (i + 1);
    sel.appendChild(opt);
  }
}

// ── Acciones ─────────────────────────────────────────────────────────────

function importar(recursos) {
  var rutas = recursos.map(function (r) {
    return rutaAbsoluta(r.filePath);
  });
  decir("Importando…");
  llamarHost("sccImportar", [JSON.stringify(rutas), "System Content Studio"])
    .then(function (d) {
      var msg = d.importados + " importado(s) en el bin “" + d.bin + "”";
      if (d.noEncontrados > 0) msg += " · " + d.noEncontrados + " sin archivo en disco";
      decir(msg, "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

function insertar(recurso) {
  var pista = parseInt($("#pista").value, 10);
  if (isNaN(pista) || pista < 0) {
    decir("Abre una secuencia en el timeline primero.", "error");
    return;
  }
  decir("Insertando en V" + (pista + 1) + "…");
  llamarHost("sccInsertarEnSecuencia", [rutaAbsoluta(recurso.filePath), pista])
    .then(function (d) {
      decir("“" + d.clip + "” insertado en V" + d.pista, "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

function refrescarPistas() {
  return llamarHost("sccPistas", [])
    .then(function (d) {
      estado.pistas = d.pistas || 0;
      pintarPistas();
    })
    .catch(function () {
      estado.pistas = 0;
      pintarPistas();
    });
}

// ── Ajustes (servidor local o remoto) ───────────────────────────────────

function pintarAjustes() {
  var preset = $("#apiPreset");
  var input = $("#apiUrl");
  var coincide = false;
  for (var i = 0; i < preset.options.length; i++) {
    if (preset.options[i].value === API) {
      coincide = true;
      break;
    }
  }
  preset.value = coincide ? API : "custom";
  input.value = API;
  input.classList.toggle("oculto", coincide);
}

function fijarApi(url) {
  if (!url || url === API) return;
  API = url.replace(/\/+$/, "");
  localStorage.setItem("scc_api_url", API);
  cargar();
  refrescarPistas();
}

$("#ajustesBtn").onclick = function () {
  var panel = $("#ajustes");
  panel.classList.toggle("oculto");
  $("#ajustesBtn").classList.toggle("activo", !panel.classList.contains("oculto"));
};
$("#apiPreset").onchange = function () {
  var v = this.value;
  $("#apiUrl").classList.toggle("oculto", v !== "custom");
  if (v !== "custom") fijarApi(v);
};
$("#apiUrl").onchange = function () {
  fijarApi(this.value.trim());
};
pintarAjustes();

// ── Vistas (Recursos / Transcribir) ─────────────────────────────────────

var botonesVista = document.querySelectorAll(".vista-btn");
for (var vi = 0; vi < botonesVista.length; vi++) {
  botonesVista[vi].onclick = function () {
    estado.vista = this.getAttribute("data-vista");
    for (var j = 0; j < botonesVista.length; j++) {
      botonesVista[j].classList.toggle("activa", botonesVista[j] === this);
    }
    $("#vistaRecursos").classList.toggle("oculto", estado.vista !== "recursos");
    $("#vistaSilencios").classList.toggle("oculto", estado.vista !== "silencios");
    $("#vistaTranscribir").classList.toggle("oculto", estado.vista !== "transcribir");
  };
}

// ── Recursos por guion ───────────────────────────────────────────────────
//
// "Por categoría" (aplanarRecursos, de siempre) mezcla todo sin importar de
// qué vídeo viene. "Por guion" (agruparPorGuion) es la vista que pidió el
// usuario: una carpeta por vídeo, con sus recursos — y si el guion tiene
// AnclaTemporal (viene de /api/ai/anclas/generar, guardadas desde la web
// tras revisarlas), cada recurso ya sabe EN QUÉ SEGUNDO va, así que
// "Insertar todo" coloca todo el guion de una vez, sincronizado, en vez de
// arrastrar recurso a recurso a mano.

var botonesSubvista = document.querySelectorAll(".subvista-btn");
for (var si = 0; si < botonesSubvista.length; si++) {
  botonesSubvista[si].onclick = function () {
    estado.recursosVista = this.getAttribute("data-subvista");
    for (var j = 0; j < botonesSubvista.length; j++) {
      botonesSubvista[j].classList.toggle("activa", botonesSubvista[j] === this);
    }
    $("#pestanas").classList.toggle("oculto", estado.recursosVista !== "categoria");
    $("#lista").classList.toggle("oculto", estado.recursosVista !== "categoria");
    $("#listaGuiones").classList.toggle("oculto", estado.recursosVista !== "guion");
    $("#listaExternos").classList.toggle("oculto", estado.recursosVista !== "externos");
    if (estado.recursosVista === "guion") pintarGuiones();
    if (estado.recursosVista === "externos") cargarExternos();
  };
}

// ── Recursos externos ────────────────────────────────────────────────────
//
// El kit de LUTs/SFX/overlays/presets/fuentes que el usuario descargó y
// extrajo en local (data/recursos-externos/, nunca en git — 35 GB). Se lee
// de /api/system/recursos-externos, no de /api/db/state: no es contenido
// generado por el estudio, es una carpeta fija en disco. Árbol plegable
// porque son 2000+ archivos — una lista plana sería inservible.

var externosCargados = null; // cache: no volver a pedir el árbol cada vez que se cambia de subvista

function cargarExternos() {
  if (externosCargados) {
    pintarExternos(externosCargados);
    return;
  }
  $("#listaExternos").innerHTML = '<p class="vacio">Leyendo data/recursos-externos…</p>';
  fetch(API + "/api/system/recursos-externos")
    .then(function (r) {
      return r.json();
    })
    .then(function (d) {
      if (!d.existe) {
        $("#listaExternos").innerHTML =
          '<p class="vacio">No existe data/recursos-externos todavía — pásame el kit y lo extraigo ahí.</p>';
        return;
      }
      externosCargados = d.arbol;
      estado.recursosExternosRoot = d.raiz;
      pintarExternos(externosCargados);
    })
    .catch(function (e) {
      $("#listaExternos").innerHTML = '<p class="vacio">Error leyendo recursos externos: ' + e.message + "</p>";
    });
}

function formatoBytes(n) {
  if (!n) return "0 B";
  var u = ["B", "KB", "MB", "GB"];
  var i = 0;
  while (n >= 1024 && i < u.length - 1) {
    n /= 1024;
    i++;
  }
  return n.toFixed(n >= 10 || i === 0 ? 0 : 1) + " " + u[i];
}

/** Solo estas extensiones tienen sentido para Importar/Insertar en Premiere — el resto (LUTs, presets, fuentes) se enseña, pero sin botones que fallarían. */
function esImportablePremiere(nombre) {
  return /\.(mp4|mov|webm|mp3|wav|aac|m4a|png|jpe?g|webp|gif)$/i.test(nombre);
}

function pintarExternos(arbol) {
  var cont = $("#listaExternos");
  cont.innerHTML = "";
  if (!arbol.length) {
    cont.innerHTML = '<p class="vacio">La carpeta está vacía.</p>';
    return;
  }
  arbol.forEach(function (nodo) {
    cont.appendChild(nodoExterno(nodo, 0));
  });
}

function nodoExterno(nodo, profundidad) {
  if (nodo.tipo === "archivo") {
    var fila = document.createElement("div");
    fila.className = "guion-item";
    fila.style.paddingLeft = 10 + profundidad * 12 + "px";

    var info = document.createElement("div");
    info.className = "guion-item-info";
    var t = document.createElement("div");
    t.className = "guion-item-titulo";
    t.textContent = nodo.nombre;
    info.appendChild(t);
    var meta = document.createElement("div");
    meta.className = "guion-item-sin-ancla";
    meta.textContent = formatoBytes(nodo.tamanoBytes);
    info.appendChild(meta);
    fila.appendChild(info);

    if (esImportablePremiere(nodo.nombre)) {
      var bImportar = document.createElement("button");
      bImportar.className = "btn";
      bImportar.textContent = "Importar";
      bImportar.onclick = function () {
        importarExterno(nodo);
      };
      fila.appendChild(bImportar);

      if (esVideo(nodo.nombre) || esImagen(nodo.nombre)) {
        var bInsertar = document.createElement("button");
        bInsertar.className = "btn primario";
        bInsertar.textContent = "Insertar";
        bInsertar.onclick = function () {
          insertarExterno(nodo);
        };
        fila.appendChild(bInsertar);
      }
    }
    return fila;
  }

  // Carpeta: cabecera plegable + hijos, igual patrón que pintarGuiones().
  var carpeta = document.createElement("div");
  carpeta.className = "guion";
  carpeta.style.marginLeft = profundidad * 6 + "px";

  var cabecera = document.createElement("div");
  cabecera.className = "guion-cabecera";
  var titulo = document.createElement("div");
  titulo.className = "guion-titulo";
  titulo.textContent = nodo.nombre;
  var meta = document.createElement("div");
  meta.className = "guion-meta";
  meta.textContent = (nodo.totalArchivos || 0) + " archivo(s)";
  cabecera.appendChild(titulo);
  cabecera.appendChild(meta);

  var cuerpo = document.createElement("div");
  cuerpo.className = "guion-cuerpo oculto";
  (nodo.hijos || []).forEach(function (hijo) {
    cuerpo.appendChild(nodoExterno(hijo, profundidad + 1));
  });

  cabecera.onclick = (function (c) {
    return function () {
      c.classList.toggle("oculto");
    };
  })(cuerpo);

  carpeta.appendChild(cabecera);
  carpeta.appendChild(cuerpo);
  return carpeta;
}

/** Ruta absoluta de disco de un recurso externo — data/recursos-externos ya vive fuera de data/media, así que no vale rutaAbsoluta(). */
function rutaExternaAbsoluta(nodo) {
  var raiz = estado.recursosExternosRoot;
  if (!raiz) return null;
  var rel = estado.separador === "\\" ? nodo.rutaRelativa.replace(/\//g, "\\") : nodo.rutaRelativa;
  return raiz + estado.separador + rel;
}

function importarExterno(nodo) {
  var ruta = rutaExternaAbsoluta(nodo);
  if (!ruta) return;
  decir("Importando " + nodo.nombre + "…");
  llamarHost("sccImportar", [JSON.stringify([ruta]), "Recursos externos"])
    .then(function (d) {
      decir(d.importados + " importado(s) en el bin “" + d.bin + "”", "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

function insertarExterno(nodo) {
  var ruta = rutaExternaAbsoluta(nodo);
  if (!ruta) return;
  var pista = parseInt($("#pista").value, 10);
  if (isNaN(pista) || pista < 0) {
    decir("Abre una secuencia en el timeline primero.", "error");
    return;
  }
  decir("Insertando " + nodo.nombre + "…");
  llamarHost("sccInsertarEnSecuencia", [ruta, pista])
    .then(function (d) {
      decir("“" + d.clip + "” insertado en V" + d.pista, "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

function pintarGuiones() {
  var cont = $("#listaGuiones");
  cont.innerHTML = "";

  var guiones = agruparPorGuion(estado.estudioCompleto || {});
  if (!guiones.length) {
    cont.innerHTML = '<p class="vacio">Ningún guion tiene recursos generados todavía.</p>';
    return;
  }

  guiones.forEach(function (g) {
    var carpeta = document.createElement("div");
    carpeta.className = "guion";

    var cabecera = document.createElement("div");
    cabecera.className = "guion-cabecera";
    var titulo = document.createElement("div");
    titulo.className = "guion-titulo";
    titulo.textContent = g.titulo;
    var meta = document.createElement("div");
    meta.className = "guion-meta";
    meta.textContent = g.items.length + " recurso(s)" + (g.totalAnclados ? " · " + g.totalAnclados + " con tiempo" : "");
    cabecera.appendChild(titulo);
    cabecera.appendChild(meta);

    var cuerpo = document.createElement("div");
    cuerpo.className = "guion-cuerpo oculto";

    if (g.totalAnclados > 0) {
      var bTodo = document.createElement("button");
      bTodo.className = "btn primario ancho";
      bTodo.textContent = "Insertar todo (" + g.totalAnclados + " en su tiempo)";
      bTodo.style.marginBottom = "8px";
      bTodo.onclick = (function (guionCerrado) {
        return function () {
          insertarGuionCompleto(guionCerrado);
        };
      })(g);
      cuerpo.appendChild(bTodo);
    }

    g.items.forEach(function (it) {
      var fila = document.createElement("div");
      fila.className = "guion-item";

      var info = document.createElement("div");
      info.className = "guion-item-info";
      var t = document.createElement("div");
      t.className = "guion-item-titulo";
      t.textContent = it.titulo;
      info.appendChild(t);
      if (it.ancla) {
        var tiempo = document.createElement("div");
        tiempo.className = "guion-item-tiempo";
        tiempo.textContent = formatoSeg(it.ancla.tiempoSeg) + " — “" + it.ancla.palabra + "”";
        info.appendChild(tiempo);
      } else {
        var sinAncla = document.createElement("div");
        sinAncla.className = "guion-item-sin-ancla";
        sinAncla.textContent = "sin tiempo asignado";
        info.appendChild(sinAncla);
      }
      fila.appendChild(info);

      var bInsertar = document.createElement("button");
      bInsertar.className = "btn";
      bInsertar.textContent = "Insertar";
      bInsertar.onclick = (function (item) {
        return function () {
          insertarItemDeGuion(item);
        };
      })(it);
      fila.appendChild(bInsertar);

      cuerpo.appendChild(fila);
    });

    cabecera.onclick = (function (c) {
      return function () {
        c.classList.toggle("oculto");
      };
    })(cuerpo);

    carpeta.appendChild(cabecera);
    carpeta.appendChild(cuerpo);
    cont.appendChild(carpeta);
  });
}

/** Un solo recurso: con ancla, en su tiempo; sin ancla, en el cursor como siempre. */
function insertarItemDeGuion(it) {
  var pista = parseInt($("#pista").value, 10);
  if (isNaN(pista) || pista < 0) {
    decir("Abre una secuencia en el timeline primero.", "error");
    return;
  }
  if (it.ancla) {
    decir("Insertando “" + it.titulo + "” en " + formatoSeg(it.ancla.tiempoSeg) + "…");
    llamarHost("sccInsertarEnTiempo", [rutaAbsoluta(it.filePath), pista, it.ancla.tiempoSeg])
      .then(function (d) {
        decir("“" + d.clip + "” insertado en V" + d.pista + " en " + formatoSeg(it.ancla.tiempoSeg), "ok");
      })
      .catch(function (e) {
        decir(e.message, "error");
      });
  } else {
    insertar({ filePath: it.filePath });
  }
}

/** Todo lo anclado de un guion, de una sola llamada — sccInsertarLoteEnSecuencia. */
function insertarGuionCompleto(g) {
  var pista = parseInt($("#pista").value, 10);
  if (isNaN(pista) || pista < 0) {
    decir("Abre una secuencia en el timeline primero.", "error");
    return;
  }
  var anclados = g.items.filter(function (it) {
    return it.ancla;
  });
  if (!anclados.length) return;

  var lote = anclados.map(function (it) {
    return { ruta: rutaAbsoluta(it.filePath), pista: pista, tiempoSeg: it.ancla.tiempoSeg };
  });

  decir("Insertando " + lote.length + " recurso(s) de “" + g.titulo + "”…");
  llamarHost("sccInsertarLoteEnSecuencia", [JSON.stringify(lote)])
    .then(function (d) {
      var msg = d.insertados + " de " + d.total + " insertado(s).";
      if (d.fallidos > 0) msg += " " + d.fallidos + " fallaron: " + d.primerError;
      decir(msg, d.fallidos > 0 ? "error" : "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

// ── Silencios ────────────────────────────────────────────────────────────
//
// Tres pasos: elegir clip → detectar (llama a /api/ai/silencios/detectar,
// que analiza el ARCHIVO de origen con ffmpeg — no toca Premiere) → revisar
// y aplicar (llama a sccRecortarSilencios, que sí edita la secuencia, y solo
// tras pulsar el botón). Los tiempos que devuelve la detección son del
// archivo de origen; se convierten a tiempo de SECUENCIA con
// clipStartSeg + (tiempoArchivo - clipInPointSeg) antes de mandarlos a
// ExtendScript, porque en el timeline lo único que importa es dónde cae ese
// silencio en la secuencia, no en el archivo.

function formatoSeg(s) {
  return s.toFixed(2) + "s";
}

$("#usarClipSilencios").onclick = function () {
  llamarHost("sccClipPrincipal", [])
    .then(function (d) {
      estado.archivoSilencios = {
        ruta: d.ruta,
        nombre: d.nombre,
        pista: d.pista,
        clipStartSeg: d.clipStartSeg,
        clipInPointSeg: d.clipInPointSeg,
      };
      $("#archivoSilencios").textContent = d.nombre + " (pista V" + (d.pista + 1) + ")";
      $("#detectarBtn").disabled = false;
      $("#silenciosResultado").classList.add("oculto");
      estado.silenciosDetectados = null;
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
};

$("#detectarBtn").onclick = function () {
  if (!estado.archivoSilencios) return;
  $("#detectarBtn").disabled = true;
  $("#silenciosResultado").classList.add("oculto");
  decir("Analizando el audio de " + estado.archivoSilencios.nombre + "…");

  fetch(API + "/api/ai/silencios/detectar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ localPath: estado.archivoSilencios.ruta }),
  })
    .then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Fallo al detectar silencios.");
        return j;
      });
    })
    .then(function (res) {
      estado.silenciosDetectados = res.silencios;
      pintarSilencios(res.silencios);
      if (!res.silencios.length) {
        decir("No se ha detectado ningún silencio con el umbral por defecto.", "ok");
        return;
      }
      $("#silenciosResumen").textContent =
        res.total + " silencio(s) detectados — " + formatoSeg(res.ahorroSeg) + " recortables en total.";
      $("#silenciosResultado").classList.remove("oculto");
      decir(res.total + " silencio(s) encontrados. Revisa la lista antes de aplicar.", "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    })
    .finally(function () {
      $("#detectarBtn").disabled = false;
    });
};

function pintarSilencios(silencios) {
  var cont = $("#silenciosLista");
  cont.innerHTML = "";
  silencios.forEach(function (s, i) {
    var fila = document.createElement("label");
    fila.className = "silencio-fila";
    var check = document.createElement("input");
    check.type = "checkbox";
    check.checked = true;
    check.dataset.indice = String(i);
    var texto = document.createElement("span");
    texto.textContent = formatoSeg(s.inicioSeg) + " → " + formatoSeg(s.finSeg) + " (" + formatoSeg(s.duracionSeg) + ")";
    fila.appendChild(check);
    fila.appendChild(texto);
    cont.appendChild(fila);
  });
}

$("#aplicarRecorteBtn").onclick = function () {
  if (!estado.archivoSilencios || !estado.silenciosDetectados) return;

  var marcados = Array.prototype.slice
    .call(document.querySelectorAll("#silenciosLista input:checked"))
    .map(function (chk) {
      return estado.silenciosDetectados[parseInt(chk.dataset.indice, 10)];
    });

  if (!marcados.length) {
    decir("No hay ningún silencio marcado para recortar.", "error");
    return;
  }

  var origen = estado.archivoSilencios;
  var rangosSecuencia = marcados.map(function (s) {
    return {
      inicioSeg: origen.clipStartSeg + (s.inicioSeg - origen.clipInPointSeg),
      finSeg: origen.clipStartSeg + (s.finSeg - origen.clipInPointSeg),
    };
  });

  $("#aplicarRecorteBtn").disabled = true;
  decir("Recortando " + rangosSecuencia.length + " silencio(s) en la secuencia…");

  llamarHost("sccRecortarSilencios", [origen.pista, JSON.stringify(rangosSecuencia)])
    .then(function (d) {
      var msg = "Vídeo: " + d.cortados + " de " + d.total + " recortado(s).";
      if (d.tuvoAudio) msg += " Audio: " + d.cortadosAudio + " de " + d.total + ".";
      else msg += " (sin pista de audio emparejada — no se ha tocado audio)";
      if (d.fallidos > 0) {
        msg += " " + d.fallidos + " intento(s) fallaron";
        if (d.primerError) msg += ": " + d.primerError;
      }
      decir(msg, d.fallidos > 0 ? "error" : "ok");
      // El log de los primeros rangos va en su propio bloque seleccionable
      // (no en el pie de estado, que se corta a una línea) — así se puede
      // copiar y pegar tal cual para reportar un fallo.
      if (d.log) {
        $("#silenciosLog").textContent = d.log.split(" | ").join("\n");
        $("#silenciosLog").classList.remove("oculto");
      } else {
        // Sin log que enseñar (todo ok o nada que reportar): sí se puede
        // ocultar el bloque de resultado, como antes.
        $("#silenciosResultado").classList.add("oculto");
      }
      estado.silenciosDetectados = null;
    })
    .catch(function (e) {
      decir(e.message, "error");
    })
    .finally(function () {
      $("#aplicarRecorteBtn").disabled = false;
    });
};

// ── Transcribir ──────────────────────────────────────────────────────────
//
// Tres pasos encadenados, cada uno habilita el siguiente: elegir archivo →
// transcribir (llama a /api/ai/subtitulos/transcribir con la ruta local,
// el servidor lee el archivo él mismo) → generar (agrupa en líneas y
// renderiza con el estilo elegido, /api/ai/subtitulos/render). El botón
// "Transcribir y generar" hace los dos últimos pasos de una vez porque
// separarlos en dos clics no aporta nada — nadie transcribe sin intención
// de generar el subtítulo.

/**
 * "El vídeo principal": el clip bajo el cursor de reproducción en la
 * secuencia activa (host/sccClipPrincipal). Guarda también en qué pista
 * estaba, porque es lo que decide dónde se inserta solo el resultado — una
 * pista por encima, sin preguntar. `sccElegirArchivo` (un archivo suelto,
 * sin relación con el timeline) nunca inserta solo: ahí no hay "una pista
 * por encima de qué" que tenga sentido.
 */
$("#usarClipPrincipal").onclick = function () {
  llamarHost("sccClipPrincipal", [])
    .then(function (d) {
      estado.archivoElegido = { ruta: d.ruta, nombre: d.nombre, pistaOrigen: d.pista, totalPistas: d.totalPistas };
      $("#archivoElegido").textContent = d.nombre + " (pista V" + (d.pista + 1) + ")";
      $("#transcribirBtn").disabled = false;
      $("#previewBloque").classList.add("oculto");
      $("#transcribirResultado").classList.add("oculto");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
};

$("#elegirArchivo").onclick = function () {
  llamarHost("sccElegirArchivo", [])
    .then(function (d) {
      if (!d.ruta) return; // cancelado
      estado.archivoElegido = { ruta: d.ruta, nombre: d.nombre, pistaOrigen: null };
      $("#archivoElegido").textContent = d.nombre;
      $("#transcribirBtn").disabled = false;
      $("#previewBloque").classList.add("oculto");
      $("#transcribirResultado").classList.add("oculto");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
};

function subirBase(nombre) {
  // El nombre del archivo local va tal cual a la API — es solo para que
  // Whisper sepa la extensión, no se usa como ruta.
  return nombre;
}

function clavesElegidas() {
  return $("#clavesInput")
    .value.split(",")
    .map(function (s) {
      return s.trim();
    })
    .filter(Boolean);
}

// ── Preview en vivo ─────────────────────────────────────────────────────
//
// El iframe carga /premiere-preview/subtitulos (una página aparte de la web,
// ver ese archivo) y le manda las líneas + el estilo elegido por
// postMessage. Cambiar de estilo en #estiloSelect NO vuelve a llamar al
// servidor: solo reenvía el mismo mensaje con el estiloId nuevo, y
// @remotion/player repinta en el propio navegador del panel. El render
// pesado (con canal alfa) solo se dispara al pulsar "Generar archivo final".
var previewListo = false;

function mandarDatosAlPreview() {
  if (!estado.lineas || !previewListo) return;
  var frame = $("#previewFrame");
  if (!frame.contentWindow) return;
  frame.contentWindow.postMessage(
    { type: "scc-datos", lineas: estado.lineas, estiloId: $("#estiloSelect").value },
    API
  );
}

window.addEventListener("message", function (e) {
  if (e.data && e.data.type === "scc-preview-listo") {
    previewListo = true;
    mandarDatosAlPreview();
  }
});

$("#estiloSelect").onchange = function () {
  mandarDatosAlPreview();
};

$("#transcribirBtn").onclick = function () {
  if (!estado.archivoElegido) return;
  var claves = clavesElegidas();

  $("#transcribirBtn").disabled = true;
  $("#previewBloque").classList.add("oculto");
  $("#transcribirResultado").classList.add("oculto");
  decir("Transcribiendo " + estado.archivoElegido.nombre + "…");

  fetch(API + "/api/ai/subtitulos/transcribir", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fileName: subirBase(estado.archivoElegido.nombre),
      localPath: estado.archivoElegido.ruta,
    }),
  })
    .then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Fallo al transcribir.");
        return j;
      });
    })
    .then(function (t) {
      estado.transcripcion = t;
      decir("Transcrito (" + t.palabras.length + " palabras). Agrupando líneas…");
      return fetch(API + "/api/ai/subtitulos/preparar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcriptPath: t.filePath, claves: claves }),
      });
    })
    .then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Fallo al agrupar la transcripción.");
        return j;
      });
    })
    .then(function (l) {
      estado.lineas = l.lineas;
      previewListo = false;
      $("#previewBloque").classList.remove("oculto");
      // Recargar el iframe (en vez de reenviar sobre uno ya cargado) evita
      // arrastrar el estado de un preview anterior si se transcribe un
      // segundo clip sin recargar el panel entero. El "?t=" fuerza la
      // recarga aunque la URL base ya fuera la misma de antes.
      $("#previewFrame").src = API + "/premiere-preview/subtitulos?t=" + Date.now();
      decir(l.lineas.length + " línea(s) — elige estilo y pulsa generar cuando estés conforme.", "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    })
    .finally(function () {
      $("#transcribirBtn").disabled = false;
    });
};

$("#generarBtn").onclick = function () {
  if (!estado.transcripcion || !estado.archivoElegido) return;
  var claves = clavesElegidas();
  var estiloId = $("#estiloSelect").value;

  $("#generarBtn").disabled = true;
  $("#transcribirResultado").classList.add("oculto");
  decir("Generando el vídeo final (con canal alfa)…");

  fetch(API + "/api/ai/subtitulos/render", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcriptPath: estado.transcripcion.filePath, estiloId: estiloId, claves: claves }),
  })
    .then(function (r) {
      return r.json().then(function (j) {
        if (!r.ok) throw new Error(j.error || "Fallo al renderizar.");
        return j;
      });
    })
    .then(function (res) {
      estado.generado = res;
      $("#resultadoPreview").src = API + "/api/media/" + res.previewPath;
      $("#transcribirResultado").classList.remove("oculto");

      // Solo se inserta solo cuando el origen fue "el clip bajo el cursor":
      // ahí SÍ hay una pista de la que "una encima" tiene sentido. Un
      // archivo suelto (elegido a mano) no viene de ningún sitio del
      // timeline, así que se queda esperando el clic de Importar/Insertar
      // como antes.
      if (estado.archivoElegido && estado.archivoElegido.pistaOrigen != null) {
        var origen = estado.archivoElegido;
        var pistaDestino = Math.min(origen.pistaOrigen + 1, origen.totalPistas - 1);
        var mismaQueOrigen = pistaDestino === origen.pistaOrigen;
        decir(res.lineas + " línea(s) generadas — insertando en V" + (pistaDestino + 1) + "…");
        insertarEnPista(estado.generado.filePath, pistaDestino).then(function () {
          if (mismaQueOrigen) {
            decir(
              "Insertado en V" + (pistaDestino + 1) + " — no había pista libre encima, añade una si lo quieres como overlay.",
              "ok"
            );
          }
        });
      } else {
        decir(res.lineas + " línea(s) generadas", "ok");
      }
    })
    .catch(function (e) {
      decir(e.message, "error");
    })
    .finally(function () {
      $("#generarBtn").disabled = false;
    });
};

/** Inserta un archivo en una pista concreta sin pasar por el selector "Insertar en" de la vista Recursos. */
function insertarEnPista(filePath, pista) {
  return llamarHost("sccInsertarEnSecuencia", [rutaAbsoluta(filePath), pista])
    .then(function (d) {
      decir("“" + d.clip + "” insertado en V" + d.pista, "ok");
    })
    .catch(function (e) {
      decir(e.message, "error");
    });
}

$("#resultadoImportar").onclick = function () {
  if (!estado.generado) return;
  importar([{ filePath: estado.generado.filePath }]);
};
$("#resultadoInsertar").onclick = function () {
  if (!estado.generado) return;
  insertar({ filePath: estado.generado.filePath });
};

// ── Arranque ─────────────────────────────────────────────────────────────

$("#recargar").onclick = function () {
  cargar();
  refrescarPistas();
};

// Premiere no avisa al panel de que has abierto otra secuencia, así que se
// vuelve a mirar cada pocos segundos. Es barato (una llamada que solo cuenta
// pistas) y evita que el selector se quede desfasado sin que se note.
setInterval(refrescarPistas, 4000);

cargar();
refrescarPistas();
