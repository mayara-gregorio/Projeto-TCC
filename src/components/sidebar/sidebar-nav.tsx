"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Users,
  Settings,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "../ui/sidebar";

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname === "/dashboard"}
          render={<Link href="/dashboard" />}
        >
          <Home />
          <span>Início</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname.startsWith("/conversations")}
          render={<Link href="/conversations" />}
        >
          <MessageCircle />
          <span>Conversas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname.startsWith("/classes")}
          render={<Link href="/classes" />}
        >
          <Users />
          <span>Turmas</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname.startsWith("/settings")}
          render={<Link href="/settings" />}
        >
          <Settings />
          <span>Configurações</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}