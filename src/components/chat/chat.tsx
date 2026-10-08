
"use client"

import { useState } from "react"

import {
  Marker,
  MarkerContent,
} from "@/components/ui/marker"

import { ChatMessage } from "./chat-message"
import { ChatInput } from "./chat-input"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Olá! Sou seu assistente de POO. Como posso ajudar você?",
    },
  ])

  const [loading, setLoading] = useState(false)

  function handleSend(content: string) {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content,
    }

    setMessages((current) => [
      ...current,
      userMessage,
    ])

    setLoading(true)

    // Temporário: simula uma resposta da IA
    setTimeout(() => {
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          "Essa é uma resposta temporária. Em seguida vamos conectar o Gemini aqui.",
      }

      setMessages((current) => [
        ...current,
        assistantMessage,
      ])

      setLoading(false)
    }, 1000)
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

      <ChatInput
        onSend={handleSend}
        disabled={loading}
      />
    </div>
  )
}
