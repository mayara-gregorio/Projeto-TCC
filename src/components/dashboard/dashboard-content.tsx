"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, MessageCircle, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SubjectCard } from "@/components/subject/subject-card";
import { CreateSubjectButton } from "@/components/subject/create-subject-button";
import { JoinSubjectButton } from "@/components/subject/join-subject-button";
import { DifficultyChart, type Dificuldade } from "./difficulty-chart";

type Subject = { id: string; name: string; role: "teacher" | "student" };
export type ResumoDashboard = {
  id: string;
  topic_id: string | null;
  title: string;
  summary: string;
  updated_at: string;
};

type Props = {
  userName: string;
  subjects: Subject[];
  difficulties: Dificuldade[]; // permanece calculado com messages
  subjectsError: boolean;
  indicatorsError: boolean;
};

export function DashboardContent({
  userName,
  subjects,
  difficulties,
  subjectsError,
  indicatorsError,
}: Props) {
  const teacherSubjects = subjects.filter((s) => s.role === "teacher");
  const studentSubjects = subjects.filter((s) => s.role === "student");
  const [teacherMode, setTeacherMode] = useState(
    teacherSubjects.length > 0 && studentSubjects.length === 0
  );

  const selected = teacherMode ? teacherSubjects : studentSubjects;
  const totalDuvidas = difficulties.reduce((sum, item) => sum + item.total, 0);
  const topicos = [...difficulties].sort((a, b) => b.total - a.total).slice(0, 4);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-7 pb-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Olá, {userName}!</h1>
          <p className="text-sm text-muted-foreground">
            {teacherMode
              ? "Acompanhe as disciplinas e os assuntos que geram mais dúvidas."
              : "Acesse suas disciplinas e continue seus estudos."}
          </p>
        </div>
        {teacherSubjects.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border px-4 py-3">
            <Label htmlFor="teacher-mode" className="cursor-pointer text-sm">
              Modo professor
            </Label>
            <Switch id="teacher-mode" checked={teacherMode} onCheckedChange={setTeacherMode} />
          </div>
        )}
      </header>

      {subjectsError && (
        <p className="text-sm text-destructive">Não foi possível carregar suas disciplinas.</p>
      )}

      {teacherMode ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard titulo="Disciplinas" valor={teacherSubjects.length} icone={<BookOpen className="size-5" />} />
            <StatCard titulo="Dúvidas classificadas" valor={totalDuvidas} icone={<MessageCircle className="size-5" />} />
            <StatCard titulo="Tópicos com dúvidas" valor={difficulties.length} icone={<GraduationCap className="size-5" />} />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tópicos com mais dúvidas</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Assuntos mais frequentes entre as perguntas dos alunos
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {indicatorsError ? (
                  <p className="text-sm text-destructive">Não foi possível carregar os indicadores.</p>
                ) : topicos.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">
                    Ainda não há dúvidas classificadas nas suas disciplinas.
                  </p>
                ) : (
                  topicos.map((item, index) => (
                    <div key={`${item.subject_id}-${item.topic_id ?? "outro"}`} className="flex items-center gap-3 rounded-lg border p-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-green-50 text-sm font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.topic_title}</p>
                        <p className="truncate text-xs text-muted-foreground">{item.subject_name}</p>
                      </div>
                      <span className="shrink-0 text-sm text-muted-foreground">{item.total} dúvidas</span>
                      {item.topic_id && (
                        <Button  variant="ghost" size="icon" title="Ver detalhes do tópico">
                          <Link href={`/topics/${item.topic_id}`} aria-label={`Ver ${item.topic_title}`}>
                            <ArrowRight className="size-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {indicatorsError ? (
              <Card className="flex items-center justify-center p-8 text-sm text-muted-foreground">
                Gráfico indisponível no momento.
              </Card>
            ) : (
              <DifficultyChart data={difficulties} />
            )}
          </div>
        </>
      ) : (
        <Card className="border-dashed bg-muted/20">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="rounded-full bg-primary/10 p-4">
              <MessageCircle className="size-7 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Alguma dúvida? Vamos estudar!</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Escolha uma disciplina abaixo para conversar com o assistente e consultar seus materiais.
            </p>
            {studentSubjects.length === 1 && (
              <Button  className="mt-2">
                <Link href={`/conversations/${studentSubjects[0].id}/chat`}>
                  Abrir chat <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Minhas disciplinas</h2>
            <p className="text-sm text-muted-foreground">
              {teacherMode ? "Disciplinas que você ensina" : "Disciplinas das quais você participa como aluno"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <CreateSubjectButton />
            <JoinSubjectButton />
          </div>
        </div>
        {selected.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {teacherMode
                ? "Você ainda não possui disciplinas como professor."
                : "Você ainda não participa de nenhuma disciplina como aluno."}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {selected.map((subject) => (
              <SubjectCard
                key={subject.id}
                id={subject.id}
                name={subject.name}
                role={subject.role}
                goToSubject={true}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ titulo, valor, icone }: { titulo: string; valor: number; icone: ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-sm text-muted-foreground">{titulo}</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{valor}</p>
        </div>
        <span className="rounded-lg bg-muted p-3 text-muted-foreground">{icone}</span>
      </CardContent>
    </Card>
  );
}
