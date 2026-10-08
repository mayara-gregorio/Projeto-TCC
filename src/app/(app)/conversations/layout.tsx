import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";
import { ChatSidebar } from "@/components/sidebar/sidebar-chat/chat-sidebar";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default async function ConversationsLayout({ children }: LayoutProps<"/">) {
    const user = await getCurrentUser();
  
    if (!user) {
        redirect("/login");
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
        <ChatSidebar/>
      </SidebarProvider>
    </>
  );
}
