// /conversations/[id]/chat
// Divide a tela: chat no meio e histórico de conversas da matéria à direita.
import { ConversationHistory } from "@/components/chat/conversation-history";

export default async function SubjectChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full">
      <div className="flex-1">{children}</div>
      <ConversationHistory subjectId={id} />
    </div>
  );
}
