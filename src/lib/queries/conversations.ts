import type { SupabaseServer } from "@/lib/supabase/server";

export function buscarConversaDoUsuario(
  supabase: SupabaseServer,
  conversationId: string,
  userId: string
) {
  return supabase
    .from("conversations")
    .select("id, subject_id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
}
