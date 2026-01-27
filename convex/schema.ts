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

  // SPEC-13: threads instead of conversations
  threads: defineTable({
    userId: v.id("users"),
    state: v.string(), // entry, education, qualification
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]), 

  // SPEC-13: messages table linked to threads
  messages: defineTable({
    threadId: v.id("threads"), // Renamed from conversationId
    role: v.union(v.literal("user"), v.literal("agent")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_threadId", ["threadId"]), // Renamed index

  // SPEC-13: files table for soft-delete support
  files: defineTable({
    storageId: v.string(), // Convex storage ID
    name: v.string(),
    type: v.string(),
    size: v.number(),
    deleted: v.boolean(), // Soft delete flag
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_storageId", ["storageId"]),

  // Legacy embeddings table (might be replaced by RAG component later, but keeping for now)
  embeddings: defineTable({
    sourceType: v.string(), 
    sourceId: v.string(),
    vector: v.array(v.number()), 
    createdAt: v.number(),
  }).vectorIndex("by_embedding", {
    vectorField: "vector",
    dimensions: 1536,
  }),

  // Agentic Memory (SPEC-13 memory model)
  memories: defineTable({
    agentId: v.string(),
    content: v.string(),
    type: v.union(v.literal("text"), v.literal("observation"), v.literal("plan")),
    metadata: v.optional(v.any()), 
    createdAt: v.number(),
  }).index("by_agentId", ["agentId"]), 

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
