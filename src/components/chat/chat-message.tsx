"use client"

import ReactMarkdown, { type Components } from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import "katex/dist/katex.min.css"

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

// Visual de cada parte do Markdown (negrito, listas, código, tabelas...)
const markdownComponents: Components = {
  p: ({ children }) => <p className="mb-2 leading-relaxed last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  ul: ({ children }) => <ul className="mb-2 list-disc space-y-1 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="mb-2 list-decimal space-y-1 pl-5">{children}</ol>,
  h1: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-2 mt-3 text-base font-semibold">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 mt-2 font-semibold">{children}</h4>,
  a: ({ children, href }) => (
    <a href={href} target="_blank" rel="noreferrer" className="underline">
      {children}
    </a>
  ),
  // Código em linha (`assim`) ou em bloco (```java ... ```)
  code: ({ className, children }) =>
    /language-/.test(className ?? "") ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    ),
  pre: ({ children }) => (
    <pre className="mb-2 overflow-x-auto rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="mb-2 overflow-x-auto">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border px-2 py-1 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border px-2 py-1">{children}</td>,
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
              <AvatarImage alt="Usuário" />
              <AvatarFallback>EU</AvatarFallback>
            </>
          ) : (
            <>
              <AvatarImage alt="Assistente" />
              <AvatarFallback>IA</AvatarFallback>
            </>
          )}
        </Avatar>
      </MessageAvatar>

      <MessageContent>
        <Bubble variant={isUser ? "default" : "muted"}>
          <BubbleContent>
            {isUser ? (
              // Mensagem do usuário: texto simples, mantendo quebras de linha
              <span className="whitespace-pre-wrap">{content}</span>
            ) : (
              // Resposta da IA: Markdown + fórmulas
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={markdownComponents}
              >
                {content}
              </ReactMarkdown>
            )}
          </BubbleContent>
        </Bubble>
      </MessageContent>
    </Message>
  )
}
