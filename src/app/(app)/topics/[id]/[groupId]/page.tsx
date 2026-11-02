import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MessageSquare, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Props = {
  params: Promise<{ id: string; groupId: string }>;
};

type MaterialCoverage = "covered" | "not_covered" | "uncertain";

type Summary = {
  id: string;
  title: string;
  summary: string;
  updatedAt: string;
  materialCoverage: MaterialCoverage;
  materialRecommendation: string | null;
};

type GroupDetails = {
  id: string;
  topicId: string;
  title: string;
  summary: string;
  totalQuestions: number;
  uniqueStudents: number;
  summaries: Summary[];
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Data indisponível";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default async function GroupDetailsPage({ params }: Props) {
  const { id: topicId, groupId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // A RPC confere se o grupo pertence ao tópico e se o usuário é
  // professor da disciplina; não devolve perguntas nem IDs dos alunos.
  const { data, error } = await supabase.rpc("detalhes_agrupamento", {
    p_topic_id: topicId,
    p_group_id: groupId,
  });

  if (error) {
    console.error("Erro ao buscar detalhes do agrupamento:", error);
    if (
      error.message.includes("Agrupamento não encontrado") ||
      error.message.includes("Acesso não autorizado")
    ) {
      notFound();
    }
    throw new Error("Não foi possível carregar o agrupamento.");
  }

  if (!data) notFound();

  const group = data as unknown as GroupDetails;
  if (group.id !== groupId || group.topicId !== topicId) notFound();

  const summaries = group.summaries ?? [];

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 pb-10">
      <Link
        href={`/topics/${topicId}`}
        className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Voltar aos detalhes do tópico
      </Link>

      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Detalhes do agrupamento</p>
        <h1 className="text-2xl font-semibold tracking-tight">{group.title}</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">{group.summary}</p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-2xl font-semibold">{Number(group.totalQuestions ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Solicitações no agrupamento</p>
            </div>
            <MessageSquare className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-2xl font-semibold">{Number(group.uniqueStudents ?? 0)}</p>
              <p className="text-sm text-muted-foreground">Alunos distintos</p>
            </div>
            <Users className="size-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Resumos das solicitações</CardTitle>
          <p className="text-sm text-muted-foreground">
            Sínteses individuais das perguntas pertencentes a este agrupamento,
            sem identificação dos estudantes.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {summaries.length === 0 ? (
            <p className="py-5 text-sm text-muted-foreground">
              Ainda não existem resumos neste agrupamento.
            </p>
          ) : (
            summaries.map((item) => (
              <div key={item.id} className="space-y-3 rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-medium">{item.title}</h3>
                  {item.materialCoverage === "not_covered" && (
                    <Badge variant="outline">Cobertura não identificada</Badge>
                  )}
                  {item.materialCoverage === "covered" && (
                    <Badge variant="secondary">Material relacionado encontrado</Badge>
                  )}
                  {(item.materialCoverage === "uncertain" || !item.materialCoverage) && (
                    <Badge variant="outline">Cobertura não verificada</Badge>
                  )}
                </div>

                <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">
                  {item.summary}
                </p>

                {item.materialCoverage === "not_covered" && (
                  <div className="space-y-2 rounded-md bg-muted/50 p-3">
                    <p className="text-xs font-medium">Possível lacuna no material didático</p>
                    <p className="text-xs text-muted-foreground">
                      Não foi identificada cobertura suficiente nos trechos recuperados.
                      Isso não confirma que o assunto esteja ausente de todos os PDFs.
                    </p>
                    {item.materialRecommendation && (
                      <p className="text-xs">
                        <strong>Inclusão de material: </strong>
                        {item.materialRecommendation}
                      </p>
                    )}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Atualizado em {formatDate(item.updatedAt)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
