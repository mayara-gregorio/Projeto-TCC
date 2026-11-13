import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processarDuvida } from "@/lib/chat/processar-duvida";
import { buscarConversaDoUsuario } from "@/lib/queries/conversations";
import { buscarParticipacao } from "@/lib/queries/subjects";
import type { TopicoDisciplina } from "@/types";
export const runtime = "nodejs";
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  const conversationId = new URL(request.url).searchParams.get("conversationId");
  if (!conversationId) return NextResponse.json({ messages: [] });
  const { data: conversation, error: conversationError } = await buscarConversaDoUsuario(
    supabase,
    conversationId,
    user.id
  );
  if (conversationError) {
    return NextResponse.json({ error: conversationError.message }, { status: 500 });
  }
  if (!conversation) {
    return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
  }
  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ messages: data });
}
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }
  let body: { conversationId?: string; subjectId?: string; content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const content = typeof body.content === "string" ? body.content.trim() : "";
  let conversationId = body.conversationId;
  let subjectId = body.subjectId;
  if (!content) {
    return NextResponse.json({ error: "A mensagem não pode estar vazia" }, { status: 400 });
  }
  // Em conversas existentes, a disciplina vem do banco, não do corpo da requisição.
  if (conversationId) {
    const { data: conversation, error } = await buscarConversaDoUsuario(
      supabase,
      conversationId,
      user.id
    );
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!conversation) {
      return NextResponse.json({ error: "Conversa não encontrada" }, { status: 404 });
    }
    subjectId = conversation.subject_id;
  }
  if (!subjectId) {
    return NextResponse.json({ error: "Disciplina não informada" }, { status: 400 });
  }
  const { data: membership, error: membershipError } = await buscarParticipacao(supabase, subjectId, user.id).maybeSingle();
  if (membershipError) {
    return NextResponse.json({ error: "Erro ao verificar participação" }, { status: 500 });
  }
  if (!membership) {
    return NextResponse.json({ error: "Você não participa desta disciplina" }, { status: 403 });
  }
  // A RPC lista os tópicos para membros da disciplina mesmo com RLS restrito em topics.
  const { data: topicosData, error: topicosError } = await supabase.rpc(
    "listar_topicos_classificacao",
    { p_subject_id: subjectId }
  );
  if (topicosError) {
    console.error("Erro ao buscar tópicos:", topicosError);
    return NextResponse.json({ error: "Não foi possível consultar os tópicos" }, { status: 500 });
  }
  const topicos = (topicosData ?? []) as TopicoDisciplina[];
  if (!conversationId) {
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, subject_id: subjectId, title: content.slice(0, 50) })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    conversationId = data.id as string;
  }
  const resultado = await processarDuvida({
    supabase,
    conversationId,
    subjectId,
    content,
    topicos,
  });
  if (!resultado.ok) {
    return NextResponse.json(
      { error: resultado.error, conversationId },
      { status: resultado.status }
    );
  }
  return NextResponse.json(resultado.dados);
}

