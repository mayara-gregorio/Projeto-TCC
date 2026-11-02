
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

async function atualizarPerfil(formData: FormData) {
  "use server";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();

  if (!name || name.length > 100) return;

  const { error } = await supabase
    .from("users")
    .update({ name })
    .eq("id", user.id);

  if (error) {
    console.error("Erro ao atualizar perfil:", error);
    return;
  }

  revalidatePath("/profile");
}

export default async function settingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email")
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.name ?? user.user_metadata?.name ?? "";
  const email = profile?.email ?? user.email ?? "";

  const iniciais = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte: string) => parte[0].toUpperCase())
    .join("") || "US";

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Meu perfil</h1>
        <p className="text-sm text-muted-foreground">
          Visualize e atualize suas informações pessoais.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarFallback className="text-lg">
                {iniciais}
              </AvatarFallback>
            </Avatar>

            <div>
              <CardTitle>{name || "Usuário"}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {email}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form action={atualizarPerfil} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                defaultValue={name}
                placeholder="Seu nome completo"
                maxLength={100}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                value={email}
                disabled
                readOnly
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit">
                Salvar alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
