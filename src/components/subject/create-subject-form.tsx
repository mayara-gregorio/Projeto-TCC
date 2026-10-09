"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";
import { createSubject } from "@/actions/actions";

const createSubjectSchema = z.object({
  subjectName: z
    .string()
    .min(2, "O nome da turma deve ter pelo menos 2 caracteres."),
});

type CreateSubjectFormData = z.infer<typeof createSubjectSchema>;

type CreateSubjectFormProps = {
  userId: string;
};

export function CreateSubjectForm({ userId }: CreateSubjectFormProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateSubjectFormData>({
    resolver: zodResolver(createSubjectSchema),

    defaultValues: {
      subjectName: "",
    },
  });

  async function onSubmit(data: CreateSubjectFormData) {
    setError(null);

    const response = await createSubject(
      data.subjectName,
    );

    if (!response) {
      setError("Erro ao criar turma.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardDescription>
          Crie uma nova Disciplina.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>

            <Controller
              name="subjectName"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="subjectName">
                    Nome da Disciplina
                  </FieldLabel>

                  <Input
                    {...field}
                    id="subjectName"
                    type="text"
                    placeholder="Nome da Disciplina"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting
                ? "Criando..."
                : "Criar Disciplina"}
            </Button>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}