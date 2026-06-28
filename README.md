# VITACORA

Bit&aacute;cora personal hecha en HTML, CSS y JavaScript puro (sin frameworks,
sin proceso de compilaci&oacute;n). Pensada para publicarse directamente en
GitHub Pages, con responsive cuidado de punta a punta y los espacios de
anuncios ya integrados: para monetizar solo falta pegar tu c&oacute;digo de
AdSense (o la red que uses).

## Estructura del proyecto

```
VITACORA/
├── index.html                Página de inicio (hero + últimas entradas)
├── repositorio.html           Archivo completo, filtrable por tema y fecha
├── entrada.html                Plantilla genérica para ver una entrada completa
├── 404.html                    Página de error 404 (mismo estilo del sitio)
├── .nojekyll                   Evita que GitHub procese el sitio con Jekyll
├── robots.txt                  Indica a los buscadores qué pueden indexar
├── sitemap.xml                 Mapa del sitio para buscadores (inicio + repositorio)
├── ads.txt                     Autorización de vendedores de anuncios (IAB)
├── site.webmanifest            Metadatos básicos de "app" para móviles
└── assets/
    ├── css/style.css           Todos los estilos del sitio (incluye responsive y anuncios)
    ├── js/data.js                ⭐ AQUÍ se agregan las noticias/entradas
    ├── js/main.js                 Lógica de la web + configuración de anuncios
    ├── img/favicon.svg            Ícono del sitio (pestaña del navegador)
    ├── img/logo.svg               Logo temporal del sitio (reemplázalo cuando tengas el definitivo)
    └── img/entradas/              Pon aquí las fotos que uses en tus entradas
```

## Cómo agregar una entrada nueva

Todo el contenido vive en **`assets/js/data.js`**. No hace falta crear
archivos nuevos ni tocar HTML.

1. Abre `assets/js/data.js`.
2. Copia el bloque de ejemplo "PLANTILLA" que está comentado cerca del
   inicio del archivo.
3. Pégalo dentro del arreglo `NOTICIAS` (en cualquier posición; el orden
   del archivo no importa, la web siempre ordena por fecha).
4. Completa los campos:
   - `id`: un identificador único (por ejemplo el siguiente número libre).
   - `fecha`: formato `AAAA-MM-DD`.
   - `tema`: una de las claves definidas en `TEMAS` (ver abajo).
   - `titulo` / `resumen`: lo que se ve en la tarjeta, en el resumen para
     compartir y en el fragmento que usan los buscadores.
   - `imagen` (opcional): ruta a una foto de portada, ej.
     `"assets/img/entradas/mi-foto.jpg"`. Se usa en la tarjeta, en la
     entrada destacada de inicio y en la cabecera de la entrada. Si no la
     pones, se muestra el bloque de color + icono del tema, como antes.
   - `contenidoHTML`: el cuerpo completo de la entrada, en HTML normal
     (`<p>`, `<h2>`, `<ul>`, `<blockquote>`, `<img>`, `<a>`, etc.). Puedes
     pegar HTML que ya tengas escrito en cualquier otro lugar. Para fotos
     dentro del cuerpo usa `<figure><img src="..." alt="...">
     <figcaption>...</figcaption></figure>` (el estilo ya está listo).
5. Guarda y sube el cambio a GitHub.

No necesitas modificar `main.js`, `style.css` ni los archivos `.html`
para publicar una entrada nueva. El tiempo de lectura, la cabecera de la
entrada, las migas de pan y las "entradas relacionadas" se generan solos
a partir de estos mismos campos.

### Agregar un tema nuevo

En el mismo archivo `data.js`, agrega una línea al objeto `TEMAS`:

```js
const TEMAS = {
  tecnologia: { label: "Tecnología", color: "#5B7065" },
  miTemaNuevo: { label: "Mi Tema Nuevo", color: "#7A4A4A" }
};
```

El `color` se usa para el sello/etiqueta de esa categoría en las tarjetas,
en la página de la entrada y en la cabecera generada de cada entrada.

## Anuncios y monetización

El sitio ya tiene los espacios de anuncio integrados en el dise&ntilde;o
(con su aviso de "Publicidad" visible, como exige la transparencia b&aacute;sica
de cualquier red publicitaria). Mientras no actives una red, esos espacios
se muestran como recuadros con el texto "Espacio publicitario", para que
veas exactamente d&oacute;nde apareceran sin que el dise&ntilde;o se rompa.

Ubicaciones (se insertan solas, sin tocar el HTML):

- **Cabecera (`leaderboardTop`)**: justo debajo del menú, en las 3 páginas.
- **Pie (`leaderboardFooter`)**: justo antes del pie de página, en las 3.
- **Barra lateral (`sidebar`)**: en el repositorio, junto a la línea de
  tiempo (se oculta en móvil para no saturar la pantalla).
- **Dentro de la grilla (`infeed`)**: en el repositorio, cada 6 tarjetas
  de resultados.
- **Dentro del artículo (`instream`)**: en cada entrada, justo después
  del cuerpo del texto.

### Para activarlos

1. Crea tu cuenta en Google AdSense (u otra red) y espera la aprobación.
2. Pega el script de verificación que te entreguen en el `<head>` de
   `index.html`, `repositorio.html` y `entrada.html` (una sola vez en
   cada archivo).
