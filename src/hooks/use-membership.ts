import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { openDemoCheckout } from "@/lib/razorpay";
import * as membershipService from "@/services/membership.services";
import type { PaymentConfirmation } from "@/types";

export const membershipKey = ["membership"] as const;

export function useMembership() {
  return useQuery({ queryKey: membershipKey, queryFn: membershipService.getMembership });
}

export function useDemoCheckout() {
  const queryClient = useQueryClient();
  const [pendingPayment, setPendingPayment] = useState<{ email: string; payment: PaymentConfirmation } | null>(null);
  const mutation = useMutation({
    mutationFn: async (user: { name: string; email: string }) => {
      let payment = pendingPayment?.email === user.email ? pendingPayment.payment : null;
      if (!payment) {
        const subscription = await membershipService.createSubscription();
        payment = await openDemoCheckout(subscription, user);
        // Keep the signed response so a verification failure can be retried without another payment.
        setPendingPayment({ email: user.email, payment });
      }
      const result = await membershipService.verifyPayment(payment);
      setPendingPayment(null);
      return result;
    },
    onSuccess: async () => {
      // Refresh membership and every cached place that displays a user's badge.
      await Promise.all(
        [membershipKey, ["currentUser"], ["profile", "me"], ["users"], ["requests"], ["connections"]]
          .map((queryKey) => queryClient.invalidateQueries({ queryKey })),
      );
    },
  });
  return { ...mutation, awaitingVerification: pendingPayment !== null };
}
