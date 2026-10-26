import { API_ROUTES } from "@/constants/routes";
import { api } from "@/lib/api";
import type { CheckoutSubscription, Membership, PaymentConfirmation } from "@/types";

export function getMembership() {
  return api<Membership>(API_ROUTES.payments.me);
}

export function createSubscription() {
  return api<CheckoutSubscription>(API_ROUTES.payments.subscription, { method: "POST" });
}

export function verifyPayment(payment: PaymentConfirmation) {
  return api<{ premiumUntil: string }>(API_ROUTES.payments.verify, {
    method: "POST",
    body: JSON.stringify(payment),
  });
}
