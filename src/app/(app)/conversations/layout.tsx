import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export default async function ConversationsLayout({ children }: LayoutProps<"/">) {
    const user = await getCurrentUser();
  
    if (!user) {
        redirect("/login");
    }
  return (
    <>
      <div>{children}</div>
    </>
  );
}
