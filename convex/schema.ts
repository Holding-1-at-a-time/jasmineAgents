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
    code: v.string(), // source_id
    channel: v.string(), // platform (X, Reddit, etc.)
    metadata: v.optional(v.any()), // campaign metadata
    scoutAgentId: v.optional(v.string()), 
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  qualification_state: defineTable({
    userId: v.id("users"),
    currentState: v.union(v.literal("entry"), v.literal("education"), v.literal("qualification"), v.literal("escalation")),
    history: v.array(v.object({
        state: v.string(),
        timestamp: v.number(),
        reason: v.optional(v.string()),
    })),
    entryTimestamp: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]),

  // SPEC-13: threads instead of conversations
  threads: defineTable({
    userId: v.id("users"),
    state: v.string(), // entry, education, qualification
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"]), 

  // SPEC-13: messages table linked to threads
  messages: defineTable({
    threadId: v.id("threads"),
    userId: v.id("users"), // Denormalized for vector filtering (SPEC-10)
    role: v.union(v.literal("user"), v.literal("agent")),
    content: v.string(),
    embedding: v.optional(v.array(v.number())), // For semantic search
    createdAt: v.number(),
  }).index("by_threadId", ["threadId"])
    .index("by_userId", ["userId"])
    .searchIndex("by_content", {
      searchField: "content",
      filterFields: ["userId", "threadId"],
    })
    .vectorIndex("by_embedding", {
      vectorField: "embedding",
      dimensions: 768,
      filterFields: ["userId"],
    }),

  // SPEC-11: Lead Management
  leads: defineTable({
    telegramId: v.string(),
    sourceId: v.optional(v.string()),
    status: v.union(v.literal("new"), v.literal("qualified"), v.literal("nurtured"), v.literal("escalated"), v.literal("onboarded")),
    metadata: v.any(),
    threadId: v.optional(v.id("threads")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_telegramId", ["telegramId"])
    .index("by_status", ["status"]),

  lead_conversations: defineTable({
    leadId: v.id("leads"),
    threadId: v.id("threads"),
    summary: v.optional(v.string()),
  }).index("by_leadId", ["leadId"]),

  // SPEC-13: files table for soft-delete support
  files: defineTable({
    storageId: v.string(), // Convex storage ID
    name: v.string(),
    type: v.string(),
    size: v.number(),
    status: v.union(v.literal("active"), v.literal("deleted"), v.literal("pending")),
    deletedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_storageId", ["storageId"]),

  // Legacy embeddings table (might be replaced by RAG component later, but keeping for now)
  embeddings: defineTable({
    sourceType: v.string(), 
    sourceId: v.string(),
    vector: v.array(v.number()), 
    createdAt: v.number(),
  }).vectorIndex("by_embedding", {
    vectorField: "vector",
    dimensions: 768,
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

  // SPEC-7: Observability & Tracing
  traces: defineTable({
    threadId: v.optional(v.id("threads")),
    workflowId: v.optional(v.id("workflows")),
    agentName: v.string(),
    stepKey: v.string(),
    model: v.optional(v.string()),
    input: v.any(),
    output: v.any(),
    rationale: v.optional(v.string()), // Why the agent acted (LLM conclusion)
    thinking: v.optional(v.string()), // Raw reasoning trace (SPEC-14 DeepSeek style)
    usage: v.optional(v.object({
        promptTokens: v.number(),
        completionTokens: v.number(),
        totalTokens: v.number(),
    })),
    durationMs: v.number(),
    createdAt: v.number(),
  }).index("by_threadId", ["threadId"])
    .index("by_workflowId", ["workflowId"]),

  // Knowledge Base for RAG Grounding
  knowledge_base: defineTable({
    title: v.string(),
    content: v.string(),
    namespace: v.union(v.literal("onboarding"), v.literal("platform_policies"), v.literal("earnings"), v.literal("general")),
    embedding: v.optional(v.array(v.number())),
    createdAt: v.number(),
  }).vectorIndex("by_embedding", {
    vectorField: "embedding",
    dimensions: 768,
    filterFields: ["namespace"],
  }),

  // Sovereign Monetization (Telegram Stars)
  star_transactions: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    itemId: v.string(),
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    invoiceId: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_userId", ["userId"])
    .index("by_status", ["status"]),

  // SPEC-7: Audit Trail
  audit_logs: defineTable({
    actor: v.string(), // "agent", "user", "system"
    action: v.string(),
    entityId: v.string(),
    entityType: v.string(), // "user", "thread", "memory"
    diff: v.any(),
    createdAt: v.number(),
  }).index("by_entityId", ["entityId"]),

  // SPEC-14: Sharding for Throughput
  shards: defineTable({
    key: v.string(), // e.g. "counter:link_clicks"
    shardId: v.number(), // 0 to N-1
    value: v.number(),
    updatedAt: v.number(),
  }).index("by_key_shardId", ["key", "shardId"]),

  // SPEC-16: Agentic Recalibration Signals
  signals: defineTable({
    originator: v.string(), // e.g. "analyst"
    target: v.string(), // e.g. "scout", "strategist"
    type: v.string(), // e.g. "intensity_adjustment", "content_pivot"
    payload: v.any(),
    status: v.union(v.literal("pending"), v.literal("applied"), v.literal("dismissed")),
    createdAt: v.number(),
  }).index("by_target", ["target"]),

  // SPEC-14: Vision Screening Persistence
  screening_results: defineTable({
    userId: v.id("users"),
    storageId: v.string(), // Convex storage ID
    analysis: v.string(), // AI's visual description
    passed: v.boolean(),
    confidence: v.float64(),
    createdAt: v.number(),
  }).index("by_userId", ["userId"]),
});
