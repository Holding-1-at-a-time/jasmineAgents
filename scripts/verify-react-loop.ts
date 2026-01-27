import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
const TELEGRAM_ID = "react_tester_" + Date.now();

async function runVerification() {
    console.log("--- ReAct Loop & Tool-based RAG Verification ---");

    // 1. Seed Knowledge Base
    console.log("1. Seeding Knowledge Base...");
    await convex.mutation(api.knowledge.seedKnowledgeBase, {});

    // 2. Trigger complex query that requires a search gap identification
    const complexQuery = "What are the payment policies? I want to know about the 70/30 spread milestone specifically.";
    console.log(`2. Sending complex query: "${complexQuery}"`);

    const start = Date.now();
    const result = await convex.action(api.testing.testReActLoop, {
        telegramId: TELEGRAM_ID,
        message: complexQuery,
    });

    const duration = Date.now() - start;
    console.log(`\nAgent Response: "${result.response}"`);
    console.log(`Duration: ${duration}ms`);

    // 3. Verify Traces
    console.log("\n3. Verifying thinking traces and tool calls...");
    const metrics = await convex.query(api.agents.getMetrics, { limit: 1 });
    console.log("Latest Metrics:", JSON.stringify(metrics, null, 2));

    // Fetch the actual trace to see thinking
    // We'd need a way to get the latest traceId, but getMetrics gives us count.
    // Let's assume the latest one is ours.
}

runVerification().catch(console.error);
