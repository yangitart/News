/* =========================================================================
   VITACORA — datos
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

/*
   NOTA: las imágenes de las dos entradas de ejemplo de abajo (campo
   "imagen") son fotos de stock libres de derechos (licencia Unsplash),
   puestas TEMPORALMENTE solo para que veas cómo luce el diseño con
   foto de portada. Reemplázalas cuando tengas tus propias imágenes:
   basta con cambiar la ruta por algo como
   "assets/img/entradas/mi-foto.jpg" (ver assets/img/entradas/README.md).
*/

const NOTICIAS = [
  {
    id: "0001",
    fecha: "2026-05-03",
    tema: "lecturas",
    titulo: "Lo que \u201cAntifragile\u201d me ense\u00f1\u00f3 sobre el desorden y el oficio de vivir",
    resumen: "Taleb me dej\u00f3 una pregunta incómoda: \u00bfqu\u00e9 le pasar\u00eda a esto si el mundo lo golpeara m\u00e1s fuerte de lo previsto? Notas sobre fragilidad, azar y la diferencia entre resistir y crecer con el caos.",
    imagen: "https://images.unsplash.com/photo-1775229106888-dca42d0c9f4f?auto=format&fit=crop&w=1200&h=675&q=80",
    imagenAlt: "Estanter\u00edas de libros antiguos en una biblioteca",
    contenidoHTML: `
      <p>Termin\u00e9 de releer <em>Antifragile</em> y esta vez subray\u00e9 mucho menos:
      casi todo lo importante cabe en una idea, y esa idea ni siquiera es nueva
      \u2014ya estaba en Her\u00e1clito, dos mil quinientos a\u00f1os antes de que Taleb le
      pusiera nombre t\u00e9cnico. Todo fluye, todo cambia, y lo \u00fanico estable es el
      cambio mismo. La pregunta no es c\u00f3mo evitarlo, sino qu\u00e9 relaci\u00f3n
      construyes con \u00e9l.</p>
      <h2>Tres categor\u00edas, una misma pregunta</h2>
      <p>Hay cosas que se rompen con el estr\u00e9s, otras que apenas lo resisten, y
      un tercer grupo \u2014el que de verdad importa\u2014 que se fortalece con \u00e9l. Lo
      interesante no es la taxonom\u00eda en s\u00ed, sino la pregunta que deja abierta
      para cualquier sistema, h\u00e1bito o identidad que construyas:
      <strong>\u00bfqu\u00e9 le pasa a esto si la realidad lo golpea m\u00e1s fuerte de lo
      previsto?</strong></p>
      <p>Es casi una versi\u00f3n moderna del <em>amor fati</em> estoico: no se trata
      de desear el golpe, sino de construir algo \u2014una rutina, un cuerpo, una
      mente\u2014 que no necesite que el mundo se porte bien para seguir de pie.</p>
      <ul>
        <li>Diversificar no es lo mismo que diluir el riesgo a cero; a veces
        diluye tambi\u00e9n el sentido.</li>
        <li>Los sistemas \u2014y las personas\u2014 demasiado optimizados para un solo
        escenario suelen ser los m\u00e1s fr\u00e1giles ante uno distinto.</li>
        <li>Cierta fricci\u00f3n temprana, incomodidad elegida a tiempo, evita
        sorpresas grandes despu\u00e9s.</li>
      </ul>
      <p>Lo que m\u00e1s se queda, al final, no es ninguna de las ideas sueltas,
      sino el cambio de postura frente al desorden: dejar de tratarlo como un
      enemigo a vencer y empezar a tratarlo como un material con el que se
      construye.</p>
      <blockquote>El objetivo no es predecir el cisne negro, sino construir
      algo que no se derrumbe \u2014y si puede ser, que mejore\u2014 cuando
      aparezca.</blockquote>
    `
  },
  {
    id: "0002",
    fecha: "2026-06-25",
    tema: "tecnologia",
    titulo: "Migrar de hex\u00e1gonos a geohash: una lecci\u00f3n de Ockham aplicada al c\u00f3digo",
    resumen: "Cambiar de H3 a geohash no fue solo una decisi\u00f3n t\u00e9cnica: fue notar, una vez m\u00e1s, que la soluci\u00f3n m\u00e1s elegante en apariencia no siempre es la m\u00e1s honesta con lo que de verdad hay que mantener.",
    imagen: "https://images.unsplash.com/photo-1759210358926-4673cc44d35f?auto=format&fit=crop&w=1200&h=675&q=80",
    imagenAlt: "Fondo abstracto de cuadr\u00edcula azul oscuro",
    contenidoHTML: `
      <p>Despu\u00e9s de varias semanas trabajando con celdas hexagonales para el
      mapa del juego, termin\u00e9 migrando todo el sistema a geohash con celdas
      cuadradas. No fue una decisi\u00f3n que tom\u00e9 a la ligera, y durante un buen
      rato me cost\u00f3 admitir que la opci\u00f3n m\u00e1s vistosa no era la que mi
      proyecto necesitaba.</p>
      <h2>La navaja de Ockham, aplicada al c\u00f3digo</h2>
      <p>Guillermo de Ockham dec\u00eda que, entre dos explicaciones igual de
      v\u00e1lidas, hay que preferir la m\u00e1s simple. No hablaba de hex\u00e1gonos ni de
      mapas, claro, pero la idea se sostiene igual: los hex\u00e1gonos se ven bien,
      tienen algo casi org\u00e1nico en su geometr\u00eda, pero cada operaci\u00f3n de
      vecindad y cada conversi\u00f3n a pantalla ped\u00eda una librer\u00eda externa y
      c\u00f3digo adicional para resolver casos borde. Con geohash, gran parte de
      esa complejidad simplemente deja de existir, porque las celdas son
      cuadradas y se alinean de forma natural con una grilla simple.</p>
      <p>Lo curioso es que tard\u00e9 en aceptarlo. Hay una vanidad t\u00e9cnica dif\u00edcil
      de nombrar: preferimos lo que se ve sofisticado sobre lo que de verdad
      resuelve el problema con menos fricci\u00f3n. No es solo un sesgo de
      ingenier\u00eda; es, quiz\u00e1s, un sesgo humano general.</p>
      <ul>
        <li>El renderizado pas\u00f3 de geometr\u00eda hexagonal a rect\u00e1ngulos: mucho
        menos c\u00f3digo que mantener.</li>
        <li>Calcular la celda vecina para asignar un dron se volvi\u00f3 casi
        trivial.</li>
        <li>El tama\u00f1o de celda ahora se ajusta solo cambiando la longitud del
        geohash, sin tocar nada m\u00e1s.</li>
      </ul>
      <p>La lecci\u00f3n general \u2014la que de verdad me llevo\u2014 es que una
      abstracci\u00f3n m\u00e1s \u00abbonita\u00bb no siempre es la m\u00e1s simple de mantener, y
      que distinguir entre las dos cosas es, en el fondo, un ejercicio de
      honestidad: con el c\u00f3digo, y con uno mismo.</p>
    `
  }
];
