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
import { createClass } from "@/actions/actions";

const createClassSchema = z.object({
  className: z
    .string()
    .min(2, "O nome da turma deve ter pelo menos 2 caracteres."),

  classCode: z
    .string()
    .min(6, "O código da turma deve ter pelo menos 6 caracteres."),
});

type CreateClassFormData = z.infer<typeof createClassSchema>;

type CreateClassFormProps = {
  userId: string;
};

export function CreateClassForm({ userId }: CreateClassFormProps) {
  const router = useRouter();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateClassFormData>({
    resolver: zodResolver(createClassSchema),

    defaultValues: {
      className: "",
      classCode: "",
    },
  });

  async function onSubmit(data: CreateClassFormData) {
    setError(null);

    const response = await createClass(
      data.className,
      data.classCode
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
          Crie uma nova turma.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>

            <Controller
              name="className"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="className">
                    Nome da Turma
                  </FieldLabel>

                  <Input
                    {...field}
                    id="className"
                    type="text"
                    placeholder="Nome da Turma"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="classCode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="classCode">
                    Código da Turma
                  </FieldLabel>

                  <Input
                    {...field}
                    id="classCode"
                    type="text"
                    placeholder="Código da Turma"
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
                : "Criar Turma"}
            </Button>

          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}