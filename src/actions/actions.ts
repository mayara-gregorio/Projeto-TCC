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

  // Buscar a turma pelo código (professor ou aluno)
  const { data: classData, error: errorClass } = await supabase
    .from("classes")
    .select("id, teacher_invite_code, student_invite_code")
    .or(`teacher_invite_code.eq.${code},student_invite_code.eq.${code}`)
    .maybeSingle();

  if (errorClass || !classData) {
    console.error("Erro ao buscar turma:", errorClass);
    return {
      error: "Turma não encontrada.",
    };
  }

  let role: "teacher" | "student";

  if (classData.teacher_invite_code === code) {
    role = "teacher";
  } else if (classData.student_invite_code === code) {
    role = "student";
  } else {
    return {
      error: "Código inválido.",
    };
  }

  // Adicionar usuário à turma
  const { error: errorJoinClass } = await supabase
    .from("class_members")
    .insert({
      class_id: classData.id,
      user_id: user.id,
      role,
    });

  if (errorJoinClass) {
    console.error("Erro ao entrar na turma:", errorJoinClass);
    return {
      error: errorJoinClass.message,
    };
  }

  return {
    error: null,
  };
}