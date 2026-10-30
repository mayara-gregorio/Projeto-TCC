
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type UploadFormProps = {
  subjectId: string;
  topicId: string;
};

// Formulário para criar tópicos
export function CreateTopicForm({ subjectId }: {subjectId: string}) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
    console.log("terceira etapa para identificar o id d DISCIPLINA - topic-forms", subjectId)
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");
    setError("");

    const formData = new FormData();
    formData.append("action", "create-topic");
    formData.append("title", title);
    formData.append("description", description);

    try {
      const response = await fetch(
        `/api/subjects/${subjectId}/topics`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Erro ao criar tópico.");
        return;
      }

      setTitle("");
      setMessage("Tópico criado com sucesso!");
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row">
            <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ex.: Classes e Objetos"
            maxLength={120}
            required
            disabled={loading}
            className="flex-1"
            />
            <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Ex.: Esse tópico especifica as características de Classes e Objetos"
            maxLength={500}
            required
            disabled={loading}
            className="flex-1"
            />
        <Button type="submit" disabled={loading}>
          <Plus className="size-4" />
          {loading ? "Criando..." : "Criar tópico"}
        </Button>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}

export function UploadTopicPdfForm({
  subjectId,
  topicId,
}: UploadFormProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [inputKey, setInputKey] = useState(0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);

    formData.append("action", "upload-pdf");
    formData.append("topic_id", topicId);

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `/api/subjects/${subjectId}/topics`,
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (!response.ok) {
        setError(result.error ?? "Erro ao enviar PDF.");
        return;
      }

      setMessage("PDF enviado com sucesso!");
      setInputKey((previous) => previous + 1);
      router.refresh();
    } catch {
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Input
        key={inputKey}
        type="file"
        name="file"
        accept=".pdf,application/pdf"
        required
        disabled={loading}
      />

      <Button
        type="submit"
        variant="outline"
        disabled={loading}
      >
        <Upload className="size-4" />
        {loading ? "Enviando..." : "Adicionar PDF"}
      </Button>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="text-sm text-muted-foreground">
          {message}
        </p>
      )}
    </form>
  );
}
