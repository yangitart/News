/* =========================================================================
   VITACORA — lógica principal (sin módulos ES, usa globals de supabase.js)
   ========================================================================= */
(async function () {
  "use strict";

  var ADS_CONFIG = {
    activo: false,
    cliente: "",
    slots: { leaderboardTop: "", leaderboardFooter: "", sidebar: "", infeed: "", instream: "" }
  };

  var SITE_CONFIG = {
    nombre: "VITACORA",
    urlBase: "https://tu-usuario.github.io/tu-repositorio/"
  };

  /* =======================================================================
     DATOS — cargados desde Supabase
     ========================================================================= */
  var NOTICIAS = [];
  var TEMAS    = {};

  async function cargarDatos() {
    try {
      const [entradas, temas] = await Promise.all([fetchEntradas(), fetchTemas()]);
      NOTICIAS = entradas.map(function(e) {
        return {
          id:            e.id,
          fecha:         e.fecha,
          tema:          e.tema,
          titulo:        e.titulo,
          resumen:       e.resumen,
          imagen:        e.imagen     || null,
          imagenAlt:     e.imagen_alt || null,
          contenidoHTML: e.contenido_html || ''
        };
      });
      TEMAS = {};
      temas.forEach(function(t) { TEMAS[t.slug] = { label: t.label, color: t.color }; });
    } catch (err) {
      console.error("Error cargando datos de Supabase:", err);
    }
  }

  /* =======================================================================
     ICONOS
     ========================================================================= */
  var ICONOS = {
    inicio:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9"/></svg>',
    archivo:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="1.2"/><path d="M3 7 5 3h14l2 4"/><path d="M10 12h4"/></svg>',
    calendario:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="1.4"/><path d="M8 3v4M16 3v4M3.5 10h17"/></svg>',
    reloj:       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.3"/><path d="M12 7.5V12l3.2 1.9"/></svg>',
    tecnologia:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="7" y="7" width="10" height="10" rx="1.2"/><path d="M9.5 7V4M14.5 7V4M9.5 20v-3M14.5 20v-3M7 9.5H4M7 14.5H4M20 9.5h-3M20 14.5h-3"/></svg>',
    desarrollo:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 16.5 9 11l3.5 3.5L20.5 6"/><path d="M14.5 6h6v6"/></svg>',
    lecturas:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6.5c-1.6-1.2-4-1.7-6.5-1.5a1 1 0 0 0-.9 1v12a1 1 0 0 0 1.1 1c2.2-.2 4.5.3 6 1.4M12 6.5c1.6-1.2 4-1.7 6.5-1.5a1 1 0 0 1 .9 1v12a1 1 0 0 1-1.1 1c-2.2-.2-4.5.3-6 1.4M12 6.5v13.4"/></svg>',
    cuerpo:      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="4.3" r="1.7" fill="currentColor" stroke="none"/><path d="M12 8v6m0 0-3.5 6M12 14l3.5 6M7 10l5-2 5 2"/></svg>',
    reflexiones: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4"/><path d="M12 3a6.5 6.5 0 0 0-3.6 11.9c.4.3.6.8.6 1.3V17h6v-.8c0-.5.2-1 .6-1.3A6.5 6.5 0 0 0 12 3Z"/></svg>'
  };

  function icono(nombre, claseExtra) {
    return '<span class="icono' + (claseExtra ? " " + claseExtra : "") + '" aria-hidden="true">' + (ICONOS[nombre] || "") + "</span>";
  }

  /* --- fechas --- */
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

  /* --- utilidades --- */
  function todasOrdenadas() {
    return NOTICIAS.slice().sort(function(a, b) { return b.fecha.localeCompare(a.fecha); });
  }
  function temaInfo(slug) { return TEMAS[slug] || { label: slug, color: "#555" }; }
  function tagHTML(slug) {
    var t = temaInfo(slug);
    return '<span class="tag" style="background:' + t.color + '">' + icono(slug) + "<span>" + t.label + "</span></span>";
  }
  function esc(str) {
    var d = document.createElement("div"); d.textContent = str; return d.innerHTML;
  }
  function padId(id) { return id.toString().padStart(2, "0"); }
  function truncar(str, max) {
    if (str.length <= max) return str;
    return str.slice(0, max - 1).trimEnd() + "…";
  }
  function tiempoLecturaMin(html) {
    var d = document.createElement("div"); d.innerHTML = html;
    var palabras = (d.textContent || "").trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(palabras / 200));
  }

  /* --- tarjeta --- */
  function entryCardHTML(n) {
    var url = "entrada.html?id=" + encodeURIComponent(n.id);
    var mediaHTML = n.imagen
      ? '<span class="entry-card__media"><img src="' + esc(n.imagen) + '" alt="' + esc(n.imagenAlt || "") + '" loading="lazy" decoding="async"></span>'
      : "";
    return (
      '<article class="entry-card' + (n.imagen ? " entry-card--media" : "") + '">' +
        mediaHTML +
        '<div class="entry-card__meta">' +
          '<span class="entry-card__num">N\u00ba\u00a0' + n.id + '</span>' +
          '<span class="entry-card__date">' + icono("calendario") + formatFechaCorta(n.fecha) + '</span>' +
        '</div>' +
        tagHTML(n.tema) +
        '<h3 class="entry-card__title"><a href="' + url + '">' + esc(n.titulo) + '</a></h3>' +
        '<p class="entry-card__excerpt">' + esc(n.resumen) + '</p>' +
        '<a class="entry-card__link" href="' + url + '">Leer entrada</a>' +
      '</article>'
    );
  }

  /* --- tarjeta destacada --- */
  function entryFeaturedHTML(n) {
    var url = "entrada.html?id=" + encodeURIComponent(n.id);
    var asideHTML = n.imagen
      ? '<div class="entry-featured__aside entry-featured__aside--media" data-id="' + padId(n.id) + '" style="background-image:url(\'' + esc(n.imagen) + '\')">' +
          '<div class="entry-featured__aside-overlay">' +
            '<div class="entry-featured__date-label">Publicado</div>' +
            '<div class="entry-featured__date-val">' + formatFechaLarga(n.fecha) + '</div>' +
            '<div class="entry-featured__tally" id="featured-tally"></div>' +
          '</div></div>'
      : '<div class="entry-featured__aside" data-id="' + padId(n.id) + '">' +
          '<div><div class="entry-featured__date-label">Publicado</div>' +
          '<div class="entry-featured__date-val">' + formatFechaLarga(n.fecha) + '</div></div>' +
          '<div class="entry-featured__tally" id="featured-tally"></div>' +
        '</div>';
    return (
      '<a class="entry-featured' + (n.imagen ? " entry-featured--media" : "") + '" href="' + url + '" aria-label="' + esc(n.titulo) + '">' +
        '<div class="entry-featured__body">' +
          '<div class="entry-featured__meta">' + tagHTML(n.tema) +
            '<span class="entry-featured__id">N\u00ba\u00a0' + n.id + '</span></div>' +
          '<h2 class="entry-featured__title">' + esc(n.titulo) + '</h2>' +
          '<p class="entry-featured__excerpt">' + esc(n.resumen) + '</p>' +
          '<span class="entry-featured__cta">Leer entrada</span>' +
        '</div>' + asideHTML +
      '</a>'
    );
  }

  /* =======================================================================
     ANUNCIOS
     ========================================================================= */
  function adSlotHTML(v) {
    if (!ADS_CONFIG.activo) return '';
    var s = ADS_CONFIG.slots[v] || "";
    if (!ADS_CONFIG.cliente || !s) return '';
    return '<div class="ad-slot ad-slot--' + v + '"><ins class="adsbygoogle" style="display:block;width:100%" data-ad-client="' + ADS_CONFIG.cliente + '" data-ad-slot="' + s + '" data-ad-format="auto" data-full-width-responsive="true"></ins></div>';
  }
  function activarAnunciosPendientes() {
    if (!ADS_CONFIG.activo || typeof window.adsbygoogle === "undefined") return;
    document.querySelectorAll(".ad-slot ins.adsbygoogle:not([data-iniciado])").forEach(function(ins) {
      ins.setAttribute("data-iniciado", "1");
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch(e) {}
    });
  }
  function conAnunciosEnGrilla(items) {
    if (!ADS_CONFIG.activo || items.length <= 6) return items.join("");
    var s = [];
    items.forEach(function(h, i) {
      s.push(h);
      if ((i + 1) % 6 === 0 && i !== items.length - 1) s.push(adSlotHTML("infeed"));
    });
    return s.join("");
  }
  function initAds() {
    var main = document.querySelector("main");
    if (main) main.insertAdjacentHTML("afterbegin", adSlotHTML("leaderboardTop"));
    var footer = document.querySelector(".site-footer");
    if (footer) footer.insertAdjacentHTML("beforebegin", adSlotHTML("leaderboardFooter"));
    activarAnunciosPendientes();
  }

  /* =======================================================================
     SEO
     ========================================================================= */
  function setMeta(attr, value, content) {
    var el = document.head.querySelector('meta[' + attr + '="' + value + '"]');
    if (!el) { el = document.createElement("meta"); el.setAttribute(attr, value); document.head.appendChild(el); }
    el.setAttribute("content", content);
  }
  function setCanonical(url) {
    var el = document.head.querySelector('link[rel="canonical"]');
    if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
    el.setAttribute("href", url);
  }
  function actualizarSEOEntrada(n) {
    setCanonical(location.href);
    setMeta("property", "og:title",       n.titulo + " · " + SITE_CONFIG.nombre);
    setMeta("property", "og:description", n.resumen);
    setMeta("property", "og:url",         location.href);
    setMeta("property", "og:type",        "article");
    setMeta("name", "twitter:title",       n.titulo + " · " + SITE_CONFIG.nombre);
    setMeta("name", "twitter:description", n.resumen);
    var script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "Article",
      "headline": n.titulo, "description": n.resumen, "datePublished": n.fecha,
      "articleSection": temaInfo(n.tema).label,
      "author":    { "@type": "Organization", "name": SITE_CONFIG.nombre },
      "publisher": { "@type": "Organization", "name": SITE_CONFIG.nombre },
      "mainEntityOfPage": location.href
    });
    document.head.appendChild(script);
  }

  /* =======================================================================
     NAV — hamburguesa
     ========================================================================= */
  function initNav() {
    var toggle = document.querySelector(".nav-toggle");
    var nav    = document.querySelector(".nav");
    if (!toggle || !nav) return;
    function setOpen(open) {
      nav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    }
    toggle.addEventListener("click", function() { setOpen(!nav.classList.contains("is-open")); });
    document.addEventListener("click", function(e) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      setOpen(false);
    });
    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
    });
    nav.querySelectorAll(".nav__link").forEach(function(l) { l.addEventListener("click", function() { setOpen(false); }); });
    window.addEventListener("resize", function() {
      if (window.innerWidth > 768 && nav.classList.contains("is-open")) setOpen(false);
    });
  }

  /* =======================================================================
     NAV AUTH — login / avatar en la barra de navegación (todas las páginas)
     ========================================================================= */
  var ADMIN_EMAIL = 'escobarpupoyancarlos1@gmail.com';

  function initNavAuth() {
    var slot = document.getElementById("nav-auth-slot");
    if (!slot) return;

    function render() {
      getUser().then(function(user) {
        if (!user) {
          // No logueado → botón "Iniciar sesión"
          slot.innerHTML =
            '<button class="nav-auth-btn nav-auth-btn--login" id="nav-btn-login" title="Iniciar sesión con Google">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>' +
              '<span class="nav-auth-btn__label">Iniciar sesión</span>' +
            '</button>';
          var btn = document.getElementById("nav-btn-login");
          if (btn) btn.addEventListener("click", function() {
            signInWithGoogle().catch(function(e) { console.error(e); });
          });
          return;
        }

        // Logueado → avatar + dropdown
        var meta   = user.user_metadata || {};
        var avatar = meta.avatar_url || meta.picture;
        var nombre = meta.full_name || meta.name || user.email;
        var esAdmin = (user.email === ADMIN_EMAIL);

        var avatarHTML = avatar
          ? '<img class="nav-auth-avatar__img" src="' + avatar + '" alt="' + nombre + '">'
          : '<span class="nav-auth-avatar__initials">' + (nombre.charAt(0).toUpperCase()) + '</span>';

        slot.innerHTML =
          '<div class="nav-auth-user" id="nav-auth-user">' +
            '<button class="nav-auth-avatar" id="nav-auth-toggle" aria-expanded="false" aria-label="Menú de cuenta" title="' + nombre + '">' +
              '<span class="nav-auth-avatar__wrap">' + avatarHTML + '</span>' +
              (esAdmin ? '<span class="nav-auth-badge" title="Admin">A</span>' : '') +
            '</button>' +
            '<div class="nav-auth-dropdown" id="nav-auth-dropdown" hidden>' +
              '<div class="nav-auth-dropdown__info">' +
                '<span class="nav-auth-dropdown__name">' + nombre + '</span>' +
                '<span class="nav-auth-dropdown__email">' + user.email + '</span>' +
                (esAdmin ? '<span class="nav-auth-dropdown__role">Administrador</span>' : '') +
              '</div>' +
              (esAdmin ? '<a class="nav-auth-dropdown__item" href="admin.html"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="1"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Panel Admin</a>' : '') +
              '<button class="nav-auth-dropdown__item nav-auth-dropdown__item--danger" id="nav-btn-logout"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> Cerrar sesión</button>' +
            '</div>' +
          '</div>';

        // Toggle dropdown
        var toggleBtn = document.getElementById("nav-auth-toggle");
        var dropdown  = document.getElementById("nav-auth-dropdown");
        if (toggleBtn && dropdown) {
          toggleBtn.addEventListener("click", function(e) {
            e.stopPropagation();
            var open = !dropdown.hidden;
            dropdown.hidden = open;
            toggleBtn.setAttribute("aria-expanded", open ? "false" : "true");
          });
          document.addEventListener("click", function closeDD(e) {
            var wrap = document.getElementById("nav-auth-user");
            if (wrap && !wrap.contains(e.target)) {
              dropdown.hidden = true;
              toggleBtn.setAttribute("aria-expanded", "false");
            }
          });
          document.addEventListener("keydown", function(e) {
            if (e.key === "Escape" && !dropdown.hidden) {
              dropdown.hidden = true;
              toggleBtn.setAttribute("aria-expanded", "false");
              toggleBtn.focus();
            }
          });
        }

        // Logout
        var logoutBtn = document.getElementById("nav-btn-logout");
        if (logoutBtn) logoutBtn.addEventListener("click", function() {
          sbSignOut().then(function() { render(); }).catch(function(e) { console.error(e); });
        });

      }).catch(function(err) { console.error("NavAuth error:", err); });
    }

    render();

    // Re-render si cambia la sesión (tras redirect OAuth, etc.)
    _sb.auth.onAuthStateChange(function() { render(); });
  }

  /* =======================================================================
     INICIO
     ========================================================================= */
  function initInicio() {
    var featuredEl = document.getElementById("entry-featured");
    var feedEl     = document.getElementById("feed-entradas");
    var counterEl  = document.getElementById("hero-counter");
    if (!featuredEl && !feedEl) return;
    var todas = todasOrdenadas();
    if (!todas.length) return;
    if (counterEl) counterEl.textContent = padId(todas.length);
    var statTotalEl = document.getElementById("hero-stat-total");
    var statTemasEl = document.getElementById("hero-stat-temas");
    var statDesdeEl = document.getElementById("hero-stat-desde");
    if (statTotalEl) statTotalEl.textContent = todas.length;
    if (statTemasEl) {
      var temasUsados = {};
      todas.forEach(function (n) { temasUsados[n.tema] = true; });
      statTemasEl.textContent = Object.keys(temasUsados).length;
    }
    if (statDesdeEl) {
      var primera = todas[todas.length - 1];
      statDesdeEl.textContent = parseFecha(primera.fecha).getFullYear();
    }
    if (featuredEl) {
      featuredEl.innerHTML = entryFeaturedHTML(todas[0]);
      var tally = document.getElementById("featured-tally");
      if (tally) tally.textContent = todas.length + (todas.length === 1 ? " entrada" : " entradas en el repositorio");
    }
    if (feedEl) feedEl.innerHTML = todas.slice(1, 4).map(entryCardHTML).join("");
  }

  /* =======================================================================
     REPOSITORIO
     ========================================================================= */
  function initRepositorio() {
    var chipsEl    = document.getElementById("repo-chips");
    var timelineEl = document.getElementById("repo-timeline");
    var resultsEl  = document.getElementById("repo-results");
    var countEl    = document.getElementById("repo-count");
    var searchEl   = document.getElementById("repo-search-input");
    if (!chipsEl || !resultsEl) return;

    var todas  = todasOrdenadas();
    var estado = { tema: null, mes: null, texto: "" };

    location.hash.replace(/^#/, "").split("&").forEach(function(par) {
      var kv = par.split("=");
      if (kv[0] === "tema" && kv[1]) estado.tema = decodeURIComponent(kv[1]);
      if (kv[0] === "mes"  && kv[1]) estado.mes  = decodeURIComponent(kv[1]);
    });

    function actualizarHash() {
      var p = [];
      if (estado.tema) p.push("tema=" + encodeURIComponent(estado.tema));
      if (estado.mes)  p.push("mes="  + encodeURIComponent(estado.mes));
      history.replaceState(null, "", p.length ? "#" + p.join("&") : location.pathname);
    }

    function dibujarChips() {
      var h = '<button type="button" class="chip" data-tema="" aria-pressed="' + (!estado.tema) + '">Todos</button>';
      Object.keys(TEMAS).forEach(function(slug) {
        h += '<button type="button" class="chip" data-tema="' + slug + '" aria-pressed="' + (estado.tema === slug) + '">' + TEMAS[slug].label + '</button>';
      });
      chipsEl.innerHTML = h;
      chipsEl.querySelectorAll(".chip").forEach(function(btn) {
        btn.addEventListener("click", function() {
          estado.tema = btn.getAttribute("data-tema") || null;
          dibujarChips(); actualizarHash(); dibujarResultados();
        });
      });
    }

    function dibujarTimeline() {
      if (!timelineEl) return;
      var grupos = {};
      todas.forEach(function(n) {
        var a = n.fecha.slice(0, 4), ym = claveAnioMes(n.fecha);
        grupos[a] = grupos[a] || {};
        grupos[a][ym] = (grupos[a][ym] || 0) + 1;
      });
      var anios = Object.keys(grupos).sort().reverse();
      var h = '<button type="button" class="timeline-reset">Ver todas las fechas</button>';
      anios.forEach(function(a) {
        h += '<div class="timeline-year">' + a + '</div>';
        Object.keys(grupos[a]).sort().reverse().forEach(function(ym) {
          h += '<button type="button" class="timeline-month" data-mes="' + ym + '" aria-pressed="' + (estado.mes === ym) + '">' +
               '<span>' + nombreMes(ym) + '</span>' +
               '<span class="timeline-month__count">' + grupos[a][ym] + '</span></button>';
        });
      });
      timelineEl.innerHTML = h;
      timelineEl.querySelector(".timeline-reset").addEventListener("click", function() {
        estado.mes = null; dibujarTimeline(); actualizarHash(); dibujarResultados();
      });
      timelineEl.querySelectorAll(".timeline-month").forEach(function(btn) {
        btn.addEventListener("click", function() {
          var m = btn.getAttribute("data-mes");
          estado.mes = estado.mes === m ? null : m;
          dibujarTimeline(); actualizarHash(); dibujarResultados();
        });
      });
    }

    function dibujarResultados() {
      var lista = todas.filter(function(n) {
        if (estado.tema && n.tema !== estado.tema) return false;
        if (estado.mes  && claveAnioMes(n.fecha) !== estado.mes) return false;
        if (estado.texto && (n.titulo + " " + n.resumen).toLowerCase().indexOf(estado.texto.toLowerCase()) === -1) return false;
        return true;
      });
      if (countEl) countEl.textContent = lista.length === 1 ? "1 entrada encontrada" : lista.length + " entradas encontradas";
      resultsEl.innerHTML = lista.length
        ? '<div class="feed">' + conAnunciosEnGrilla(lista.map(entryCardHTML)) + '</div>'
        : '<div class="repo-empty"><strong>Sin resultados</strong>Prueba quitando algún filtro.</div>';
      activarAnunciosPendientes();
    }

    if (searchEl) searchEl.addEventListener("input", function() { estado.texto = searchEl.value; dibujarResultados(); });
    dibujarChips(); dibujarTimeline(); dibujarResultados();
  }

  /* =======================================================================
     ENTRADA INDIVIDUAL
     ========================================================================= */
  function initEntrada() {
    var contenedor = document.getElementById("entrada-contenido");
    if (!contenedor) return;
    var id    = new URLSearchParams(location.search).get("id");
    var todas = todasOrdenadas();
    var n     = todas.find(function(x) { return x.id === id; });

    if (!n) {
      document.title = "No encontrada · VITACORA";
      contenedor.innerHTML =
        '<div style="border:1px dashed var(--rim);padding:var(--s6);text-align:center;color:var(--cream-3)">' +
        '<strong style="display:block;font-family:var(--font-display);font-size:1.3rem;color:var(--cream);margin-bottom:.5rem">Entrada no encontrada</strong>' +
        'El enlace puede estar incompleto o la entrada fue movida.</div>' +
        '<p style="margin-top:1.5rem"><a class="btn btn--ghost" href="repositorio.html">← Repositorio</a></p>';
      return;
    }

    document.title = n.titulo + " · VITACORA";
    actualizarSEOEntrada(n);

    var idx  = todas.indexOf(n);
    var sig  = todas[idx - 1];
    var ant  = todas[idx + 1];
    var tema = temaInfo(n.tema);
    var min  = tiempoLecturaMin(n.contenidoHTML);

    function navItem(entry, label, clase) {
      if (!entry) return "";
      return '<a class="entry-nav__item ' + clase + '" href="entrada.html?id=' + encodeURIComponent(entry.id) + '">' +
             '<span class="entry-nav__label">' + label + '</span>' +
             '<span class="entry-nav__title">' + esc(entry.titulo) + '</span></a>';
    }

    var relacionadas = todas.filter(function(x) { return x.tema === n.tema && x.id !== n.id; }).slice(0, 3);
    var relacionadasHTML = relacionadas.length
      ? '<section class="entry-related"><h2 class="entry-related__title">También te puede interesar</h2>' +
        '<div class="feed">' + relacionadas.map(entryCardHTML).join("") + '</div></section>'
      : "";

    contenedor.innerHTML =
      '<a class="entry-back" href="repositorio.html">Repositorio</a>' +
      '<nav class="breadcrumb" aria-label="Ruta de navegación">' +
        '<a href="index.html">Inicio</a><span class="breadcrumb__sep">/</span>' +
        '<a href="repositorio.html">Repositorio</a><span class="breadcrumb__sep">/</span>' +
        '<a href="repositorio.html#tema=' + encodeURIComponent(n.tema) + '">' + esc(tema.label) + '</a>' +
        '<span class="breadcrumb__sep">/</span>' +
        '<span aria-current="page">' + esc(truncar(n.titulo, 42)) + '</span></nav>' +
      (n.imagen
        ? '<div class="entry-hero entry-hero--media" style="background-image:url(\'' + esc(n.imagen) + '\')">' +
          '<span class="entry-hero__tag">' + tagHTML(n.tema) + '</span></div>'
        : '<div class="entry-hero" data-num="' + padId(n.id) + '" style="--entry-hero-color:' + tema.color + '">' +
          '<span class="entry-hero__tag">' + tagHTML(n.tema) + '</span></div>') +
      '<header class="entry-header">' +
        '<div class="entry-header__meta">' + tagHTML(n.tema) +
          '<span class="entry-header__date">Nº\u00a0' + n.id + ' · ' + formatFechaLarga(n.fecha) + '</span>' +
          '<span class="reading-time">' + icono("reloj") + min + ' min de lectura</span></div>' +
        '<h1 class="display-2">' + esc(n.titulo) + '</h1></header>' +
      '<div class="entry-ornament" aria-hidden="true"><span></span><svg viewBox="0 0 12 12"><path d="M6 0 8 4l4 2-4 2-2 4-2-4-4-2 4-2Z" fill="currentColor"/></svg><span></span></div>' +
      '<div class="entry-paper"><div class="entry-content">' + n.contenidoHTML + '</div>' +
        '<div class="entry-actions">' +
          '<button class="entry-share-btn" id="btn-like" type="button" data-liked="false">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 8.6c0 4-7.8 9-8.8 9.6-1-.6-8.8-5.6-8.8-9.6C3.2 5.7 5.4 3.6 8 3.6c1.7 0 3.2.9 4 2.3.8-1.4 2.3-2.3 4-2.3 2.6 0 4.8 2.1 4.8 5z"/></svg>' +
            ' <span id="like-count">0</span> Me gusta</button>' +
          '<button class="entry-share-btn" id="btn-compartir" type="button">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>' +
            ' Copiar enlace</button>' +
          '<a class="entry-share-btn" target="_blank" rel="noopener" href="https://wa.me/?text=' + encodeURIComponent(n.titulo + " — " + location.href) + '">' +
            '<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.6.1-.2.3-.7.9-.9 1-.2.2-.3.2-.6.1-.9-.4-1.8-1-2.6-1.8-.7-.7-1.3-1.5-1.7-2.3-.1-.2 0-.4.1-.5.2-.2.4-.5.6-.7.1-.2.1-.4 0-.6-.1-.2-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-.1 2.4.9 1.4 1.6 2 2.9 3.2 1.7 1.4 3.1 1.9 3.6 2.1.5.2.8.1 1.1-.1.3-.3 1-.9 1.2-1.2.2-.3.4-.3.6-.2l1.9.9c.2.1.4.2.5.3.1.2.1.9-.2 1.3z"/><path d="M12 2C6.5 2 2 6.5 2 12c0 1.8.5 3.6 1.4 5.1L2 22l5-1.3c1.4.8 3.1 1.2 4.9 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2zm0 18c-1.6 0-3.1-.4-4.4-1.2l-.3-.2-2.9.8.8-2.8-.2-.3C4.4 15 4 13.5 4 12c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8z"/></svg>' +
            ' WhatsApp</a></div></div>' +
      '<section class="entry-comments" id="entry-comments">' +
        '<h2 class="entry-comments__title">Comentarios</h2>' +
        '<div id="comments-gate"></div>' +
        '<div id="comments-list" class="comments-list"></div>' +
      '</section>' +
      relacionadasHTML +
      '<nav class="entry-nav" aria-label="Navegación entre entradas">' +
        navItem(ant, "← Entrada anterior", "entry-nav__item--prev") +
        navItem(sig, "Entrada siguiente →", "entry-nav__item--next") +
      '</nav>';

    var btn   = document.getElementById("btn-compartir");
    var toast = document.getElementById("share-toast");
    if (btn && toast) {
      btn.addEventListener("click", function() {
        function mostrar() {
          toast.classList.add("is-visible");
          setTimeout(function() { toast.classList.remove("is-visible"); }, 2200);
        }
        if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(mostrar);
        else {
          var ta = document.createElement("textarea");
          ta.value = location.href; ta.style.cssText = "position:fixed;opacity:0";
          document.body.appendChild(ta); ta.select();
          document.execCommand("copy"); document.body.removeChild(ta); mostrar();
        }
      });
    }
    initComentariosYLikes(n.id);
    activarAnunciosPendientes();
  }

  /* =======================================================================
     COMENTARIOS Y LIKES (cualquier usuario logueado con Google, no solo admin)
     ========================================================================= */
  function initComentariosYLikes(entradaId) {
    var btnLike   = document.getElementById("btn-like");
    var likeCount = document.getElementById("like-count");
    var gate      = document.getElementById("comments-gate");
    var lista     = document.getElementById("comments-list");
    if (!gate || !lista) return;

    function escHTML(str) { var d = document.createElement("div"); d.textContent = str; return d.innerHTML; }
    function formatFechaComentario(iso) {
      return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
    }

    function pintarLike() {
      return Promise.all([fetchLikesCount(entradaId), fetchMiLike(entradaId)]).then(function(r) {
        if (likeCount) likeCount.textContent = r[0];
        if (btnLike) btnLike.setAttribute("data-liked", r[1] ? "true" : "false");
      }).catch(function(e) { console.error("Error cargando likes", e); });
    }

    function pintarComentarios() {
      return Promise.all([fetchComentarios(entradaId), getUser()]).then(function(r) {
        var comentarios = r[0], user = r[1];
        if (!comentarios.length) {
          lista.innerHTML = '<p class="comments-empty">Todavía no hay comentarios. Sé el primero.</p>';
          return;
        }
        lista.innerHTML = comentarios.map(function(c) {
          var puedeBorrar = user && user.id === c.user_id;
          var avatar = c.user_avatar
            ? '<img class="comment-item__avatar" src="' + escHTML(c.user_avatar) + '" alt="" loading="lazy">'
            : '<span class="comment-item__avatar"></span>';
          return (
            '<div class="comment-item">' + avatar +
              '<div class="comment-item__body">' +
                '<div class="comment-item__head">' +
                  '<span class="comment-item__name">' + escHTML(c.user_name || c.user_email) + '</span>' +
                  '<span class="comment-item__date">' + formatFechaComentario(c.created_at) + '</span>' +
                  (puedeBorrar ? '<button class="comment-item__del" data-id="' + c.id + '">Borrar</button>' : '') +
                '</div>' +
                '<p class="comment-item__text">' + escHTML(c.contenido) + '</p>' +
              '</div>' +
            '</div>'
          );
        }).join('');
        lista.querySelectorAll(".comment-item__del").forEach(function(b) {
          b.addEventListener("click", function() {
            if (!confirm("¿Borrar este comentario?")) return;
            deleteComentario(b.getAttribute("data-id")).then(pintarComentarios)
              .catch(function(e) { alert("Error al borrar: " + e.message); });
          });
        });
      }).catch(function(e) {
        lista.innerHTML = '<p class="comments-empty">No se pudieron cargar los comentarios.</p>';
        console.error(e);
      });
    }

    function pintarGate() {
      return getUser().then(function(user) {
        if (!user) {
          gate.innerHTML =
            '<div class="comments-gate">' +
              '<span class="comments-gate__text">Inicia sesión con Google para comentar y dar like.</span>' +
              '<button class="btn btn--ghost" id="btn-comment-login" style="padding:.6rem 1.1rem;font-size:.7rem">Iniciar sesión</button>' +
            '</div>';
          var loginBtn = document.getElementById("btn-comment-login");
          if (loginBtn) loginBtn.addEventListener("click", function() {
            signInWithGoogle().catch(function(e) { alert(e.message); });
          });
          return;
        }
        var meta   = user.user_metadata || {};
        var avatar = meta.avatar_url || meta.picture;
        gate.innerHTML =
          '<form class="comment-form" id="comment-form">' +
            '<div class="comment-form__user">' +
              (avatar ? '<img class="comment-form__avatar" src="' + escHTML(avatar) + '" alt="">' : '') +
              '<span>' + escHTML(meta.full_name || meta.name || user.email) + '</span>' +
            '</div>' +
            '<textarea class="comment-textarea" id="comment-texto" placeholder="Escribe un comentario…" maxlength="1000" required></textarea>' +
            '<div class="comment-form__actions">' +
              '<button type="submit" class="btn btn--primary" style="padding:.6rem 1.3rem;font-size:.7rem">Comentar</button>' +
            '</div>' +
          '</form>';
        var form = document.getElementById("comment-form");
        form.addEventListener("submit", function(ev) {
          ev.preventDefault();
          var textarea = document.getElementById("comment-texto");
          var texto    = textarea.value.trim();
          if (!texto) return;
          var submitBtn = form.querySelector('button[type="submit"]');
          submitBtn.disabled = true;
          addComentario(entradaId, texto).then(function() {
            textarea.value = "";
            return pintarComentarios();
          }).catch(function(e) {
            alert("Error al comentar: " + e.message);
          }).finally(function() { submitBtn.disabled = false; });
        });
      });
    }

    if (btnLike) {
      btnLike.addEventListener("click", function() {
        getUser().then(function(user) {
          if (!user) { signInWithGoogle().catch(function(e) { alert(e.message); }); return; }
          btnLike.disabled = true;
          toggleLike(entradaId).then(pintarLike)
            .catch(function(e) { alert("Error: " + e.message); })
            .finally(function() { btnLike.disabled = false; });
        });
      });
    }

    pintarGate();
    pintarLike();
    pintarComentarios();

    _sb.auth.onAuthStateChange(function() {
      pintarGate();
      pintarLike();
      pintarComentarios();
    });
  }

  /* =======================================================================
     REVELADO AL HACER SCROLL
     ========================================================================= */
  function initRevelar() {
    if (!("IntersectionObserver" in window)) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    var selectores = ".entry-card, .entry-featured, .section-label, .entry-related, .entry-comments";
    var elementos = Array.prototype.slice.call(document.querySelectorAll(selectores));
    if (!elementos.length) return;

    elementos.forEach(function(el, i) {
      el.classList.add("reveal");
      // escalonar dentro de un mismo grupo (tarjetas hermanas)
      var hermanos = el.parentElement ? el.parentElement.children : [el];
      var idx = Array.prototype.indexOf.call(hermanos, el);
      el.style.setProperty("--reveal-delay", (Math.min(idx, 6) * 70) + "ms");
    });

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.add("reveal--in");
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    elementos.forEach(function(el) { io.observe(el); });
  }

  /* =======================================================================
     BARRA DE PROGRESO DE LECTURA (solo en entrada con artículo)
     ========================================================================= */
  function initProgresoLectura() {
    var paper = document.querySelector(".entry-paper");
    if (!paper) return;

    var barra = document.createElement("div");
    barra.className = "read-progress";
    barra.setAttribute("aria-hidden", "true");
    var fill = document.createElement("span");
    barra.appendChild(fill);
    document.body.appendChild(barra);

    var ticking = false;
    function actualizar() {
      var rect = paper.getBoundingClientRect();
      var vh = window.innerHeight || document.documentElement.clientHeight;
      var total = rect.height - vh;
      var avance = total > 0 ? (-rect.top) / total : 0;
      avance = Math.max(0, Math.min(1, avance));
      fill.style.transform = "scaleX(" + avance + ")";
      ticking = false;
    }
    function onScroll() {
      if (!ticking) { window.requestAnimationFrame(actualizar); ticking = true; }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    actualizar();
  }

  /* =======================================================================
     ARRANQUE
     ========================================================================= */
  await cargarDatos();
  initNav();
  initNavAuth();
  initInicio();
  initRepositorio();
  initEntrada();
  initAds();
  initRevelar();
  initProgresoLectura();
  var anioEl = document.getElementById("anio-actual");
  if (anioEl) anioEl.textContent = new Date().getFullYear();

})();
