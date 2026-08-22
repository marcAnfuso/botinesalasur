# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Cuatro perfiles confirmados, todos reales para el negocio:

- **Jugador amateur adulto.** Se compra sus propios botines para el fútbol 5, la liga o el potrero. Sabe qué busca y compara precios.
- **Padres y madres que compran para chicos.** Necesitan más ayuda con el talle. El catálogo incluye talles de niño (medidas en centímetros, ej. "22,5 CM").
- **Cliente del barrio que se acerca al showroom** de Llavallol. Usa la web para ver modelos, talles y precios antes de ir.
- **Comprador que llega desde Instagram o WhatsApp.** Pregunta por privado y coordina la compra por ahí; para él la web funciona como catálogo de respaldo.

## Product Purpose

Tienda de botines de fútbol de Botinesala Sur (Llavallol, Buenos Aires). Permite ver
el catálogo por tipo de cancha, verificar stock por talle y comprar, ya sea pagando
online por MercadoPago o coordinando por WhatsApp. Hay envíos a todo el país y un
showroom físico donde se puede probar y llevar en el acto.

Éxito es que la persona encuentre su par en su talle y complete la compra sin
tener que preguntar, sin que eso cierre la puerta a quien prefiere WhatsApp.

## Positioning

Tres diferenciales confirmados:

1. **Precio.** Competir por conveniencia; el copy puede afirmarlo.
2. **Variedad organizada por tipo de cancha.** El surtido se ordena como el jugador
   realmente elige: fútsal, sintético o fútbol 11.
3. **Atención y asesoramiento por WhatsApp.** Respuesta rápida y ayuda concreta para
   elegir talle y modelo; trato personal en vez de un carrito anónimo.

El showroom de Llavallol es un hecho del negocio y se comunica, pero no fue elegido
como diferencial principal.

## Constraints

- **No afirmar origen ni autenticidad de los productos.** La web no debe decir que
  los botines son "originales" ni equivalentes. Se habla de modelos, calidad y
  precio. Esta restricción es deliberada: la afirmación existió y fue removida a
  propósito (commit `3e67185`). No reintroducirla en copy, metadatos ni imágenes.
- **Categorías fijas del catálogo:** `futsal`, `sintetico`, `futbol11`, `accesorios`.
- **Zonas y costos de envío:** GBA Sur $2.500, resto del país $5.500.
- **Dos vías de compra conviven:** MercadoPago y WhatsApp. Ninguna puede quedar
  escondida ni ser tratada como secundaria en la interfaz.
- **Talles heterogéneos:** conviven numeración argentina de adulto (39-44) y medidas
  en centímetros para niño. La interfaz no puede asumir un solo formato.
- **Locale es-AR**, precios en pesos argentinos, voseo en el trato.

## Terminology

- **Fútsal / Sintético / Fútbol 11** — las tres formas de jugar que organizan el catálogo.
- **Showroom** — el local de Llavallol.
- **Talle** — no "tamaño" ni "size".

## Assets

- **Logo:** círculo con "BOTINESALA SUR" en estilo graffiti, rojo y negro sobre blanco.
  El archivo de mayor resolución disponible es 150×150 px, tomado del perfil de
  Instagram (`public/images/logo-botinesalasur.png`, y una variante recortada en
  círculo). No existe versión vectorial ni de alta resolución.
- **Banner del hero:** foto de botín apoyado sobre pelota en un showroom, con
  tratamiento oscuro y rojo.
- **Instagram:** [@botinesalasur](https://www.instagram.com/botinesalasur/)
- **Dominio:** botinesalasur.com.ar

## Open decisions

- Si en el futuro conviven productos con y sin origen verificable, habría que
  resolver cómo marcarlo por producto. Hoy no se afirma nada.
