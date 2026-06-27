/* =========================================================================
   VitaCora — datos
   =========================================================================
   Para agregar una entrada nueva, copia el objeto de PLANTILLA,
   pégalo dentro del arreglo NOTICIAS y rellena los campos.
   No hace falta tocar ningún otro archivo.

   Campos:
     id           → string único, ej. "0006"
     fecha        → "AAAA-MM-DD"
     tema         → clave de TEMAS (o agrega una nueva línea en TEMAS)
     titulo       → título de la entrada
     resumen      → texto corto para las tarjetas (1-2 frases)
     imagen       → (opcional) ruta a una foto de portada, ej.
                    "assets/img/entradas/mi-foto.jpg". Si no la pones,
                    se sigue mostrando el bloque de color + icono del
                    tema, como hasta ahora. Ver assets/img/entradas/README.md
     imagenAlt    → (opcional) texto alternativo de la foto de portada
     contenidoHTML → HTML completo del cuerpo: <p>, <h2>, <ul>, <blockquote>…
                    También puedes meter fotos dentro del cuerpo con
                    <figure><img src="assets/img/entradas/x.jpg" alt="…">
                    <figcaption>Pie de foto opcional</figcaption></figure>
   ========================================================================= */

const TEMAS = {
  tecnologia:  { label: "Tecnología",          color: "#5B7065" },
  desarrollo:  { label: "Desarrollo Personal",  color: "#8B3A2B" },
  lecturas:    { label: "Lecturas",             color: "#4A5D7A" },
  cuerpo:      { label: "Cuerpo y Movimiento",  color: "#9C6B30" },
  reflexiones: { label: "Reflexiones",          color: "#6B5B7A" }
};

/*
PLANTILLA — cópiala para crear una entrada nueva:

{
  id: "0003",
  fecha: "2026-07-10",
  tema: "tecnologia",
  titulo: "Título de la entrada",
  resumen: "Una o dos frases que resumen la entrada para las tarjetas.",
  imagen: "assets/img/entradas/mi-foto.jpg",   // opcional, borra la línea si no tienes foto
  imagenAlt: "Descripción corta de la foto",    // opcional
  contenidoHTML: `
    <p>Primer párrafo...</p>
    <h2>Un subtítulo</h2>
    <p>Más contenido con <strong>negritas</strong>, <em>cursivas</em>
    y <a href="https://ejemplo.com">enlaces</a>.</p>
    <figure>
      <img src="assets/img/entradas/otra-foto.jpg" alt="Descripción">
      <figcaption>Pie de foto opcional.</figcaption>
    </figure>
    <blockquote>Una cita destacada.</blockquote>
  `
},
*/

const NOTICIAS = [
  {
    id: "0001",
    fecha: "2026-05-03",
    tema: "lecturas",
    titulo: "Lo que me dejó \u201cAntifragile\u201d de Nassim Taleb",
    resumen: "Notas sobre sistemas que mejoran con el desorden, y por qué buscar la comodidad constante puede salir caro.",
    contenidoHTML: `
      <p>Terminé de releer <em>Antifragile</em> y esta vez subrayé mucho menos:
      casi todo lo importante cabe en una idea. Hay cosas que se rompen con el
      estrés, otras que solo lo resisten, y un tercer grupo —el interesante—
      que en realidad se fortalece con él.</p>
      <h2>Lo práctico, no solo lo teórico</h2>
      <p>Lo que más me quedó no fue el concepto en sí, sino la pregunta que
      deja para cualquier sistema que diseñes: <strong>¿qué le pasa a esto
      si la realidad lo golpea más fuerte de lo previsto?</strong></p>
      <ul>
        <li>Diversificar no es lo mismo que diluir el riesgo a cero.</li>
        <li>Los sistemas demasiado optimizados para un escenario suelen ser
        los más frágiles ante uno distinto.</li>
        <li>Cierta fricción temprana evita sorpresas grandes después.</li>
      </ul>
      <blockquote>El objetivo no es predecir el cisne negro, sino construir
      algo que no se derrumbe cuando aparezca.</blockquote>
    `
  },
  {
    id: "0002",
    fecha: "2026-06-25",
    tema: "tecnologia",
    titulo: "Migrar de celdas hexagonales a geohash: lo que aprendí",
    resumen: "Cambiar de H3 a geohash no fue solo una decisión técnica: simplificó toda la lógica que dependía de la cuadrícula.",
    contenidoHTML: `
      <p>Después de varias semanas trabajando con celdas hexagonales para el
      mapa del juego, terminé migrando todo el sistema a geohash con celdas
      cuadradas. No fue una decisión que tomé a la ligera, pero el resultado
      valió la pena.</p>
      <h2>¿Por qué cambiar?</h2>
      <p>Los hexágonos se ven bien en un mapa, pero cada operación de
      vecindad y conversión a pantalla pedía una librería externa y código
      adicional para resolver casos borde. Con geohash, gran parte de esa
      complejidad desaparece porque las celdas son cuadradas y se alinean
      naturalmente con una grilla simple.</p>
      <ul>
        <li>El renderizado pasó de geometría hexagonal a rectángulos: mucho menos código.</li>
        <li>Calcular la celda vecina para asignar un dron se volvió trivial.</li>
        <li>El tamaño de celda ahora se ajusta cambiando la longitud del geohash.</li>
      </ul>
      <p>La lección general: una abstracción más «bonita» no siempre es la
      más simple de mantener.</p>
    `
  }
];
