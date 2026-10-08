
"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble"

import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"

type ChatMessageProps = {
  role: "user" | "assistant"
  content: string
}

export function ChatMessage({
  role,
  content,
}: ChatMessageProps) {
  const isUser = role === "user"

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageAvatar>
        <Avatar>
          {isUser ? (
            <>
              <AvatarImage
                src="/avatars/user.png"
                alt="Usuário"
              />
              <AvatarFallback>EU</AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage
                src="/avatars/ai.png"
                alt="Assistente"
              />
              <AvatarFallback>IA</AvatarFallback>
            </>
          )}
        </Avatar>
      </MessageAvatar>

      <MessageContent>
        <Bubble variant={isUser ? "default" : "muted"}>
          <BubbleContent>
            {content}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
