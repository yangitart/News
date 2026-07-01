/* =========================================================================
   VITACORA — fondo ambiental con Three.js
   Polvo dorado a la deriva + una gema facetada con halo, detrás de todo el
   contenido. Se degrada con elegancia: si no hay WebGL, si el usuario pide
   "menos movimiento" o si el CDN no responde, la página sigue igual de bien
   sin el fondo animado.
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isNarrow ? 1.5 : 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  var raizStyle = getComputedStyle(document.documentElement);
  function colorCSS(nombre, fallback) {
    var v = raizStyle.getPropertyValue(nombre).trim();
    return new THREE.Color(v || fallback);
  }
  var colVoid     = colorCSS("--void", "#0A0E14");
  var colGold     = colorCSS("--gold", "#C8933A");
  var colGoldDim  = colorCSS("--gold-dim", "#A07530");
  var colGoldPale = colorCSS("--gold-pale", "#F0D48A");

  var scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(colVoid.getHex(), 0.045);

  var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 26);

  /* ---------- Polvo dorado ---------- */
  var TOTAL = isNarrow ? 260 : 640;
  var geoPolvo = new THREE.BufferGeometry();
  var posiciones = new Float32Array(TOTAL * 3);
  var fases = new Float32Array(TOTAL);
  var velocidades = new Float32Array(TOTAL);
  var colores = new Float32Array(TOTAL * 3);
  var paleta = [colGold, colGoldPale, colGoldDim];

  for (var i = 0; i < TOTAL; i++) {
    posiciones[i * 3 + 0] = (Math.random() - 0.5) * 60;
    posiciones[i * 3 + 1] = (Math.random() - 0.5) * 40;
    posiciones[i * 3 + 2] = (Math.random() - 0.5) * 50 - 10;
    fases[i] = Math.random() * Math.PI * 2;
    velocidades[i] = 0.15 + Math.random() * 0.35;
    var c = paleta[i % paleta.length];
    colores[i * 3 + 0] = c.r; colores[i * 3 + 1] = c.g; colores[i * 3 + 2] = c.b;
  }
  geoPolvo.setAttribute("position", new THREE.BufferAttribute(posiciones, 3));
  geoPolvo.setAttribute("color", new THREE.BufferAttribute(colores, 3));

  var texturaSprite = (function () {
    var c = document.createElement("canvas");
    c.width = c.height = 64;
    var ctx = c.getContext("2d");
    var g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.35, "rgba(255,244,220,.7)");
    g.addColorStop(1, "rgba(255,244,220,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();

  var matPolvo = new THREE.PointsMaterial({
    size: isNarrow ? 0.34 : 0.42,
    map: texturaSprite,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    fog: true
  });
  var polvo = new THREE.Points(geoPolvo, matPolvo);
  scene.add(polvo);

  /* ---------- Gema facetada con halo ---------- */
  var gema = new THREE.Group();
  gema.position.set(isNarrow ? 0 : 9.5, 1.2, -9);
  scene.add(gema);

  var icoEdges = new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(6.4, 0));
  var icoLineas = new THREE.LineSegments(icoEdges, new THREE.LineBasicMaterial({
    color: colGold, transparent: true, opacity: 0.4, fog: true
  }));
  gema.add(icoLineas);

  var dodecaEdges = new THREE.EdgesGeometry(new THREE.DodecahedronGeometry(3.4, 0));
  var dodecaLineas = new THREE.LineSegments(dodecaEdges, new THREE.LineBasicMaterial({
    color: colGoldPale, transparent: true, opacity: 0.3, fog: true
  }));
  gema.add(dodecaLineas);

  var halo = new THREE.Mesh(
    new THREE.TorusGeometry(8.6, 0.012, 8, 128),
    new THREE.MeshBasicMaterial({ color: colGoldDim, transparent: true, opacity: 0.35, fog: true })
  );
  halo.rotation.x = Math.PI / 2.6;
  halo.rotation.y = 0.3;
  gema.add(halo);

  /* ---------- Interacción sutil (paralaje) ---------- */
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

  /* ---------- Bucle de animación ---------- */
  var reloj = new THREE.Clock();
  var raf = null;

  function animar() {
    raf = requestAnimationFrame(animar);
    var t = reloj.getElapsedTime();

    var attr = geoPolvo.attributes.position;
    for (var i = 0; i < TOTAL; i++) {
      attr.array[i * 3 + 1] += Math.sin(t * velocidades[i] + fases[i]) * 0.0018;
    }
    attr.needsUpdate = true;
    polvo.rotation.y = t * 0.012;

    gema.rotation.y = t * 0.06;
    gema.rotation.x = Math.sin(t * 0.15) * 0.08;
    halo.rotation.z = t * 0.03;

    objetivo.x += (mouse.y * 0.12 - objetivo.x) * 0.03;
    objetivo.y += (mouse.x * 0.16 - objetivo.y) * 0.03;
    camera.position.x += (objetivo.y * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (-objetivo.x * 1.2 - scrollY * 0.002 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, -6);

    renderer.render(scene, camera);
  }

  function reanudar() { if (raf === null) animar(); }
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
