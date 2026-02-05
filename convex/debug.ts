import { action, query } from "./_generated/server";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

const ollama = createOpenAI({
  baseURL: process.env.OLLAMA_BASE_URL || "http://localhost:11434/v1",
  apiKey: process.env.OLLAMA_API_KEY || "ollama",
});

export const testCloudModel = action({
  args: {},
  handler: async (ctx) => {
    const model = process.env.OLLAMA_MODEL || "qwen3-vl:235b-cloud";
    console.log("Testing cloud model via local Ollama:");
    console.log("  Model:", model);
    console.log("  Base URL:", process.env.OLLAMA_BASE_URL);
    
    try {
        const { text, usage } = await generateText({
            model: ollama(model),
            prompt: "Explain the ReAct reasoning pattern in exactly 2 sentences.",
        });
        return { 
            status: "success", 
            text,
            tokens: usage.totalTokens,
            model 
        };
    } catch (e: any) {
        return { 
            error: e.message,
            cause: e.cause?.message,
        };
    }
  },
});

export const listRecentTraces = query({
  args: {},
  handler: async (ctx) => {
    const traces = await ctx.db.query("traces").order("desc").take(5);
    return traces.map(t => ({
      agent: t.agentName,
      step: t.stepKey,
      model: t.model,
      thinking: t.thinking?.substring(0, 100),
      createdAt: new Date(t.createdAt).toISOString(),
    }));
  },
});
