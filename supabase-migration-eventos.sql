-- =====================================================
-- MIGRACIÓN: registro de actividad de compra
-- Ejecutar en el SQL Editor de Supabase
-- =====================================================

-- Cada paso del recorrido de compra queda anotado acá: ver un producto,
-- armar el carrito, tocar comprar, la respuesta de MercadoPago, el aviso del
-- webhook. Cuando un cliente viene con un problema, se busca por la
-- referencia del pedido o por su sesión y se ve qué pasó y dónde se cortó.

CREATE TABLE IF NOT EXISTS events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event VARCHAR(40) NOT NULL,
  -- 'client' lo manda el navegador; 'server' lo anota la propia API
  source VARCHAR(10) NOT NULL DEFAULT 'client' CHECK (source IN ('client', 'server')),
  -- Identificador anónimo del navegador, para seguir a un visitante entre pasos
  session_id VARCHAR(64),
  -- Referencia del pedido (BOTS-... o WA-...) cuando ya existe
  order_ref VARCHAR(100),
  path TEXT,
  user_agent TEXT,
  details JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_order_ref ON events(order_ref);
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);

-- Sin políticas: sólo la service role (el panel y la API) puede leer o
-- escribir. El navegador nunca toca la tabla directamente.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- FIN
-- =====================================================
