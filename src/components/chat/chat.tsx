"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Marker, MarkerContent } from "@/components/ui/marker"

import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

const welcomeMessage: Message = {
  id: "welcome",
  role: "assistant",
  content: "Olá! Sou seu assistente. Como posso ajudar você?",
}

export function Chat({
  initialConversationId,
  subjectId,
}: {
  initialConversationId?: string
  subjectId?: string
}) {
  const [messages, setMessages] = useState<Message[]>([welcomeMessage])
  const [conversationId, setConversationId] = useState<string | undefined>(
    initialConversationId
  )
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!initialConversationId) return

    fetch(`/api/chat?conversationId=${initialConversationId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.messages?.length) {
          setMessages([welcomeMessage, ...data.messages])
        }
      })
      .catch((error) => {
        console.error("Falha ao carregar histórico:", error)
      })
  }, [initialConversationId])

  async function handleSend(content: string) {
    const tempId = crypto.randomUUID()
    setMessages((current) => [...current, { id: tempId, role: "user", content }])
    setLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // subjectId é necessário para criar a conversa na primeira mensagem
        body: JSON.stringify({ conversationId, subjectId, content }),
      })

      if (!res.ok) {
        const data: { error?: string } = await res.json()
        throw new Error(data.error ?? `Falha ao enviar mensagem (${res.status})`)
      }

      const data = await res.json()

      if (!conversationId && data.conversationId && subjectId) {
        window.history.replaceState(
          null,
          "",
          `/conversations/${subjectId}/chat/${data.conversationId}`
        )
        router.refresh()
      }

      setConversationId(data.conversationId)

      setMessages((current) => [
        ...current.filter((m) => m.id !== tempId),
        data.userMessage,
        data.assistantMessage,
      ])
    } catch (error) {
      console.error("Falha ao enviar mensagem para /api/chat:", error)
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Ocorreu um erro ao processar sua mensagem. Tente novamente.",
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <h1>Chat</h1>

      <div className="flex-1 space-y-6 overflow-y-auto p-6">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
          />
        ))}

        {loading && (
          <Marker role="status">
            <MarkerContent className="shimmer">
              O assistente está digitando...
            </MarkerContent>
          </Marker>
        )}
      </div>

      <ChatInput onSend={handleSend} disabled={loading} />
    </div>
  )
}
