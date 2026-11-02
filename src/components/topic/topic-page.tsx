
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  ExternalLink,
  FileText,
  Plus,
} from "lucide-react";

import { getCurrentUser } from "@/lib/get-user";
import { createClient } from "@/lib/supabase/server";


import {
  CreateTopicForm,
  UploadTopicPdfForm,
} from "@/components/topic/topic-forms";


export async function TopicsPage({ subjectId }: {subjectId: string}) {
  const  id  = subjectId;
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const supabase = await createClient();

  // Busca a disciplina e verifica se o usuário é professor
  const { data: subject } = await supabase
    .from("subjects")
    .select(`
      id,
      name,
      subject_members!inner (
        user_id,
        role
      )
    `)
    .eq("id", id)
    .eq("subject_members.user_id", user.id)
    .eq("subject_members.role", "teacher")
    .maybeSingle();

  if (!subject) notFound();

  // Busca os tópicos e os PDFs de cada um
    const { data: topics, error } = await supabase
    .from("topics")
    .select(`
        id,
        title,
        materials (
        id,
        filename,
        storage_path,
        status
        )
    `)
    .eq("subject_id", id)
    .order("created_at", { ascending: true });
    if (error) {
        console.error("Erro ao buscar tópicos:", error);
    }

  // Gera links temporários para os arquivos privados
    const topicsWithFiles = await Promise.all(
    (topics ?? []).map(async (topic) => {
        const materials = await Promise.all(
        (topic.materials ?? []).map(async (material) => {
            const { data } = await supabase.storage
            .from("storage_materials")
            .createSignedUrl(material.storage_path, 3600);

            return {
            ...material,
            url: data?.signedUrl ?? null,
            };
        })
        );

        return { ...topic, materials };
    })
    );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 md:px-8">
      <header className="flex flex-col gap-5">
        <Link
          href="/subjects"
          className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar para disciplinas
        </Link>

        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {subject.name}
          </h1>

          <p className="text-sm text-muted-foreground">
            Gerencie os tópicos e materiais da disciplina.
          </p>
        </div>
      </header>

      <main className="flex flex-col gap-6">
        {/* Formulário de criação */}
        <section className="rounded-xl border p-5">
          <div className="mb-4">
            <h2 className="font-semibold">Novo tópico</h2>
            <p className="text-sm text-muted-foreground">
              Adicione um assunto que será abordado na disciplina.
            </p>
          </div>

          <CreateTopicForm subjectId={id} />
        </section>

        {/* Listagem dos tópicos */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Tópicos da disciplina
            </h2>

            <span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">
              {topicsWithFiles.length}
            </span>
          </div>

          {topicsWithFiles.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-14 text-center">
              <BookOpen className="mb-2 size-8 text-muted-foreground" />

              <p className="font-medium">
                Nenhum tópico cadastrado
              </p>

              <p className="text-sm text-muted-foreground">
                Crie seu primeiro tópico para adicionar materiais.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {topicsWithFiles.map((topic) => (
                <li key={topic.id}>
                  <details className="group rounded-xl border">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                      <div className="flex min-w-0 items-center gap-3">
                        <BookOpen className="size-5 shrink-0 text-muted-foreground" />

                        <div className="min-w-0">
                          <h3 className="truncate font-medium">
                            {topic.title}
                          </h3>

                          <p className="text-xs text-muted-foreground">
                            {topic.materials.length} material(is)
                          </p>
                        </div>
                      </div>

                      <Plus className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-45" />
                    </summary>

                    <div className="flex flex-col gap-4 border-t p-5">
                      <h4 className="text-sm font-medium">
                        Materiais do tópico
                      </h4>

                      {topic.materials.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Nenhum PDF anexado ainda.
                        </p>
                      ) : (
                        <ul className="flex flex-col gap-2">
                          {topic.materials.map((material) => (
                            <li key={material.id}>
                              <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/50 p-3">
                                <div className="flex min-w-0 items-center gap-3">
                                  <FileText className="size-5 shrink-0 text-muted-foreground" />

                                  <span className="truncate text-sm">
                                    {material.filename}
                                  </span>
                                </div>

                                {material.url && (
                                  <a
                                    href={material.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={`Abrir ${material.filename}`}
                                    className="text-muted-foreground hover:text-foreground"
                                  >
                                    <ExternalLink className="size-4" />
                                  </a>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    <UploadTopicPdfForm
                    subjectId={id}
                    topicId={topic.id}
                    />
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
