import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/get-user";
import { createClient } from "@/lib/supabase/server";
import { Separator } from "@/components/ui/separator";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{id: string}>
}

export default async function getClassPage({params}: PageProps) {
  const supabase = await createClient()
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  //se o usuário for aluno, não deve enxergar os códigos da disciplina

  const {id} = await params
  const { data: classItem} = await supabase
  .from("classes")
  .select(
    `id, 
    name, 
    teacher_invite_code,
    student_invite_code, 
    created_by, 
    class_members!inner(
      user_id,
      role
    )`)
  .eq("id", id)
  .eq("class_members.user_id", user.id )
  .single()

  if(!classItem){
    redirect("/dashboard")
  }

  const role = classItem.class_members[0].role

  return (
    <div className="flex-col min-h-[70vh] w-full p-4">
      <div className="flex-col gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{classItem.name}</h1>
        <div className="flex items-center gap-4 py-4">
          <Badge variant={role === "teacher" ? "teacher" : "default"}>
            {role === "teacher" ? "Professor" : "Aluno"}
          </Badge>
          {role === "teacher" && (
            <div className="flex h-10 w-full items-center gap-4 bg-red">
              <Separator orientation="vertical"/>
              <h1>10 Alunos</h1>
            </div>
          )}
        </div>
      </div>
      
      {role === "teacher" && (
      <div>
        <h1>Isso só professor vê</h1>
        <h2>Código para Convidar professor: {classItem.teacher_invite_code}</h2>
        <h2>Código para Convidar Aluno: {classItem.student_invite_code}</h2>
      </div>
      )}
      {role === "student" && 
      <div>
        <h1>Isso só Aluno vê</h1>
      </div>
      }
      <div>
        <h1>Isso Professores e alunos vêem</h1>
      </div>
    </div>
  );
}