# Imágenes de entradas

Pon aquí las fotos o imágenes que quieras usar en tus entradas de VITACORA.
No necesitas tocar HTML ni CSS: solo coloca el archivo en esta carpeta y
referencia la ruta desde `assets/js/data.js`.

## 1. Imagen de portada de una entrada (tarjetas, destacada y cabecera)

En `data.js`, agrega el campo `imagen` (y opcionalmente `imagenAlt`) al
objeto de la entrada:

```js
{
  id: "0003",
  fecha: "2026-07-10",
  tema: "tecnologia",
  titulo: "Título de la entrada",
  resumen: "Resumen corto...",
  imagen: "assets/img/entradas/mi-foto.jpg",
  imagenAlt: "Descripción corta de la foto",
  contenidoHTML: `...`
}
```

Si una entrada no tiene `imagen`, todo sigue funcionando igual que antes
(se muestra el bloque de color con el icono del tema, como ya lo tenías).
Es decir: el campo es 100% opcional, no rompe nada.

## 2. Imágenes dentro del cuerpo del texto (`contenidoHTML`)

Para fotos dentro del propio artículo, usa una etiqueta `<figure>` normal
dentro de `contenidoHTML`, igual que el resto del HTML:

```html
<figure>
  <img src="assets/img/entradas/mi-foto.jpg" alt="Descripción de la foto">
  <figcaption>Texto opcional debajo de la imagen, a modo de pie de foto.</figcaption>
</figure>
```

`figcaption` es opcional. El estilo (bordes, sombra, tipografía del pie)
ya está definido en `style.css`, no hace falta nada más.

## Recomendaciones de tamaño

- Portada (`imagen`): idealmente 1200×675&nbsp;px (relación 16:9), formato
  `.jpg` o `.webp` para que pese poco.
- Imágenes en el cuerpo: el ancho real de lectura es de ~700&nbsp;px, así
  que con 1000–1400&nbsp;px de ancho es más que suficiente; no hace falta
  subir fotos de varios megapíxeles.
