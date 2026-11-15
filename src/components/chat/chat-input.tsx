
"use client"

import { useState } from "react"
import type { KeyboardEvent, SubmitEvent } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Info, Send } from "lucide-react"

type ChatInputProps = {
  onSend: (message: string) => void
  disabled?: boolean
}

export function ChatInput({
  onSend,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("")

  function sendMessage() {
    const content = message.trim()

    if (!content || disabled) return

    onSend(content)
    setMessage("")
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    sendMessage()
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault()
      sendMessage()
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center gap-2 border-t p-4"
    >
      <div className="flex lg:max-w-2xl flex-col items-center gap-2">
        <div className="flex w-full items-center justify-center gap-2">
          <Textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            disabled={disabled}
            className="min-h-12 max-h-40 resize-none"
          />
          <Button
          type="submit"
          size="icon"
          disabled={disabled || !message.trim()}
          aria-label="Enviar mensagem"
          >
          <Send className="size-4" />
        </Button>
        </div>
        <div className="flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 size-3.5 shrink-0" />
          <p>
            O professor visualizará as dúvidas
            enviadas, sem vínculo à identificação do estudante.
          </p>
        </div>
      </div>
    </form>
  )
}
