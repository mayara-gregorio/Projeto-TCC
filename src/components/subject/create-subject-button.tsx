import { Button } from "@/components/ui/button";
import Link from "next/link";
export function CreateSubjectButton() {
  return (
    <Button variant={"default"}>
      <Link href="/subject/create">
        Criar Disciplina
      </Link>
    </Button>
  );
}