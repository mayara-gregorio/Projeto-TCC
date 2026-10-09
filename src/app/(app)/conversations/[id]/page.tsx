import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-user";
import { CreateSubjectButton } from "@/components/subject/create-subject-button";
import { createClient } from "@/lib/supabase/server";
import { JoinClassButton } from "@/components/subject/join-subject-button";
import { SubjectCard } from "@/components/subject/subject-card";
import { ButtonGoChat } from "@/components/chat/button-go-chat";

export default async function ConversationsPage({params,}:{params: Promise<{id: string}>}) {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const {id} = await params
  console.log("este é o início do transporte do id", id)

  const { count: classCount, error } = await supabase
    .from("subject")
    .select("id, subject_members!inner(user_id)", {
      count: "exact",
      head: true,
    })
    .eq("subject_members.user_id", user.id);

  if (error) {
    console.error(
      "Erro ao buscar quantidade de turmas:",
      error
    );
  }

  const { data: subjects, error: errorSubject } = await supabase
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
    .eq("subject_members.user_id", user.id)

  if (errorSubject) {
    console.error(
      "Erro ao buscar Disciplinas:",
      error
    );
  }


  return (
    <div className="flex flex-col h-full gap-6">
      <main>
        <div className="flex flex-col gap-4">
          {subjects?.map((subjectItem) => (
            <SubjectCard
              key={subjectItem.id}
              id={subjectItem.id}
              name={subjectItem.name}
              role={subjectItem.subject_members[0]?.role === "teacher"
                ? "teacher"
                : "student"}
            />
          ))}
        </div>
      </main>

      <footer className="flex gap-2">
        <CreateSubjectButton />
        <JoinClassButton/>
        <ButtonGoChat id={id}/>
      </footer>
    </div>
  );
}