import { JoinClassForm } from "@/components/classe/join-class-form";
import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

export default async function createClassPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <JoinClassForm userId={user.id} />
    </div>
  );
}