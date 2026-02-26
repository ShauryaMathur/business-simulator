"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const router = useRouter();
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
    passwordTouched && password.length > 0 && password.length < 6
      ? "Password must be at least 6 characters."
      : null;

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

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsLoading(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      setSuccess("Account created and signed in successfully. Redirecting...");
      router.push("/dashboard");
    } else {
      setSuccess(
        "Account created. Check your email for a verification link, then return here and sign in."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-zinc-900">Sign up</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Create a new account with your email and password.
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
              aria-describedby={emailValidationError ? "signup-email-error" : undefined}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              placeholder="you@example.com"
            />
            {emailValidationError ? (
              <p id="signup-email-error" className="mt-1 text-sm text-red-600" aria-live="polite">
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
              minLength={6}
              autoComplete="new-password"
              aria-invalid={Boolean(passwordValidationError)}
              aria-describedby={passwordValidationError ? "signup-password-error" : "signup-password-help"}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-zinc-900 outline-none ring-0 placeholder:text-zinc-400 focus:border-zinc-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              placeholder="Create a password"
            />
            <p id="signup-password-help" className="mt-1 text-xs text-zinc-500">
              Use at least 6 characters.
            </p>
            {passwordValidationError ? (
              <p
                id="signup-password-error"
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
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800" aria-live="polite">
              <p>{success}</p>
              <p className="mt-1">
                You can{" "}
                <Link
                  href="/login"
                  className="font-medium underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-700"
                >
                  go to login
                </Link>{" "}
                after confirming your email.
              </p>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-zinc-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-zinc-900 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
