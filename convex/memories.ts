import { action, internalAction, internalMutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { embed } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY || "ollama",
});

const EMBEDDING_MODEL = process.env.OLLAMA_EMBEDDING_MODEL || "embeddinggemma:300m";

// SPEC-10: Hybrid Search Retrieval
export const hybridSearch = action({
  args: {
    userId: v.id("users"),
    query: v.string(),
    threadId: v.optional(v.id("threads")),
    searchOtherThreads: v.optional(v.boolean()),
    mode: v.union(v.literal("lexical"), v.literal("semantic"), v.literal("hybrid")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // SPEC-14: Identity verification for multi-tenant isolation
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Unauthenticated retrieval");

    let results: Array<{ _id: string; _score?: number; content?: string; role?: string }> = [];

    // 1. Semantic Path
    if (args.mode === "semantic" || args.mode === "hybrid") {
        // Use Action Cache to avoid redundant embedding generations
        const cacheKey = `embed:${args.query}:${EMBEDDING_MODEL}`;
        
        // Try getting from cache
        const cached = await ctx.runAction(internal.actionCache.get, { key: cacheKey });
        let embedding: number[];
        
        if (cached) {
            embedding = cached as number[];
        } else {
            const result = await embed({
                model: ollama.embedding(EMBEDDING_MODEL),
                value: args.query,
            });
            embedding = result.embedding;
            await ctx.runAction(internal.actionCache.set, { key: cacheKey, value: embedding });
        }

        const vectorResults = await ctx.vectorSearch("messages", "by_embedding", {
            vector: embedding,
            limit: args.limit ?? 5,
            filter: (q) => q.eq("userId", args.userId),
        });
        results = [...results, ...vectorResults];
    }

    // 2. Lexical Path
    if (args.mode === "lexical" || args.mode === "hybrid") {
        const searchResults = await ctx.runQuery(internal.memories.lexicalSearch, {
            userId: args.userId,
            query: args.query,
            threadId: args.searchOtherThreads ? undefined : args.threadId,
        });
        results = [...results, ...searchResults];
    }

    // 3. De-duplicate and Parse
    const unique = Array.from(new Map(results.map(r => [r._id, r])).values());

    return unique.map(r => ({
        id: r._id as string,
        content: (r as { content?: string }).content ?? "",
        role: (r as { role?: string }).role ?? "user",
        score: (r as { _score?: number })._score ?? 0,
    }));
  },
});

export const lexicalSearch = query({
    args: { userId: v.id("users"), query: v.string(), threadId: v.optional(v.id("threads")) },
    handler: async (ctx, args) => {
        const q = ctx.db.query("messages")
            .withSearchIndex("by_content", (q) => 
                q.search("content", args.query)
                 .eq("userId", args.userId)
            );
        
        if (args.threadId) {
            return await ctx.db.query("messages")
                .withSearchIndex("by_content", (q) => 
                    q.search("content", args.query)
                     .eq("userId", args.userId)
                     .eq("threadId", args.threadId!)
                )
                .take(10);
        }
        // Note: withSearchIndex filterFields must be exact matches
        // We already added threadId to filterFields in schema

        return await q.take(10);
    }
});

// Background task to embed messages
export const generateMessageEmbedding = internalAction({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const message = await ctx.runQuery(internal.memories.getMessage, { messageId: args.messageId });
        if (!message || !message.content) return;

        const { embedding } = await embed({
            model: ollama.embedding(EMBEDDING_MODEL),
            value: message.content,
        });

        await ctx.runMutation(internal.memories.updateMessageEmbedding, {
            messageId: args.messageId,
            embedding,
        });
    }
});

export const getMessage = query({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.messageId);
    }
});

export const updateMessageEmbedding = internalMutation({
    args: { messageId: v.id("messages"), embedding: v.array(v.number()) },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.messageId, { embedding: args.embedding });
    }
});
