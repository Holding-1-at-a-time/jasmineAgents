import { ActionCtx } from "../_generated/server";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";

interface StepInput {
  property1: string;
  property2: number;
  property3: boolean;
  property4: object;
}

export class WorkflowManager {
  private ctx: ActionCtx;
  private workflowId: Id<"workflows">;

/**
 * Constructor for the WorkflowManager class.
 *
 * @param ctx - The Convex ActionCtx object passed to every Convex function.
 * @param workflowId - The ID of the workflow to manage.
 */
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
    input: StepInput,
    fn: () => Promise<T>
  ): Promise<T> {
    // 1. Check if step exists and is completed
    let existingStep;
    try {
      existingStep = await this.ctx.runQuery(internal.workflows.getStep, {
        workflowId: this.workflowId,
        stepKey,
      });
    } catch (e) {
      console.error(`Failed to retrieve step ${stepKey}:`, e);
      throw e;
    }

    if (existingStep && existingStep.status === "completed") {
      if (existingStep.output === null || existingStep.output === undefined) {
        throw new Error(`Step ${stepKey} has no output`);
      }
      console.log(`Step ${stepKey} already completed. Recovering result.`);
      return existingStep.output as T;
    }

    if (existingStep === null || existingStep === undefined) {
      throw new Error(`Step ${stepKey} does not exist`);
    }

    if (existingStep.status === "failed") {
      throw new Error(`Step ${stepKey} failed: ${existingStep.error}`);
    }

    if (existingStep.status === "running") {
      throw new Error(`Step ${stepKey} is already running`);
    }
    return existingStep.output as T;

    

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
    } catch (e: Error) {
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
