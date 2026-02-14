"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signIn } from "next-auth/react";
import { loginSchema } from "./login-schema.validation";
import { useTranslations } from "next-intl";
import UnauthenticatedHeader from "@/components/ui/UnauthenticatedHeader";

export default function Login() {
  const router = useRouter();
  const t = useTranslations();
  const tLogin = useTranslations("login");
  const [isLoading, setIsLoading] = useState(false);

  const onHandleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      const errors = validation.error.format();
      toast.error(
        errors.email?._errors[0] ||
          errors.password?._errors[0] ||
          t("errors.loginFailed"),
      );
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(t("errors.invalidCredentials"));
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        toast.success(tLogin("successMessage"));
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error(t("errors.connectionError"));
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UnauthenticatedHeader backText={tLogin("backToHome")} />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {tLogin("title")}
            </h1>
            <p className="text-gray-600 mt-2">
              Accédez à LocalKit avec votre compte
            </p>
          </div>

          <form onSubmit={onHandleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tLogin("email")}
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={isLoading}
                placeholder={tLogin("emailPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tLogin("password")}
              </label>
              <input
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder={tLogin("passwordPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? tLogin("loggingIn") : tLogin("loginButton")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            {tLogin("noAccount")}{" "}
            <Link href="/signup" className="text-blue-600 hover:text-blue-700">
              {tLogin("signUp")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
