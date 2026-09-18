import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cliente tipado para consultas (con inferencia de tipos)
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Cliente sin tipos estrictos para operaciones de admin (update, insert, delete)
// Usa service role key para bypass de RLS
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey;

// Sin la service role el cliente "admin" queda sujeto a RLS y falla en
// silencio: los productos ocultos desaparecen del panel, las escrituras se
// rechazan. Es un error de configuración, y conviene verlo en los logs.
if (typeof window === "undefined" && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "SUPABASE_SERVICE_ROLE_KEY no está configurada: el panel de admin va a ver sólo lo que ve el público."
  );
}
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Cliente para el lado del servidor (solo se usa en API routes o server components)
export const createServerClient = () => {
  return createClient<Database>(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey
  );
};
