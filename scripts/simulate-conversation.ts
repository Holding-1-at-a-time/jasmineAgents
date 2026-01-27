import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const TELEGRAM_ID = "111111"; // User created in previous simulation

async function verifyConversation() {
    console.log("1. Simulating incoming message from User (Telegram ID: " + TELEGRAM_ID + ")...");
    
    // 1. Send Message
    // Note: We use the internal mutation 'logMessage' via a cheat or we trust the route.ts logic.
    // Ideally we should post to the route, but that needs fetch to ngrok.
    // Let's assume route.ts calls logMessage, so we call logMessage directly to test Internal Logic.
    // Wait, logMessage is internalMutation. We cannot call it from client.
    // We must expose a public action for testing or use `npx convex run`? 
    // Ah, `convex/telegram.ts:logMessage` is `internalMutation`.
    // We can't call it from here using `ConvexHttpClient`.
    
    // Alternative: We can use the existing `api.users.register` (public mutation?) no `users.register` is mutation.
    // Is `logMessage` public? No.
    // So we MUST use the HTTP endpoint (Webhooks) or create a test mutation.
    
    // Let's try sending to the HTTP endpoint using the local ngrok URL if available, or just mocking.
    // If we want to test PURELY internals, we'd need a `runTest` action like in Phase 2.
    
    // Let's create `test_conversation.ts` in convex/ directory to run ON server.
    // Then we call THAT action from this script.
}

// Plan B: Create a temporary public action to trigger the flow.
// Or just modify `simulate-telegram.ts` to POST to the actual URL?
// Yes, calling the real URL is better integration test.

// import fetch from "node-fetch"; // Native fetch in Node 18+


async function runRealIntegration() {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const secret = process.env.TELEGRAM_WEBHOOK_SECRET;

    if (!webhookUrl || !secret) {
        console.error("Missing env vars.");
        return;
    }

    console.log("Sending Webhook to:", webhookUrl);

    const payload = {
        update_id: 123456,
        message: {
            message_id: 101,
            from: {
                id: 111111,
                is_bot: false,
                first_name: "Test",
                username: "tester"
            },
            chat: { id: 111111, type: "private" },
            date: Date.now() / 1000,
            text: "Hello Agent, report status"
        }
    };

    const res = await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-telegram-bot-api-secret-token": secret
        },
        body: JSON.stringify(payload)
    });

    console.log("Webhook Response:", res.status, await res.text());

    console.log("Waiting 4s for Agent...");
    await new Promise(r => setTimeout(r, 4000));

    // Now query messages via Convex Client (needs finding user first)
    // We need the userid for 111111.
    const user = await convex.query(api.users.getByTelegramId, { telegramId: "111111" });
    if (!user) {
         console.error("User not found.");
         return;
    }
    
    // Find thread
    // We don't have getThreadByUserId exposed? 
    // User logic created it.
    // We can cheat: look at `api.telegram.listMessages` if we have threadId.
    // We don't have threadId.
    // Let's expose `getLatestThread` in users or just assume we can find it.
    console.log("Check Dashboard for messages. If you see 'Reflecting on: Hello Agent...', it worked.");
}

runRealIntegration().catch(console.error);
