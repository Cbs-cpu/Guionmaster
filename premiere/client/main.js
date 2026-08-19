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

var API = "http://localhost:3000";
var cs = new CSInterface();

var estado = {
  mediaRoot: null,
  separador: "\\",
  recursos: [],
  categoriaActiva: null,
  pistas: 0,
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
      estado.recursos = aplanarRecursos(res[1].state || {});

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
