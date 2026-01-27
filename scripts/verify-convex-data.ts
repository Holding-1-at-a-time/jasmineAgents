
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function verify() {
  console.log("Verifying Convex Data...");

  // 1. Check User 1
  const user1 = await convex.query(api.users.getByTelegramId, { telegramId: "111111" });
  if (user1) {
    console.log("PASS: User 111111 found:", user1._id);
  } else {
    console.error("FAIL: User 111111 not found");
  }

  // 2. Check User 2
  const user2 = await convex.query(api.users.getByTelegramId, { telegramId: "222222" });
  if (user2) {
    console.log("PASS: User 222222 found:", user2._id);
  } else {
    console.error("FAIL: User 222222 not found");
  }
}

verify();
