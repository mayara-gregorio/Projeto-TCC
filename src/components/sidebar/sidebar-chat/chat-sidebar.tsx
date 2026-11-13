import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { ChatSidebarNav } from "./chat-sidebar-nav"
import type { Conversation } from "@/types"

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
          <ChatSidebarNav subjectId={subjectId} conversations={conversations ?? []} />
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
