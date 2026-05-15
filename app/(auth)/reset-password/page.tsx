"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, KeyRound, CheckCircle2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = (() => {
    try {
      return createSupabaseBrowserClient();
    } catch {
      return null;
    }
  })();

  // The reset link from email creates a temporary "recovery" session.
  // We just wait for it to be established before allowing password change.
  useEffect(() => {
    if (!supabase) return;
    const sub = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        setReady(true);
      }
    });
    // Also check if session already exists
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => {
      sub.data.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async () => {
    if (!supabase) return;
    if (password.length < 6) return toast.error("Пароль минимум 6 символов");
    if (password !== confirm) return toast.error("Пароли не совпадают");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message);
      return toast.error(error.message);
    }
    setDone(true);
    toast.success("Пароль обновлён");
    setTimeout(() => router.push("/play"), 1200);
  };

  if (!supabase) {
    return (
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="frame-elevated max-w-md p-8 text-center">
          <ShieldCheck className="w-10 h-10 text-red-alert mx-auto mb-4" />
          <h1 className="display text-2xl mb-2">SUPABASE НЕ НАСТРОЕН</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md frame-elevated">
        <div className="border-b border-steel-700 p-6 flex items-center gap-3">
          <KeyRound className="w-5 h-5 text-red-alert" />
          <div>
            <span className="tag tag-red">СБРОС ПАРОЛЯ</span>
            <h1 className="display text-2xl mt-2">НОВЫЙ ПАРОЛЬ</h1>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <CheckCircle2 className="w-10 h-10 text-red-alert mx-auto mb-3" />
              <h2 className="display text-xl mb-2">ГОТОВО</h2>
              <p className="text-bone-dim text-sm">Перенаправляю в игру...</p>
            </div>
          ) : !ready ? (
            <div className="text-center py-8 flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-red-alert" />
              <p className="text-bone-dim text-xs mono uppercase tracking-widest">
                Проверка ссылки...
              </p>
              {error && (
                <p className="text-red-alert text-xs">{error}</p>
              )}
            </div>
          ) : (
            <>
              <p className="text-bone-dim text-sm">
                Введи новый пароль для входа в аккаунт.
              </p>
              <div>
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                  Новый пароль
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                />
              </div>
              <div>
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                  Повтори пароль
                </label>
                <input
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                />
              </div>
              <button
                onClick={update}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                Обновить пароль
              </button>
            </>
          )}
        </div>

        <div className="border-t border-steel-700 p-4 text-center">
          <Link
            href="/login"
            className="mono text-[10px] text-steel-500 uppercase tracking-widest hover:text-bone"
          >
            ← К входу
          </Link>
        </div>
      </div>
    </main>
  );
}
