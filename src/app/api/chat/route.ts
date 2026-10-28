import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server" 
import { askLocal } from "@/lib/ai/local"

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

  let conversationId = incomingId

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
      const status = error.code === "42501" ? 403 : 500
      return NextResponse.json({ error: error.message }, { status })
    }

    conversationId = data.id as string
  }

  const { data: userMessage, error: userError } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, role: "user", content })
    .select("id, role, content")
    .single()

  if (userError) {
    return NextResponse.json({ error: userError.message }, { status: 500 })
  }

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

  let assistantText: string

  try {
    assistantText = await askLocal(history)
  } catch (error) {
    console.error("[api/chat] Falha ao consultar a IA local:", error)
    return NextResponse.json(
      { error: "Falha ao consultar a IA" },
      { status: 502 }
    )
  }

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

  return NextResponse.json({
    conversationId,
    userMessage,
    assistantMessage,
  })
}