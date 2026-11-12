"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, CirclePlus } from "lucide-react";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

type Conversation = { id: string; title: string | null; created_at: string };

export function SidebarNav({
  subjectId,
  conversations,
}: {
  subjectId: string;
  conversations: Conversation[];
}) {
  const pathname = usePathname();
  const newChatHref = `/conversations/${subjectId}/chat`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={pathname === newChatHref}
          render={<Link href={newChatHref} />}
        >
          <CirclePlus />
          <span>Nova Conversa</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {conversations.map((conversation) => {
        const href = `${newChatHref}/${conversation.id}`;
        return (
          <SidebarMenuItem key={conversation.id}>
            <SidebarMenuButton
              isActive={pathname === href}
              render={<Link href={href} />}
            >
              <MessageCircle />
              <span className="truncate">
                {conversation.title ?? "Nova conversa"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}