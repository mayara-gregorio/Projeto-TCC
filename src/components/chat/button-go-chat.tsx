import { Button } from "@/components/ui/button";
import Link from "next/link";
export function ButtonGoChat({id}: {id: string}) {
  return (
    <Button variant={"default"}>
      <Link href={`/conversations/${id}/chat`}>
        Conversar com Assistente da Disciplina
      </Link>
    </Button>
  );
}