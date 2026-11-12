// app/subject/[id]/chat/page.tsx
// Sempre abre uma conversa nova da matéria.
import { Chat } from "@/components/chat/chat";

export default async function NewChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <Chat key="nova" subjectId={id} />;
}
