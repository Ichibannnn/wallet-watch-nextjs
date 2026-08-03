"use client";

import Link from "next/link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { SignUpInput, signUpSchema } from "@/lib/validations/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FieldGroup } from "@/components/ui/field";

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

  async function onSubmit(data: SignUpInput) {
    console.log("FormData: ", data);

    // setIsLoading(true);
    // setServerError(null);

    // try {
    //   // Simulate API call
    //   await new Promise((resolve) => setTimeout(resolve, 1000));
    //   router.push("/dashboard");
    // } catch (error) {
    //   setServerError("Failed to create account. Please try again.");
    // } finally {
    //   setIsLoading(false);
    // }
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
            <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
            <p className="mt-1 text-sm text-muted-foreground">Start tracking your money with Wallet Watch</p>
          </header>

          {/* Form Content */}

          <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-2">
              <Label htmlFor="email">Name</Label>
              <FieldGroup>
                <Controller
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="name"
                      type="text"
                      placeholder="Juan Dela Cruz"
                      autoComplete="name"
                    />
                  )}
                />
              </FieldGroup>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full">
              Create account
            </Button>
          </form>

          {/* Form Footer */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
