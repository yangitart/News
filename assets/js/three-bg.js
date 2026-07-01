/* =========================================================================
   VITACORA — fondo ambiental con Three.js (capa premium)
   Escena nocturna detrás de todo el contenido: polvo dorado con parpadeo
   (shader propio), nebulosas de resplandor, una constelación conectada,
   una gema facetada con núcleo luminoso y satélites en órbita, y estrellas
   fugaces ocasionales. Reacciona con paralaje sutil al mouse y al scroll.

   Se degrada con elegancia: si no hay WebGL, si el usuario pide "menos
   movimiento" o si el CDN no responde, la página sigue igual de bien sin
   el fondo animado. Si el dispositivo va justo de FPS, baja la calidad
   solo (menos resolución, menos partículas) antes que trabarse.
   ========================================================================= */
(async function () {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.getElementById("bg-canvas");
  if (!canvas) return;

  var THREE;
  try {
    THREE = await import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js");
  } catch (e) {
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: true,
      antialias: true,
      powerPreference: "low-power"
    });
  } catch (e) {
    return;
  }

  var isNarrow = window.innerWidth < 720;
  var pixelRatio = Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  var raizStyle = getComputedStyle(document.documentElement);
  function colorCSS(nombre, fallback) {
    var v = raizStyle.getPropertyValue(nombre).trim();
    return new THREE.Color(v || fallback);
  }
  var colGold     = colorCSS("--gold", "#C8933A");
  var colGoldDim  = colorCSS("--gold-dim", "#A07530");
  var colGoldPale = colorCSS("--gold-pale", "#F0D48A");
  var colCream    = colorCSS("--cream", "#EDE4D0");

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 120);
  camera.position.set(0, 0, 26);

  /* ---------- Texturas procedurales (sin descargar nada) ---------- */
  function texturaRadial(paradas) {
    var c = document.createElement("canvas");
    c.width = c.height = 128;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    paradas.forEach(function (p) { g.addColorStop(p[0], p[1]); });
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  var texGlow = texturaRadial([
    [0, "rgba(255,248,230,1)"],
    [0.25, "rgba(240,212,138,.55)"],
    [0.6, "rgba(200,147,58,.12)"],
    [1, "rgba(200,147,58,0)"]
  ]);
  var texNebula = texturaRadial([
    [0, "rgba(240,212,138,.85)"],
    [0.4, "rgba(200,147,58,.30)"],
    [1, "rgba(200,147,58,0)"]
  ]);

  /* ---------- Polvo dorado con shader propio ----------
     Cada partícula tiene tamaño, fase, velocidad y color propios; parpadea
     suavemente y se funde con la distancia. Todo el movimiento vive en el
     vertex shader, así que la CPU no toca el buffer nunca. */
  var TOTAL = isNarrow ? 300 : 720;
  var geoPolvo = new THREE.BufferGeometry();
  var posiciones = new Float32Array(TOTAL * 3);
  var atribSize = new Float32Array(TOTAL);
  var atribFase = new Float32Array(TOTAL);
  var atribVel = new Float32Array(TOTAL);
  var atribColor = new Float32Array(TOTAL * 3);
  var paleta = [colGold, colGoldPale, colGoldDim, colCream];

  for (var i = 0; i < TOTAL; i++) {
    posiciones[i * 3 + 0] = (Math.random() - 0.5) * 64;
    posiciones[i * 3 + 1] = (Math.random() - 0.5) * 44;
    posiciones[i * 3 + 2] = (Math.random() - 0.5) * 52 - 10;
    atribSize[i] = 0.45 + Math.pow(Math.random(), 2.2) * 1.25;
    atribFase[i] = Math.random() * Math.PI * 2;
    atribVel[i] = 0.15 + Math.random() * 0.4;
    var c = paleta[i % paleta.length];
    atribColor[i * 3 + 0] = c.r; atribColor[i * 3 + 1] = c.g; atribColor[i * 3 + 2] = c.b;
  }
  geoPolvo.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
  geoPolvo.setAttribute("aSize", new THREE.BufferAttribute(atribSize, 1));
  geoPolvo.setAttribute("aFase", new THREE.BufferAttribute(atribFase, 1));
  geoPolvo.setAttribute("aVel", new THREE.BufferAttribute(atribVel, 1));
  geoPolvo.setAttribute("aColor", new THREE.BufferAttribute(atribColor, 3));

  var uniformes = {
    uTime: { value: 0 },
    uPixelRatio: { value: pixelRatio }
  };

  var matPolvo = new THREE.ShaderMaterial({
    uniforms: uniformes,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: [
      "attribute float aSize;",
      "attribute float aFase;",
      "attribute float aVel;",
      "attribute vec3 aColor;",
      "uniform float uTime;",
      "uniform float uPixelRatio;",
      "varying vec3 vColor;",
      "varying float vAlpha;",
      "void main() {",
      "  vec3 p = position;",
      "  p.y += sin(uTime * aVel + aFase) * 0.7;",
      "  p.x += cos(uTime * aVel * 0.6 + aFase * 1.7) * 0.5;",
      "  vec4 mv = modelViewMatrix * vec4(p, 1.0);",
      "  float dist = -mv.z;",
      "  float twinkle = 0.35 + 0.65 * (0.5 + 0.5 * sin(uTime * (0.5 + aVel * 1.4) + aFase * 3.1));",
      "  float lejos = smoothstep(80.0, 28.0, dist);",
      "  float cerca = smoothstep(5.0, 12.0, dist);",
      "  vAlpha = twinkle * lejos * cerca;",
      "  vColor = aColor;",
      "  gl_PointSize = aSize * uPixelRatio * (230.0 / dist);",
      "  gl_Position = projectionMatrix * mv;",
      "}"
    ].join("\n"),
    fragmentShader: [
      "varying vec3 vColor;",
      "varying float vAlpha;",
      "void main() {",
      "  float d = length(gl_PointCoord - vec2(0.5));",
      "  float a = smoothstep(0.5, 0.05, d);",
      "  a *= a;",
      "  gl_FragColor = vec4(vColor, a * vAlpha * 0.7);",
      "}"
    ].join("\n")
  });

  var polvo = new THREE.Points(geoPolvo, matPolvo);
  scene.add(polvo);

  /* ---------- Nebulosas de resplandor (profundidad y atmósfera) ---------- */
  var nebulas = [];
  var datosNebulas = [
    { x: -16, y: 6, z: -28, s: 42, o: 0.10 },
    { x: 14, y: -4, z: -24, s: 34, o: 0.08 },
    { x: 2, y: 12, z: -32, s: 48, o: 0.06 }
  ];
  datosNebulas.forEach(function (d, idx) {
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texNebula,
      transparent: true,
      opacity: isNarrow ? d.o * 0.7 : d.o,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    sp.position.set(d.x, d.y, d.z);
    sp.scale.setScalar(d.s);
    sp.userData = { base: d.s, fase: idx * 2.1 };
    scene.add(sp);
    nebulas.push(sp);
  });

  /* ---------- Gema facetada: núcleo luminoso + jaulas + anillos ---------- */
  var gema = new THREE.Group();
  // En pantallas estrechas la gema baja, se aleja y se encoge para no
  // competir con el texto del hero.
  if (isNarrow) {
    gema.position.set(0, -9, -18);
    gema.scale.setScalar(0.72);
  } else {
    gema.position.set(9.5, 1.2, -9);
  }
  scene.add(gema);

  var nucleo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texGlow,
    transparent: true,
    opacity: isNarrow ? 0.32 : 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  }));
  nucleo.scale.setScalar(7);
  nucleo.userData = { baseOp: nucleo.material.opacity };
  gema.add(nucleo);

  var icoLineas = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(6.4, 0)),
    new THREE.LineBasicMaterial({ color: colGold, transparent: true, opacity: 0.42 })
  );
  gema.add(icoLineas);

  var dodecaLineas = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(3.4, 0)),
    new THREE.LineBasicMaterial({ color: colGoldPale, transparent: true, opacity: 0.32 })
  );
  gema.add(dodecaLineas);

  var octaLineas = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.OctahedronGeometry(1.5, 0)),
    new THREE.LineBasicMaterial({ color: colCream, transparent: true, opacity: 0.5 })
  );
  gema.add(octaLineas);

  var anillos = [];
  var datosAnillos = [
    { r: 8.6, tubo: 0.014, rx: Math.PI / 2.6, ry: 0.3, op: 0.35, vel: 0.05 },
    { r: 9.8, tubo: 0.010, rx: Math.PI / 1.9, ry: -0.55, op: 0.20, vel: -0.035 },
    { r: 11.2, tubo: 0.008, rx: Math.PI / 2.2, ry: 1.1, op: 0.12, vel: 0.022 }
  ];
  datosAnillos.forEach(function (d, idx) {
    var anillo = new THREE.Mesh(
      new THREE.TorusGeometry(d.r, d.tubo, 8, 140),
      new THREE.MeshBasicMaterial({ color: idx === 0 ? colGoldDim : colGold, transparent: true, opacity: d.op })
    );
    anillo.rotation.x = d.rx;
    anillo.rotation.y = d.ry;
    anillo.userData = { vel: d.vel };
    // Satélite luminoso que recorre el anillo
    var satelite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texGlow,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    }));
    satelite.scale.setScalar(1.1 - idx * 0.25);
    satelite.userData = { radio: d.r, fase: idx * 2.3, vel: 0.22 - idx * 0.06 };
    anillo.add(satelite);
    anillo.userData.satelite = satelite;
    gema.add(anillo);
    anillos.push(anillo);
  });

  /* ---------- Constelación conectada (solo escritorio) ---------- */
  var constelacion = null;
  if (!isNarrow) {
    constelacion = new THREE.Group();
    constelacion.position.set(-17, 3, -14);
    var NODOS = 12;
    var nodos = [];
    for (var k = 0; k < NODOS; k++) {
      nodos.push(new THREE.Vector3(
        (Math.random() - 0.5) * 13,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 5
      ));
    }
    // Conectar cada nodo con sus 2 vecinos más cercanos, sin duplicar aristas
    var aristas = {};
    var segmentos = [];
    nodos.forEach(function (n, a) {
      var dists = nodos.map(function (m, b) {
        return { b: b, d: a === b ? Infinity : n.distanceToSquared(m) };
      }).sort(function (x, y) { return x.d - y.d; });
      for (var v = 0; v < 2; v++) {
        var b = dists[v].b;
        var clave = Math.min(a, b) + "-" + Math.max(a, b);
        if (aristas[clave]) continue;
        aristas[clave] = true;
        segmentos.push(n.clone(), nodos[b].clone());
      }
    });
    var geoLineas = new THREE.BufferGeometry().setFromPoints(segmentos);
    var matLineas = new THREE.LineBasicMaterial({ color: colGold, transparent: true, opacity: 0.14 });
    constelacion.add(new THREE.LineSegments(geoLineas, matLineas));

    nodos.forEach(function (n) {
      var estrella = new THREE.Sprite(new THREE.SpriteMaterial({
        map: texGlow,
        transparent: true,
        opacity: 0.55 + Math.random() * 0.3,
        depthWrite: false,
        blending: THREE.AdditiveBlending
      }));
      estrella.position.copy(n);
      estrella.scale.setScalar(0.5 + Math.random() * 0.5);
      constelacion.add(estrella);
    });
    constelacion.userData = { matLineas: matLineas };
    scene.add(constelacion);
  }

  /* ---------- Estrella fugaz ocasional ---------- */
  var texEstela = (function () {
    var c = document.createElement("canvas");
    c.width = 256; c.height = 8;
    var ctx = c.getContext("2d");
    var g = ctx.createLinearGradient(0, 0, 256, 0);
    g.addColorStop(0, "rgba(240,212,138,0)");
    g.addColorStop(0.75, "rgba(240,212,138,.45)");
    g.addColorStop(1, "rgba(255,250,235,1)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 8);
    return new THREE.CanvasTexture(c);
  })();

  var fugaz = new THREE.Mesh(
    new THREE.PlaneGeometry(7, 0.09),
    new THREE.MeshBasicMaterial({
      map: texEstela,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    })
  );
  fugaz.visible = false;
  scene.add(fugaz);

  var estadoFugaz = { activa: false, vida: 0, duracion: 1.3, vel: new THREE.Vector2() };

  function lanzarFugaz() {
    var desdeIzquierda = Math.random() < 0.5;
    fugaz.position.set(desdeIzquierda ? -26 : 26, 10 + Math.random() * 8, -18);
    var vx = (desdeIzquierda ? 1 : -1) * (16 + Math.random() * 8);
    var vy = -(5 + Math.random() * 5);
    estadoFugaz.vel.set(vx, vy);
    fugaz.rotation.z = Math.atan2(vy, vx) + (desdeIzquierda ? 0 : Math.PI);
    estadoFugaz.vida = 0;
    estadoFugaz.activa = true;
    fugaz.visible = true;
  }

  var timerFugaz = null;
  function programarFugaz() {
    timerFugaz = setTimeout(function () {
      if (document.visibilityState !== "hidden") lanzarFugaz();
      programarFugaz();
    }, 7000 + Math.random() * 9000);
  }
  programarFugaz();

  /* ---------- Interacción (paralaje con mouse y scroll) ---------- */
  var mouse = { x: 0, y: 0 };
  var objetivo = { x: 0, y: 0 };
  window.addEventListener("pointermove", function (e) {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  var scrollY = window.scrollY || 0;
  window.addEventListener("scroll", function () {
    scrollY = window.scrollY || window.pageYOffset || 0;
  }, { passive: true });

  /* ---------- Calidad adaptativa ---------- */
  var emaDt = 16;
  var cuadros = 0;
  var nivelCalidad = 0;

  function ajustarCalidad(dtMs) {
    emaDt = emaDt * 0.95 + dtMs * 0.05;
    cuadros++;
    if (cuadros < 120) return;
    if (nivelCalidad === 0 && emaDt > 34) {
      nivelCalidad = 1;
      renderer.setPixelRatio(1);
      uniformes.uPixelRatio.value = 1;
    } else if (nivelCalidad === 1 && emaDt > 40) {
      nivelCalidad = 2;
      geoPolvo.setDrawRange(0, Math.floor(TOTAL / 2));
      nebulas.forEach(function (n) { n.visible = false; });
    }
  }

  /* ---------- Bucle de animación ---------- */
  var reloj = new THREE.Clock();
  var t = 0;
  var raf = null;
  var primerCuadro = true;

  function animar() {
    raf = requestAnimationFrame(animar);
    var dt = Math.min(reloj.getDelta(), 0.05);
    t += dt;
    uniformes.uTime.value = t;

    polvo.rotation.y = t * 0.012;

    gema.rotation.y = t * 0.06;
    gema.rotation.x = Math.sin(t * 0.15) * 0.08;
    nucleo.material.opacity = nucleo.userData.baseOp + 0.12 * Math.sin(t * 0.8);
    octaLineas.rotation.y = -t * 0.2;
    octaLineas.rotation.z = t * 0.13;

    anillos.forEach(function (anillo) {
      anillo.rotation.z += anillo.userData.vel * dt;
      var s = anillo.userData.satelite;
      var a = t * s.userData.vel + s.userData.fase;
      s.position.set(Math.cos(a) * s.userData.radio, Math.sin(a) * s.userData.radio, 0);
    });

    nebulas.forEach(function (n) {
      n.scale.setScalar(n.userData.base * (1 + 0.06 * Math.sin(t * 0.1 + n.userData.fase)));
    });

    if (constelacion) {
      constelacion.rotation.y = Math.sin(t * 0.05) * 0.18;
      constelacion.userData.matLineas.opacity = 0.11 + 0.05 * Math.sin(t * 0.4);
    }

    if (estadoFugaz.activa) {
      estadoFugaz.vida += dt;
      var f = estadoFugaz.vida / estadoFugaz.duracion;
      if (f >= 1) {
        estadoFugaz.activa = false;
        fugaz.visible = false;
        fugaz.material.opacity = 0;
      } else {
        fugaz.position.x += estadoFugaz.vel.x * dt;
        fugaz.position.y += estadoFugaz.vel.y * dt;
        fugaz.material.opacity = Math.sin(f * Math.PI) * 0.8;
      }
    }

    objetivo.x += (mouse.y * 0.12 - objetivo.x) * 0.03;
    objetivo.y += (mouse.x * 0.16 - objetivo.y) * 0.03;
    camera.position.x += (objetivo.y * 1.6 - camera.position.x) * 0.04;
    camera.position.y += (-objetivo.x * 1.3 - scrollY * 0.0028 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -6);

    renderer.render(scene, camera);

    if (primerCuadro) {
      primerCuadro = false;
      canvas.classList.add("is-on");
    }

    ajustarCalidad(dt * 1000);
  }

  function reanudar() { if (raf === null) { reloj.getDelta(); animar(); } }
  function pausar() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") pausar(); else reanudar();
  });

  window.addEventListener("resize", function () {
    var w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  reanudar();
})();
