import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  GraduationCap,
  KeyRound,
  MessageCircle,
  Settings2,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { buscarDisciplinaDoUsuario } from "@/lib/queries/subjects";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SubjectPage({ params }: PageProps) {
  const { id: subjectId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // O !inner restringe o resultado às disciplinas de que o usuário é membro.
  const { data: subjectItem, error: subjectError } = await buscarDisciplinaDoUsuario(
    supabase,
    subjectId,
    user.id
  ).maybeSingle();

  if (subjectError) {
    console.error("Erro ao buscar disciplina:", subjectError);
    throw new Error("Não foi possível carregar a disciplina.");
  }

  if (!subjectItem) notFound();

  const role = subjectItem.subject_members.find(
    (member) => member.user_id === user.id
  )?.role;

  const isTeacher = role === "teacher";
  const isStudent = role === "student";

  if (!isTeacher && !isStudent) notFound();

  // Mantenha essa rota alinhada à localização real do chat no seu App Router.
  const chatHref = `/conversations/${subjectId}/chat`;
  const topicsHref = `/subjects/${subjectId}/topics`;

  let studentCount: number | null = null;
  let teacherCode: string | null = null;
  let studentCode: string | null = null;

  if (isTeacher) {
    // Consultas adicionais somente para docentes. As políticas RLS do
    // Supabase também devem impedir estudantes de lerem os convites.
    const [membersResult, invitesResult] = await Promise.all([
      supabase
        .from("subject_members")
        .select("user_id", { count: "exact", head: true })
        .eq("subject_id", subjectId)
        .eq("role", "student"),
      supabase
        .from("subject_invites")
        .select("teacher_invite_code, student_invite_code")
        .eq("subject_id", subjectId)
        .maybeSingle(),
    ]);

    if (membersResult.error) {
      console.error("Erro ao contar alunos:", membersResult.error);
    } else {
      studentCount = membersResult.count ?? 0;
    }

    if (invitesResult.error) {
      console.error("Erro ao buscar convites:", invitesResult.error);
    } else {
      teacherCode = invitesResult.data?.teacher_invite_code ?? null;
      studentCode = invitesResult.data?.student_invite_code ?? null;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-8">
      <header className="space-y-5">
        <Button variant="ghost" size="sm" className="-ml-3 w-fit">
          <Link href="/subjects" className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 size-4" />
            Voltar para disciplinas
          </Link>
        </Button>

        <div className="flex flex-col gap-4 rounded-xl border bg-card p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <BookOpen className="size-6" />
            </div>
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isTeacher ? "teacher" : "secondary"}>
                  {isTeacher ? "Professor" : "Aluno"}
                </Badge>
                <span className="text-xs text-muted-foreground">Disciplina</span>
              </div>
              <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                {subjectItem.name}
              </h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                {isTeacher
                  ? "Gerencie os conteúdos e compartilhe os convites de acesso à disciplina."
                  : "Acesse o assistente da disciplina para tirar dúvidas sobre os conteúdos estudados."}
              </p>
            </div>
          </div>
          {isTeacher && studentCount !== null && (
            <div className="flex shrink-0 items-center gap-2 rounded-lg bg-muted/60 px-4 py-3 text-sm">
              <Users className="size-4 text-muted-foreground" />
              <span className="font-semibold tabular-nums">{studentCount}</span>
              <span className="text-muted-foreground">
                {studentCount === 1 ? "aluno matriculado" : "alunos matriculados"}
              </span>
            </div>
          )}
        </div>
      </header>

      {isStudent ? (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MessageCircle className="size-5" />
              </div>
              <CardTitle>Assistente da disciplina</CardTitle>
              <CardDescription>
                Envie perguntas sobre os assuntos estudados e consulte as respostas
                com apoio dos materiais disponibilizados pelo professor.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Link href={chatHref}>
                  Acessar chat da disciplina
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <GraduationCap className="size-5" />
              </div>
              <CardTitle>Sobre a disciplina</CardTitle>
              <CardDescription>
                Você está vinculado à disciplina {subjectItem.name}. As dúvidas
                enviadas no assistente podem ser classificadas por tópico para
                apoiar o acompanhamento do conteúdo pelo professor.
              </CardDescription>
            </CardHeader>
          </Card>
        </section>
      ) : (
        <section className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Settings2 className="size-5" />
              </div>
              <CardTitle>Tópicos e materiais</CardTitle>
              <CardDescription>
                Cadastre os tópicos da disciplina e vincule os materiais didáticos
                que serão utilizados pelo assistente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button>
                <Link href={topicsHref} className="flex items-center justify-center">
                  Gerenciar tópicos
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <KeyRound className="size-5" />
              </div>
              <CardTitle>Códigos de convite</CardTitle>
              <CardDescription>
                Compartilhe cada código apenas com as pessoas que deverão ter
                o respectivo tipo de acesso.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Convite para alunos</p>
                <div className="rounded-lg border bg-muted/40 px-4 py-3 font-mono text-sm break-all select-all">
                  {studentCode ?? "Código indisponível"}
                </div>
              </div>
              <Separator />
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Convite para professores</p>
                <div className="rounded-lg border bg-muted/40 px-4 py-3 font-mono text-sm break-all select-all">
                  {teacherCode ?? "Código indisponível"}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atenção: este código concede acesso de professor à disciplina.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}
