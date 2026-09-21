import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  if (!user) {
      redirect("/login");
  }

  return (
    <SidebarProvider>
      <AppSidebar titleDropdown={user.name} />
      <main className="flex-1 p-4">
        <SidebarTrigger />
        <div className="w-full">{children}</div>
      </main>
    </SidebarProvider>
  );
}
