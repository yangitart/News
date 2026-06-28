/* =========================================================================
   VITACORA — lógica (vanilla JS, sin dependencias)
   Para publicar entradas nuevas solo edita data.js.
   Para activar anuncios o ajustar SEO, mira la sección CONFIGURACIÓN abajo.
   ========================================================================= */
(function () {
  "use strict";

  /* =======================================================================
     CONFIGURACIÓN — anuncios y sitio
     =========================================================================
     ADS_CONFIG.activo: déjalo en false hasta que tengas tu cuenta de
     AdSense (u otra red) aprobada. Mientras esté en false, NO se mostrará
     ningún espacio publicitario (ni siquiera el placeholder).
     ========================================================================= */
  var ADS_CONFIG = {
    activo: false,  // <--- Mientras esté en false, todo el código de anuncios se salta
    cliente: "",
    slots: {
      leaderboardTop: "",
      leaderboardFooter: "",
      sidebar: "",
      infeed: "",
      instream: ""
    }
  };

  var SITE_CONFIG = {
    nombre: "VITACORA",
    /* Cambia esto por la URL real de GitHub Pages cuando publiques. */
    urlBase: "https://tu-usuario.github.io/tu-repositorio/"
  };

  /* =======================================================================
     ICONOS — set de iconos lineales propios, sin dependencias externas
     ========================================================================= */
  var ICONOS = {
    inicio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>',
    archivo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1.2"/><path d="M3 7 5 3h14l2 4"/><path d="M10 12h4"/></svg>',
    calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="1.4"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
    reloj: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.2 1.9"/></svg>',
    tecnologia: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.2"/><path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3"/></svg>',
    desarrollo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6"/><path d="M14.5 6h6v6"/></svg>',
    lecturas: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5c-1.6-1.2-4-1.7-6.5-1.5a1 1 0 0 0-.9 1v12a1 1 0 0 0 1.1 1c2.2-.2 4.5.3 6 1.4M12 6.5c1.6-1.2 4-1.7 6.5-1.5a1 1 0 0 1 .9 1v12a1 1 0 0 1-1.1 1c-2.2-.2-4.5.3-6 1.4M12 6.5v13.4"/></svg>',
    cuerpo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.3" r="1.7" fill="currentColor" stroke="none"/><path d="M12 8v6m0 0-3.5 6M12 14l3.5 6M7 10l5-2 5 2"/></svg>',
    reflexiones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6.5 6.5 0 0 0-3.6 11.9c.4.3.6.8.6 1.3V17h6v-.8c0-.5.2-1 .6-1.3A6.5 6.5 0 0 0 12 3Z"/></svg>'
  };
  function icono(nombre, claseExtra) {
    return '<span class="icono' + (claseExtra ? " " + claseExtra : "") + '" aria-hidden="true">' + (ICONOS[nombre] || "") + "</span>";
  }

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
    return '<span class="tag" style="background:' + t.color + '">' + icono(slug) + "<span>" + t.label + "</span></span>";
  }
  function esc(str) {
    var d = document.createElement("div");
    d.textContent = str;
    return d.innerHTML;
  }
  function padId(id) {
    return id.toString().padStart(2, "0");
  }
  function truncar(str, max) {
    if (str.length <= max) return str;
    return str.slice(0, max - 1).trimEnd() + "…";
  }

  /* --- tiempo de lectura --- */
  function tiempoLecturaMin(html) {
    var d = document.createElement("div");
    d.innerHTML = html;
    var texto = d.textContent || "";
    var palabras = texto.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(palabras / 200));
  }

  /* --- tarjeta normal --- */
  function entryCardHTML(n) {
    var url = "entrada.html?id=" + encodeURIComponent(n.id);
    var mediaHTML = n.imagen
      ? '<span class="entry-card__media"><img src="' + esc(n.imagen) + '" alt="' + esc(n.imagenAlt || "") + '" loading="lazy" decoding="async"></span>'
      : "";
    return (
      '<article class="entry-card' + (n.imagen ? " entry-card--media" : "") + '">' +
        mediaHTML +
        '<div class="entry-card__meta">' +
          '<span class="entry-card__num">N\u00ba&nbsp;' + n.id + "</span>" +
          '<span class="entry-card__date">' + icono("calendario") + formatFechaCorta(n.fecha) + "</span>" +
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
    var asideHTML = n.imagen
      ? '<div class="entry-featured__aside entry-featured__aside--media" data-id="' + padId(n.id) + '" style="background-image:url(&quot;' + esc(n.imagen) + '&quot;)">' +
          '<div class="entry-featured__aside-overlay">' +
            '<div class="entry-featured__date-label">Publicado</div>' +
            '<div class="entry-featured__date-val">' + formatFechaLarga(n.fecha) + "</div>" +
            '<div class="entry-featured__tally" id="featured-tally"></div>' +
          "</div>" +
        "</div>"
      : '<div class="entry-featured__aside" data-id="' + padId(n.id) + '">' +
          '<div>' +
            '<div class="entry-featured__date-label">Publicado</div>' +
            '<div class="entry-featured__date-val">' + formatFechaLarga(n.fecha) + "</div>" +
          "</div>" +
          '<div class="entry-featured__tally" id="featured-tally"></div>' +
        "</div>";
    return (
      '<a class="entry-featured' + (n.imagen ? " entry-featured--media" : "") + '" href="' + url + '" aria-label="' + esc(n.titulo) + '">' +
        '<div class="entry-featured__body">' +
          '<div class="entry-featured__meta">' +
            tagHTML(n.tema) +
            '<span class="entry-featured__id">N\u00ba&nbsp;' + n.id + "</span>" +
          "</div>" +
          '<h2 class="entry-featured__title">' + esc(n.titulo) + "</h2>" +
          '<p class="entry-featured__excerpt">' + esc(n.resumen) + "</p>" +
          '<span class="entry-featured__cta">Leer entrada</span>' +
        "</div>" +
        asideHTML +
      "</a>"
    );
  }

  /* =======================================================================
     ANUNCIOS — MODIFICADO: si no está activo, no pinta nada (ni placeholder)
     ========================================================================= */
  function adSlotHTML(variante) {
    // 🔥 CAMBIO 1: Si la publicidad no está activa, NO devolvemos nada
    if (!ADS_CONFIG.activo) return '';

    var slotId = ADS_CONFIG.slots[variante] || "";
    if (!ADS_CONFIG.cliente || !slotId) return '';

    return '<div class="ad-slot ad-slot--' + variante + '" data-ad-variant="' + variante + '">' +
      '<ins class="adsbygoogle" style="display:block;width:100%" ' +
      'data-ad-client="' + ADS_CONFIG.cliente + '" ' +
      'data-ad-slot="' + slotId + '" ' +
      'data-ad-format="auto" data-full-width-responsive="true"></ins>' +
    '</div>';
  }

  function activarAnunciosPendientes() {
    if (!ADS_CONFIG.activo || typeof window.adsbygoogle === "undefined") return;
    document.querySelectorAll(".ad-slot ins.adsbygoogle:not([data-iniciado])").forEach(function (ins) {
      ins.setAttribute("data-iniciado", "1");
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) { /* noop */ }
    });
  }

  /* Inserta los espacios fijos del sitio sin tocar el HTML de cada página. */
  function initAds() {
    // Como adSlotHTML devuelve '' si no está activo, insertar un string vacío no hace nada.
    var main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("afterbegin", adSlotHTML("leaderboardTop"));

    var footer = document.querySelector(".site-footer");
    if (footer) footer.insertAdjacentHTML("beforebegin", adSlotHTML("leaderboardFooter"));

    var timeline = document.getElementById("repo-timeline");
    if (timeline) timeline.insertAdjacentHTML("afterend", adSlotHTML("sidebar"));

    activarAnunciosPendientes();
  }

  /* Intercala un anuncio nativo cada 6 tarjetas dentro de una grilla. */
  function conAnunciosEnGrilla(itemsHTML) {
    // 🔥 CAMBIO 2: Si la publicidad no está activa, devolvemos las tarjetas sin anuncios
    if (!ADS_CONFIG.activo) return itemsHTML.join("");

    if (itemsHTML.length <= 6) return itemsHTML.join("");
    var salida = [];
    itemsHTML.forEach(function (html, i) {
      salida.push(html);
      var esUltimo = i === itemsHTML.length - 1;
      if ((i + 1) % 6 === 0 && !esUltimo) salida.push(adSlotHTML("infeed"));
    });
    return salida.join("");
  }

  /* =======================================================================
     AVISO DE COOKIES / CONSENTIMIENTO
     ========================================================================= */
  function initConsent() {
    // Mientras no haya anuncios activos (ADS_CONFIG.activo = false), no tiene
    // sentido pedir consentimiento de cookies/anuncios: lo saltamos por ahora.
    // En cuanto pongas ADS_CONFIG.activo = true, este aviso vuelve a aparecer solo.
    if (!ADS_CONFIG.activo) return;

    var KEY = "VITACORA_consent";
    var valor = null;
    try { valor = localStorage.getItem(KEY); } catch (e) { /* noop */ }
    window.VITACORA_CONSENT = valor;
    if (valor) return;

    var banner = document.createElement("div");
    banner.className = "cookie-consent";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Aviso de privacidad");
    banner.innerHTML =
      '<p class="cookie-consent__text">Este sitio puede mostrar anuncios y usar cookies b\u00e1sicas para medir visitas. \u00bfLo aceptas?</p>' +
      '<div class="cookie-consent__actions">' +
        '<button type="button" class="btn btn--ghost" data-consent="rechazar">Rechazar</button>' +
        '<button type="button" class="btn btn--primary" data-consent="aceptar">Aceptar</button>' +
      "</div>";
    document.body.appendChild(banner);
    requestAnimationFrame(function () { banner.classList.add("is-visible"); });

    banner.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-consent]");
      if (!btn) return;
      var decision = btn.getAttribute("data-consent") === "aceptar" ? "aceptado" : "rechazado";
      try { localStorage.setItem(KEY, decision); } catch (err) { /* noop */ }
      window.VITACORA_CONSENT = decision;
      banner.classList.remove("is-visible");
      setTimeout(function () { banner.remove(); }, 350);
      try { document.dispatchEvent(new CustomEvent("VITACORA:consent", { detail: decision })); } catch (err) { /* noop */ }
    });
  }

  /* =======================================================================
     SEO — metaetiquetas dinámicas (refuerzan, no sustituyen, las del <head>)
     ========================================================================= */
  function setMeta(attr, value, content) {
    var selector = "meta[" + attr + '="' + value + '"]';
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement("meta");
      el.setAttribute(attr, value);
      document.head.appendChild(el);
    }
    el.setAttribute("content", content);
  }

  function setCanonical(url) {
    var el = document.head.querySelector('link[rel="canonical"]');
    if (!el) {
      el = document.createElement("link");
      el.setAttribute("rel", "canonical");
      document.head.appendChild(el);
    }
    el.setAttribute("href", url);
  }

  function inyectarJSONLD(n) {
    var data = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": n.titulo,
      "description": n.resumen,
      "datePublished": n.fecha,
      "articleSection": temaInfo(n.tema).label,
      "author": { "@type": "Organization", "name": SITE_CONFIG.nombre },
      "publisher": { "@type": "Organization", "name": SITE_CONFIG.nombre },
      "mainEntityOfPage": location.href
    };
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  }

  function actualizarSEOEntrada(n) {
    var url = location.href;
    setCanonical(url);
    setMeta("property", "og:title", n.titulo + " · " + SITE_CONFIG.nombre);
    setMeta("property", "og:description", n.resumen);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", "article");
    setMeta("name", "twitter:title", n.titulo + " · " + SITE_CONFIG.nombre);
    setMeta("name", "twitter:description", n.resumen);
    inyectarJSONLD(n);
  }

  /* --- hamburguesa --- */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".nav");
    if (!toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar men\u00fa" : "Abrir men\u00fa");
    }

    toggle.addEventListener("click", function () {
      setOpen(!nav.classList.contains("is-open"));
    });

    /* cerrar al tocar fuera del menu */
    document.addEventListener("click", function (e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });

    /* cerrar con la tecla Escape, devolviendo el foco al boton */
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggle.focus();
      }
    });

    /* cerrar al elegir un enlace (por si ya estabas en esa pagina) */
    nav.querySelectorAll(".nav__link").forEach(function (link) {
      link.addEventListener("click", function () { setOpen(false); });
    });

    /* si rotas o agrandas a escritorio con el menu abierto, lo cerramos */
    window.addEventListener("resize", function () {
      if (window.innerWidth > 768 && nav.classList.contains("is-open")) setOpen(false);
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
        ? '<div class="feed">' + conAnunciosEnGrilla(lista.map(entryCardHTML)) + "</div>"
        : '<div class="repo-empty"><strong>Sin resultados</strong>Prueba quitando algún filtro.</div>';
      activarAnunciosPendientes();
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
      document.title = "No encontrada \u00b7 VITACORA";
      contenedor.innerHTML =
        '<div style="border:1px dashed var(--rim);padding:var(--s6);text-align:center;color:var(--cream-3)">' +
        '<strong style="display:block;font-family:var(--font-display);font-size:1.3rem;color:var(--cream);margin-bottom:.5rem">Entrada no encontrada</strong>' +
        'El enlace puede estar incompleto o la entrada fue movida.</div>' +
        '<p style="margin-top:1.5rem"><a class="btn btn--ghost" href="repositorio.html">\u2190 Repositorio</a></p>';
      return;
    }

    document.title = n.titulo + " \u00b7 VITACORA";
    var metaDesc = document.getElementById("entrada-meta-desc");
    if (metaDesc) metaDesc.setAttribute("content", n.resumen);
    actualizarSEOEntrada(n);

    var idx = todas.indexOf(n);
    var sig = todas[idx - 1];
    var ant = todas[idx + 1];
    var tema = temaInfo(n.tema);
    var minutos = tiempoLecturaMin(n.contenidoHTML);

    function navItem(entry, label, clase) {
      if (!entry) return "";
      return '<a class="entry-nav__item ' + clase + '" href="entrada.html?id=' + encodeURIComponent(entry.id) + '">' +
             '<span class="entry-nav__label">' + label + "</span>" +
             '<span class="entry-nav__title">' + esc(entry.titulo) + "</span></a>";
    }

    var breadcrumbHTML =
      '<nav class="breadcrumb" aria-label="Ruta de navegaci\u00f3n">' +
        '<a href="index.html">Inicio</a>' +
        '<span class="breadcrumb__sep">/</span>' +
        '<a href="repositorio.html">Repositorio</a>' +
        '<span class="breadcrumb__sep">/</span>' +
        '<a href="repositorio.html#tema=' + encodeURIComponent(n.tema) + '">' + esc(tema.label) + "</a>" +
        '<span class="breadcrumb__sep">/</span>' +
        '<span aria-current="page">' + esc(truncar(n.titulo, 42)) + "</span>" +
      "</nav>";

    var heroHTML = n.imagen
      ? '<div class="entry-hero entry-hero--media" style="background-image:url(&quot;' + esc(n.imagen) + '&quot;)">' +
          '<span class="entry-hero__tag">' + tagHTML(n.tema) + "</span>" +
        "</div>"
      : '<div class="entry-hero" data-num="' + padId(n.id) + '" style="--entry-hero-color:' + tema.color + '">' +
          '<span class="entry-hero__tag">' + tagHTML(n.tema) + "</span>" +
        "</div>";

    /* relacionadas: mismo tema, sin la actual, hasta 3 */
    var relacionadas = todas.filter(function (x) { return x.tema === n.tema && x.id !== n.id; }).slice(0, 3);
    var relacionadasHTML = relacionadas.length
      ? '<section class="entry-related" aria-label="Entradas relacionadas">' +
          '<h2 class="entry-related__title">Tambi\u00e9n te puede interesar</h2>' +
          '<div class="feed">' + relacionadas.map(entryCardHTML).join("") + "</div>" +
        "</section>"
      : "";

    contenedor.innerHTML =
      '<a class="entry-back" href="repositorio.html">Repositorio</a>' +
      breadcrumbHTML +
      heroHTML +
      '<header class="entry-header">' +
        '<div class="entry-header__meta">' +
          tagHTML(n.tema) +
          '<span class="entry-header__date">N\u00ba&nbsp;' + n.id + " &middot; " + formatFechaLarga(n.fecha) + "</span>" +
          '<span class="reading-time">' + icono("reloj") + minutos + (minutos === 1 ? " min de lectura" : " min de lectura") + "</span>" +
        "</div>" +
        '<h1 class="display-2">' + esc(n.titulo) + "</h1>" +
      "</header>" +
      '<div class="entry-ornament" aria-hidden="true"><span></span><svg viewBox="0 0 12 12"><path d="M6 0 8 4l4 2-4 2-2 4-2-4-4-2 4-2Z" fill="currentColor"/></svg><span></span></div>' +
      '<div class="entry-paper">' +
        '<div class="entry-content">' + n.contenidoHTML + "</div>" +
        '<div class="entry-actions">' +
          '<button class="entry-share-btn" id="btn-compartir" type="button">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
            " Copiar enlace" +
          "</button>" +
          '<a class="entry-share-btn" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(n.titulo + " — " + location.href) + '">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.7-2.3-.1-.2 0-.4.1-.5.2-.2.4-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-.1 2.4.9 1.4 1.6 2 2.9 3.2 1.7 1.4 3.1 1.9 3.6 2.1.5.2.8.1 1.1-.1.3-.3 1-.9 1.2-1.2.2-.3.4-.3.6-.2l1.9.9c.2.1.4.2.5.3.1.2.1.9-.2 1.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/></svg>' +
            " WhatsApp" +
          "</a>" +
        "</div>" +
      "</div>" +
      // adSlotHTML("instream")  // <-- Este también se salta automáticamente ahora
      relacionadasHTML +
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

    activarAnunciosPendientes();
  }

  /* --- arranque --- */
  document.addEventListener("DOMContentLoaded", function () {
    initNav();
    initInicio();
    initRepositorio();
    initEntrada();
    initAds();
    initConsent();
    var anioEl = document.getElementById("anio-actual");
    if (anioEl) anioEl.textContent = new Date().getFullYear();
  });
})();