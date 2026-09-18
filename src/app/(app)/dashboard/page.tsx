import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
export default async function DashboardPage() {

  const supabase = createClient()

  const { data: {user}} = await (await supabase).auth.getUser()

  if(!user){
    return null
  }

  const { data: profile} = await (await supabase).from("users").select("name").eq("id", user.id).single()

  const { data: classes} = await (await supabase).from("classes").select("*").eq("user_id", user.id)

  return (
    <div className="flex flex-col h-full gap-6">
      <div>
        <h1 className="text-2xl font-bold" style={{color: '#2f2e31'}}>Olá, {profile?.name}</h1>
        <span>Aqui está um resumo das suas turmas</span>
      </div>
      <div>
        <Card className="p-4 w-64">
          <h2 className="text-xl font-semibold">2</h2>
          <p className="text-muted-foreground">Turmas</p>
        </Card>
      </div>

    </div>
  );
}
