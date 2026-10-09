import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type SubjectCardProps = {
  id: string;
  name: string;
  role: "teacher" | "student";
  goToSubject: boolean;
};

export function SubjectCard({
  id,
  name,
  role,
  goToSubject
}: SubjectCardProps) {
  return (
    <Card className="flex-row justify-between p-4 min-w-[50%]">
      <div>
        <h2 className="text-lg font-semibold">
          {name}
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={role === "teacher" ? "teacher" : "default"}>
          {role === "teacher" ? "Professor" : "Aluno"}
        </Badge>
        {goToSubject && (
          <Link href={`/subject/${id}`}>
            <ChevronRight />
          </Link>
        )}
      </div>
    </Card>
  );
}