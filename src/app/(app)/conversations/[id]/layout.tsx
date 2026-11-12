import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/sidebar/sidebar-chat/chat-sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function ConversationsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id: subjectId } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

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
    <>
      <SidebarProvider>
        <main className="min-w-0 flex-1 ">
          <header className="flex h-12 items-center justify-end">
            <SidebarTrigger iconOpen={<ChevronLeft />} iconClosed={<ChevronRight />} />
          </header>
          <div className="w-full">{children}</div>
        </main>
        <ChatSidebar subjectId={subjectId} conversations={conversations ?? []} />
      </SidebarProvider>
    </>
  );
}
