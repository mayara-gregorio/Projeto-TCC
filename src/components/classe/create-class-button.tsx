import { Button } from "@/components/ui/button";
import Link from "next/link";
export function CreateClassButton() {
  return (
    <Button variant={"default"}>
      <Link href="/classes/create">
        Criar Turma
      </Link>
    </Button>
  );
}