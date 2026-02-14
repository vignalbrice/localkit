"use client";

import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { signupUser } from "./actions";
import { useRouter } from "next/navigation";
import UnauthenticatedHeader from "@/components/ui/UnauthenticatedHeader";

export default function Signup() {
  const t = useTranslations("signup");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await signupUser(formData);
      if (!res.ok) {
        toast.error(res.message ?? "Signup failed");
        setIsLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch (e) {
      toast.error(
        "Signup failed",
        e instanceof Error ? { description: e.message } : undefined,
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <UnauthenticatedHeader backText={t("backToHome")} />
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t("title")}</h1>
            <p className="text-gray-600 mt-2">{t("subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("name")}
              </label>
              <input
                name="name"
                type="text"
                disabled={isLoading}
                placeholder={t("namePlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("email")}
              </label>
              <input
                name="email"
                type="email"
                required
                disabled={isLoading}
                placeholder={t("emailPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("password")}
              </label>
              <input
                name="password"
                type="password"
                required
                disabled={isLoading}
                placeholder={t("passwordPlaceholder")}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "..." : t("createAccount")}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            {t("alreadyHaveAccount")}{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700">
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
