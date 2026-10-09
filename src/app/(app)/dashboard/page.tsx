import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-user";
import { CreateSubjectButton } from "@/components/subject/create-subject-button";
import { createClient } from "@/lib/supabase/server";
import { JoinClassButton } from "@/components/subject/join-subject-button";
import { SubjectCard } from "@/components/subject/subject-card";

export default async function DashboardPage() {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  // Matérias em que o usuário é membro (professor ou aluno)
  const { data: subjects, error: errorSubject } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      created_by,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("subject_members.user_id", user.id)
    .order("name");

  if (errorSubject) {
    console.error("Erro ao buscar disciplinas:", errorSubject);
  }

  const subjectList = subjects ?? [];

  return (
    <div className="flex h-full flex-col gap-6">
      <header>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2f2e31" }}>
            Olá, {user.name}
          </h1>
          <span>Aqui está um resumo das suas turmas</span>
        </div>

        <div>
          <Card className="w-64 p-4">
            <h2 className="text-xl font-semibold">{subjectList.length}</h2>
            <p className="text-muted-foreground">Turmas</p>
          </Card>
        </div>
      </header>

      <main>
        <div className="flex flex-col gap-4">
          {errorSubject && (
            <p className="text-red-600">Não foi possível carregar suas turmas.</p>
          )}

          {!errorSubject && subjectList.length === 0 && (
            <p className="text-muted-foreground">
              Você ainda não está em nenhuma turma.
            </p>
          )}

          {subjectList.map((subjectItem) => (
            <SubjectCard
              key={subjectItem.id}
              id={subjectItem.id}
              name={subjectItem.name}
              role={
                subjectItem.subject_members[0]?.role === "teacher"
                  ? "teacher"
                  : "student"
              }
            />
          ))}
        </div>
      </main>

      <footer className="flex gap-2">
        <CreateSubjectButton />
        <JoinClassButton />
      </footer>
    </div>
  );
}
