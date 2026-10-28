import { Suspense } from "react";
import { VerifyEmailView } from "@/components/verify-email-view";
import { AuthFormSkeleton } from "@/components/loading-skeletons";

// The content depends on the client session check in the auth layout.
export const instant = false;

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<AuthFormSkeleton />}>
      <VerifyEmailView />
    </Suspense>
  );
}
