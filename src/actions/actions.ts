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
