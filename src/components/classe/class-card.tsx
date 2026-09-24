import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ClassCardProps = {
  id: string;
  name: string;
  role: "teacher" | "student";
};

export function ClassCard({
  id,
  name,
  role,
}: ClassCardProps) {
  return (
    <Card className="flex-row justify-between p-4">
      <div>
        <h2 className="text-lg font-semibold">
          {name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={role === "teacher" ? "teacher" : "default"}>
          {role === "teacher" ? "Professor" : "Aluno"}
        </Badge>

        <Link href={`/classes/${id}`}>
          <ChevronRight />
        </Link>
      </div>
    </Card>
  );
}