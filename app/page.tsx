import type { Metadata } from "next";
import LandingClient from "./LandingClient";

export const metadata: Metadata = {
  title: "LocalKit - Translation Management",
  description:
    "Manage your i18next translations with ease. Import, edit, and sync your translations with GitHub seamlessly.",
};

export default function LandingPage() {
  return <LandingClient />;
}
