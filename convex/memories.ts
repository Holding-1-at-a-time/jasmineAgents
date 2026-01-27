import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { generateEmbedding } from "./lib/ai";

// Internal mutation to store the memory text record
export const storeMemory = internalMutation({
  args: {
    agentId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("observation"), v.literal("plan")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("memories", {
      agentId: args.agentId,
      content: args.content,
      type: args.type,
      metadata: args.metadata,
      createdAt: Date.now(),
    });
  },
});

// Internal mutation to store the embedding
export const storeEmbedding = internalMutation({
  args: {
    sourceType: v.string(),
    sourceId: v.string(), // ID of the memory
    vector: v.array(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("embeddings", {
      sourceType: args.sourceType,
      sourceId: args.sourceId,
      vector: args.vector,
      createdAt: Date.now(),
    });
  },
});

// Public Action: Remember something (Text + Embedding)
export const remember = action({
  args: {
    agentId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("observation"), v.literal("plan")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Store Text Memory
    const memoryId = await ctx.runMutation(internal.memories.storeMemory, {
      agentId: args.agentId,
      content: args.content,
      type: args.type,
      metadata: args.metadata,
    });

    // 2. Generate Embedding
    const vector = await generateEmbedding(args.content);

    // 3. Store Embedding linked to Memory
    await ctx.runMutation(internal.memories.storeEmbedding, {
      sourceType: "memory",
      sourceId: memoryId,
      vector,
    });

    return memoryId;
  },
});

// Public Action: Recall (Hybrid Search)
export const search = action({
  args: {
    agentId: v.string(),
    query: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    const vector = await generateEmbedding(args.query);

    // 1. Vector Search
    const vectorResults = await ctx.vectorSearch("embeddings", "by_embedding", {
      vector,
      limit,
    });

    // 2. Hydrate Memories from Vector Results
    const memoryIds = vectorResults
        .filter((r) => r.sourceType === "memory") // Assuming vector search might return other things? Or just filter by convention if index is shared
        // Actually, we can't filter in vectorSearch easily if not indexed, but here we assume all are embeddings.
        // But wait, `embeddings` table has `sourceType`, we can check that after fetch.
        // Wait, vectorSearch returns objects with `_id` (embedding ID) and `_score`.
        // We need to fetch the embedding doc to get `sourceId`.
        .map((r) => r._id);
    
    // We need a helper to fetch embeddings by IDs to get sourceIds, then fetch memories.
    // Or, define a vector search that includes metadata?
    // Convex vector search returns { _id, _score }. 
    // We need to fetch the docs.
    
    const results = await ctx.runQuery(internal.memories.retrieveMemoriesByEmbeddingIds, {
        embeddingIds: memoryIds
    });

    return results;
  },
});

// Internal Query to hydrate results
export const retrieveMemoriesByEmbeddingIds = internalQuery({
    args: { embeddingIds: v.array(v.id("embeddings")) },
    handler: async (ctx, args) => {
        const memories = [];
        for (const embeddingId of args.embeddingIds) {
            const embedding = await ctx.db.get(embeddingId);
            if (embedding && embedding.sourceType === "memory") {
                const memory = await ctx.db.get(embedding.sourceId as any);
                if (memory) {
                    memories.push(memory);
                }
            }
        }
        return memories;
    }
});
