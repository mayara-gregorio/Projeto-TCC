import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: LayoutProps<"/">) {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/login");
    }
  return (
      <SidebarProvider>
      <AppSidebar />
      <main className="p-4">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
