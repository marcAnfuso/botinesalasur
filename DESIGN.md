# Design

<!-- impeccable:design-schema 1 -->

## Visual world

**Showroom de noche.** Negro profundo, rojo señal del logo y blanco tiza de línea
de cal. La referencia no es el e-commerce deportivo genérico sino el local con
las paredes llenas de cajas: fondo oscuro, un foco sobre el producto y la
señalética pintada a mano del logo.

La estructura se ordena por **dónde se juega**, no por marca ni por grilla neutra
de catálogo. La cancha es la puerta de entrada.

## Palette

| Token | Valor | Uso |
|---|---|---|
| `dark` | `#0B0B0C` | Fondo base |
| `dark-lighter` | `#141416` | Bandas y superficies elevadas |
| `dark-card` | `#1A1A1D` | Tarjetas de producto |
| `dark-line` | `#26262B` | Reglas y separadores, siempre 1px |
| `primary` | `#DC2626` | Rojo del logo: acciones, acentos, estado activo |
| `chalk` | `#E8E6E1` | Blanco tiza para bordes sutiles |
| `field` | `#22C55E` | Verde césped, solo para estados de disponibilidad |

El rojo es señal, no decoración: marca lo accionable y lo urgente (últimos pares,
CTA principal, categoría activa). Nunca se usa como fondo de superficies grandes.

## Typography

- **Display — Archivo 900 itálica, mayúsculas, `letter-spacing: -0.04em`,
  `line-height: 0.88`.** Titulares de página y de sección, nombres de producto y
  precios en tarjeta. Es la voz de estampado de camiseta; se aplica con la clase
  `.display`. Techo de tamaño: `4.25rem`.
- **`.display-tight`** — Archivo 800 itálica con tracking más suelto, para piezas
  chicas: el logotipo del header, ítems del menú móvil.
- **Texto — Inter.** Todo lo que se lee de corrido: párrafos, descripciones,
  formularios, etiquetas de interfaz. Los títulos de la barra de beneficios usan
  Inter semibold a propósito: en display itálica se partían en dos líneas y
  perdían legibilidad.
- **`.label`** — mayúsculas, `letter-spacing: 0.14em`, 11px. Metadatos: marca,
  "talles", encabezados de columna del footer.
- **`.tnum`** — cifras tabulares. Obligatorio en precios, talles y costos de
  envío, para que las columnas no bailen.

## Components

- **Sin esquinas blandas.** Los contenedores son rectos, con borde de 1px en
  `dark-line`. Se eliminó `rounded-xl` de todas las superficies públicas. Los
  únicos círculos son el logo, los avatares de acción y los badges de conteo.
- **Tarjeta de producto:** foto cuadrada a sangre, badge de estado pegado a la
  esquina superior izquierda sin margen, y bloque de datos con marca → nombre →
  descripción → talles → precio. El agotado se comunica con la foto en escala de
  grises al 45%, no con un velo encima.
- **Reglas:** `.rule-chalk` es el separador de sección — 44px de rojo y el resto
  en gris de línea. Reemplaza al borde neutro.
- **Sin kicker ni eyebrow** sobre los títulos. El titular carga solo; las pruebas
  (showroom, envíos, WhatsApp) van debajo como lista con íconos.

## Motion

Un solo momento autorado: la entrada del hero, escalonada en cuatro tiempos
(titular, párrafo, pruebas, acciones) con `cubic-bezier(0.16, 1, 0.3, 1)` desde un
estado ya visible. El resto del sitio no tiene entradas por scroll. Los hovers son
transformaciones cortas: la foto escala 4–5% y los bordes cambian de color.

`prefers-reduced-motion` anula todo en `globals.css`.

## Browser surfaces

Se tematizan explícitamente, porque los defaults del navegador no pertenecen a
ningún sistema de diseño: selección de texto en rojo de marca, caret rojo en los
campos, scrollbar propia (track `#101012`, thumb que pasa a rojo en hover), anillo
de foco único de 2px con offset, y subrayado de links con offset de `0.25em`.

## Assets y procedencia

- `public/images/logo-botinesalasur.png` — foto de perfil de
  [@botinesalasur](https://www.instagram.com/botinesalasur/), 150×150 px, la mayor
  resolución que Instagram expone públicamente. Convertida de JPEG a PNG sin
  reescalar.
- `public/images/logo-botinesalasur-circular.png` — la anterior con máscara
  circular; las esquinas quedan transparentes para apoyarse sobre el negro.
- `src/app/icon.png` (96×96) y `src/app/apple-icon.png` (180×180) — derivados del
  mismo archivo.
- `public/images/hero-banner-foto.jpg` — recorte (desde x=900) de un banner
  generado con ChatGPT el 25-ago-2026, que compone una foto real del showroom
  con tratamiento gráfico. Se recorta **para dejar afuera el logo y el titular
  quemados en la imagen**: un texto quemado cae a 8px en un teléfono, no lo
  indexa el buscador y no se puede editar sin regenerar la imagen. El titular
  vive en HTML.
  Conocido: el recorte tiene 772px de ancho, la mitad de los ~1496 que pide la
  columna del hero en pantallas retina. Es una decisión tomada a conciencia; se
  resuelve pidiendo el banner sin texto y en mayor resolución.

  La foto original del showroom (botín rojo, 3024×4032) está en las descargas de
  Marc y sirve de reemplazo con nitidez de sobra si hiciera falta.

## Restricciones heredadas

`PRODUCT.md` manda sobre el copy. En particular: **la web no afirma que los
productos sean originales**. Ningún texto de interfaz puede reintroducir esa
afirmación.

## Alcance aplicado

Home, catálogo, detalle de producto y checkout. El panel `/admin` conserva su
lenguaje anterior: es una superficie de operación, con otras prioridades.
