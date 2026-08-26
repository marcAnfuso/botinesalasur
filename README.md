# Botinesala Sur — Tienda Online

Tienda online de botines de fútbol. Next.js 14 (App Router), TypeScript,
Tailwind CSS, Supabase y MercadoPago. Interfaz en español, precios en pesos
argentinos.

## Qué incluye

- Catálogo con filtros por categoría, marca y talle
- Carrito persistente en localStorage
- Checkout con pago por MercadoPago o coordinación por WhatsApp
- Webhook de MercadoPago: confirma el pago, descuenta stock y manda los mails
- Panel de administración protegido: productos, variantes, stock, pedidos e
  importación masiva por CSV
- Mails de confirmación al cliente y aviso de pedido nuevo a la tienda

## Requisitos

- Node.js 18+
- Cuenta de Supabase
- Cuenta de MercadoPago
- Cuenta de Resend (opcional; sin ella la tienda funciona pero no manda mails)

## Puesta en marcha

```bash
npm install
cp .env.example .env.local   # completar con las credenciales
npm run dev                  # http://localhost:3000
```

### Base de datos

En el SQL Editor de Supabase, correr **los dos archivos en este orden**:

1. `supabase-schema.sql` — tablas `products`, `product_variants`, `orders`,
   `order_items`
2. `supabase-migration-mercadopago.sql` — columnas de pago en `orders`, las
   columnas `size` y `total_price` en `order_items`, la función
   `decrement_stock` que usa el webhook, y el estado `confirmed`
3. `supabase-migration-envios.sql` — tabla de costos de envío editable desde
   el panel y la columna `channel` de `orders`
4. `supabase-migration-eventos.sql` — tabla `events` con el registro de
   actividad de compra (se ve en `/admin/actividad`)

Sin el segundo archivo el checkout falla en cuanto alguien intenta pagar.

### Variables de entorno

Todas están documentadas en `.env.example`. Las imprescindibles:

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Lecturas públicas |
| `SUPABASE_SERVICE_ROLE_KEY` | Escrituras del panel y del webhook |
| `MERCADOPAGO_ACCESS_TOKEN` | Cobros (`TEST-` para probar, `APP_USR-` en producción) |
| `NEXT_PUBLIC_BASE_URL` | URL pública del sitio; de acá salen las URLs de retorno y la del webhook |
| `ADMIN_PASSWORD` | Acceso al panel. Sin ella el panel queda cerrado |
| `ADMIN_SESSION_SECRET` | Opcional: firma de la cookie de sesión (`openssl rand -hex 32`) |
| `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NOTIFICATION_EMAIL` | Envío de mails |

`NEXT_PUBLIC_BASE_URL` se resuelve en tiempo de build: si la cambiás, hay que
volver a desplegar.

## Estructura

```
src/
├── app/
│   ├── page.tsx              # Home
│   ├── catalogo/             # Listado con filtros
│   ├── producto/[id]/        # Detalle
│   ├── checkout/             # Compra y página de resultado del pago
│   ├── admin/                # Panel (login, productos, pedidos, importar)
│   └── api/
│       ├── admin/            # CRUD del panel + login
│       └── mercadopago/      # Preferencia, webhook y verificación de pago
├── components/
├── context/                  # Carrito
├── lib/                      # Supabase, datos, sesión admin, estados de pedido
├── middleware.ts             # Protege /admin y /api/admin
└── types/
```

## Panel de administración

Está en `/admin` y pide la contraseña de `ADMIN_PASSWORD`.

La contraseña se valida **solo en el servidor**: nunca se envía al navegador.
Al ingresar se emite una cookie httpOnly firmada (HMAC-SHA256, 12 horas) que
el middleware verifica en cada request, tanto en las páginas del panel como en
las rutas `/api/admin/*`.

Desde el panel se puede:

- Crear, editar, activar/desactivar y destacar productos
- Gestionar variantes y stock por talle
- Importar productos masivamente desde CSV
- Ver los pedidos, filtrarlos y cambiarles el estado de preparación

El estado de **pago** de un pedido no se toca a mano: lo maneja el webhook de
MercadoPago.

## MercadoPago

El flujo es:

1. El checkout llama a `/api/mercadopago/create-preference`, que **primero
   graba el pedido** en Supabase con una referencia `BOTS-AAAAMMDD-XXXXXX` y
   recién después crea la preferencia de pago.
2. El cliente paga en MercadoPago y vuelve a `/checkout/resultado`.
3. MercadoPago notifica a `/api/mercadopago/webhook`, que actualiza el pedido,
   descuenta el stock de cada variante y dispara los mails.
4. Si la notificación se demora, `/api/mercadopago/verify-payment` consulta el
   pago directamente contra la API de MercadoPago.

Para que el webhook funcione hay que cargar su URL pública en el panel de
desarrolladores de MercadoPago:

```
https://TU-DOMINIO/api/mercadopago/webhook
```

Apuntala al dominio definitivo, no a uno que redirija: las notificaciones son
POST y un redirect en el medio puede hacer que se pierdan. En desarrollo se
puede exponer el puerto local con un túnel (por ejemplo `ngrok http 3000`).

## Envíos

Dos zonas, definidas en `src/app/checkout/page.tsx`:

- **GBA Sur** (Llavallol, Lanús, Lomas y alrededores): $2.500
- **Todo el país**: $5.500

## Despliegue

El proyecto está pensado para Vercel: se conecta el repositorio, se cargan las
variables de entorno y cada push despliega. Para otras plataformas,
`npm run build && npm start`.

## Pendientes

- [ ] Reemplazar la contraseña única del panel por Supabase Auth con usuarios
- [ ] Historial de cambios de estado de los pedidos
- [ ] Configurar ESLint (`npm run lint` todavía pide el setup inicial)
- [ ] Más medios de pago

---

Desarrollado para **Botinesala Sur** — Llavallol, Buenos Aires