3. Abre `assets/js/main.js` y, al principio del archivo, edita
   `ADS_CONFIG`:
   ```js
   var ADS_CONFIG = {
     activo: true,                       // antes en false
     cliente: "ca-pub-XXXXXXXXXXXXXXXX",  // tu ID de cliente
     slots: {
       leaderboardTop: "1111111111",
       leaderboardFooter: "2222222222",
       sidebar: "3333333333",
       infeed: "4444444444",
       instream: "5555555555"
     }
   };
   ```
   Cada número de `slots` es el "ID de bloque de anuncios" que generas en
   tu panel de AdSense al crear cada unidad (puedes usar el mismo ID en
   varios si no quieres crear 5 unidades distintas).
4. Sustituye el contenido de `ads.txt` por la línea real que te indique
   tu red (ahí mismo el archivo trae un ejemplo comentado).
5. Sube los cambios. Listo: no hay nada más que tocar en el diseño.

### Aviso de cookies

Como mostrar anuncios suele implicar cookies, el sitio incluye un aviso
breve la primera vez que alguien lo visita ("¿Lo aceptas? / Rechazar /
Aceptar"). La decisiónVITACORAda en el navegador de la persona y queda
disponible en `window.VITACORA_CONSENT` ("aceptado" o "rechazado") por si
en el futuro quieres condicionar la carga de anuncios personalizados a
ese valor.

## Cómo publicarlo en GitHub Pages

1. Crea un repositorio nuevo en GitHub (puede ser público o privado, si
   es privado necesitas GitHub Pro/Team/Enterprise para activar Pages).
2. Sube todo el contenido de esta carpeta a la rama `main` del
   repositorio (puede ser con GitHub Desktop, con `git` desde la terminal,
   o arrastrando los archivos desde la web de GitHub).
3. En el repositorio, ve a **Settings → Pages**.
4. En "Build and deployment", elige **Deploy from a branch**, selecciona
   la rama `main` y la carpeta `/ (root)`.
5. Guarda. GitHub te dará una URL del tipo
   `https://tu-usuario.github.io/tu-repositorio/` en uno o dos minutos.
6. **Antes de publicar**, busca y reemplaza `tu-usuario.github.io/tu-repositorio/`
   por tu URL real en estos archivos: `index.html`, `repositorio.html`,
   `entrada.html`, `robots.txt`, `sitemap.xml` y, si lo cambiaste, en
   `urlBase` dentro de `assets/js/main.js`. Es una sola línea por archivo
   (Ctrl+H en casi cualquier editor lo hace de una vez).

El archivo `.nojekyll` ya está incluido para evitar problemas de
procesamiento automático de GitHub Pages.

## SEO y compartibilidad

- Cada página trae metaetiquetas Open Graph y Twitter Card básicas para
  que, al compartir un enlace en WhatsApp, Twitter/X o Facebook, se vea
  un título y descripción decentes en vez de nada.
- En `entrada.html` esas etiquetas son genéricas en el HTML (porque el
  contenido se genera con JavaScript), pero `main.js` las actualiza con
  el título y resumen reales de cada entrada en cuanto carga la página.
  Esto ya ayuda a Google (que sí ejecuta JavaScript), pero algunos
  rastreadores de redes sociales no lo hacen, así que la vista previa de
  VITACORAe compartido puede mostrar el título genérico de "Entrada ·
  VitaCora" en vez del título exacto. Si en algún momento quieres una
  vista previa perfecta por entrada, la solución real es generar cada
  página en el servidor o con un paso de compilación; queda fuera del
  alcance de "sin build" que tiene este proyecto hoy.
- También se inyectan datos estructurados (JSON-LD tipo `Article`) en
  cada entrada, que ayudan a que los buscadores entiendan mejor el
  contenido.
- No se incluye una imagen `og:image` propia todavía: si agregas fotos de
  portada con el campo `imagen`, las vistas previas al compartir un enlace
  seguirán sin foto a menos que agregues la etiqueta `og:image`
  correspondiente en los tres `.html` (idealmente 1200×630&nbsp;px).

## Notas técnicas

- Las tipografías se cargan desde Google Fonts mediante un `<link>` en el
  `<head>` de cada página. Si vas a usar el sitio sin conexión a internet,
  puedes descargarlas y servirlas localmente, pero para GitHub Pages no
  es necesario.
- El filtrado en `repositorio.html` guarda el tema y el mes seleccionados
  en el hash de la URL (por ejemplo `#tema=lecturas&mes=2026-06`), así
  que puedes compartir un enlace directo a una vista filtrada.
- Todo el sitio funciona abriendo `index.html` directamente en el
  navegador (doble clic), sin necesidad de un servidor local.
- El responsive se revisó en cuatro puntos de quiebre además del diseño
  base: 1400px (pantallas muy anchas), 960px (tablet), 768px (móvil
  grande / menú hamburguesa) y 560px y 380px (móviles medianos y muy
  pequeños), cuidando tamaños de toque de al menos 44px en botones y
  enlaces de navegación.
- Mejoras futuras razonables si quieres seguir puliendo: RSS feed,
  `og:image` propio, y listar cada entrada individual en `sitemap.xml`
  (hoy solo lleva las dos páginas fijas, a propósito, para no tener que
  mantenerlo a mano cada vez que publiques).
- Accesibilidad y robustez ya incluidas: enlace "Saltar al contenido
  principal" (visible solo al navegar con teclado), aviso si alguien
  visita el sitio con JavaScript desactivado, y el menú móvil se cierra
  solo al tocar fuera, con la tecla Escape, al elegir un enlace o al
  pasar a una pantalla de escritorio. También hay una página `404.html`
  con el mismo estilo del sitio (GitHub Pages la usa automáticamente
  cuando alguien visita una URL que no existe).

---
