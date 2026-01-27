import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    telegramId: v.string(),
    username: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_telegramId", ["telegramId"]),

  sources: defineTable({
    code: v.string(),
    channel: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  conversations: defineTable({
    userId: v.id("users"),
    state: v.string(), // entry, education, qualification
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    role: v.union(v.literal("user"), v.literal("agent")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_conversationId", ["conversationId"]),

  embeddings: defineTable({
    sourceType: v.string(), // e.g., "message", "source_text"
    sourceId: v.string(),
    vector: v.array(v.number()), // 1536 dimensions
    createdAt: v.number(),
  }).vectorIndex("by_embedding", {
    vectorField: "vector",
    dimensions: 1536,
  }),

  memories: defineTable({
    agentId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("observation"), v.literal("plan")),
    embeddingId: v.optional(v.id("embeddings")),
    metadata: v.optional(v.any()), // flexible metadata
    createdAt: v.number(),
  })
    .index("by_agentId", ["agentId"])
    .vectorIndex("by_embedding", {
      vectorField: "embeddingId", // Note: vector index usually needs the vector data, but here we link to embeddings table. 
        // Actually, for Convex vector search, the vector must be IN the table being searched usually, or we search embeddings table and join. 
        // Let's keep vector in `embeddings` table for now and search that, then link back. 
        // OR better: put vector here if we want to search memories directly. 
        // The spec says "Hybrid retrieval".
        // Let's stick to having a separate embeddings table for now to keep vector storage cleaner, 
        // but typically one searches the table with the vector. 
        // If we want to search memories by vector, memories table needs the vector or we search embeddings and lookup memory.
        // Let's just rely on the `embeddings` table having a reference to `sourceId` which would be the `memoryId`.
    }), 

  workflows: defineTable({
    agentId: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("paused")
    ),
    state: v.any(), // JSON state
    result: v.optional(v.any()),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_agentId", ["agentId"]),

  workflow_steps: defineTable({
    workflowId: v.id("workflows"),
    stepKey: v.string(),
    input: v.any(),
    output: v.optional(v.any()),
    status: v.union(v.literal("pending"), v.literal("running"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workflowId_stepKey", ["workflowId", "stepKey"]),

  solver_jobs: defineTable({
    workflowId: v.optional(v.id("workflows")),
    agentId: v.string(),
    formulation: v.any(), // The LP/Optimization problem
    result: v.optional(v.any()),
    status: v.union(v.literal("pending"), v.literal("processing"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_workflowId", ["workflowId"]),
});
