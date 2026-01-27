import { api } from "../../../../convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextRequest, NextResponse } from "next/server";
import TelegramBot from "node-telegram-bot-api";

// Initialize Convex Client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  // 1. Security: Verify Secret Token
  const secretToken = req.headers.get("x-telegram-bot-api-secret-token");
  if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse Update
  const update: TelegramBot.Update = await req.json();

  if (!update.message || !update.message.from) {
    // Ignore non-message updates for now
    return NextResponse.json({ ok: true });
  }

  const { from, text } = update.message;
  const telegramId = from.id.toString();

  // 3. Handle /start command
  if (text?.startsWith("/start")) {
    const args = text.split(" ");
    const sourceCode = args.length > 1 ? args[1] : undefined;

    // Call Convex Mutation to Register User
    await convex.mutation(api.users.register, {
      telegramId,
      username: from.username,
      firstName: from.first_name,
      lastName: from.last_name,
      sourceCode,
    });

    // TODO: Send welcome message back to Telegram
  } else if (text) {
      // 4. Handle other messages
       await convex.mutation(api.telegram.logMessage, {
          telegramId,
          text,
          role: "user"
       });
  }

  return NextResponse.json({ ok: true });
}
