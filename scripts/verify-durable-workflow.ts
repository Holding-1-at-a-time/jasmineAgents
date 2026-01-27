
import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

async function verifyDurableWorkflow() {
  console.log("Starting Durable Workflow Verification...");

  // 1. Start Workflow - Expect Failure
  console.log("\n--- Attempt 1: Simulating Failure ---");
  let workflowId: any;
  try {
      // @ts-ignore - dynamic api path might not be typed yet
      const result = await convex.action(api.agent.test_agent.runTest, { shouldFail: true });
      console.error("UNEXPECTED: Workflow succeeded when it should have failed!", result);
      return;
  } catch (e: any) {
      console.log("Expected Failure caught:", e.message);
      // We need to get the workflowId.
      // The action throws, so we can't get the return value.
      // But we logged it in convex logs.
      // Ideally, the action should return a formatted error object instead of throwing for easier testing, 
      // OR we just query the most recent workflow for 'test_agent_001'.
      
      console.log("Fetching workflow ID from DB...");
      // We need a query to get recent workflow.
      // Since we don't have a public query for that, we can use the internal query via a test action 
      // or just assume we can get it if we modify runTest to return even on error? 
      // `runTest` catches internally and returns object { status: "failed", error, workflowId }.
      // Wait, let's check `test_agent.ts`.
      // Yes: `catch (e: any) { ... return { status: "failed", error: e.message, workflowId }; }`
      // So `convex.action` should return that object, NOT throw.
      // Unless `convex.action` throws on backend error?
      // If `runTest` catches and returns, `convex.action` sees a success return value (which happens to contain error info).
      // So the try/catch above might not trigger.
  }
  
  // Let's retry calling and reading the result.
  // @ts-ignore
  const result1 = await convex.action(api.agent.test_agent.runTest, { shouldFail: true });
  console.log("Run 1 Result:", result1);
  
  if (result1.status !== "failed" || !result1.workflowId) {
      console.error("FAIL: Run 1 did not return expected failure status or workflowId");
      return;
  }
  
  workflowId = result1.workflowId;
  console.log("Captured Workflow ID:", workflowId);

  // 2. Resume Workflow - Expect Success
  console.log("\n--- Attempt 2: Resuming Workflow ---");
  // @ts-ignore
  const result2 = await convex.action(api.agent.test_agent.runTest, { 
      workflowId: workflowId,
      shouldFail: false // We remove the forced failure trigger, but steps 1 & 2 should remain skipped
  });
  
  console.log("Run 2 Result:", result2);
  
  if (result2.status === "Done") {
      console.log("PASS: Workflow resumed and completed successfully.");
      // Check if steps were skipped? We'd need to check logs or step timestamps, 
      // but "Recall Results" log in console would show if it ran again (if we could see server logs).
      // In this client script we verify the logic flow.
  } else {
      console.error("FAIL: Workflow did not complete successfully on resume.");
  }
}

verifyDurableWorkflow();
