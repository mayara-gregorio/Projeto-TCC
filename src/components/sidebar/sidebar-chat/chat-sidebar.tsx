import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SidebarNav } from "./chat-sidebar-nav"

export function ChatSidebar() {
  return (
    <Sidebar className="pb-6" side="right">
      <SidebarHeader style={{}}>Conversas</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarNav/>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}