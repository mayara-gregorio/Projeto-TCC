
import Link from "next/link";
import { ArrowRight, BookOpen, MessageCircle } from "lucide-react";

import { getCurrentUser } from "@/lib/get-user";
import { CreateSubjectButton } from "@/components/subject/create-subject-button";
import { JoinSubjectButton } from "@/components/subject/join-subject-button";
import { createClient } from "@/lib/supabase/server";

export default async function SubjectPage() {
  const supabase = await createClient();
  const user = await getCurrentUser();

  if (!user) return null;

  const { data: subjects, error: errorSubject } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("subject_members.user_id", user.id);

  if (errorSubject) {
    console.error("Erro ao buscar disciplinas:", errorSubject);
  }

  const teacherSubjects =
    subjects?.filter((subject) =>
      subject.subject_members.some(
        (member) => member.role === "teacher"
      )
    ) ?? [];

  const studentSubjects =
    subjects?.filter((subject) =>
      subject.subject_members.some(
        (member) => member.role === "student"
      )
    ) ?? [];

  const hasTeacherSubjects = teacherSubjects.length > 0;
  const hasStudentSubjects = studentSubjects.length > 0;

  const showBoth = hasTeacherSubjects && hasStudentSubjects;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Disciplinas
          </h1>

          <p className="text-sm text-muted-foreground">
            Gerencie suas disciplinas e acesse o assistente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <JoinSubjectButton />
          <CreateSubjectButton />
        </div>
      </header>

      {!hasTeacherSubjects && !hasStudentSubjects ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-16 text-center">
          <BookOpen className="mb-2 size-8 text-muted-foreground" />

          <p className="font-medium">
            Nenhuma disciplina ainda
          </p>

          <p className="text-sm text-muted-foreground">
            Entre em uma disciplina ou crie uma nova para começar.
          </p>
        </div>
      ) : (
        <main
          className={`grid gap-6 ${
            showBoth ? "md:grid-cols-2" : "grid-cols-1"
          }`}
        >
          {hasTeacherSubjects && (
            <section className="flex flex-col gap-4 rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Professor
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Disciplinas que você ministra
                  </p>
                </div>

                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {teacherSubjects.length}
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                {teacherSubjects.map((subject) => (
                  <li key={subject.id}>
                    <Link
                      href={`/subjects/${subject.id}/topics`}
                      className="group flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <BookOpen className="size-5 shrink-0 text-muted-foreground" />

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {subject.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Ver tópicos
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {hasStudentSubjects && (
            <section className="flex flex-col gap-4 rounded-xl border p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">
                    Aluno
                  </h2>

                  <p className="text-sm text-muted-foreground">
                    Disciplinas em que você está matriculado
                  </p>
                </div>

                <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
                  {studentSubjects.length}
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                {studentSubjects.map((subject) => (
                  <li key={subject.id}>
                    <Link
                      href={`/subjects/${subject.id}/conversations`}
                      className="group flex items-center justify-between gap-3 rounded-lg border p-4 transition-colors hover:bg-accent"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <MessageCircle className="size-5 shrink-0 text-muted-foreground" />

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {subject.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Conversar com o assistente da disciplina
                          </p>
                        </div>
                      </div>

                      <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </main>
      )}
    </div>
  );
}
