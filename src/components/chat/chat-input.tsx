"use client"

import { FormEvent, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"

type ChatInputProps = {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const content = message.trim()

    if (!content || disabled) {
      return
    }

    onSend(content)
    setMessage("")
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()

      const content = message.trim()

      if (!content || disabled) {
        return
      }

      onSend(content)
      setMessage("")
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t p-4"
    >
      <Textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Digite sua dúvida sobre POO..."
        disabled={disabled}
        className="min-h-12 max-h-40 resize-none"
      />

      <Button
        type="submit"
        size="icon"
        disabled={disabled || !message.trim()}
      >
        <Send />
        <span className="sr-only">Enviar mensagem</span>
      </Button>
    </form>
  )
}
