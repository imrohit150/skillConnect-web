# SkillConnect Web

Next.js frontend for SkillConnect, a developer networking app. It talks to the `skillConnect-backend` API.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

The app runs on http://localhost:3000. Start the backend first and set `CLIENT_URL=http://localhost:3000` in its `.env`.

See [BUILD-LOG.md](./BUILD-LOG.md) for progress.

## Demo membership

Open Membership in the desktop sidebar, or use the membership card on Profile on mobile. Plus is ₹99/month in Razorpay **test mode only**; no real money is charged. Pro video calling is coming soon and cannot be purchased.

The backend's `RAZORPAY_PLAN_ID` must reference a test plan for **9900 paise, INR, monthly, interval 1**. The public test key and subscription ID come from the backend; no payment secret belongs in frontend environment variables. Badge activation requires backend payment verification.

Use Razorpay's subscription test card `4718 6091 0820 4366`, any future expiry date and a random three-digit CVV. See the [official test instructions](https://razorpay.com/docs/payments/subscriptions/test/). Do not enter a real card for this demo.
