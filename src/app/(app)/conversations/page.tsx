import { getCurrentUser } from "@/lib/get-user";
import { CreateSubjectButton } from "@/components/subject/create-subject-button";
import { createClient } from "@/lib/supabase/server";
import { JoinSubjectButton } from "@/components/subject/join-subject-button";
import { SubjectCard } from "@/components/subject/subject-card";
import { ButtonGoChat } from "@/components/chat/button-go-chat";

export default async function ConversationsPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data: subjects, error: errorSubject } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("subject_members.user_id", user.id);

  if (errorSubject) {
    console.error("Erro ao buscar Disciplinas:", errorSubject);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Conversas</h1>
          <p className="text-sm text-muted-foreground">
            Escolha uma disciplina para conversar com o assistente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JoinSubjectButton />
          <CreateSubjectButton />
        </div>
      </header>

      {/* Lista */}
      <main>
        {subjects && subjects.length > 0 ? (
          <ul className="grid gap-3">
            {subjects.map((subjectItem) => (
              <li
                key={subjectItem.id}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
              >
                <div className="min-w-0 flex-1 [&>*]:w-full">
                  <SubjectCard
                    id={subjectItem.id}
                    name={subjectItem.name}
                    role={
                      subjectItem.subject_members[0]?.role === "teacher"
                        ? "teacher"
                        : "student"
                    }
                    goToSubject={false}
                  />
                </div>

                <div className="shrink-0">
                  <ButtonGoChat id={subjectItem.id} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
            <p className="font-medium">Nenhuma disciplina ainda</p>
            <p className="text-sm text-muted-foreground">
              Entre em uma turma ou crie uma nova disciplina para começar.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}