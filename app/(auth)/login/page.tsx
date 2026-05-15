"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const router = useRouter();

  const supabase = (() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  })();

  if (!supabase) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="frame-elevated max-w-md p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-red-alert mx-auto mb-4" />
          <h1 className="display text-2xl mb-2">SUPABASE НЕ НАСТРОЕН</h1>
          <p className="text-bone-dim text-sm">
            Заполни <code className="mono text-red-alert">.env.local</code> по{" "}
            <code className="mono text-red-alert">.env.local.example</code>.
          </p>
        </div>
      </main>
    );
  }

  const sendMagicLink = async () => {
    if (!email || !email.includes("@")) {
      toast.error("Введи валидный email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
      setSent(true);
      toast.success("Ссылка отправлена на email");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setLoading(false);
    }
  };

  const signInGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md frame-elevated">
        <div className="border-b border-steel-700 p-6 flex items-center gap-3">
          <span className="block w-2 h-2 bg-red-alert animate-pulse" />
          <div>
            <span className="tag tag-red">ВХОД В ШТАБ</span>
            <h1 className="display text-2xl mt-2">АУТЕНТИФИКАЦИЯ</h1>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {sent ? (
            <div className="text-center py-6">
              <Mail className="w-10 h-10 text-red-alert mx-auto mb-3" />
              <h2 className="display text-xl mb-2">ПРОВЕРЬ ПОЧТУ</h2>
              <p className="text-bone-dim text-sm">
                Мы отправили magic link на {email}
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={signInGoogle}
                disabled={loading}
                className="btn-ghost w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4"
                    fill="currentColor"
                  >
                    <path d="M21.35 11.1H12v3.2h5.35c-.23 1.45-1.66 4.27-5.35 4.27-3.22 0-5.85-2.67-5.85-5.95s2.63-5.95 5.85-5.95c1.83 0 3.06.78 3.76 1.45l2.56-2.46C16.92 3.93 14.69 3 12 3 6.92 3 2.82 7.04 2.82 12s4.1 9 9.18 9c5.3 0 8.82-3.72 8.82-8.96 0-.6-.06-1.05-.13-1.5Z" />
                  </svg>
                )}
                Войти через Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <span className="h-px flex-1 bg-steel-700" />
                <span className="mono text-[10px] text-steel-500 uppercase tracking-widest">
                  ИЛИ
                </span>
                <span className="h-px flex-1 bg-steel-700" />
              </div>

              <div className="space-y-2">
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@ops-red.com"
                  className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                />
              </div>
              <button
                onClick={sendMagicLink}
                disabled={loading || !email}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Отправить magic link
              </button>
            </>
          )}
        </div>

        <div className="border-t border-steel-700 p-4 text-center">
          <Link
            href="/"
            className="mono text-[10px] text-steel-500 uppercase tracking-widest hover:text-bone"
          >
            ← На главную
          </Link>
        </div>
      </div>
    </main>
  );
}
