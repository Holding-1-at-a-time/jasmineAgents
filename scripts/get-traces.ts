import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function main() {
    const traces = await convex.query(api.agents.getMetrics, { limit: 5 });
    console.log(JSON.stringify(traces, null, 2));
}

main().catch(console.error);
