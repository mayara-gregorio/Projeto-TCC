import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TopicDetails,
  type DayCount,
  type SlideSource,
} from "@/components/topic/topic-details";

type Props = {
  params: Promise<{ id: string }>;
};

type SlideData = Omit<SlideSource, "url">;

type DetailsData = {
  subjectId: string;
  subjectName: string;
  topicId: string
  topicName: string;
  description: string | null;
  totalQuestions: number;
  uniqueStudents: number;
  timeline: DayCount[];
  slides: SlideData[];
  groups: DoubtGroup[]
};

export type DoubtGroup = {
  id: string;
  title: string;
  summary: string;
  totalQuestions: number;
  uniqueStudents: number;
};

export default async function TopicPage({ params }: Props) {
  const { id: topicId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) redirect("/login");

  // A RPC valida que o usuário é professor da disciplina e
  // devolve apenas estatísticas, sem o conteúdo das mensagens.
  const { data: rawDetails, error: detailsError } = await supabase.rpc(
    "detalhes_topico",
    { p_topic_id: topicId }
  );

  
  if (detailsError) {
    console.error("Erro ao buscar detalhes do tópico:", detailsError);

    if (
      detailsError.message.includes("Tópico não encontrado") ||
      detailsError.message.includes("Acesso não autorizado")
    ) {
      notFound();
    }

    throw new Error("Não foi possível carregar os detalhes do tópico.");
  }

  if (!rawDetails) notFound();
  const details = rawDetails as unknown as DetailsData;
  details.topicId = topicId

// listar agrupamento dos tópicos
  const { data: groupsData, error: groupsError } =
    await supabase.rpc("listar_agrupamentos_topico", {
      p_topic_id: topicId,
    });

  if (groupsError) {
    console.error("Erro ao buscar agrupamentos:", groupsError);
    throw new Error("Não foi possível carregar os agrupamentos.");
  }

  const groups = (groupsData ?? []).map((group: any) => ({
    id: group.id,
    title: group.title,
    summary: group.summary,
    totalQuestions: Number(group.total_questions ?? 0),
    uniqueStudents: Number(group.unique_students ?? 0),
  }));

  // Gera URLs assinadas apenas para os PDFs associados aos slides exibidos.
  const urls = new Map<string, string | null>();
  const slides: SlideSource[] = [];

  for (const slide of details.slides ?? []) {
    if (!urls.has(slide.storagePath)) {
      const { data: file, error: storageError } = await supabase.storage
        .from("storage_materials")
        .createSignedUrl(slide.storagePath, 3600);

      if (storageError) {
        console.error("Erro ao gerar URL do PDF:", storageError);
      }

      urls.set(slide.storagePath, file?.signedUrl ?? null);
    }

    slides.push({
      ...slide,
      url: urls.get(slide.storagePath) ?? null,
    });
  }

  return (
    <TopicDetails
      subjectId={details.subjectId}
      subjectName={details.subjectName}
      topicId={details.topicId}
      topicName={details.topicName}
      description={details.description}
      totalQuestions={details.totalQuestions}
      uniqueStudents={details.uniqueStudents}
      slides={slides}
      timeline={details.timeline}
      groups={groups}
    />
  );
}
