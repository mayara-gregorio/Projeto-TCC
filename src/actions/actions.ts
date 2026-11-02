"use server";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function logoutCurrentUser() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  return error;
}

export async function createSubject(
  SubjectName: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado.",
    };
  }

  const { error } = await supabase
    .from("subjects")
    .insert({
      name: SubjectName,
      created_by: user.id,
    });

  if (error) {
    console.error("Erro ao criar disciplina:", error);

    return {
      error: error.message,
    };
  }

  return {
    error: null,
  };
}

type JoinSubjectResult =
  | { error: string; subjectId?: undefined; role?: undefined; alreadyMember?: undefined }
  | { error: null; subjectId: string; role: "teacher" | "student"; alreadyMember: boolean };
 
export async function joinSubject(subjectCode: string): Promise<JoinSubjectResult> {
  const code = subjectCode.trim();
 
  if (!code) {
    return { error: "Informe um código." };
  }
 
  const supabase = await createClient();
 
  const {
    data: { user },
  } = await supabase.auth.getUser();
 
  if (!user) {
    return { error: "Usuário não autenticado." };
  }
 
  // A função join_subject no banco procura o código, descobre o papel
  // (professor ou aluno) e adiciona o usuário à matéria.
  const { data, error } = await supabase.rpc("join_subject", { p_code: code });
 
  if (error) {
    console.error("Erro ao entrar na matéria:", error);
    // Mensagens criadas na função (ex.: "Código inválido.") chegam aqui
    return { error: error.message || "Não foi possível entrar na matéria." };
  }
 
  const result = data as {
    subject_id: string;
    role: "teacher" | "student";
    already_member: boolean;
  };
 
  // Atualiza a lista de matérias na tela
  revalidatePath("/", "layout");
 
  return {
    error: null,
    subjectId: result.subject_id,
    role: result.role,
    alreadyMember: result.already_member,
  };
}