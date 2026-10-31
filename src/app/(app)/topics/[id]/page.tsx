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

type ConversationInfo = {
  user_id: string;
  subject_id: string;
};

export default async function TopicPage({ params }: Props) {
  const { id: topicId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: topic, error: topicError } = await supabase
    .from("topics")
    .select("id, title, description, subject_id")
    .eq("id", topicId)
    .maybeSingle();

  if (topicError || !topic) notFound();

  // Somente professores desta disciplina podem acessar os detalhes.
  const { data: membership, error: membershipError } = await supabase
    .from("subject_members")
    .select("user_id")
    .eq("subject_id", topic.subject_id)
    .eq("user_id", user.id)
    .eq("role", "teacher")
    .maybeSingle();

  if (membershipError || !membership) notFound();

  const { data: subject, error: subjectError } = await supabase
    .from("subjects")
    .select("name")
    .eq("id", topic.subject_id)
    .maybeSingle();

  if (subjectError) console.error("Erro ao buscar disciplina:", subjectError);

  // A contagem usa messages; os textos das perguntas não são exibidos.
  const { count: totalCount, error: countError } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .eq("topic_id", topicId);

  if (countError) console.error("Erro ao contar dúvidas:", countError);
  const totalQuestions = totalCount ;
  console.log("total de dúvidas enviadas", totalQuestions)


  // Metadados para o gráfico, alunos distintos e referências.
  // O limite de 1000 é provisório: para um volume maior, use uma RPC agregada.
  const { data: questions, error: questionsError } = await supabase
    .from("messages")
    .select("id, created_at, conversations!inner(user_id, subject_id)")
    .eq("role", "user")
    .eq("topic_id", topicId)
    .eq("conversations.subject_id", topic.subject_id)
    .order("created_at", { ascending: false })
    .limit(1000);
  
  console.log("DIAGNÓSTICO DO TÓPICO", {
    topicId,
    subjectId: topic.subject_id,
    totalCount,
    countError,
    quantidadeDePerguntas: questions?.length,
    questionsError,
  });

  if (questionsError) console.error("Erro ao buscar metadados:", questionsError);
  const questionList = questions ?? [];

  const studentIds = new Set(
    questionList
      .map((question) => {
        const relation = question.conversations;
        const conversation = (Array.isArray(relation)
          ? relation[0]
          : relation) as ConversationInfo | undefined;
        return conversation?.user_id;
      })
      .filter((id): id is string => typeof id === "string")
  );
  const uniqueStudents = studentIds.size;

  // Últimos sete dias usando datas UTC, coerentes com os timestamps consultados.
  const now = new Date();
  const daily = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (6 - index))
    );
    return {
      iso: date.toISOString().slice(0, 10),
      day: date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        timeZone: "UTC",
      }),
    };
  });

  const timeline: DayCount[] = daily.map(({ iso, day }) => ({
    day,
    count: questionList.filter((question) => question.created_at?.slice(0, 10) === iso)
      .length,
  }));

  // Resumos da IA por conversa e tópico (sem exibir o texto original da pergunta).
  const { data: summaryData, error: summariesError } = await supabase
    .from("conversation_summaries")
    .select("id, title, summary, updated_at, conversations!inner(subject_id)")
    .eq("topic_id", topicId)
    .eq("conversations.subject_id", topic.subject_id)
    .order("updated_at", { ascending: false })
    .limit(100);

  if (summariesError) console.error("Erro ao buscar resumos:", summariesError);

  const summaries: TopicSummary[] = (summaryData ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    updatedAt: item.updated_at,
  }));

  console.log("DIAGNÓSTICO DOS RESUMOS", {
  quantidade: summaryData?.length,
  summariesError,
});

  // Conta as recuperações dos chunks associados às perguntas classificadas no tópico.
  const messageIds = questionList.map((question) => question.id);
  const counts = new Map<string, number>();

  for (let i = 0; i < messageIds.length; i += 100) {
    const { data: sources, error } = await supabase
      .from("message_sources")
      .select("chunk_id")
      .in("message_id", messageIds.slice(i, i + 100));

    if (error) {
      console.error("Erro ao buscar fontes:", error);
      break;
    }

    for (const source of sources ?? []) {
      counts.set(source.chunk_id, (counts.get(source.chunk_id) ?? 0) + 1);
    }
  }

  const slides: SlideSource[] = [];
  const chunkIds = [...counts.keys()];

  for (let i = 0; i < chunkIds.length; i += 100) {
    const { data: chunks, error } = await supabase
      .from("chunks")
      .select("id, page, page_end, material_id, materials(filename, storage_path)")
      .in("id", chunkIds.slice(i, i + 100))
      .eq("subject_id", topic.subject_id);

    if (error) {
      console.error("Erro ao consultar chunks:", error);
      break;
    }

    for (const chunk of chunks ?? []) {
      const relation = chunk.materials;
      const material = Array.isArray(relation) ? relation[0] : relation;
      if (!material) continue;

      slides.push({
        key: chunk.id,
        filename: material.filename,
        storagePath: material.storage_path,
        start: chunk.page,
        end: chunk.page_end ?? chunk.page,
        count: counts.get(chunk.id) ?? 0,
        url: null,
      });
    }
  }

  slides.sort((a, b) => b.count - a.count);
  const mostUsed = slides.slice(0, 10);

  // Apenas gera links para os arquivos exibidos.
  const urls = new Map<string, string | null>();
  for (const path of [...new Set(mostUsed.map((slide) => slide.storagePath))]) {
    const { data, error } = await supabase.storage
      .from("storage_materials")
      .createSignedUrl(path, 3600);

    if (error) console.error("Erro ao gerar link do PDF:", error);
    urls.set(path, data?.signedUrl ?? null);
  }

  for (const slide of mostUsed) {
    slide.url = urls.get(slide.storagePath) ?? null;
  }


  return (
    <TopicDetails
      subjectId={topic.subject_id}
      subjectName={subject?.name ?? "Disciplina"}
      topicName={topic.title}
      description={topic.description}
      totalQuestions={totalQuestions ?? 0}
      uniqueStudents={uniqueStudents}
      summaries={summaries}
      slides={mostUsed}
      timeline={timeline}
    />
  );
}
