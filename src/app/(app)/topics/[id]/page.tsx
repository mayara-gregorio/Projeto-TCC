import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  TopicDetails,
  type DayCount,
  type SlideSource,
  type TopicSummary,
} from "@/components/topic/topic-details";

type Props = {
  params: Promise<{ id: string }>;
};

type DetailsData = {
  subjectId: string;
  subjectName: string;
  topicName: string;
  description: string | null;
  totalQuestions: number;
  uniqueStudents: number;
  timeline: DayCount[];
  slides: Omit<SlideSource, "url">[];
};

type SummaryRow = {
  id: string;
  title: string;
  summary: string;
  created_at: string;
  updated_at: string | null;
  material_coverage: string | null;
  material_recommendation: string | null;
};

export default async function TopicPage({ params }: Props) {
  const { id: topicId } = await params;
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

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

  const { data: rawSummaries, error: summariesError } = await supabase.rpc(
    "listar_resumos_topico",
    { p_topic_id: topicId, p_limite: 100 }
  );

  if (summariesError) {
    console.error("Erro ao buscar resumos do tópico:", summariesError);
    throw new Error("Não foi possível carregar os resumos do tópico.");
  }

  const summaries: TopicSummary[] = ((rawSummaries ?? []) as SummaryRow[]).map(
    (item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary,
      updatedAt: item.updated_at ?? item.created_at,
      materialCoverage:
        item.material_coverage === "covered" ||
        item.material_coverage === "not_covered"
          ? item.material_coverage
          : "uncertain",
      materialRecommendation: item.material_recommendation ?? null,
    })
  );

  // Gera URLs assinadas somente dos arquivos exibidos.
  const signedUrls = new Map<string, string | null>();
  const slides: SlideSource[] = [];

  for (const slide of details.slides ?? []) {
    if (!signedUrls.has(slide.storagePath)) {
      const { data: file, error: storageError } = await supabase.storage
        .from("storage_materials")
        .createSignedUrl(slide.storagePath, 3600);

      if (storageError) {
        console.error("Erro ao gerar URL do PDF:", storageError);
      }
      signedUrls.set(slide.storagePath, file?.signedUrl ?? null);
    }

    slides.push({
      ...slide,
      url: signedUrls.get(slide.storagePath) ?? null,
    });
  }

  return (
    <TopicDetails
      subjectId={details.subjectId}
      subjectName={details.subjectName}
      topicId={topicId}
      topicName={details.topicName}
      description={details.description}
      totalQuestions={Number(details.totalQuestions ?? 0)}
      uniqueStudents={Number(details.uniqueStudents ?? 0)}
      slides={slides}
      timeline={details.timeline ?? []}
      summaries={summaries}
    />
  );
}
