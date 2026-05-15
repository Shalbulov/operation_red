"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  ShieldCheck,
  KeyRound,
  UserPlus,
  LogIn,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils/cn";

type Tab = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const [tab, setTab] = useState<Tab>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [signupSent, setSignupSent] = useState(false);
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

  const validateEmail = (s: string) => s.includes("@") && s.length >= 5;

  // ── Sign in (password) ────────────────────────────────────────
  const signInPassword = async () => {
    if (!validateEmail(email)) return toast.error("Невалидный email");
    if (!password) return toast.error("Введи пароль");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("С возвращением, агент");
    router.push("/play");
    router.refresh();
  };

  // ── Sign up (password) ────────────────────────────────────────
  const signUpPassword = async () => {
    if (!validateEmail(email)) return toast.error("Невалидный email");
    if (password.length < 6) {
      return toast.error("Пароль минимум 6 символов");
    }
    if (password !== passwordConfirm) {
      return toast.error("Пароли не совпадают");
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    // If email confirmation is OFF in Supabase, session is created instantly.
    if (data.session) {
      toast.success("Регистрация успешна");
      router.push("/play");
      router.refresh();
    } else {
      setSignupSent(true);
      toast.success("Подтверди email чтобы войти");
    }
  };

  // ── Magic link (passwordless) ─────────────────────────────────
  const sendMagicLink = async () => {
    if (!validateEmail(email)) return toast.error("Невалидный email");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Magic link отправлен на email");
  };

  // ── Password reset request ────────────────────────────────────
  const requestReset = async () => {
    if (!validateEmail(email)) return toast.error("Невалидный email");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    setForgotSent(true);
    toast.success("Ссылка для сброса пароля отправлена");
  };

  // ── Google OAuth ──────────────────────────────────────────────
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
    <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md frame-elevated">
        <div className="border-b border-steel-700 p-6 flex items-center gap-3">
          <span className="block w-2 h-2 bg-red-alert animate-pulse" />
          <div>
            <span className="tag tag-red">ВХОД В ШТАБ</span>
            <h1 className="display text-2xl mt-2">
              {tab === "signin"
                ? "АУТЕНТИФИКАЦИЯ"
                : tab === "signup"
                  ? "РЕГИСТРАЦИЯ"
                  : "СБРОС ПАРОЛЯ"}
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-px bg-steel-700">
          {(
            [
              { id: "signin" as const, label: "Войти", icon: LogIn },
              { id: "signup" as const, label: "Регистрация", icon: UserPlus },
              { id: "forgot" as const, label: "Сброс", icon: KeyRound },
            ]
          ).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setForgotSent(false);
                  setSignupSent(false);
                }}
                className={cn(
                  "mono text-[10px] sm:text-xs font-bold uppercase tracking-widest px-2 sm:px-3 py-3 transition-colors flex-1 flex items-center justify-center gap-1.5",
                  tab === t.id
                    ? "bg-red-alert text-void"
                    : "bg-panel text-bone-dim hover:bg-elevated hover:text-bone",
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden xs:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-6 space-y-4">
          {/* Forgot — sent state */}
          {tab === "forgot" && forgotSent ? (
            <div className="text-center py-6">
              <Mail className="w-10 h-10 text-red-alert mx-auto mb-3" />
              <h2 className="display text-xl mb-2">ПРОВЕРЬ ПОЧТУ</h2>
              <p className="text-bone-dim text-sm">
                Письмо со ссылкой для сброса отправлено на{" "}
                <span className="text-bone">{email}</span>
              </p>
            </div>
          ) : tab === "signup" && signupSent ? (
            <div className="text-center py-6">
              <Mail className="w-10 h-10 text-red-alert mx-auto mb-3" />
              <h2 className="display text-xl mb-2">ПОДТВЕРДИ EMAIL</h2>
              <p className="text-bone-dim text-sm">
                Письмо отправлено на <span className="text-bone">{email}</span>.
                Перейди по ссылке чтобы активировать аккаунт.
              </p>
            </div>
          ) : (
            <>
              {/* Google OAuth */}
              {tab !== "forgot" && (
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
                </>
              )}

              {/* Email field */}
              <div>
                <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="agent@ops-red.com"
                  className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                />
              </div>

              {/* Password fields */}
              {(tab === "signin" || tab === "signup") && (
                <div>
                  <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                    Пароль
                  </label>
                  <input
                    type="password"
                    autoComplete={
                      tab === "signin" ? "current-password" : "new-password"
                    }
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                  />
                </div>
              )}

              {tab === "signup" && (
                <div>
                  <label className="mono text-[10px] text-steel-400 uppercase tracking-widest block mb-1">
                    Повтори пароль
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-3 bg-sunken border border-steel-700 text-bone mono text-sm placeholder:text-steel-500 focus:outline-none focus:border-red-alert"
                  />
                </div>
              )}

              {/* Primary action */}
              <button
                onClick={
                  tab === "signin"
                    ? signInPassword
                    : tab === "signup"
                      ? signUpPassword
                      : requestReset
                }
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : tab === "signin" ? (
                  <Lock className="w-4 h-4" />
                ) : tab === "signup" ? (
                  <UserPlus className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                {tab === "signin"
                  ? "Войти"
                  : tab === "signup"
                    ? "Создать аккаунт"
                    : "Отправить ссылку для сброса"}
              </button>

              {/* Forgot link under sign-in */}
              {tab === "signin" && (
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setTab("forgot")}
                    className="mono text-[10px] text-steel-400 uppercase tracking-widest hover:text-red-alert"
                  >
                    Забыл пароль?
                  </button>
                  <button
                    onClick={sendMagicLink}
                    disabled={loading}
                    className="mono text-[10px] text-steel-400 uppercase tracking-widest hover:text-red-alert flex items-center gap-1"
                  >
                    <Mail className="w-3 h-3" />
                    Magic link
                  </button>
                </div>
              )}
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
