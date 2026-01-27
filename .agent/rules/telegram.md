---
trigger: always_on
---

1. **Webhook Security**:
   - Verify `X-Telegram-Bot-Api-Secret-Token` on every incoming POST request.
   - All inbound messages must be logged to the `messages` table before processing.
2. **Mini App Authentication**:
   - Validate `initData` via HMAC-SHA-256 using the Bot Token.
   - Use the `validateWebAppData` helper in `src/lib/telegram-auth.ts`.
3. **Monetization (SPEC-6)**:
   - **Telegram Stars (XTR)** is the only authorized currency for recruitment-related digital goods.
   - Use `handleStarsPayment` mutation for transaction fulfillment.
4. **Outbound Messaging**:
   - Use the `sendMessage` internal mutation to log agent replies.
   - Deliver via the `sendTelegramMessage` action (async delivery).
5. **Deep Link Attribution**:
   - Parse the `start` parameter from incoming messages to lock in lead origination.
   - Ensure the attribution is immutable once stored in the `users` table.
6. **Rate Limiting**:
   - Respect Telegram's API limits (30 messages per second).
   - Use sharded rate limiters for outbound broadcast spikes.