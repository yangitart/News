/* =========================================================================
   VitaCora — lógica de la web (vanilla JS, sin dependencias)
   Este archivo lee los datos de data.js y dibuja el contenido en las
   tres páginas (index, repositorio, entrada). No necesitas tocar este
   archivo para publicar entradas nuevas: eso se hace en data.js.
   ========================================================================= */

(function () {
  "use strict";

  /* ---------------- utilidades de fecha ---------------- */

  function parseFecha(iso) {
    // "2026-06-25" -> Date local, evitando el corrimiento de zona horaria
    var partes = iso.split("-").map(Number);
    return new Date(partes[0], partes[1] - 1, partes[2]);
  }

  function formatFechaLarga(iso) {
    var d = parseFecha(iso);
    return d.toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }

  function formatFechaCorta(iso) {
    var d = parseFecha(iso);
    var s = d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
    return s.replace(".", "").toUpperCase();
  }

  function claveAnioMes(iso) {
    return iso.slice(0, 7); // "2026-06"
  }

  function nombreMes(claveYM) {
    var partes = claveYM.split("-").map(Number);
    var d = new Date(partes[0], partes[1] - 1, 1);
    var nombre = d.toLocaleDateString("es-ES", { month: "long" });
    return nombre.charAt(0).toUpperCase() + nombre.slice(1);
  }

  /* ---------------- utilidades de datos ---------------- */

  function todasOrdenadas() {
    return NOTICIAS.slice().sort(function (a, b) {
      return b.fecha.localeCompare(a.fecha);
    });
  }

  function temaInfo(slug) {
    return TEMAS[slug] || { label: slug, color: "#777" };
  }

  function tagHTML(slug) {
    var t = temaInfo(slug);
    return '<span class="tag" style="background:' + t.color + '">' + t.label + "</span>";
  }

  function escapeHTML(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  /* ---------------- tarjetas ---------------- */

  function entryCardHTML(n) {
    return (
      '<article class="entry-card">' +
        '<div class="entry-card__meta">' +
          '<span class="entry-card__number">N\u00ba ' + n.id + "</span>" +
          "<span>" + formatFechaCorta(n.fecha) + "</span>" +
        "</div>" +
        tagHTML(n.tema) +
        '<h3 class="entry-card__title"><a href="entrada.html?id=' + encodeURIComponent(n.id) + '">' + escapeHTML(n.titulo) + "</a></h3>" +
        '<p class="entry-card__excerpt">' + escapeHTML(n.resumen) + "</p>" +
        '<a class="entry-card__link" href="entrada.html?id=' + encodeURIComponent(n.id) + '">Leer entrada \u2192</a>' +
      "</article>"
    );
  }

  /* ---------------- navegación (hamburguesa) ---------------- */

  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var abierto = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", abierto ? "true" : "false");
    });
  }

  /* ---------------- página: inicio ---------------- */

  function initInicio() {
    var feed = document.getElementById("feed-entradas");
    if (!feed) return;

    var todas = todasOrdenadas();
    var ultimas = todas.slice(0, 6);
    feed.innerHTML = ultimas.map(entryCardHTML).join("");

    var statTotal = document.getElementById("stat-total");
    var statTemas = document.getElementById("stat-temas");
    var statUltima = document.getElementById("stat-ultima");

    if (statTotal) statTotal.textContent = todas.length;
    if (statTemas) statTemas.textContent = Object.keys(TEMAS).length;
    if (statUltima && todas.length) statUltima.textContent = formatFechaCorta(todas[0].fecha);
  }

  /* ---------------- página: repositorio ---------------- */

  function initRepositorio() {
    var chipsEl = document.getElementById("repo-chips");
    var timelineEl = document.getElementById("repo-timeline");
    var resultsEl = document.getElementById("repo-results");
    var countEl = document.getElementById("repo-count");
    var searchEl = document.getElementById("repo-search-input");
    if (!chipsEl || !resultsEl) return;

    var todas = todasOrdenadas();

    var estado = { tema: null, mes: null, texto: "" };

    // --- leer estado inicial desde el hash, para que los enlaces sean compartibles ---
    (function leerHash() {
      var hash = location.hash.replace(/^#/, "");
      hash.split("&").forEach(function (par) {
        var kv = par.split("=");
        if (kv[0] === "tema" && kv[1]) estado.tema = decodeURIComponent(kv[1]);
        if (kv[0] === "mes" && kv[1]) estado.mes = decodeURIComponent(kv[1]);
      });
    })();

    function actualizarHash() {
      var partes = [];
      if (estado.tema) partes.push("tema=" + encodeURIComponent(estado.tema));
      if (estado.mes) partes.push("mes=" + encodeURIComponent(estado.mes));
      history.replaceState(null, "", partes.length ? "#" + partes.join("&") : location.pathname);
    }

    // --- chips de tema ---
    function dibujarChips() {
      var html = '<button type="button" class="chip" data-tema="" aria-pressed="' + (!estado.tema) + '">Todos</button>';
      Object.keys(TEMAS).forEach(function (slug) {
        html += '<button type="button" class="chip" data-tema="' + slug + '" aria-pressed="' + (estado.tema === slug) + '">' + TEMAS[slug].label + "</button>";
      });
      chipsEl.innerHTML = html;
      chipsEl.querySelectorAll(".chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          estado.tema = btn.getAttribute("data-tema") || null;
          dibujarChips();
          actualizarHash();
          dibujarResultados();
        });
      });
    }

    // --- línea de tiempo por año/mes ---
    function dibujarTimeline() {
      if (!timelineEl) return;
      var grupos = {}; // { "2026": { "2026-06": n, ... } }
      todas.forEach(function (n) {
        var anio = n.fecha.slice(0, 4);
        var ym = claveAnioMes(n.fecha);
        grupos[anio] = grupos[anio] || {};
        grupos[anio][ym] = (grupos[anio][ym] || 0) + 1;
      });

      var anios = Object.keys(grupos).sort().reverse();
      var html = '<button type="button" class="timeline-reset">Ver todas las fechas</button>';
      anios.forEach(function (anio) {
        html += '<div class="timeline-year">' + anio + "</div>";
        var meses = Object.keys(grupos[anio]).sort().reverse();
        meses.forEach(function (ym) {
          var activo = estado.mes === ym;
          html +=
            '<button type="button" class="timeline-month" data-mes="' + ym + '" aria-pressed="' + activo + '">' +
              "<span>" + nombreMes(ym) + "</span>" +
              '<span class="timeline-month__count">' + grupos[anio][ym] + "</span>" +
            "</button>";
        });
      });
      timelineEl.innerHTML = html;

      timelineEl.querySelector(".timeline-reset").addEventListener("click", function () {
        estado.mes = null;
        dibujarTimeline();
        actualizarHash();
        dibujarResultados();
      });
      timelineEl.querySelectorAll(".timeline-month").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var mes = btn.getAttribute("data-mes");
          estado.mes = estado.mes === mes ? null : mes;
          dibujarTimeline();
          actualizarHash();
          dibujarResultados();
        });
      });
    }

    // --- resultados filtrados ---
    function dibujarResultados() {
      var lista = todas.filter(function (n) {
        if (estado.tema && n.tema !== estado.tema) return false;
        if (estado.mes && claveAnioMes(n.fecha) !== estado.mes) return false;
        if (estado.texto) {
          var t = (n.titulo + " " + n.resumen).toLowerCase();
          if (t.indexOf(estado.texto.toLowerCase()) === -1) return false;
        }
        return true;
      });

      if (countEl) {
        countEl.textContent = lista.length === 1 ? "1 entrada encontrada" : lista.length + " entradas encontradas";
      }

      if (!lista.length) {
        resultsEl.innerHTML =
          '<div class="repo-empty"><strong>No hay entradas con estos filtros</strong>Prueba quitando el tema o la fecha seleccionada.</div>';
        return;
      }
      resultsEl.innerHTML = '<div class="feed">' + lista.map(entryCardHTML).join("") + "</div>";
    }

    if (searchEl) {
      searchEl.addEventListener("input", function () {
        estado.texto = searchEl.value;
        dibujarResultados();
      });
    }

    dibujarChips();
    dibujarTimeline();
    dibujarResultados();
  }

  /* ---------------- página: entrada individual ---------------- */

  function initEntrada() {
    var contenedor = document.getElementById("entrada-contenido");
    if (!contenedor) return;

    var params = new URLSearchParams(location.search);
    var id = params.get("id");
    var todas = todasOrdenadas();
    var noticia = todas.find(function (n) { return n.id === id; });

    if (!noticia) {
      document.getElementById("entrada-titulo-pagina") && (document.title = "Entrada no encontrada \u00b7 VitaCora");
      contenedor.innerHTML =
        '<div class="entry-paper">' +
          '<div class="repo-empty">' +
            '<strong>No encontramos esta entrada</strong>' +
            "Puede que el enlace esté incompleto o que la entrada se haya movido." +
          "</div>" +
          '<p style="margin-top:1.5rem"><a class="btn btn--ghost" href="repositorio.html">\u2190 Volver al repositorio</a></p>' +
        "</div>";
      return;
    }

    document.title = noticia.titulo + " \u00b7 VitaCora";

    var index = todas.indexOf(noticia);
    var siguiente = todas[index - 1]; // más reciente
    var anterior = todas[index + 1];  // más antigua

    function navItem(n, etiqueta, clase) {
      if (!n) return "";
      return (
        '<a class="entry-nav__item ' + clase + '" href="entrada.html?id=' + encodeURIComponent(n.id) + '">' +
          '<span class="entry-nav__label">' + etiqueta + "</span>" +
          '<span class="entry-nav__title">' + escapeHTML(n.titulo) + "</span>" +
        "</a>"
      );
    }

    contenedor.innerHTML =
      '<a class="entry-back" href="repositorio.html">\u2190 Volver al repositorio</a>' +
      '<header class="entry-header">' +
        '<div class="entry-header__meta">' +
          tagHTML(noticia.tema) +
          '<span class="entry-header__date">N\u00ba ' + noticia.id + " \u00b7 " + formatFechaLarga(noticia.fecha) + "</span>" +
        "</div>" +
        '<h1 class="display-2">' + escapeHTML(noticia.titulo) + "</h1>" +
      "</header>" +
      '<div class="entry-paper">' +
        '<div class="entry-content">' + noticia.contenidoHTML + "</div>" +
      "</div>" +
      '<nav class="entry-nav" aria-label="Navegación entre entradas">' +
        navItem(anterior, "\u2190 Entrada anterior", "entry-nav__item--prev") +
        navItem(siguiente, "Entrada siguiente \u2192", "entry-nav__item--next") +
      "</nav>";
  }

  /* ---------------- arranque ---------------- */

  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initInicio();
    initRepositorio();
    initEntrada();

    var anioEl = document.getElementById("anio-actual");
    if (anioEl) anioEl.textContent = new Date().getFullYear();
  });
})();
