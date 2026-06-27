/* =========================================================================
   VitaCora — datos de la bitácora
   =========================================================================
   Este es el ÚNICO archivo que necesitas editar para publicar una entrada
   nueva. No requiere backend ni proceso de compilación: es solo HTML/JS.

   PASO A PASO PARA AGREGAR UNA NOTICIA NUEVA
   -------------------------------------------------------------------------
   1. Copia el objeto de ejemplo "PLANTILLA" que está más abajo.
   2. Pégalo dentro del arreglo NOTICIAS (al principio o al final, el orden
      no importa: la web siempre ordena las entradas por fecha).
   3. Cambia "id" por algo único (puedes usar el siguiente número libre).
   4. Cambia "fecha" en formato AAAA-MM-DD (eso es lo que se usa para
      ordenar y para los filtros de fecha del repositorio).
   5. Cambia "tema" por una de las claves definidas en TEMAS (más abajo).
      Si quieres un tema nuevo, agrégalo primero en el objeto TEMAS.
   6. Escribe "titulo" y "resumen" (el resumen es el texto corto que se ve
      en las tarjetas).
   7. Dentro de "contenidoHTML" escribe el cuerpo completo de la noticia,
      en HTML normal: <p>, <h2>, <h3>, <ul>, <li>, <blockquote>, <a>,
      <img>, <strong>, <em>, etc. Puedes pegar literalmente HTML que ya
      tengas escrito en otro lado.
   8. Guarda el archivo y sube los cambios a GitHub. Listo.

   No hace falta tocar ningún otro archivo para publicar una entrada.
   ========================================================================= */

/* ---------- Temas disponibles -------------------------------------------
   "label"  -> nombre que se muestra
   "color"  -> color del sello/etiqueta (código hexadecimal)
   Agrega aquí una línea nueva si necesitas un tema que no existe todavía.
-------------------------------------------------------------------------- */
const TEMAS = {
  tecnologia:  { label: "Tecnología",         color: "#5B7065" },
  desarrollo:  { label: "Desarrollo Personal", color: "#8B3A2B" },
  lecturas:    { label: "Lecturas",            color: "#4A5D7A" },
  cuerpo:      { label: "Cuerpo y Movimiento", color: "#9C6B30" },
  reflexiones: { label: "Reflexiones",         color: "#6B5B7A" }
};

/* ---------- Plantilla de ejemplo (no se publica) -------------------------
   Cópiala cuando quieras escribir una entrada nueva.

   {
     id: "0006",
     fecha: "2026-07-02",
     tema: "tecnologia",
     titulo: "Título de la entrada",
     resumen: "Una o dos frases que resumen la entrada para la tarjeta.",
     contenidoHTML: `
       <p>Primer párrafo de la entrada...</p>
       <h2>Un subtítulo si hace falta</h2>
       <p>Más contenido, con <strong>negritas</strong>, <em>cursivas</em>
       y <a href="https://ejemplo.com">enlaces</a>.</p>
       <ul>
         <li>Una idea</li>
         <li>Otra idea</li>
       </ul>
       <blockquote>Una cita o nota destacada.</blockquote>
     `
   },
-------------------------------------------------------------------------- */

