import { Button } from "@/components/ui/button";
import Link from "next/link";
export function CreateSubjectButton() {
  return (
    <Button variant={"default"}>
      <Link href="/subjects/create">
        Criar Disciplina
      </Link>
    </Button>
  );
}