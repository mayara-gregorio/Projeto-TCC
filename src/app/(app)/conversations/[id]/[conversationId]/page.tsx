// app/subject/[id]/chat/[conversationId]/page.tsx
// Abre uma conversa antiga, escolhida no histórico.
import { Chat } from "@/components/chat/chat";

export default async function OldChatPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>;
}) {
  const { id, conversationId } = await params;

  // key faz o chat "zerar" ao trocar de conversa
  return (
    <Chat
      key={conversationId}
      subjectId={id}
      initialConversationId={conversationId}
    />
  );
}