/* ---------- Entradas ------------------------------------------------------
   Estas cinco son entradas de ejemplo para que veas el sistema funcionando.
   Puedes editarlas, borrarlas o dejarlas como referencia.
-------------------------------------------------------------------------- */
const NOTICIAS = [
  {
    id: "0001",
    fecha: "2026-05-03",
    tema: "lecturas",
    titulo: "Lo que me dejó \u201cAntifragile\u201d de Nassim Taleb",
    resumen: "Notas sobre sistemas que mejoran con el desorden, y por qué buscar la comodidad constante puede salir caro a largo plazo.",
    contenidoHTML: `
      <p>Terminé de releer <em>Antifragile</em> y esta vez subrayé mucho menos:
      casi todo lo importante cabe en una idea. Hay cosas que se rompen con el
      estrés, otras que solo lo resisten, y un tercer grupo &mdash;el interesante&mdash;
      que en realidad se fortalece con él.</p>
      <h2>Lo práctico, no solo lo teórico</h2>
      <p>Lo que más me quedó no fue el concepto en sí, sino la pregunta que
      deja para cualquier sistema que diseñes (un hábito, un proyecto, una
      arquitectura de software): <strong>¿qué le pasa a esto si la realidad
      lo golpea más fuerte de lo previsto?</strong></p>
      <ul>
        <li>Diversificar no es lo mismo que diluir el riesgo a cero.</li>
        <li>Los sistemas demasiado optimizados para un escenario suelen ser
        los más frágiles ante uno distinto.</li>
        <li>Cierta cantidad de fricción o variabilidad temprana evita
        sorpresas grandes después.</li>
      </ul>
      <blockquote>El objetivo no es predecir el cisne negro, sino construir
      algo que no se derrumbe cuando aparezca.</blockquote>
      <p>Voy a intentar aplicar esto literalmente a cómo organizo mis
      proyectos de software: menos dependencias que prometen «todo
      resuelto» y más piezas pequeñas que puedo reemplazar sin que el resto
      se caiga.</p>
    `
  },
  {
    id: "0002",
    fecha: "2026-05-19",
    tema: "tecnologia",
    titulo: "Migrar de celdas hexagonales a geohash: lo que aprendí",
    resumen: "Cambiar de H3 a geohash no fue solo una decisión técnica: simplificó toda la lógica de juego que dependía de la cuadrícula.",
    contenidoHTML: `
      <p>Después de varias semanas trabajando con celdas hexagonales para el
      mapa del juego, terminé migrando todo el sistema a geohash con celdas
      cuadradas. No fue una decisión que tomé a la ligera, pero el resultado
      valió la pena.</p>
      <h2>¿Por qué cambiar?</h2>
      <p>Los hexágonos se ven muy bien en un mapa, pero cada operación de
      vecindad, de conversión a coordenadas de pantalla y de almacenamiento
      terminaba pidiendo una librería externa y código adicional para
      resolver casos borde. Con geohash, gran parte de esa complejidad
      desaparece porque las celdas son cuadradas y se alinean naturalmente
      con una grilla simple.</p>
      <h3>Lo que cambió en la práctica</h3>
      <ul>
        <li>El renderizado de la grilla pasó de necesitar geometría
        hexagonal a dibujar rectángulos: mucho menos código.</li>
        <li>Calcular la celda vecina para asignar un dron se volvió trivial.</li>
        <li>El tamaño de celda ahora se ajusta cambiando la longitud del
        geohash, sin tocar el resto del sistema.</li>
      </ul>
      <p>La lección general: una abstracción más «bonita» no siempre es la
      más simple de mantener. A veces conviene la opción aburrida.</p>
    `
  },
  {
    id: "0003",
    fecha: "2026-06-02",
    tema: "cuerpo",
    titulo: "Tres meses de calistenia: lo que sí funcionó",
    resumen: "Progresar en calistenia se parece más a depurar código que a \u201centrenar duro\u201d: hay que medir, ajustar y tener paciencia.",
    contenidoHTML: `
      <p>Llevo tres meses entrenando calistenia de forma constante y quiero
      dejar registrado lo que realmente funcionó, sin la parte de
      entusiasmo inicial que se evapora a la semana dos.</p>
      <ul>
        <li><strong>Progresiones, no repeticiones a la fuerza:</strong> avanzar
        de una variante más fácil a una más difícil cuando la técnica es
        sólida, no cuando la impaciencia lo pide.</li>
        <li><strong>Registrar cada sesión:</strong> sin un registro simple de
        series y repeticiones es imposible saber si en verdad hay progreso
        o solo cansancio.</li>
        <li><strong>Caminar como recuperación activa:</strong> las caminatas
        largas terminaron siendo el complemento perfecto para los días sin
        entrenar fuerza.</li>
      </ul>
      <p>Nada de esto es novedoso, pero escribirlo aquí sirve como ancla para
      dentro de unos meses, cuando quiera comparar dónde estaba.</p>
    `
  },
  {
    id: "0004",
    fecha: "2026-06-14",
    tema: "reflexiones",
    titulo: "Debatir para entender, no para ganar",
    resumen: "Una conversación reciente me hizo notar cuánto cambia un debate cuando el objetivo deja de ser \u201ctener razón\u201d.",
    contenidoHTML: `
      <p>Tuve una discusión larga esta semana sobre un tema en el que estaba
      bastante seguro de mi posición. A mitad de la conversación noté algo:
      estaba más concentrado en encontrar el siguiente contraargumento que
      en entender lo que la otra persona realmente quería decir.</p>
      <p>Cuando cambié el objetivo &mdash;de «ganar» a «entender por qué
      alguien razonable pensaría distinto»&mdash; la conversación mejoró de
      inmediato. No necesariamente cambié de opinión, pero la discusión dejó
      de ser un partido y empezó a ser útil.</p>
      <blockquote>Si no puedo explicar la posición contraria mejor de lo que
      la explicaría quien la defiende, probablemente no la entiendo todavía.</blockquote>
    `
  },
  {
    id: "0005",
    fecha: "2026-06-25",
    tema: "tecnologia",
    titulo: "Un error de arranque, una hora perdida y una lección sobre confiar en los mensajes de error",
    resumen: "El error \u201cBody is unusable\u201d en Expo CLI no era lo que parecía, y confiar demasiado rápido en la primera hipótesis costó tiempo.",
    contenidoHTML: `
      <p>El error decía <code>Body is unusable</code> al arrancar el
      proyecto con Expo CLI. Mi primera hipótesis fue que algo estaba mal
      con una petición de red en el arranque, así que pasé un buen rato
      revisando ese código sin encontrar nada raro.</p>
      <p>La causa real estaba en otro lugar, relacionada con cómo se estaba
      consumiendo una respuesta más de una vez. La lección, otra vez:</p>
      <ul>
        <li>El mensaje de error es una pista, no un diagnóstico.</li>
        <li>Vale más reproducir el problema de forma aislada que seguir
        leyendo el mismo stack trace una quinta vez.</li>
      </ul>
      <p>Queda documentado aquí para no repetir la misma hora perdida la
      próxima vez que aparezca algo parecido.</p>
    `
  }
];
