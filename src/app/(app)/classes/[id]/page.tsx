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

  const {id} = await params
  const { data: classItem} = await supabase
  .from("classes")
  .select(`id, name, code, created_by, 
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
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <h1>{classItem.name}</h1>
      <h2>{classItem.code}</h2>
    </div>
  );
}