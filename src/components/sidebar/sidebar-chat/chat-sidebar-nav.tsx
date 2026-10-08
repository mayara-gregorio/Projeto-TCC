"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageCircle,
  CirclePlus,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, Sidebar } from "../../ui/sidebar";

export function SidebarNav() {
  const pathname = usePathname();
  return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton>
            <CirclePlus />
            <span>Nova Conversa</span>
          </SidebarMenuButton>
        </SidebarMenuItem>

        <SidebarMenuItem>
          <SidebarMenuButton
            isActive={pathname.startsWith("/conversations")}
            render={<Link href="/conversations" />}
          >
            <MessageCircle />
            <span>Dúvida sobre Encapsulamento</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
  );
}