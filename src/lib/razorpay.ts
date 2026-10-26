import type { CheckoutSubscription, PaymentConfirmation } from "@/types";

type RazorpayOptions = {
  key: string;
  subscription_id: string;
  name: string;
  description: string;
  prefill: { name: string; email: string; contact: string };
  readonly: { contact: boolean };
  theme: { color: string };
  handler: (response: PaymentConfirmation) => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  close: () => void;
  on: (event: "payment.failed", handler: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export class CheckoutCancelled extends Error {
  constructor() {
    super("Demo checkout closed. No money was charged.");
  }
}

export function openDemoCheckout(
  subscription: CheckoutSubscription,
  user: { name: string; email: string },
): Promise<PaymentConfirmation> {
  const Razorpay = window.Razorpay;
  if (!Razorpay) return Promise.reject(new Error("Checkout could not load. Please refresh and try again."));
  if (!subscription.keyId.startsWith("rzp_test_")) {
    return Promise.reject(new Error("Demo checkout requires Razorpay test mode."));
  }

  return new Promise((resolve, reject) => {
    const checkout = new Razorpay({
      key: subscription.keyId,
      subscription_id: subscription.subscriptionId,
      name: "SkillConnect · Demo",
      description: "Plus membership · ₹99/month · Test payment only",
      // Sample contact for the test-only demo; never ask visitors for a personal number.
      prefill: { name: user.name, email: user.email, contact: "+919000090000" },
      readonly: { contact: true },
      theme: { color: "#0891b2" },
      handler: (response) => {
        if (response.razorpay_subscription_id !== subscription.subscriptionId) {
          reject(new Error("Checkout returned a different subscription. Please try again."));
          return;
        }
        resolve(response);
      },
      modal: { ondismiss: () => reject(new CheckoutCancelled()) },
    });
    checkout.on("payment.failed", (response) => {
      reject(new Error(response.error?.description || "The test payment failed. Please try again."));
      checkout.close();
    });
    checkout.open();
  });
}
