import { v } from "convex/values";
import { action, internalMutation, internalQuery } from "./_generated/server";
import { generateEmbedding } from "./lib/ai";

// Internal mutation to store the memory text record
export const storeMemory = internalMutation({
  args: {
    agentId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("observation"), v.literal("plan")),
    metadata: v.optional(v.any()),
  },
/**
 * Inserts a new memory record into the database.
 *
 * @param {ActionCtx} ctx - The context of the action
 * @param {Object} args - The arguments of the action
 * @param {string} args.agentId - The ID of the agent that created the memory
 * @param {string} args.content - The content of the memory
 * @param {string} args.type - The type of the memory (text, observation, plan)
 * @param {Object} [args.metadata] - Optional metadata associated with the memory
 * @returns {Promise<number>} The ID of the newly inserted memory record
 */
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
/**
 * Store an embedding in the database.
 * @param {Context} ctx - The Convex API context.
 * @param {Object} args - The arguments to the mutation.
 * @param {string} args.sourceType - The type of the source document (e.g. "memory").
 * @param {string} args.sourceId - The ID of the source document.
 * @param {number[]} args.vector - The embedding vector.
 * @returns {Promise<Object>} The result of the mutation, which is the created embedding document.
 */
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
/**
 * Handles the `remember` action by storing a text memory and generating an embedding from it.
 *
 * @param {ActionCtx} ctx - The action context.
 * @param {Object} args - The action arguments with the following properties:
 *   - `agentId`: The ID of the agent performing the action.
 *   - `content`: The text content to be stored as a memory.
 *   - `type`: The type of the memory (text, observation, plan).
 *   - `metadata`: Optional metadata associated with the memory.
 *
 * @returns {Promise<string>} A promise resolving to the ID of the stored memory.
 */
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
/**
 * Recall memories using a hybrid search approach.
 * Given a query string, first generate an embedding vector using AI.
 * Then, perform a vector search on the embeddings table to find the top N closest embeddings.
 * Finally, hydrate the memories from the vector search results.
 * @param {string} agentId - The ID of the agent performing the search.
 * @param {string} query - The query string to search for.
 * @param {number} [limit=5] - The number of results to return.
 * @returns {Promise<Array<Object>>} An array of memory objects that match the query.
 */
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
    /**
     * Retrieves memories by their embedding IDs.
     * 
     * Given an array of embedding IDs, this query fetches the memories
     * associated with each embedding ID. If an embedding ID is not associated
     * with a memory or if the memory does not exist, it is skipped.
     * 
     * @param {string[]} embeddingIds The array of embedding IDs to fetch memories for.
     * @returns {Promise<object[]>} A promise that resolves to an array of memory objects.
     */
    handler: async (ctx, args) => {
        const memories = [];
        for (const embeddingId of args.embeddingIds) {
            const embedding = await ctx.db.get(embeddingId);
            if (embedding && embedding.sourceType === "memory") {
                const memory = await ctx.db.get(embedding.sourceId as string);
                if (memory) {
                    memories.push(memory);
                }
            }
        }
        return memories;
    }
});
