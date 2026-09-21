"use server";

import { createClient } from "@/lib/supabase/server";

export async function logoutCurrentUser() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut({
    scope: "local",
  });

  return error;
}

export async function createClass(
  className: string,
  classCode: string
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
    .from("classes")
    .insert({
      name: className,
      code: classCode,
      created_by: user.id,
    });

  if (error) {
    console.error("Erro ao criar turma:", error);

    return {
      error: error.message,
    };
  }

  return {
    error: null,
  };
}

export async function joinClass(classCode: string) {
  const code = classCode.trim();
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: "Usuário não autenticado.",
    };
  }

  console.log("classCode", classCode)
  // Buscar a turma pelo código
  const { data: classData, error: errorClass } = await supabase
    .from("classes")
    .select("id")
    .eq("code", classCode)
    .single();
  
    console.log("isssossoso", classData)

  if (errorClass || !classData) {
    console.error("Erro ao buscar turma:", errorClass);

    return {
      error: "Turma não encontrada.",
    };
  }

  // Adicionar usuário à turma
  const { error: errorJoinClass } = await supabase
    .from("class_members")
    .insert({
      class_id: classData.id,
      user_id: user.id,
      role: "student",
    });

  if (errorJoinClass) {
    console.error(
      "Erro ao entrar na turma:",
      errorJoinClass
    );

    return {
      error: errorJoinClass.message,
    };
  }

  return {
    error: null,
  };
}