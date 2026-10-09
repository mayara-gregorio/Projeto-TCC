import { Chat } from "@/components/chat/chat";

export default async function ConversationChatPage({
  params,
}: {
  params: Promise<{ id: string; conversationId: string }>;
}) {
  const { id, conversationId } = await params;

  return (
    <Chat
      key={conversationId}
      subjectId={id}
      initialConversationId={conversationId}
    />
  );
}
