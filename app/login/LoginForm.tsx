"use client";

import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error || !res?.ok) {
      setError("بيانات الدخول غير صحيحة.");
      return;
    }
    const callback = params.get("callbackUrl") ?? "/calculator";
    router.push(callback);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card p-8">
        <div className="text-center mb-8">
          <div className="text-sm text-brand-blue font-bold tracking-wide">
            نهر AI
          </div>
          <h1 className="mt-2 text-2xl font-bold text-navy">Hamzah.sa</h1>
          <p className="mt-1 text-sm text-navy-700/70">
            حاسبة الأهلية التمويلية — نسخة تجريبية
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-navy-900/10 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue/30"
              dir="ltr"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-navy-900/10 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-blue/30"
              dir="ltr"
            />
          </div>
          {error ? (
            <div className="text-sm text-red-600 fade-in">{error}</div>
          ) : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-navy text-white py-2.5 font-semibold hover:bg-navy-800 transition disabled:opacity-60"
          >
            {loading ? "جارٍ الدخول..." : "دخول"}
          </button>
        </form>
      </div>
    </main>
  );
}
