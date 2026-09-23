import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/get-user";
import { CreateClassButton } from "@/components/create-class-button";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JoinClassButton } from "@/components/join-class-button";
import { ChevronRight } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();

  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { count: classCount, error } = await supabase
    .from("classes")
    .select("id, class_members!inner(user_id)", {
      count: "exact",
      head: true,
    })
    .eq("class_members.user_id", user.id);

  if (error) {
    console.error(
      "Erro ao buscar quantidade de turmas:",
      error
    );
  }

const { data: classes, error: errorClasses } = await supabase
  .from("classes")
  .select(`
    id,
    name,
    teacher_invite_code,
    student_invite_code,
    created_by,
    class_members!inner(
      user_id,
      role
    )
  `)
  .eq("class_members.user_id", user.id);

  if (errorClasses) {
    console.error(
      "Erro ao buscar turmas:",
      error
    );
  }


  return (
    <div className="flex flex-col h-full gap-6">
      <header>
        <div>
          <h1
            className="text-2xl font-bold"
            style={{ color: "#2f2e31" }}
          >
            Olá, {user.name}
          </h1>

          <span>
            Aqui está um resumo das suas turmas
          </span>
        </div>

        <div>
          <Card className="w-64 p-4">
            <h2 className="text-xl font-semibold">
              {classCount ?? 0}
            </h2>

            <p className="text-muted-foreground">
              Turmas
            </p>
          </Card>
        </div>
      </header>

      <main>
        <div className="flex flex-col gap-4">
        {classes?.map((classItem) => (
          <Card key={classItem.id} className="flex-row p-4 justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                {classItem.name}
              </h2>
            </div>
            <div className="flex-col justify-end bg-red items-center gap-4">
              <Badge variant={classItem.class_members[0]?.role === "teacher" ? "teacher" : "default"}>{classItem.class_members[0]?.role === "teacher" ? "Professor" : "Aluno"}</Badge>
              <div className="bg-blue">
                <a href={`/classes/${classItem.id}`}><ChevronRight /></a>
              </div>
            </div>
          </Card>
        ))}
      </div>
      </main>

      <footer className="flex gap-2">
        <CreateClassButton />
        <JoinClassButton/>
      </footer>
    </div>
  );
}