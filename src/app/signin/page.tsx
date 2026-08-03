import Link from "next/link";
import { AuthBrandPanel } from "@/components/auth/auth-brand-panel";
import { ThemeToggle } from "@/components/theme-toggle";
import { SignInForm } from "@/components/auth/signin-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const { registered } = await searchParams;

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
          <header className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Sign in to your Wallet Watch account
            </p>
          </header>

          {registered && (
            <div className="mb-4 rounded-lg border border-emerald-600/30 bg-emerald-600/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">
              Account created successfully. Please sign in.
            </div>
          )}

          <SignInForm />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
