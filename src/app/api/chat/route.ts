// app/api/chat/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" // seu client do @supabase/ssr
import { askGemini } from "@/lib/ai/gemini"

// Carrega o histórico de uma conversa
export async function GET(request: Request) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const conversationId = new URL(request.url).searchParams.get("conversationId")

  if (!conversationId) {
    return NextResponse.json({ messages: [] })
  }

  const { data, error } = await supabase
    .from("messages")
    .select("id, role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data })
}

// Recebe uma mensagem, salva, consulta o Gemini e salva a resposta
export async function POST(request: Request) {
  console.info("[api/chat] POST recebido")

  const supabase = await createClient()

  const body = await request.json()
  const incomingId = body.conversationId as string | undefined
  const subjectId = body.subjectId as string | undefined
  const content = (body.content as string | undefined)?.trim()

  console.log("este é o body", body)

  if (!content) {
    return NextResponse.json(
      { error: "A mensagem não pode estar vazia" },
      { status: 400 }
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  // 1. Cria a conversa se ainda não existir
  let conversationId = incomingId

  console.log(subjectId, "aaaaaaaaaaaa")
  if (!conversationId) {
    if (!subjectId) {
      return NextResponse.json(
        { error: "subjectId é obrigatório para iniciar uma conversa" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_id: user.id,
        subject_id: subjectId,
        title: content.slice(0, 50),
      })
      .select("id")
      .single()

    if (error) {
      // 42501 = bloqueado pelo RLS (usuário não é membro da matéria)
      const status = error.code === "42501" ? 403 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    conversationId = data.id as string
  }

  // 2. Salva a mensagem do usuário
  const { data: userMessage, error: userError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "user", content })
    .select("id, role, content")
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

  // 3. Busca o histórico (já inclui a mensagem que acabou de ser salva)
  const { data: history, error: historyError } = await supabase
    .from("messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })

  if (historyError || !history) {
    return NextResponse.json(
      { error: historyError?.message ?? "Erro ao buscar histórico" },
      { status: 500 }
    )
  }

  // 4. Chama o Gemini com o histórico completo
  let assistantText: string

  try {
    assistantText = await askGemini(history)
  } catch (error) {
    console.error("[api/chat] Falha ao consultar o Gemini:", error)
    return NextResponse.json(
      { error: "Falha ao consultar a IA" },
      { status: 502 }
    )
  }

  // 5. Salva a resposta da IA
  const { data: assistantMessage, error: assistantError } = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      role: "assistant",
      content: assistantText,
    })
    .select("id, role, content")
    .single()

  if (assistantError) {
    return NextResponse.json({ error: assistantError.message }, { status: 500 })
  }

  // 6. Devolve tudo para o front
  return NextResponse.json({
    conversationId,
    userMessage,
    assistantMessage,
  })
}