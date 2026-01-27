import { internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

/**
 * SPEC-14: Multimodal Vision Screening
 * Uses qwen3-vl:235b-cloud for high-fidelity visual reasoning.
 */

export const screenPhotoAction = internalAction({
  args: { 
    storageId: v.string(), 
    userId: v.id("users"),
    prompt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const imageUrl = await ctx.storage.getUrl(args.storageId);
    if (!imageUrl) throw new Error("File not found");

    const systemPrompt = "You are a professional model scout. Analyze the provided photo for: 1. Professional lighting/quality. 2. Attire suitability. 3. General aesthetic fit for high-end modeling. Respond in structured JSON only: { 'passed': boolean, 'confidence': float, 'analysis': string }";
    
    const response = await fetch(`${process.env.OLLAMA_BASE_URL}/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OLLAMA_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODAL || "qwen3-vl:235b-cloud",
        messages: [{
          role: "user",
          content: args.prompt ?? systemPrompt,
          images: [imageUrl]
        }],
        stream: false,
        format: "json"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Ollama Cloud error:", errorText);
      throw new Error(`Vision model failed: ${response.statusText}`);
    }

    const result = await response.json();
    const evaluation = JSON.parse(result.message.content);

    // Persist result
    await ctx.runMutation(internal.vision.saveScreeningResult, {
        userId: args.userId,
        storageId: args.storageId,
        analysis: evaluation.analysis,
        passed: evaluation.passed,
        confidence: evaluation.confidence,
    });

    return evaluation;
  }
});

export const saveScreeningResult = internalMutation({
    args: {
        userId: v.id("users"),
        storageId: v.string(),
        analysis: v.string(),
        passed: v.boolean(),
        confidence: v.float64(),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("screening_results", {
            ...args,
            createdAt: Date.now(),
        });
    }
});
