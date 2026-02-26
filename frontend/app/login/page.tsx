"use client";

import { FormEvent, Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const emailValidationError =
    emailTouched && email && !emailPattern.test(email)
      ? "Enter a valid email address."
      : null;
  const passwordValidationError =
    passwordTouched && !password ? "Password is required." : null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);
    setError(null);
    setSuccess(null);

    if (!emailPattern.test(email)) {
      setError("Enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    setIsLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (signInError) {
      setError(signInError.message);
      return;
    }

    setSuccess("Logged in successfully.");
    const redirectTo = searchParams.get("redirectTo");
    const safeRedirect =
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/dashboard";
    router.push(safeRedirect);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Login</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Sign in with your email and password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              onBlur={() => setEmailTouched(true)}
              required
              autoComplete="email"
              aria-invalid={Boolean(emailValidationError)}
              aria-describedby={emailValidationError ? "login-email-error" : undefined}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              placeholder="you@example.com"
            />
            {emailValidationError ? (
              <p id="login-email-error" className="mt-1 text-sm text-red-600" aria-live="polite">
                {emailValidationError}
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              onBlur={() => setPasswordTouched(true)}
              required
              autoComplete="current-password"
              aria-invalid={Boolean(passwordValidationError)}
              aria-describedby={passwordValidationError ? "login-password-error" : undefined}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              placeholder="Enter your password"
            />
            {passwordValidationError ? (
              <p
                id="login-password-error"
                className="mt-1 text-sm text-red-600"
                aria-live="polite"
              >
                {passwordValidationError}
              </p>
            ) : null}
          </div>

          {error ? (
            <p className="text-sm text-red-600" role="alert" aria-live="polite">
              {error}
            </p>
          ) : null}

          {success ? (
            <p className="text-sm text-green-600" aria-live="polite">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-zinc-900 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-600">Loading login...</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
