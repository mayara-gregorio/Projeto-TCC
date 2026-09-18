"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

import { Input } from "@/components/ui/input";

const registerSchema = z.object({
  name: z
    .string()
    .min(2, "O nome deve ter pelo menos 2 caracteres."),
  email: z
    .string()
    .email("Digite um e-mail válido."),

  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres."),

  confirmPassword: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres.")
});

type RegisterFormData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const supabase = createClient();

  const [error, setError] = useState<string | null>(null);

  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  if (form.watch("password") !== form.watch("confirmPassword")) {
    form.setError("confirmPassword", {
      type: "manual",
      message: "As senhas não coincidem.",
    });
  }

  async function onSubmit(data: RegisterFormData) {
    setError(null);

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
        }
      }
    });

    if (error) {
      setError("Erro ao criar a conta. Tente novamente.");
      return;
    }

    router.push("/student");
    router.refresh();
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>

        <CardDescription>
          Crie uma nova conta.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>

            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">
                    Nome
                  </FieldLabel>

                  <Input
                    {...field}
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    E-mail
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="email">
                    E-mail
                  </FieldLabel>

                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    autoComplete="email"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="password">
                    Senha
                  </FieldLabel>

                  <Input
                    {...field}
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="confirmPassword"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="confirmPassword">
                    Confirmar Senha
                  </FieldLabel>

                  <Input
                    {...field}
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
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
                ? "Criando conta..."
                : "Criar conta"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
                Já possui uma conta?{" "}
                <a
                    href="/login"
                    className="font-medium text-primary hover:underline"
                >
                    Fazer login
                </a>
            </p>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}