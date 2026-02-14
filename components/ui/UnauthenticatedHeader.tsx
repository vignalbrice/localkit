import Link from "next/link";

interface UnauthenticatedHeaderProps {
  backText: string;
}

export default function UnauthenticatedHeader({
  backText,
}: UnauthenticatedHeaderProps) {
  return (
    <header className="w-full bg-white border-b border-gray-200 px-6 py-4">
      <Link
        href="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        {backText}
      </Link>
    </header>
  );
}
