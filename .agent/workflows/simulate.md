---
description: Run an end-to-end conversation simulation through the Telegram API boundary.
---

1. **Start Development Environment**
   Ensure `npx convex dev` and `npm run dev` are running.

2. **Verify Webhook Connectivity**
   Ensure your local environment is reachable via ngrok and the webhook is registered.

3. **Run Conversation Simulator**
   Execute the script that POSTs a mock message update to your `/api/telegram` endpoint.
   // turbo
   `npx tsx scripts/simulate-conversation.ts`

4. **Monitor Auditor Logs**
   Check the `audit_logs` and `traces` tables in Convex to see the multi-agent handoffs and reasoning steps.
   // turbo
   `npx convex query agents:getMetrics`

5. **Examine Message History**
   Confirm the user was registered and the agent reply was persisted in the `messages` table.
