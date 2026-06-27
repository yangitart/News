# VitaCora

Bit&aacute;cora personal hecha en HTML, CSS y JavaScript puro (sin frameworks,
sin proceso de compilaci&oacute;n). Pensada para publicarse directamente en
GitHub Pages.

## Estructura del proyecto

```
VitaCora/
├── index.html              Página de inicio (hero + últimas entradas)
├── repositorio.html         Archivo completo, filtrable por tema y fecha
├── entrada.html              Plantilla genérica para ver una entrada completa
├── .nojekyll                 Evita que GitHub procese el sitio con Jekyll
└── assets/
    ├── css/style.css         Todos los estilos del sitio
    ├── js/data.js             ⭐ AQUÍ se agregan las noticias/entradas
    ├── js/main.js              Lógica de la web (no necesitas tocarlo)
    └── img/favicon.svg         Ícono del sitio
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
   - `titulo` / `resumen`: lo que se ve en la tarjeta.
   - `contenidoHTML`: el cuerpo completo de la entrada, en HTML normal
     (`<p>`, `<h2>`, `<ul>`, `<blockquote>`, `<img>`, `<a>`, etc.). Puedes
     pegar HTML que ya tengas escrito en cualquier otro lugar.
5. Guarda y sube el cambio a GitHub.

No necesitas modificar `main.js`, `style.css` ni los archivos `.html`
para publicar una entrada nueva.

### Agregar un tema nuevo

En el mismo archivo `data.js`, agrega una línea al objeto `TEMAS`:

```js
const TEMAS = {
  tecnologia: { label: "Tecnología", color: "#5B7065" },
  miTemaNuevo: { label: "Mi Tema Nuevo", color: "#7A4A4A" }
};
```

El `color` se usa para el sello/etiqueta de esa categoría en las tarjetas
y en la página de la entrada.

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

El archivo `.nojekyll` ya está incluido para evitar problemas de
procesamiento automático de GitHub Pages.

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
