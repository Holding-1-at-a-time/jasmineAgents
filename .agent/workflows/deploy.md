---
description: Deploy the JASMINAgent backend to Convex and the frontend to Vercel.
---

1. **Verify Environment Variables**
   Ensure all critical secrets are set in `.env.local` and synchronized with the Convex dashboard.
   - `TELEGRAM_TOKEN`
   - `OLLAMA_BASE_URL` / `OLLAMA_API_KEY`
   - `TELEGRAM_WEBHOOK_SECRET`

2. **Run Type Checks**
   Ensure the project compiles and TypeScript types are up-to-date.
   // turbo
   `npm run typecheck`

3. **Deploy Convex Functions**
   Push the latest schema, mutations, actions, and workflows to your Convex deployment.
   // turbo
   `npx convex deploy`

4. **Synchronize Telegram Webhook**
   Update the Telegram bot to point to your newly deployed production URL (if applicable).
   // turbo
   `npx tsx scripts/set-webhook.ts`

5. **Deploy Next.js Frontend**
   If using Vercel, trigger a production build.
   // turbo
   `vercel --prod`
