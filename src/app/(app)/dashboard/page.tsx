
import { getCurrentUser } from "@/lib/get-user";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "@/components/dashboard/dashboard-content";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) return null;

  const supabase = await createClient();

  // Busca disciplinas do usuário
  const { data: subjects, error: subjectsError } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("subject_members.user_id", user.id)
    .order("name");

  if (subjectsError) {
    console.error("Erro ao buscar disciplinas:", subjectsError);
  }

  const disciplinas = (subjects ?? []).map((subject) => ({
    id: subject.id,
    name: subject.name,
    role:
      subject.subject_members[0]?.role === "teacher"
        ? ("teacher" as const)
        : ("student" as const),
  }));

  // Disciplinas em que o usuário é professor
  const teacherSubjectIds = disciplinas
    .filter((subject) => subject.role === "teacher")
    .map((subject) => subject.id);

  // Indicadores continuam sendo calculados com messages
  let dificuldades: {
    subject_id: string;
    subject_name: string;
    topic_id: string | null;
    topic_title: string;
    total: number;
  }[] = [];

  let erroIndicadores = false;

  if (teacherSubjectIds.length > 0) {
    const { data, error } = await supabase.rpc(
      "dashboard_dificuldades"
    );

    if (error) {
      console.error("Erro ao buscar indicadores:", error);
      erroIndicadores = true;
    } else {
      dificuldades = (data ?? []).map((item: any) => ({
        subject_id: item.subject_id,
        subject_name: item.subject_name,
        topic_id: item.topic_id,
        topic_title: item.topic_title,
        total: Number(item.total),
      }));
    }
  }

  

  return (
    <DashboardContent
      userName={user.name ?? "Usuário"}
      subjects={disciplinas}
      difficulties={dificuldades}
      subjectsError={Boolean(subjectsError)}
      indicatorsError={erroIndicadores}
    />
  );
}
