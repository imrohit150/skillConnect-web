# SkillConnect Web

Next.js frontend for SkillConnect, a developer networking app. It talks to the `skillConnect-backend` API.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs on http://localhost:3000. Start the backend first and set `CLIENT_URL=http://localhost:3000` in its `.env`.

Set `NEXT_PUBLIC_SOCKET_URL` to the backend origin (for example, `http://localhost:5000`), without `/api/v1`. Opening a conversation starts a cookie-authenticated Socket.IO connection; “Chat connected” means the backend confirmed access to that conversation's room. Leaving the conversation disconnects it. Saved messages load separately through the REST API.

In a connected chat, use Enter to send and Shift+Enter for a new line (up to 2000 characters). Messages and inbox previews update live. Failed sends preserve the draft; if delivery cannot be confirmed, check the conversation before trying again because the backend may already have saved the message.

See [BUILD-LOG.md](./BUILD-LOG.md) for progress.

## Demo membership

Open Membership in the desktop sidebar, or use the membership card on Profile on mobile. Plus is ₹99/month in Razorpay **test mode only**; no real money is charged. Pro video calling is coming soon and cannot be purchased.

The backend's `RAZORPAY_PLAN_ID` must reference a test plan for **9900 paise, INR, monthly, interval 1**. The public test key and subscription ID come from the backend; no payment secret belongs in frontend environment variables. Badge activation requires backend payment verification.

Use Razorpay's subscription test card `4718 6091 0820 4366`, any future expiry date and a random three-digit CVV. See the [official test instructions](https://razorpay.com/docs/payments/subscriptions/test/). Do not enter a real card for this demo.
