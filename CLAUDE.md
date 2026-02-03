# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Botinesala Sur — an e-commerce store for soccer cleats built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Supabase (PostgreSQL), and MercadoPago for payments. The UI is in Spanish (es-AR locale, Argentine Peso currency).

## Commands

```bash
npm run dev      # Dev server on localhost:3000
npm run build    # Production build
npm start        # Run production server
npm run lint     # ESLint
```

No test framework is configured.

## Architecture

- **App Router hybrid rendering**: Server components fetch data (with ISR revalidation), client components handle interactivity. Pattern: async server page wraps a `*Client.tsx` component.
- **Path alias**: `@/*` maps to `./src/*`
- **Supabase clients** (`src/lib/supabase.ts`): `supabase` for public reads, `supabaseAdmin` for admin mutations, `createServerClient()` for server-side with service role key.
- **Data layer** (`src/lib/supabase-data.ts`): All Supabase queries and CRUD operations. `transformProduct()` maps DB snake_case to app camelCase types.
- **Cart state** (`src/context/CartContext.tsx`): React Context with localStorage persistence. Provided in root layout.
- **Admin panel** (`src/app/admin/`): Password-protected (env `ADMIN_PASSWORD`). Product CRUD, bulk CSV import, variant/stock management.
- **API routes** (`src/app/api/`): Admin product/variant CRUD endpoints and MercadoPago preference creation.
- **Types** (`src/types/index.ts`): Core interfaces (Product, ProductVariant, CartItem, Order). `src/types/supabase.ts` has auto-generated DB types.

## Database

Schema defined in `supabase-schema.sql`. Four tables: `products`, `product_variants`, `orders`, `order_items`. Products have categories: futsal, sintetico, futbol11, accesorios. Variants track size and stock per product. RLS is enabled.

## Environment Variables

Required in `.env.local` (see `.env.example`): Supabase URL/keys, MercadoPago tokens, `NEXT_PUBLIC_BASE_URL`, `ADMIN_PASSWORD`.

## Tailwind Theme

Custom colors in `tailwind.config.ts`: `primary` (red #DC2626), `field` (green #22C55E), `dark` (grayscale). Font: Inter.
