"use client";

import Link from "next/link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { useState } from "react";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

export default function SignUpPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = form.watch("password");
  const confirmPassword = form.watch("confirmPassword");
  const passwordsMatch = password === confirmPassword;

  async function onSubmit(data: SignUpInput) {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const { error } = await response.json();
        setServerError(error ?? "Failed to create account. Please try again.");
        return;
      }

      router.push("/signin?registered=1");
    } catch {
      setServerError("Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <AuthBrandPanel />

      {/* Form panel */}
      <section className="relative flex flex-col bg-background px-6 py-8 sm:px-10">
        {/* Theme toggle — top right corner */}
        <div className="absolute top-6 right-6">
          <ThemeToggle />
        </div>

        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
          {/* Form Header */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Start tracking your money with Wallet Watch
            </p>
          </header>

          {/* Form Content */}

          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-2">
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Fullname</FieldLabel>
                      <Input
                        {...field}
                        placeholder="Juan Dela Cruz"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="grid gap-2">
              <FieldGroup>
                <Controller
                  name="email"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Email</FieldLabel>
                      <Input
                        {...field}
                        placeholder="you@email.com"
                        autoComplete="off"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="grid gap-2">
              <FieldGroup>
                <Controller
                  name="password"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Password</FieldLabel>
                      <PasswordInput
                        {...field}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            <div className="grid gap-2">
              <FieldGroup>
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid && !passwordsMatch}>
                      <FieldLabel>Confirm password</FieldLabel>
                      <PasswordInput
                        {...field}
                        placeholder="••••••••"
                        autoComplete="new-password"
                      />
                      {confirmPassword.length > 0 ? (
                        passwordsMatch ? (
                          <p className="text-sm font-normal text-emerald-600 dark:text-emerald-400">
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-sm font-normal text-destructive">
                            Passwords do not match
                          </p>
                        )
                      ) : (
                        fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )
                      )}
                    </Field>
                  )}
                />
              </FieldGroup>
            </div>

            {serverError && (
              <p
                role="alert"
                className="text-sm font-normal text-destructive"
              >
                {serverError}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={isLoading}
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          {/* Form Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/signin"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
