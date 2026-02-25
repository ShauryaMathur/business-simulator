import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-[calc(100vh-73px)] items-center justify-center bg-zinc-50 px-6">
      <section className="w-full max-w-3xl rounded-2xl border border-zinc-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-zinc-500">
          Shaurya Mathur
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
          Business Simulator
        </h1>
        <p className="mt-4 text-lg leading-8 text-zinc-700">
          This is a take-home assignment submission by Shaurya Mathur for the
          Full-Stack Engineer role at Convergent. This is a single-player,
          turn-based startup simulation inspired by the MIT CleanStart game{" "}
          <Link
            href="https://forio.com/simulate/mit/cleanstart/simulation/login.html"
            className="text-blue-600 underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Link
          </Link>
          .
        </p>
        <p className="mt-4 text-lg text-zinc-700">
          <Link href="/login" className="text-blue-600 underline">
            Click here to begin
          </Link>
          .
        </p>
        
      </section>
    </main>
  );
}
