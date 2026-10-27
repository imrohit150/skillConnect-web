import type { Metadata } from "next";
import { ResetPasswordView } from "@/components/reset-password-view";

export const metadata: Metadata = { title: "Reset password | SkillConnect", referrer: "no-referrer", robots: { index: false, follow: false } };
export const instant = false;

export default function ResetPasswordPage() {
  return <ResetPasswordView />;
}
