# Botinesala Sur - Tienda Online

Tienda online para venta de botines de fútbol desarrollada con Next.js 14, TypeScript y Tailwind CSS.

## Características

- Catálogo de productos con filtros por categoría, marca y talle
- Carrito de compras persistente (localStorage)
- Checkout con formulario de envío
- Integración lista para MercadoPago
- Panel de administración para gestionar productos
- Diseño responsive y moderno
- Optimizado para SEO

## Requisitos

- Node.js 18+
- npm o yarn
- Cuenta de Supabase (para la base de datos)
- Cuenta de MercadoPago (para pagos)

## Instalación

1. **Clonar e instalar dependencias:**

```bash
cd botinesalasur
npm install
```

2. **Configurar variables de entorno:**

Copia el archivo de ejemplo y completá los valores:

```bash
cp .env.example .env.local
```

Editá `.env.local` con tus credenciales de Supabase y MercadoPago.

3. **Configurar la base de datos (Supabase):**

- Creá un proyecto en [Supabase](https://supabase.com)
- Andá a SQL Editor y ejecutá el contenido de `supabase-schema.sql`
- Copiá las credenciales a tu `.env.local`

4. **Ejecutar en desarrollo:**

```bash
npm run dev
```

La tienda estará disponible en `http://localhost:3000`

## Estructura del proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── page.tsx           # Página de inicio
│   ├── catalogo/          # Catálogo de productos
│   ├── producto/[id]/     # Detalle de producto
│   ├── checkout/          # Proceso de compra
│   ├── admin/             # Panel de administración
│   └── api/               # API Routes
├── components/            # Componentes reutilizables
├── context/               # Context providers (carrito)
├── lib/                   # Utilidades y configuración
└── types/                 # Tipos de TypeScript
```

## Panel de Administración

Accedé a `/admin` para gestionar productos.

**Contraseña por defecto:** `botinesalasur2024` (cambiar en producción)

Desde el panel podés:
- Ver todos los productos
- Agregar nuevos productos
- Editar productos existentes
- Activar/desactivar productos
- Marcar productos como destacados

## Integración con MercadoPago

1. Creá una aplicación en el [Panel de Desarrolladores de MercadoPago](https://www.mercadopago.com.ar/developers/panel)
2. Obtené las credenciales de prueba (TEST)
3. Agregá las credenciales a `.env.local`
4. Para producción, usá las credenciales de producción

## Envíos

El sistema tiene dos zonas de envío configuradas:
- **GBA Sur** (Llavallol, Lanús, Lomas, etc.): Envío en moto, $2.500
- **Interior / Otro**: Envío por correo, $5.500

Los precios se pueden modificar en `src/app/checkout/page.tsx`

## Despliegue

### Vercel (Recomendado)

1. Conectá tu repositorio con [Vercel](https://vercel.com)
2. Configurá las variables de entorno en el dashboard
3. Deploy automático con cada push

### Otras plataformas

```bash
npm run build
npm start
```

## Próximos pasos

- [ ] Conectar completamente con Supabase para CRUD de productos
- [ ] Implementar autenticación con Supabase Auth para el admin
- [ ] Agregar página de órdenes en el admin
- [ ] Implementar notificaciones por email
- [ ] Agregar más métodos de pago

## Soporte

Para consultas sobre el desarrollo, contactar al desarrollador.

---

Desarrollado para **Botinesala Sur** - Llavallol, Buenos Aires
