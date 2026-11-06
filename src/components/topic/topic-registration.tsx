"use client";

import { useState } from "react";
import { CreateTopicForm } from "@/components/topic/topic-forms";
import { ImportTopicsForm } from "@/components/topic/import-topics-form";
import { Button } from "@/components/ui/button";

export function TopicRegistration({ subjectId }: { subjectId: string }) {
  const [mode, setMode] = useState<"import" | "manual">("import");
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Forma de cadastrar tópicos">
        <Button type="button" size="sm" variant={mode === "import" ? "default" : "outline"}
          aria-pressed={mode === "import"} onClick={() => setMode("import")}>
          Importar do plano
        </Button>
        <Button type="button" size="sm" variant={mode === "manual" ? "default" : "outline"}
          aria-pressed={mode === "manual"} onClick={() => setMode("manual")}>
          Cadastrar manualmente
        </Button>
      </div>
      {mode === "import" ? <ImportTopicsForm subjectId={subjectId} /> : <CreateTopicForm subjectId={subjectId} />}
    </div>
  );
}
