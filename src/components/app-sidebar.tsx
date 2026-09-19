import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {AppDropdownMenu} from "@/components/dropdown-menu"

export function AppSidebar({titleDropdown}: {titleDropdown: React.ReactNode}) {
  return (
    <Sidebar className="pb-6">
      <SidebarHeader style={{}}>LearnSync</SidebarHeader>
      <SidebarContent>
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <AppDropdownMenu title={titleDropdown} />
      </SidebarFooter>
    </Sidebar>
  )
}