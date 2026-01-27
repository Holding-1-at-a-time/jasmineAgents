---
name: "Telegram Orchestration Expert"
description: "Specialized knowledge for Telegram Bot API, Mini Apps 2.0, and Stars (XTR) monetization."
---

# Telegram Orchestration Expert

This skill governs the interaction surface between the JASMINAgent brain and the user's sovereign Telegram interface.

## Core Directives

### 1. Zero-Trust Ingress
- **Webhooks**: Always verify `X-Telegram-Bot-Api-Secret-Token`.
- **Mini Apps**: Always validate `initData` using the HMAC-SHA-256 algorithm.
- **Payloads**: Treat all message text as untrusted. Use strict validators (`v`) before processing.

### 2. Digital Sovereignty (Stars)
- **Currency**: Only use **Telegram Stars (XTR)** for digital recruitment goods.
- **Fulfillment**: 
    - Create invoices via `sendInvoice`.
    - Handle `pre_checkout_query` with immediate 200 OK if stock/quota exists.
    - Fulfill asynchronously in a mutation after the `successful_payment` update.

### 3. Outbound Flow Control
- **Rate Limits**: Limit outbound messages to 30/sec (or 1/sec per chat).
- **Persistence**: Log EVERY outgoing message to the `messages` table before calling the API.

## Snippets & Patterns

### Mini App Validator
```typescript
// use src/lib/telegram-auth.ts
const isValid = await validateWebAppData(initData, process.env.TELEGRAM_TOKEN!);
```

### Async Star Processing
```typescript
export const handlePayment = internalMutation({
  args: { payload: v.string(), amount: v.number() },
  handler: async (ctx, args) => {
    // Fulfill order, then log success
  }
});
```
