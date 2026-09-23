# SEO — investigación y plan (22-9-2026)

Para Marc, Alan y Fede. Qué busca la gente, quién aparece hoy en Google,
qué ya hicimos y qué falta, en orden de impacto.

## 1. Dónde estamos

Hecho el 22-9 (verificado en producción):

- `robots.txt` y `sitemap.xml` (84 URLs: inicio, catálogo, 4 categorías, 78 productos), enviados a Search Console.
- Título y descripción propios por producto y por categoría; canonical en todas las páginas.
- El catálogo se dibuja en el servidor: Google recibe los 78 links a productos (antes recibía cero).
- Datos estructurados: **Producto** (precio, stock, código) en cada botín y **Tienda deportiva** (Llavallol, Instagram) en todo el sitio.
- Miniatura al compartir por WhatsApp/Instagram (`og.jpg`); en productos, la foto del botín.
- Propiedad `botinesalasur.com.ar` verificada en Search Console (DNS).

Lo que Google necesita ahora es **tiempo y contenido**. Lo técnico que falta está abajo, es poco.

## 2. Qué busca la gente y quién aparece

Búsquedas hechas el 22-9 en Google Argentina.

**"botines futsal" / "comprar botines futsal online"** — aparecen, en orden: la tienda oficial de Adidas, MercadoLibre, y después tiendas medianas y chicas: Docta Botines Argentinos, Vaypol, Solo Fútbol, Pasional Deporte, Joma oficial, Umbro oficial. Todas venden con la misma promesa en el título: *"envíos a todo el país · hasta 6 cuotas sin interés"*.

**"botines de fútbol baratos"** — Umbro, Solo Fútbol, Locos del Arco (*"20% de descuento en transferencia/efectivo"*), Sporting, Red Sport, Mega Sports, Templo del Fútbol.

Qué se aprende de eso:

1. **La unidad que rankea es la página de categoría**, no la home: `/botines/futsal`, `/botines/futbol-5`. Nosotros ya tenemos `/catalogo?categoria=futsal` con título propio; el paso siguiente es que sean páginas "de verdad" con texto (ver P1).
2. **Todos prometen lo mismo**: cuotas sin interés, envío a todo el país, descuento por transferencia. Nosotros tenemos las tres cosas y hoy no las decimos en los títulos ni en las descripciones de Google.
3. **Nadie chico rankea por "botines" a secas**: eso es de Adidas/Nike/MercadoLibre. Se gana en lo específico: *modelo + superficie + talle* ("nike street gato futsal", "tiempo legend sintético 42") y en lo **local** ("botines lomas de zamora", "botines temperley").
4. **Local, casi vacío**: buscando botines + Llavallol/Lomas en Instagram y Google no aparece ningún negocio del rubro con presencia armada. Es la oportunidad más barata de todas (P0).

