"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);

    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password. Use the ADMIN_PASSWORD set in Vercel.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-md"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          VonWillingh Barbershop
        </p>
        <h1 className="mt-2 text-2xl font-bold text-zinc-900">Admin Login</h1>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Enter the admin password here to manage the site. This is the{" "}
          <strong className="font-semibold text-zinc-800">ADMIN_PASSWORD</strong>{" "}
          you set in Vercel (not your Vercel or Supabase login).
        </p>

        <label className="mt-6 block text-sm">
          <span className="mb-1.5 block font-medium text-zinc-800">
            Admin password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 px-3 py-2.5 text-zinc-900 shadow-sm focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200"
            placeholder="Enter your admin password"
            autoFocus
          />
        </label>

        {error && (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign in to dashboard"}
        </button>
      </form>
    </div>
  );
}
