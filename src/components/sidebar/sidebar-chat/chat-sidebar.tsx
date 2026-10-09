import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SidebarNav } from "./chat-sidebar-nav"

type Conversation = {
  id: string;
  title: string | null;
  created_at: string;
};

type ChatSidebarProps = {
  subjectId: string
  conversations: Conversation[];
}

export function ChatSidebar({ subjectId, conversations }: ChatSidebarProps) {
  return (
    <Sidebar side="right" className="hidden border-l md:flex">
      <SidebarHeader>Conversas</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarNav subjectId={subjectId} conversations={conversations ?? []} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
