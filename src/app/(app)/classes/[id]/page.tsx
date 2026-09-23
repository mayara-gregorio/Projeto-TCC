import { CreateClassForm } from "@/components/create-class-form";
import { getCurrentUser } from "@/lib/get-user";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <div className="flex-col min-h-[70vh] w-full p-4">
      <h1>{classItem.name}</h1>
      <h2>Código para Convidar professor: {classItem.teacher_invite_code}</h2>
      <h2>Código para Convidar Aluno: {classItem.student_invite_code}</h2>
    </div>
  );
}