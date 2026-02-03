import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente tipado para consultas (con inferencia de tipos)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cliente sin tipos estrictos para operaciones de admin (update, insert, delete)
// Usa service role key para bypass de RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente para el lado del servidor (solo se usa en API routes o server components)
export const createServerClient = () => {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  );
};
