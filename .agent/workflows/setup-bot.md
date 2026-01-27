---
description: Configure the Telegram Bot webhook and verify security tokens.
---

1. **Configure .env.local**
   Verify `TELEGRAM_TOKEN` and `TELEGRAM_WEBHOOK_SECRET` are correctly set.

2. **Expose Localhost (If Testing Locally)**
   Use ngrok to create a secure tunnel for Telegram to reach your local Next.js server.
   // turbo
   `ngrok http 3000`

3. **Update Webhook URL in .env.local**
   Set `TELEGRAM_WEBHOOK_URL` to your ngrok or production URL + `/api/telegram`.

4. **Run Webhook Setup Script**
   Register the URL and secret with the Telegram Bot API.
   // turbo
   `npx tsx scripts/set-webhook.ts`

5. **Verify Webhook Status**
   Send a test message to your bot and check the Convex `messages` table for ingestion.
