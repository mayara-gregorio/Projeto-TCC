import type { SupabaseServer } from "@/lib/supabase/server";

export function listarDisciplinasDoUsuario(supabase: SupabaseServer, userId: string) {
  return supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("subject_members.user_id", userId);
}

export function buscarDisciplinaDoUsuario(
  supabase: SupabaseServer,
  subjectId: string,
  userId: string
) {
  return supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("id", subjectId)
    .eq("subject_members.user_id", userId);
}

export function buscarParticipacao(
  supabase: SupabaseServer,
  subjectId: string,
  userId: string
) {
  return supabase
    .from("subject_members")
    .select("user_id")
    .eq("subject_id", subjectId)
    .eq("user_id", userId);
}
