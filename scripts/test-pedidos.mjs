#!/usr/bin/env node
/**
 * Simulador de pedidos para probar el flujo en local.
 *
 *   node scripts/test-pedidos.mjs seed          crea pedidos de prueba variados
 *   node scripts/test-pedidos.mjs listar        muestra los pedidos de prueba
 *   node scripts/test-pedidos.mjs pagar <REF>   simula que MercadoPago aprobó el pago
 *   node scripts/test-pedidos.mjs limpiar       borra TODOS los pedidos de prueba
 *
 * Los pedidos de prueba usan referencias que empiezan con TEST- para poder
 * borrarlos después sin tocar pedidos reales.
 */

import { readFileSync } from "node:fs";

// --- carga de variables de entorno (.env.local tiene prioridad) ---
for (const file of [".env", ".env.local"]) {
  try {
    for (const line of readFileSync(file, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {}
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PREFIX = "TEST-";

if (!URL_BASE || !KEY) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const headers = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};

async function sb(path, options = {}) {
  const res = await fetch(`${URL_BASE}/rest/v1/${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers || {}) },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${path}: ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

const money = (n) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(n);

// --- perfiles de pedido a crear ---
const PERFILES = [
  {
    etiqueta: "pagado y sin preparar",
    status: "confirmed",
    payment_status: "paid",
    cliente: { nombre: "Lucía Fernández", email: "lucia@ejemplo.com", ciudad: "Lomas de Zamora", zona: "gba-sur" },
    items: 2,
  },
  {
    etiqueta: "esperando pago (efectivo/Rapipago)",
    status: "pending",
    payment_status: "pending",
    cliente: { nombre: "Martín Gómez", email: "martin@ejemplo.com", ciudad: "Córdoba", zona: "otro" },
    items: 1,
  },
  {
    etiqueta: "ya enviado",
    status: "shipped",
    payment_status: "paid",
    cliente: { nombre: "Sofía Ramírez", email: "sofia@ejemplo.com", ciudad: "Lanús", zona: "gba-sur" },
    items: 1,
  },
  {
    etiqueta: "pago rechazado",
    status: "cancelled",
    payment_status: "failed",
    cliente: { nombre: "Diego Sosa", email: "diego@ejemplo.com", ciudad: "Rosario", zona: "otro" },
    items: 1,
  },
];

const ENVIO = { "gba-sur": 2500, otro: 5500 };

function referencia(i) {
  const hoy = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `${PREFIX}${hoy}-${String(i + 1).padStart(3, "0")}`;
}

async function productosDisponibles() {
  const variantes = await sb("product_variants?select=id,product_id,size,stock&stock=gt.0&limit=20");
  if (!variantes.length) throw new Error("No hay variantes con stock en la base");
  const ids = [...new Set(variantes.map((v) => v.product_id))];
  const productos = await sb(`products?select=id,name,brand,price&id=in.(${ids.join(",")})`);
  const porId = Object.fromEntries(productos.map((p) => [p.id, p]));
  return variantes
    .filter((v) => porId[v.product_id])
    .map((v) => ({ variante: v, producto: porId[v.product_id] }));
}

async function seed() {
  const disponibles = await productosDisponibles();
  console.log(`Usando ${disponibles.length} variantes con stock de la base real.\n`);

  for (const [i, perfil] of PERFILES.entries()) {
    const ref = referencia(i);
    const elegidos = disponibles.slice(i, i + perfil.items);
    if (!elegidos.length) continue;

    const subtotal = elegidos.reduce((s, e) => s + e.producto.price, 0);
    const envio = ENVIO[perfil.cliente.zona];

    const [orden] = await sb("orders", {
      method: "POST",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        external_reference: ref,
        customer_name: perfil.cliente.nombre,
        customer_email: perfil.cliente.email,
        customer_phone: "1155667788",
        shipping_address: "Av. Siempre Viva 742",
        shipping_city: perfil.cliente.ciudad,
        shipping_province: perfil.cliente.zona === "gba-sur" ? "Buenos Aires" : "Córdoba",
        shipping_postal_code: "1836",
        shipping_zone: perfil.cliente.zona,
        shipping_cost: envio,
        subtotal,
        total: subtotal + envio,
        status: perfil.status,
        payment_status: perfil.payment_status,
        paid_at: perfil.payment_status === "paid" ? new Date().toISOString() : null,
        mp_payment_id: perfil.payment_status === "paid" ? `TEST${1000 + i}` : null,
        notes: i === 0 ? "Tocar timbre 2B, preferentemente por la tarde." : null,
      }),
    });

    await sb("order_items", {
      method: "POST",
      body: JSON.stringify(
        elegidos.map((e) => ({
          order_id: orden.id,
          product_id: e.producto.id,
          variant_id: e.variante.id,
          product_name: e.producto.name,
          product_brand: e.producto.brand,
          variant_size: e.variante.size,
          size: e.variante.size,
          quantity: 1,
          unit_price: e.producto.price,
          total_price: e.producto.price,
        }))
      ),
    });

    console.log(`  ✓ ${ref}  ${perfil.etiqueta.padEnd(34)} ${money(subtotal + envio)}`);
  }
  console.log("\nMirá el panel en /admin/pedidos");
}

async function listar() {
  const pedidos = await sb(
    `orders?select=external_reference,customer_name,status,payment_status,total&external_reference=like.${PREFIX}*&order=created_at.desc`
  );
  if (!pedidos.length) return console.log("No hay pedidos de prueba. Corré: seed");
  for (const p of pedidos) {
    console.log(
      `  ${p.external_reference}  ${String(p.payment_status).padEnd(8)} ${String(p.status).padEnd(10)} ${money(p.total).padStart(12)}  ${p.customer_name}`
    );
  }
}

// Reproduce lo que hace el webhook cuando MercadoPago aprueba un pago.
async function pagar(ref) {
  if (!ref) throw new Error("Falta la referencia. Ej: pagar TEST-20260822-002");

  const [orden] = await sb(
    `orders?select=id,external_reference,payment_status,total&external_reference=eq.${ref}`
  );
  if (!orden) throw new Error(`No existe el pedido ${ref}`);
  if (orden.payment_status === "paid") return console.log(`${ref} ya estaba pagado.`);

  await sb(`orders?id=eq.${orden.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      payment_status: "paid",
      status: "confirmed",
      paid_at: new Date().toISOString(),
      mp_payment_id: `TEST${Date.now().toString().slice(-6)}`,
    }),
  });
  console.log(`  ✓ ${ref} marcado como pagado`);

  // Descuento de stock, igual que el webhook
  const items = await sb(`order_items?select=variant_id,quantity,product_name,size&order_id=eq.${orden.id}`);
  for (const item of items) {
    const [antes] = await sb(`product_variants?select=stock&id=eq.${item.variant_id}`);
    await fetch(`${URL_BASE}/rest/v1/rpc/decrement_stock`, {
      method: "POST",
      headers,
      body: JSON.stringify({ variant_id: item.variant_id, qty: item.quantity }),
    });
    const [despues] = await sb(`product_variants?select=stock&id=eq.${item.variant_id}`);
    console.log(
      `  ✓ stock ${item.product_name} talle ${item.size}: ${antes.stock} → ${despues.stock}`
    );
  }
  console.log("\nEsto es lo mismo que hace el webhook al aprobarse un pago real.");
  console.log("Los mails NO se mandan desde acá: eso lo hace el webhook (necesita RESEND_API_KEY).");
}

async function limpiar() {
  const pedidos = await sb(`orders?select=id,external_reference&external_reference=like.${PREFIX}*`);
  if (!pedidos.length) return console.log("No hay pedidos de prueba para borrar.");
  for (const p of pedidos) {
    await sb(`order_items?order_id=eq.${p.id}`, { method: "DELETE" });
    await sb(`orders?id=eq.${p.id}`, { method: "DELETE" });
    console.log(`  ✓ borrado ${p.external_reference}`);
  }
  console.log("\nOjo: el stock descontado con 'pagar' no se restituye solo.");
}

const [, , comando, arg] = process.argv;
const acciones = { seed, listar, pagar, limpiar };

if (!acciones[comando]) {
  console.log("Uso: node scripts/test-pedidos.mjs <seed|listar|pagar REF|limpiar>");
  process.exit(1);
}

acciones[comando](arg).catch((e) => {
  console.error("Error:", e.message);
  process.exit(1);
});