Fuentes: [Adidas](https://www.adidas.com.ar/botines-cancha_cubierta) · [MercadoLibre](https://listado.mercadolibre.com.ar/botines-futsal) · [Docta](https://www.doctabotinargentino.com.ar/futsal/) · [Vaypol](https://www.vaypol.com.ar/productos/k/botines-futsal/p/1) · [Solo Fútbol](https://www.solofutbol.com/botines/futsal.html) · [Pasional Deporte](https://www.pasionaldeporte.com.ar/botines/botines-futsal/) · [Joma](https://jomasport.ar/futbol/futsal/) · [Umbro](https://tienda.umbro.com.ar/botines/adultos/futsal) · [Locos del Arco](https://www.locosdelarco.com.ar/botines/) · [Red Sport](https://www.redsportonline.com.ar/calzado/botines) · [Mega Sports](https://www.megasports.com.ar/calzado/botines/)

> Regla de la casa que también aplica al SEO: la web **nunca** dice "originales". Se describe por modelo, superficie, materiales y calce. Ni "originales" ni "réplicas".

## 3. Plan, por impacto

> Equilibrio: Alan vende a todo el país. La **home y las categorías** hablan
> nacional ("envíos a todo el país", superficie, marca); lo **local** lo
> pelea la página `/botines-zona-sur` (Lomas de Zamora, Llavallol, GBA Sur)
> más el Perfil de Empresa. No achicar el sitio entero a la zona.

**P0 — esta semana, sin código**

| Qué | Quién | Por qué |
|---|---|---|
| **Perfil de Empresa en Google** (Google Business Profile) para el showroom de Llavallol: dirección, horarios, fotos del local y de botines, categoría "Tienda de artículos deportivos", link a la web y al WhatsApp. | Alan | Aparece en el mapa y en "botines cerca de mí" / "botines lomas de zamora". Hoy no hay competencia local con esto armado. Es lo que más ventas locales puede traer, gratis. |
| **Descripciones únicas por producto** (2–3 frases: para qué superficie, cómo calza, materiales, si viene medio punto). Hoy muchos comparten un texto genérico. | Alan | Google baja lo repetido; y la descripción es lo que aparece debajo del título en el resultado. |
| **Nombres completos de modelo** ("Nike Tiempo Legend 10 Academy TF" en vez de "Tiempo Legend"). | Alan | Es literalmente lo que la gente tipea. |
| **Fotos con fondo limpio y del mismo encuadre**; una segunda foto de la suela. | Alan | Google Imágenes y Shopping muestran la foto; las de fondo blanco convierten más. |
| Enviar el sitemap en Search Console y pedir indexación de `/` y `/catalogo`. | Marc | Días en vez de semanas. |

**P1 — hecho el 22-9 (código)** — URLs `/botines/<categoría>` con texto propio, URLs de producto con nombre (las viejas redirigen), títulos con la promesa, marca enlazada, páginas de envíos/cambios y preguntas frecuentes.

| Qué | Detalle |
|---|---|
| **Páginas de categoría con texto** | Un párrafo arriba del grillado en `/catalogo?categoria=futsal` ("Botines de fútsal: suela lisa de goma para parquet y cemento…") y, mejor aún, URLs limpias: `/botines/futsal`, `/botines/sintetico`, `/botines/futbol-11`. |
| **URLs de producto con nombre** | Hoy son `/producto/87b97bc8-…`. Pasar a `/producto/nike-street-gato-tiempo-0032` (la vieja redirige). Google y la gente leen el nombre en la URL. |
| **Títulos con la promesa** | "Nike Street Gato Tiempo · Fútsal · 3 cuotas sin interés — Botinesala Sur". Lo mismo que hacen los que rankean. |
| **Página "Envíos, cambios y devoluciones"** y **"Preguntas frecuentes"** (talles, cambio de talle, cómo pagar, dónde está el showroom). | Las piden Google Merchant Center y los clientes; y responden búsquedas tipo "cambio de talle botines". |
| **Enlazado interno** | En cada producto, links a su categoría y a "más de esta marca". Ya hay relacionados; falta la categoría y la marca como links con texto. |

**P2 — cuando lo anterior esté**

| Qué | Detalle |
|---|---|
| **Google Merchant Center, fichas gratuitas** | El feed ya existe: `https://botinesalasur.com.ar/feed/google.xml` (un ítem por talle). Falta crear la cuenta en Merchant Center, verificar el sitio y cargar esa URL como feed programado los botines aparecen en la pestaña Shopping y en resultados con precio y foto, **sin pagar**. Requiere: sitio verificado (ya), políticas de envío/devolución visibles (P1), y datos por talle. Fuente: [Google — fichas gratuitas](https://support.google.com/merchants/answer/9826670?hl=es-419). |
| **Guías** ("Cómo elegir botines de fútsal", "Guía de talles", "Sintético vs fútbol 11: qué suela va") | Contenido que rankea por búsquedas de duda y termina en el catálogo. Una por mes alcanza. |
| **Reseñas** | Pedir a los que compraron una reseña en el Perfil de Empresa (link directo en el mail de confirmación, después de la entrega). Las estrellas en el mapa mueven más que cualquier texto. |

**P3 — medir**

- Search Console: cada 2 semanas mirar "Rendimiento → Consultas": qué buscan para llegar, en qué posición. Ahí salen las próximas páginas a escribir.
- `/admin/actividad` ya muestra el embudo (producto → carrito → checkout → pago). Si mucha gente llega y no agrega al carrito, el problema no es SEO, es la página.

## 4. Lo que NO vale la pena ahora

- Comprar links, "SEO agencies" que prometen primera página en 30 días.
- Pelear "botines" o "botines nike" a secas contra Adidas/MercadoLibre.
- Blog diario. Una guía buena por mes rinde más.
- Anuncios pagos antes de tener Perfil de Empresa, descripciones y fotos: sería pagar tráfico para una vidriera a medio armar.

## 5. Orden sugerido

1. Alan: Perfil de Empresa + descripciones + nombres completos (P0). Marc: sitemap en Search Console.
2. Marc/Claude: categorías con URL limpia y texto, URLs de producto con nombre, títulos con la promesa, páginas de envíos y FAQ (P1).
3. Feed para Merchant Center y primera guía (P2).
4. A las 4 semanas, leer Search Console y ajustar.
