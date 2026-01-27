import { action, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { Id } from "./_generated/dataModel";

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY || "ollama",
});

const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "embeddinggemma:300m";

// SPEC-15: Authoritative Knowledge Base for RAG
export const seedKnowledgeBase = internalMutation({
  args: {},
  handler: async (ctx) => {
    const data = [
      {
        title: "Onboarding Requirements",
        content: "All models must provide a valid government ID, professional headshot, and proof of address. Onboarding typically takes 48-72 hours after document submission.",
        namespace: "onboarding" as const,
      },
      {
        title: "Payment Policy",
        content: "Payouts are processed weekly via USDT or Wire Transfer. Initial models starts at a 60/40 spread, moving to 70/30 after a $5k revenue milestone.",
        namespace: "platform_policies" as const,
      },
      {
        title: "Earnings Expectations",
        content: "Experienced models on JASMINAgent earn an average of $2,500 - $8,000 per month. New creators typically reach $1,000 in their first 30 days.",
        namespace: "earnings" as const,
      }
    ];

    for (const item of data) {
      await ctx.db.insert("knowledge_base", {
        ...item,
        createdAt: Date.now(),
      });
    }
  },
});

export const getKnowledgeByNamespace = query({
    args: { namespace: v.union(v.literal("onboarding"), v.literal("platform_policies"), v.literal("earnings"), v.literal("general")) },
    handler: async (ctx, args) => {
        return await ctx.db.query("knowledge_base")
            .withIndex("by_embedding", (q) => q.eq("namespace", args.namespace))
            .collect();
    }
});

export const searchKnowledgeBase = action({
  args: {
    query: v.string(),
    namespace: v.union(v.literal("onboarding"), v.literal("platform_policies"), v.literal("earnings"), v.literal("general")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // 1. Generate Embedding (with caching)
    const cacheKey = `embed:kb:${args.query}:${EMBEDDING_MODEL}`;
    const cached = await ctx.runAction(internal.actionCache.get, { key: cacheKey });
    let embedding: number[];

    if (cached) {
        embedding = cached as number[];
    } else {
        const { embedding: newEmbedding } = await embed({
            model: ollama.embedding(EMBEDDING_MODEL),
            value: args.query,
        });
        embedding = newEmbedding;
        await ctx.runAction(internal.actionCache.set, { key: cacheKey, value: embedding });
    }

    // 2. Vector Search
    const results = await ctx.vectorSearch("knowledge_base", "by_embedding", {
        vector: embedding,
        limit: args.limit ?? 3,
        filter: (q) => q.eq("namespace", args.namespace),
    });

    // 3. Fetch Full Items
    const fullItems = await Promise.all(
        results.map(async (r) => {
            const item = await ctx.runQuery(internal.knowledge.getKnowledgeItem, { id: r._id as Id<"knowledge_base"> });
            return {
                title: item?.title ?? "Unknown",
                content: item?.content ?? "",
                score: r._score,
            };
        })
    );

    return fullItems;
  },
});

export const getKnowledgeItem = query({
    args: { id: v.id("knowledge_base") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});
