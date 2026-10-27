import { VerifyEmailView } from "@/components/verify-email-view";

// The content depends on the client session check in the auth layout.
export const instant = false;

export default function VerifyEmailPage() {
  return <VerifyEmailView />;
}
