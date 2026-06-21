"use client";

import { useState, type FormEvent } from "react";
import { supabase, supabaseEnabled } from "@/lib/supabaseClient";

/**
 * Minimal optional-accounts entry point. Accounts are not required to use
 * FlightLine — this just gives logged-out visitors a way to save favorite
 * airports/flights once Supabase is configured (see .env.example).
 */
export default function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  async function sendMagicLink(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOtp({ email });
    setStatus(error ? "error" : "sent");
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/60 text-slate-600 shadow-glass backdrop-blur-md transition-colors hover:text-brand-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-brand-300"
        aria-label="Account"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-5 w-5">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="glass-panel absolute right-0 top-full z-30 mt-2 w-72 p-4">
          {!supabaseEnabled ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Accounts aren&apos;t set up yet. Add your Supabase project URL and
              anon key to <code className="rounded bg-slate-100 px-1 dark:bg-white/10">.env.local</code> to
              enable sign-in and saved favorites.
            </p>
          ) : status === "sent" ? (
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Check your email for a sign-in link.
            </p>
          ) : (
            <form onSubmit={sendMagicLink} className="space-y-2">
              <label className="text-sm font-medium">Sign in</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-white/80 px-3 py-2 text-sm outline-none transition-colors focus:border-brand-400 dark:border-slate-700 dark:bg-slate-800"
              />
              <button type="submit" className="btn-gradient w-full">
                Send magic link
              </button>
              {status === "error" && (
                <p className="text-xs text-red-500">
                  Something went wrong. Try again.
                </p>
              )}
              <p className="text-xs text-slate-400">
                No password needed — browsing without an account works too.
              </p>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
