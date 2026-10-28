import { Suspense } from "react";
import { VerifyEmailView } from "@/components/verify-email-view";

// The content depends on the client session check in the auth layout.
export const instant = false;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p role="status" className="py-16 text-center text-sm text-muted-foreground">Loading your signup...</p>}>
      <VerifyEmailView />
    </Suspense>
  );
}
