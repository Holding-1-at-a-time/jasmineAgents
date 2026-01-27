import { AbstractAgent } from "../lib/agent";
import { api } from "../../_generated/api";
import { v } from "convex/values";
import { action } from "../../_generated/server";

export class TestAgent extends AbstractAgent {
  async run(input: { shouldFail?: boolean }) {
    if (!this.workflow) throw new Error("Workflow not initialized");

    // Step 1: Memory Test
    await this.workflow.runStep("memory_check", {}, async () => {
      console.log("Step 1: Rememering...");
      await this.remember("The sky is blue", "text");
      const results = await this.recall("what color is the sky?");
      console.log("Recall Results:", results);
      return { recallCount: results.length };
    });

    // Step 2: Solver Test
    const solverResult = await this.workflow.runStep("solve_problem", {}, async () => {
        console.log("Step 2: Solving LP...");
        // Maximize P = x + y subject to 2x + y <= 20, x + 2y <= 20, x >= 0, y >= 0
        const model = {
            optimize: "profit",
            opType: "max",
            constraints: {
                c1: { max: 20 },
                c2: { max: 20 }
            },
            variables: {
                x: { profit: 1, c1: 2, c2: 1 },
                y: { profit: 1, c1: 1, c2: 2 }
            }
        };
        
        // Call the solver action via ctx.runAction
        const result = await this.ctx.runAction(api.solver.solveLP, {
            agentId: this.agentId,
            model
        });
        
        return result;
    });

    // Step 3: Failure Simulation (Durable Workflow Test)
    await this.workflow.runStep("risk_step", { shouldFail: input.shouldFail }, async () => {
        console.log("Step 3: Risk Step. Input:", input);
        if (input.shouldFail) {
            throw new Error("Simulated Failure!");
        }
        return "Success!";
    });

    return { status: "Done", solver: solverResult };
  }
}

export const runTest = action({
  args: {
    shouldFail: v.optional(v.boolean()),
    resume: v.optional(v.boolean()), // In a real scenario, we'd pass workflowId to resume
    workflowId: v.optional(v.id("workflows"))
  },
  handler: async (ctx, args) => {
    const agentId = "test_agent_001";
    const agent = new TestAgent(ctx, agentId);

    let workflowId = args.workflowId;
    
    // Create new workflow if not resuming or ID not provided
    if (!workflowId) {
        // Internal mutation to create workflow record
        // We catch the internal mutation import issue by using `api.workflows.createWorkflow`? 
        // No, `createWorkflow` is internal. 
        // `ctx.runMutation` with `internal.workflows.createWorkflow`
        const { internal } = await import("../../_generated/api");
        workflowId = await ctx.runMutation(internal.workflows.createWorkflow, {
            agentId,
            state: { input: args }
        });
        console.log("Created new workflow:", workflowId);
    } else {
        console.log("Resuming workflow:", workflowId);
    }

    await agent.initWorkflow(workflowId);

    try {
        const result = await agent.run({ shouldFail: args.shouldFail });
        console.log("Test Completed:", result);
        
        // Mark workflow completed
        const { internal } = await import("../../_generated/api");
        await ctx.runMutation(internal.workflows.updateWorkflowStatus, {
             workflowId: workflowId!,
             status: "completed",
             result
        });
        return result;
    } catch (e: any) {
        console.error("Test Failed (Expected if shouldFail=true):", e.message);
        return { status: "failed", error: e.message, workflowId };
    }
  },
});
