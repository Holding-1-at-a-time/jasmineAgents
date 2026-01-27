import { ActionCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

export class WorkflowManager {
  private ctx: ActionCtx;
  private workflowId: Id<"workflows">;

  constructor(ctx: ActionCtx, workflowId: Id<"workflows">) {
    this.ctx = ctx;
    this.workflowId = workflowId;
  }

  /**
   * Run a durable step.
   * If step was already completed, returns the persisted output.
   * If not, runs the function, persists output, and returns it.
   */
  async runStep<T>(
    stepKey: string,
    input: any,
    fn: () => Promise<T>
  ): Promise<T> {
    // 1. Check if step exists and is completed
    const existingStep = await this.ctx.runQuery(internal.workflows.getStep, {
      workflowId: this.workflowId,
      stepKey,
    });

    if (existingStep && existingStep.status === "completed") {
      console.log(`Step ${stepKey} already completed. Recovering result.`);
      return existingStep.output as T;
    }

    // 2. Log Start
    await this.ctx.runMutation(internal.workflows.logStepStart, {
      workflowId: this.workflowId,
      stepKey,
      input,
    });

    try {
      // 3. Execute Function
      const result = await fn();

      // 4. Log Success
      await this.ctx.runMutation(internal.workflows.logStepSuccess, {
        workflowId: this.workflowId,
        stepKey,
        output: result,
      });

      return result;
    } catch (e: any) {
      console.error(`Step ${stepKey} failed:`, e);
      // 5. Log Failure
      await this.ctx.runMutation(internal.workflows.logStepFailure, {
        workflowId: this.workflowId,
        stepKey,
        error: e.message || "Unknown error",
      });
      throw e;
    }
  }
}
