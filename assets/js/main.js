/* =========================================================================
   VitaCora — lógica (vanilla JS, sin dependencias)
   Para publicar entradas nuevas solo edita data.js.
   ========================================================================= */
(function () {
  "use strict";

  /* --- utilidades de fecha --- */
  function parseFecha(iso) {
    var p = iso.split("-").map(Number);
    return new Date(p[0], p[1] - 1, p[2]);
  }
  function formatFechaLarga(iso) {
    return parseFecha(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });
  }
  function formatFechaCorta(iso) {
    return parseFecha(iso)
      .toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })
      .replace(".", "").toUpperCase();
  }
  function claveAnioMes(iso) { return iso.slice(0, 7); }
  function nombreMes(ym) {
    var p = ym.split("-").map(Number);
    var s = new Date(p[0], p[1] - 1, 1).toLocaleDateString("es-ES", { month: "long" });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }

  /* --- utilidades de datos --- */
  function todasOrdenadas() {
    return NOTICIAS.slice().sort(function (a, b) { return b.fecha.localeCompare(a.fecha); });
  }
  function temaInfo(slug) {
    return TEMAS[slug] || { label: slug, color: "#555" };
  }
  function tagHTML(slug) {
    var t = temaInfo(slug);
    return '<span class="tag" style="background:' + t.color + '">' + t.label + "</span>";
  }
  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
  function padId(id) {
    return id.toString().padStart(2, "0");
  }

  /* --- tarjeta normal --- */
  function entryCardHTML(n) {
    var url = "entrada.html?id=" + encodeURIComponent(n.id);
    return (
      '<article class="entry-card">' +
        '<div class="entry-card__meta">' +
          '<span class="entry-card__num">N\u00ba&nbsp;' + n.id + "</span>" +
          "<span>" + formatFechaCorta(n.fecha) + "</span>" +
        "</div>" +
        tagHTML(n.tema) +
        '<h3 class="entry-card__title"><a href="' + url + '">' + esc(n.titulo) + "</a></h3>" +
        '<p class="entry-card__excerpt">' + esc(n.resumen) + "</p>" +
        '<a class="entry-card__link" href="' + url + '">Leer entrada</a>' +
      "</article>"
    );
  }

  /* --- tarjeta destacada --- */
  function entryFeaturedHTML(n) {
    var url = "entrada.html?id=" + encodeURIComponent(n.id);
    return (
      '<a class="entry-featured" href="' + url + '" aria-label="' + esc(n.titulo) + '">' +
        '<div class="entry-featured__body">' +
          '<div class="entry-featured__meta">' +
            tagHTML(n.tema) +
            '<span class="entry-featured__id">N\u00ba&nbsp;' + n.id + "</span>" +
          "</div>" +
          '<h2 class="entry-featured__title">' + esc(n.titulo) + "</h2>" +
          '<p class="entry-featured__excerpt">' + esc(n.resumen) + "</p>" +
          '<span class="entry-featured__cta">Leer entrada</span>' +
        "</div>" +
        '<div class="entry-featured__aside" data-id="' + padId(n.id) + '">' +
          '<div>' +
            '<div class="entry-featured__date-label">Publicado</div>' +
            '<div class="entry-featured__date-val">' + formatFechaLarga(n.fecha) + "</div>" +
          "</div>" +
          '<div class="entry-featured__tally" id="featured-tally"></div>' +
        "</div>" +
      "</a>"
    );
  }

  /* --- hamburguesa --- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* --- índice --- */
  function initInicio() {
    var featuredEl = document.getElementById("entry-featured");
    var feedEl = document.getElementById("feed-entradas");
    var counterEl = document.getElementById("hero-counter");
    if (!featuredEl && !feedEl) return;

    var todas = todasOrdenadas();
    if (!todas.length) return;

    if (counterEl) {
      counterEl.textContent = padId(todas.length);
    }

    if (featuredEl) {
      featuredEl.innerHTML = entryFeaturedHTML(todas[0]);
      var tally = document.getElementById("featured-tally");
      if (tally) {
        tally.textContent = todas.length + (todas.length === 1 ? " entrada" : " entradas en el repositorio");
      }
    }

    if (feedEl) {
      feedEl.innerHTML = todas.slice(1, 4).map(entryCardHTML).join("");
    }
  }

  /* --- repositorio --- */
  function initRepositorio() {
    var chipsEl = document.getElementById("repo-chips");
    var timelineEl = document.getElementById("repo-timeline");
    var resultsEl = document.getElementById("repo-results");
    var countEl = document.getElementById("repo-count");
    var searchEl = document.getElementById("repo-search-input");
    if (!chipsEl || !resultsEl) return;

    var todas = todasOrdenadas();
    var estado = { tema: null, mes: null, texto: "" };

    (function leerHash() {
      location.hash.replace(/^#/, "").split("&").forEach(function (par) {
        var kv = par.split("=");
        if (kv[0] === "tema" && kv[1]) estado.tema = decodeURIComponent(kv[1]);
        if (kv[0] === "mes"  && kv[1]) estado.mes  = decodeURIComponent(kv[1]);
      });
    })();

    function actualizarHash() {
      var partes = [];
      if (estado.tema) partes.push("tema=" + encodeURIComponent(estado.tema));
      if (estado.mes)  partes.push("mes="  + encodeURIComponent(estado.mes));
      history.replaceState(null, "", partes.length ? "#" + partes.join("&") : location.pathname);
    }

    function dibujarChips() {
      var h = '<button type="button" class="chip" data-tema="" aria-pressed="' + (!estado.tema) + '">Todos</button>';
      Object.keys(TEMAS).forEach(function (slug) {
        h += '<button type="button" class="chip" data-tema="' + slug + '" aria-pressed="' + (estado.tema === slug) + '">' + TEMAS[slug].label + "</button>";
      });
      chipsEl.innerHTML = h;
      chipsEl.querySelectorAll(".chip").forEach(function (btn) {
        btn.addEventListener("click", function () {
          estado.tema = btn.getAttribute("data-tema") || null;
          dibujarChips(); actualizarHash(); dibujarResultados();
        });
      });
    }

    function dibujarTimeline() {
      if (!timelineEl) return;
      var grupos = {};
      todas.forEach(function (n) {
        var a = n.fecha.slice(0, 4), ym = claveAnioMes(n.fecha);
        grupos[a] = grupos[a] || {};
        grupos[a][ym] = (grupos[a][ym] || 0) + 1;
      });
      var anios = Object.keys(grupos).sort().reverse();
      var h = '<button type="button" class="timeline-reset">Ver todas las fechas</button>';
      anios.forEach(function (a) {
        h += '<div class="timeline-year">' + a + "</div>";
        Object.keys(grupos[a]).sort().reverse().forEach(function (ym) {
          h += '<button type="button" class="timeline-month" data-mes="' + ym + '" aria-pressed="' + (estado.mes === ym) + '">' +
               "<span>" + nombreMes(ym) + "</span>" +
               '<span class="timeline-month__count">' + grupos[a][ym] + "</span></button>";
        });
      });
      timelineEl.innerHTML = h;
      timelineEl.querySelector(".timeline-reset").addEventListener("click", function () {
        estado.mes = null; dibujarTimeline(); actualizarHash(); dibujarResultados();
      });
      timelineEl.querySelectorAll(".timeline-month").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var m = btn.getAttribute("data-mes");
          estado.mes = estado.mes === m ? null : m;
          dibujarTimeline(); actualizarHash(); dibujarResultados();
        });
      });
    }

    function dibujarResultados() {
      var lista = todas.filter(function (n) {
        if (estado.tema && n.tema !== estado.tema) return false;
        if (estado.mes  && claveAnioMes(n.fecha) !== estado.mes) return false;
        if (estado.texto) {
          if ((n.titulo + " " + n.resumen).toLowerCase().indexOf(estado.texto.toLowerCase()) === -1) return false;
        }
        return true;
      });
      if (countEl) countEl.textContent = lista.length === 1 ? "1 entrada encontrada" : lista.length + " entradas encontradas";
      resultsEl.innerHTML = lista.length
        ? '<div class="feed">' + lista.map(entryCardHTML).join("") + "</div>"
        : '<div class="repo-empty"><strong>Sin resultados</strong>Prueba quitando algún filtro.</div>';
    }

    if (searchEl) searchEl.addEventListener("input", function () { estado.texto = searchEl.value; dibujarResultados(); });
    dibujarChips(); dibujarTimeline(); dibujarResultados();
  }

  /* --- entrada individual --- */
  function initEntrada() {
    var contenedor = document.getElementById("entrada-contenido");
    if (!contenedor) return;

    var id = new URLSearchParams(location.search).get("id");
    var todas = todasOrdenadas();
    var n = todas.find(function (x) { return x.id === id; });

    if (!n) {
      document.title = "No encontrada \u00b7 VitaCora";
      contenedor.innerHTML =
        '<div style="border:1px dashed var(--rim);padding:var(--s6);text-align:center;color:var(--cream-3)">' +
        '<strong style="display:block;font-family:var(--font-display);font-size:1.3rem;color:var(--cream);margin-bottom:.5rem">Entrada no encontrada</strong>' +
        'El enlace puede estar incompleto o la entrada fue movida.</div>' +
        '<p style="margin-top:1.5rem"><a class="btn btn--ghost" href="repositorio.html">\u2190 Repositorio</a></p>';
      return;
    }

    document.title = n.titulo + " \u00b7 VitaCora";
    var metaDesc = document.getElementById("entrada-meta-desc");
    if (metaDesc) metaDesc.setAttribute("content", n.resumen);

    var idx = todas.indexOf(n);
    var sig = todas[idx - 1];
    var ant = todas[idx + 1];

    function navItem(entry, label, clase) {
      if (!entry) return "";
      return '<a class="entry-nav__item ' + clase + '" href="entrada.html?id=' + encodeURIComponent(entry.id) + '">' +
             '<span class="entry-nav__label">' + label + "</span>" +
             '<span class="entry-nav__title">' + esc(entry.titulo) + "</span></a>";
    }

    contenedor.innerHTML =
      '<a class="entry-back" href="repositorio.html">Repositorio</a>' +
      '<header class="entry-header">' +
        '<div class="entry-header__meta">' +
          tagHTML(n.tema) +
          '<span class="entry-header__date">N\u00ba&nbsp;' + n.id + " &middot; " + formatFechaLarga(n.fecha) + "</span>" +
        "</div>" +
        '<h1 class="display-2">' + esc(n.titulo) + "</h1>" +
      "</header>" +
      '<div class="entry-paper">' +
        '<div class="entry-content">' + n.contenidoHTML + "</div>" +
        '<div class="entry-actions">' +
          '<button class="entry-share-btn" id="btn-compartir" type="button">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
            " Copiar enlace" +
          "</button>" +
        "</div>" +
      "</div>" +
      '<nav class="entry-nav" aria-label="Navegaci\u00f3n entre entradas">' +
        navItem(ant, "\u2190 Entrada anterior", "entry-nav__item--prev") +
        navItem(sig, "Entrada siguiente \u2192", "entry-nav__item--next") +
      "</nav>";

    /* botón compartir */
    var btn = document.getElementById("btn-compartir");
    var toast = document.getElementById("share-toast");
    if (btn && toast) {
      btn.addEventListener("click", function () {
        var url = window.location.href;
        function mostrar() {
          toast.classList.add("is-visible");
          setTimeout(function () { toast.classList.remove("is-visible"); }, 2200);
        }
        if (navigator.clipboard) {
          navigator.clipboard.writeText(url).then(mostrar);
        } else {
          var ta = document.createElement("textarea");
          ta.value = url; ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta);
          mostrar();
        }
      });
    }
  }

  /* --- arranque --- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initInicio();
    initRepositorio();
    initEntrada();
    var anioEl = document.getElementById("anio-actual");
    if (anioEl) anioEl.textContent = new Date().getFullYear();
  });
})();
