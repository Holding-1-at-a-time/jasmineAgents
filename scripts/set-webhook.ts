import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const token = process.env.TELEGRAM_TOKEN;
const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL; // Need to set this in env or pass as arg
const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;

if (!token) {
    console.error("Error: TELEGRAM_TOKEN not set in .env.local");
    process.exit(1);
}

if (!secretToken) {
    console.error("Error: TELEGRAM_WEBHOOK_SECRET not set in .env.local");
    process.exit(1);
}

// Helper to set webhook
async function setWebhook(url: string) {
    console.log(`Setting webhook to: ${url}`);
    console.log(`Using secret token: ${secretToken}`);
    
    const apiUrl = `https://api.telegram.org/bot${token}/setWebhook`;
    
    try {
        const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                url: url,
                secret_token: secretToken,
                allowed_updates: ["message", "callback_query"] // Good practice to be explicit
            }),
        });
        
        const data = await response.json();
        console.log("Response:", data);
        
        if (data.ok) {
            console.log("Webhook set successfully with secret token!");
        } else {
            console.error("Failed to set webhook:", data.description);
        }
    } catch (e: any) {
        console.error("Network error setting webhook:", e.message);
    }
}

// Check if URL provided as arg, else check env
const argUrl = process.argv[2];
const targetUrl = argUrl || webhookUrl;

if (!targetUrl) {
    console.error("Usage: npx tsx scripts/set-webhook.ts <WEBHOOK_URL>");
    console.error("Or set TELEGRAM_WEBHOOK_URL in .env.local");
    process.exit(1);
}

setWebhook(targetUrl);
