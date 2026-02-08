"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect } from "react";
import {
  Upload,
  Clock,
  Users,
  Edit,
  Sparkles,
  Zap,
  Shield,
  Languages,
} from "lucide-react";

export default function LandingClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("landing");

  useEffect(() => {
    if (session?.user) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
              <Languages className="size-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-xl">LocalKit</h1>
              <p className="text-sm text-slate-600">
                Translation management made simple
              </p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              {t("nav.features")}
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              {t("nav.testimonials")}
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-gray-900 transition"
            >
              {t("nav.pricing")}
            </a>
          </nav>
          <Link
            href="/login"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            {t("nav.getStarted")}
          </Link>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              {t("hero.title")}
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/login"
                className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition shadow-lg font-medium text-center"
              >
                {t("hero.cta")}
              </Link>
              <a
                href="#features"
                className="px-8 py-4 bg-white text-gray-900 text-lg rounded-lg hover:bg-gray-50 transition border-2 border-gray-200 font-medium text-center"
              >
                {t("hero.learnMore")}
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-4/3 bg-linear-to-br from-blue-100 to-purple-100 rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80"
                alt="Team collaboration"
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("features.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("features.subtitle")}
            </p>
          </div>

          {/* Feature 1 - Import/Export */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Import et export ZIP
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Importez facilement vos fichiers de traduction existants au
                format ZIP. Exportez-les tout aussi simplement pour les intégrer
                dans vos projets.
              </p>
              <a
                href="#"
                className="text-blue-600 font-medium hover:text-blue-700 transition"
              >
                En savoir plus →
              </a>
            </div>
            <div className="order-1 lg:order-2">
              <div className="aspect-4/3 bg-linear-to-br from-blue-50 to-purple-50 rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80"
                  alt="File management"
                  width={800}
                  height={600}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 - Edition */}
          <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
            <div>
              <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-xl overflow-hidden shadow-xl">
                <Image
                  src="/images/women-laugh.png"
                  alt="Woman working"
                  width={300}
                  height={300}
                  className="w-full h-full"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-6">
                <Edit className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Édition en tableau
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Visualisez et éditez toutes vos traductions dans une interface
                claire et intuitive. Modifiez plusieurs langues simultanément
                avec notre éditeur en ligne.
              </p>
              <a
                href="#"
                className="text-purple-600 font-medium hover:text-purple-700 transition"
              >
                En savoir plus →
              </a>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-20">
            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.import.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.import.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Edit className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.edit.title")}
              </h4>
              <p className="text-gray-600">{t("features.edit.description")}</p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
                <Upload className="w-6 h-6 text-purple-600 rotate-180" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.export.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.export.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg mb-4">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.validation.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.validation.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-lg mb-4">
                <Zap className="w-6 h-6 text-red-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.github.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.github.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-lg mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.collaboration.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.collaboration.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.autoSync.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.autoSync.description")}
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-gray-900 mb-3">
                {t("features.security.title")}
              </h4>
              <p className="text-gray-600">
                {t("features.security.description")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-gray-600">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="text-yellow-400 mb-4 text-xl">★★★★★</div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{t("testimonials.testimonial1.quote")}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                  SC
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    {t("testimonials.testimonial1.author")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("testimonials.testimonial1.role")}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="text-yellow-400 mb-4 text-xl">★★★★★</div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{t("testimonials.testimonial2.quote")}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                  MJ
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    {t("testimonials.testimonial2.author")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("testimonials.testimonial2.role")}
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
              <div className="text-yellow-400 mb-4 text-xl">★★★★★</div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                &quot;{t("testimonials.testimonial3.quote")}&quot;
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold">
                  EW
                </div>
                <div className="ml-3">
                  <div className="font-semibold text-gray-900">
                    {t("testimonials.testimonial3.author")}
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("testimonials.testimonial3.role")}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              {t("pricing.title")}
            </h2>
            <p className="text-xl text-gray-600">{t("pricing.subtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-300 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("pricing.free.name")}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {t("pricing.free.price")}
                  </span>
                </div>
                <p className="text-gray-600 mt-3">
                  {t("pricing.free.description")}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.free.feature1")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.free.feature2")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.free.feature3")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.free.feature4")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.free.feature5")}
                  </span>
                </li>
              </ul>

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-gray-100 text-gray-900 text-center rounded-lg hover:bg-gray-200 transition font-medium"
              >
                {t("pricing.free.cta")}
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-blue-600 hover:border-blue-700 transition relative shadow-xl">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  {t("pricing.pro.popular")}
                </span>
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("pricing.pro.name")}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {t("pricing.pro.price")}
                  </span>
                  <span className="text-gray-600">
                    {t("pricing.pro.period")}
                  </span>
                </div>
                <p className="text-gray-600 mt-3">
                  {t("pricing.pro.description")}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature1")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature2")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature3")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature4")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature5")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature6")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.pro.feature7")}
                  </span>
                </li>
              </ul>

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition font-medium"
              >
                {t("pricing.pro.cta")}
              </Link>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-purple-300 transition">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {t("pricing.enterprise.name")}
                </h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-gray-900">
                    {t("pricing.enterprise.price")}
                  </span>
                </div>
                <p className="text-gray-600 mt-3">
                  {t("pricing.enterprise.description")}
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature1")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature2")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature3")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature4")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature5")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature6")}
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <svg
                    className="w-6 h-6 text-green-600 shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700">
                    {t("pricing.enterprise.feature7")}
                  </span>
                </li>
              </ul>

              <Link
                href="/login"
                className="block w-full px-6 py-3 bg-purple-600 text-white text-center rounded-lg hover:bg-purple-700 transition font-medium"
              >
                {t("pricing.enterprise.cta")}
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600">
              Tous les plans incluent une période d&apos;essai de 14 jours sans
              engagement.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            {t("cta.title")}
          </h2>
          <p className="text-xl text-gray-600 mb-8">{t("cta.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition shadow-lg font-medium"
            >
              {t("cta.button")}
            </Link>
          </div>
          <p className="mt-4 text-gray-600 text-sm">{t("cta.noCard")}</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 text-center">
            {t("faq.title")}
          </h2>
          <p className="text-xl text-gray-600 mb-12 text-center">
            {t("faq.subtitle")}
          </p>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("faq.q1.question")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("faq.q1.answer")}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("faq.q2.question")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("faq.q2.answer")}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("faq.q3.question")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("faq.q3.answer")}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("faq.q4.question")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("faq.q4.answer")}
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {t("faq.q5.question")}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {t("faq.q5.answer")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="bg-linear-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                  <Languages className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="font-semibold text-xl">LocalKit</h1>
                  <p className="text-sm text-slate-600">
                    Translation management made simple
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                {t("footer.product.title")}
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <a
                    href="#features"
                    className="hover:text-gray-900 transition"
                  >
                    {t("footer.product.features")}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-gray-900 transition">
                    {t("footer.product.pricing")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.product.documentation")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.product.changelog")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                {t("footer.company.title")}
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.company.about")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.company.blog")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.company.careers")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.company.contact")}
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">
                {t("footer.resources.title")}
              </h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.resources.guides")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.resources.apiDocs")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.resources.community")}
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition">
                    {t("footer.resources.support")}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
            <p>{t("footer.copyright")}</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-900 transition">
                {t("footer.legal.privacy")}
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                {t("footer.legal.terms")}
              </a>
              <a href="#" className="hover:text-gray-900 transition">
                {t("footer.legal.security")}
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
