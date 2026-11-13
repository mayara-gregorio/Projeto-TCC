import { askLocal, classificarDuvida, resumirDuvida } from "@/lib/ai/local";
import { PROMPT_RESPOSTA_SEM_MATERIAL, promptRespostaComMaterial } from "@/lib/ai/prompts";
import { vetorDaDuvida } from "@/lib/rag/embeddings";
import type { SupabaseServer } from "@/lib/supabase/server";
import type { TopicoDisciplina } from "@/types";

type ChunkRecuperado = {
  id: string;
  material_id: string;
  topic_id: string;
  content: string;
  page: number;
  page_end: number;
  similarity: number;
};

type EntradaDuvida = {
  supabase: SupabaseServer;
  conversationId: string;
  subjectId: string;
  content: string;
  topicos: TopicoDisciplina[];
};

export async function processarDuvida({
  supabase,
  conversationId,
  subjectId,
  content,
  topicos,
}: EntradaDuvida) {
  // A mensagem é registrada antes do processamento, para preservar a dúvida original.
  const { data: userMessage, error: userError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "user", content })
    .select("id, role, content")
    .single();
  if (userError) {
    return { ok: false as const, error: userError.message, status: 500 };
  }
  let vetor: number[];
  try {
    vetor = await vetorDaDuvida(content);
    if (!Array.isArray(vetor) || vetor.length !== 768 || !vetor.every(Number.isFinite)) {
      throw new Error("Embedding inválido");
    }
  } catch (error) {
    console.error("Erro ao gerar embedding:", error);
    return { ok: false as const, error: "Não foi possível gerar o embedding", status: 502 };
  }
  // Busca uma única vez os cinco chunks mais próximos da dúvida.
  const { data: chunksData, error: searchError } = await supabase.rpc("buscar_chunks", {
    p_embedding: vetor,
    p_subject_id: subjectId,
    p_limite: 5,
  });
  if (searchError) {
    console.error("Erro na busca semântica:", searchError);
    return { ok: false as const, error: "Não foi possível consultar os materiais", status: 500 };
  }
  const chunks = (chunksData ?? []) as ChunkRecuperado[];
  // O local.ts atualizado recebe um único contexto, não três argumentos separados.
  const contextoClassificacao = {
    duvida: content,
    topicos: topicos.map((topico) => ({
      id: topico.id,
      titulo: topico.title,
      descricao: topico.description,
    })),
    fragmentos: chunks.map((chunk) => ({
      topico_id: chunk.topic_id,
      conteudo: chunk.content,
      similaridade: chunk.similarity,
      pagina: chunk.page,
      pagina_final: chunk.page_end,
    })),
  };
  let classificacao: { topic_id: string; confidence: number };
  try {
    classificacao = await classificarDuvida(contextoClassificacao);
    console.log("Classificação da dúvida:", classificacao);
  } catch (error) {
    console.error("Erro ao classificar dúvida:", error);
    return { ok: false as const, error: "Não foi possível classificar a dúvida", status: 502 };
  }
  const { data: mensagemClassificada, error: classificationError } = await supabase
    .from("messages")
    .update({ topic_id: classificacao.topic_id, confidence: classificacao.confidence })
    .eq("id", userMessage.id)
    .eq("conversation_id", conversationId)
    .select("id")
    .maybeSingle();
  if (classificationError || !mensagemClassificada) {
    console.error("Erro ao salvar classificação:", classificationError);
    return { ok: false as const, error: "Não foi possível salvar a classificação", status: 500 };
  }
  // Salva as fontes recuperadas para auditoria/avaliação no TCC.
  const fontes = Array.from(new Map(chunks.map((chunk) => [chunk.id, chunk])).values())
    .map((chunk) => ({
      message_id: userMessage.id,
      chunk_id: chunk.id,
      similarity: chunk.similarity,

    }));
  if (fontes.length > 0) {
    const { error: sourcesError } = await supabase
      .from("message_sources")
      .insert(fontes);
    if (sourcesError) {
      console.error("Erro ao salvar fontes:", sourcesError);
      return { ok: false as const, error: "Não foi possível salvar as fontes da dúvida", status: 500 };
    }
  }
  const { data: history, error: historyError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (historyError || !history) {
    return { ok: false as const, error: "Erro ao buscar histórico", status: 500 };
  }
  // Os chunks recuperados agora fundamentam a resposta da LLM.
  // Mantemos um limite de tamanho para não ultrapassar o contexto do Qwen local.
let assistantText: string;
const possuiChunks = chunks.length > 0;
const materiais = chunks
  .map((chunk, indice) => {
    const pagina =
chunk.page_end && chunk.page_end !== chunk.page
        ? `${chunk.page}-${chunk.page_end}`
        : String(chunk.page);
    return (
      `[Fonte ${indice + 1} | slide ${pagina} | tópico ${chunk.topic_id}]\n` +
chunk.content.slice(0, 750)
    );
  })
  .join("\n\n");
const instrucoes = possuiChunks
  ? promptRespostaComMaterial(materiais)
  : PROMPT_RESPOSTA_SEM_MATERIAL;
  // Poucas mensagens recentes para evitar estourar o limite de contexto da LLM.
    // A dúvida atual já consta no histórico salvo no banco.
    const historicoCurto = history.slice(-6).map((mensagem) => ({
      role: mensagem.role as "user" | "assistant",
      content: mensagem.content.slice(0, 500),
    }));
    try {
      assistantText = await askLocal([
        { role: "system", content: instrucoes },
        ...historicoCurto,
      ]);
    } catch (error) {
      console.error("Falha ao gerar resposta fundamentada:", error);
      return { ok: false as const, error: "Falha ao consultar a IA", status: 502 };
    }
  const { data: assistantMessage, error: assistantError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "assistant", content: assistantText })
    .select("id, role, content")
    .single();
  if (assistantError) {
    return { ok: false as const, error: assistantError.message, status: 500 };
  }
  // Uma pergunta classificada recebe um resumo individual, exibido ao professor.
  // Não reprocessamos dúvidas antigas. Falha no resumo não cancela
  // a resposta já persistida para o aluno.
  let resumoSalvo = false;
  if (classificacao.topic_id !== null) {
    try {
      const topico = topicos.find((item) => item.id === classificacao.topic_id);
      // history contém a pergunta atual, mas ainda não a resposta recém-gerada.
      // Isso permite interpretar perguntas contextuais como "me dê um exemplo".
      const resumo = await resumirDuvida({
        pergunta: content,
        disciplina: subjectId,
        topico: topico!.title,
        historico: history.slice(-6).map((mensagem) => ({
          role: mensagem.role as "user" | "assistant",
          content: mensagem.content.slice(0, 400),
        })),
        fragmentos: chunks.map((chunk) => ({
          conteudo: chunk.content,
          similaridade: chunk.similarity,
        })),
      });
      if (!resumo.title.trim() || !resumo.summary.trim()) {
        throw new Error("O Qwen retornou um resumo vazio.");
      }
      const { error: summaryError } = await supabase.rpc(
        "salvar_resumo_mensagem_v2",
        {
          p_message_id: userMessage.id,
          p_title: resumo.title,
          p_summary: resumo.summary,
          // Cobertura do material avaliada pela LLM: covered, not_covered ou uncertain.
          p_material_coverage: resumo.material_coverage,
        }
      );
      if (summaryError) {
        console.error("Erro ao salvar resumo da dúvida:", summaryError);
      } else {
        resumoSalvo = true;
      }
    } catch (error) {
      console.error("Erro ao gerar resumo da dúvida:", error);
    }
  }
  return {
    ok: true as const,
    dados: {
      conversationId,
      userMessage: { ...userMessage, ...classificacao },
      assistantMessage,
      classification: classificacao,
      summarySaved: resumoSalvo,
      // Metadados úteis para conferência da busca, sem expor o texto dos chunks.
      retrievedChunks: chunks.map((chunk) => ({
        id: chunk.id,
        materialId: chunk.material_id,
        topicId: chunk.topic_id,
        page: chunk.page,
        pageEnd: chunk.page_end,
        similarity: chunk.similarity,
      })),
    },
  };
}
