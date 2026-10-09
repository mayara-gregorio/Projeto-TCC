// src/components/chat/conversation-history.tsx
// Lista as conversas do usuário NESTA matéria.
import Link from "next/link";
import { MessageCircle, PlusCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function ConversationHistory({ subjectId }: { subjectId: string }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, title, created_at")
    .eq("subject_id", subjectId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar conversas:", error);
  }

  return (
    <aside className="flex w-64 flex-col gap-2 border-l p-3">
      <h2 className="text-base">Conversas</h2>

      <Link
        href={`/conversations/${subjectId}/chat`}
        className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
      >
        <PlusCircle className="size-4" />
        Nova Conversa
      </Link>

      {(conversations ?? []).map((conversation) => (
        <Link
          key={conversation.id}
          href={`/conversations/${subjectId}/chat/${conversation.id}`}
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
        >
          <MessageCircle className="size-4 shrink-0" />
          <span className="truncate">{conversation.title ?? "Nova conversa"}</span>
        </Link>
      ))}
    </aside>
  );
}
