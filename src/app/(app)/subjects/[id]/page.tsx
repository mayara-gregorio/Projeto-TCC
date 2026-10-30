import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TopicCard } from "@/components/topic/topic-card";

export default async function SubjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: subjectItem, error } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      created_by,
      subject_members!inner (
        user_id,
        role
      ),
      subject_invites (
        teacher_invite_code,
        student_invite_code
      )
    `)
    .eq("id", id)
    .eq("subject_members.user_id", user.id)
    .single();

  if (error || !subjectItem) {
    console.error("Erro matéria:", error);
    notFound();
  }

  const role = subjectItem.subject_members[0]?.role;
  const isTeacher = role === "teacher";

  const invites = Array.isArray(subjectItem.subject_invites)
    ? subjectItem.subject_invites[0]
    : subjectItem.subject_invites;

  let studentCount = 0;
  if (isTeacher) {
    const { count } = await supabase
      .from("subject_members")
      .select("user_id", { count: "exact", head: true })
      .eq("subject_id", id)
      .eq("role", "student");
    studentCount = count ?? 0;
  }

  return (
    <div className="flex min-h-[70vh] w-full flex-col p-4">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{subjectItem.name}</h1>

        <div className="flex items-center gap-4 py-4">
          <Badge variant={isTeacher ? "teacher" : "default"}>
            {isTeacher ? "Professor" : "Aluno"}
          </Badge>

          {isTeacher && (
            <div className="flex h-10 items-center gap-4">
              <Separator orientation="vertical" />
              <span>
                {studentCount} {studentCount === 1 ? "aluno" : "alunos"}
              </span>
            </div>
          )}
        </div>
      </div>

      {isTeacher && (
        <div>
          <h2>Isso só professor vê</h2>
          {invites ? (
            <>
              <p>Código para convidar professor: {invites.teacher_invite_code}</p>
              <p>Código para convidar aluno: {invites.student_invite_code}</p>
            </>
          ) : (
            <p>Códigos de convite não encontrados.</p>
          )}
          <TopicCard />
        </div>
      )}

      {role === "student" && (
        <div>
          <h2>Detalhes da Disciplina aqui</h2>
        </div>
      )}
    </div>
  );
}
