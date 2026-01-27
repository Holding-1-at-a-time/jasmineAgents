// Native fetch is available in Node 18+

const WEBHOOK_URL = "http://localhost:3000/api/telegram";
const SECRET_TOKEN = "test_secret";

async function simulateStart(telegramId: string, sourceCode?: string) {
  const payload = {
    update_id: 123456789,
    message: {
      message_id: 1,
      from: {
        id: parseInt(telegramId),
        is_bot: false,
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        language_code: "en",
      },
      chat: {
        id: parseInt(telegramId),
        first_name: "John",
        last_name: "Doe",
        username: "johndoe",
        type: "private",
      },
      date: Math.floor(Date.now() / 1000),
      text: sourceCode ? `/start ${sourceCode}` : "/start",
    },
  };

  console.log(`Sending /start for ${telegramId} with source: ${sourceCode || "none"}`);
  
  const response = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-telegram-bot-api-secret-token": SECRET_TOKEN,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  console.log("Response:", response.status, data);
}

// Run simulation
(async () => {
    // 1. Simualte User 1 with Source
    await simulateStart("111111", "linkedin_ad_1");
    
    // 2. Simulate User 2 without Source
    await simulateStart("222222");

    console.log("Simulation complete. Check Convex Dashboard for data.");
})();
