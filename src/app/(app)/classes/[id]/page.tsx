import { CreateClassForm } from "@/components/create-class-form";
import { getCurrentUser } from "@/lib/get-user";
import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{id: string}>
}

export default async function getClassPage({params}: PageProps) {
  const user = await getCurrentUser();

  const {id} = await params

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-[70vh] w-full items-center justify-center p-4">
      <h1>{id}</h1>
    </div>
  );
}