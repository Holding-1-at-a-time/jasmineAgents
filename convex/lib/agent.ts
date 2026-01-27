import { ActionCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";
import { WorkflowManager } from "./workflow";
import { api } from "../_generated/api";

export abstract class AbstractAgent {
  protected ctx: ActionCtx;
  protected agentId: string;
  protected workflowId?: Id<"workflows">;
  protected workflow?: WorkflowManager;

  constructor(ctx: ActionCtx, agentId: string) {
    this.ctx = ctx;
    this.agentId = agentId;
  }

  /**
   * Initialize a new workflow or resume an existing one
   */
  async initWorkflow(workflowId: Id<"workflows">) {
    this.workflowId = workflowId;
    this.workflow = new WorkflowManager(this.ctx, workflowId);
  }

  /**
   * Abstract run method to be implemented by specific agents
   */
  abstract run(input: any): Promise<any>;

  protected async remember(content: string, type: "text" | "observation" | "plan" = "text", metadata?: any) {
      await this.ctx.runAction(api.memories.remember, {
          agentId: this.agentId,
          content,
          type,
          metadata
      });
  }

  protected async recall(query: string, limit: number = 5) {
      return await this.ctx.runAction(api.memories.search, {
          agentId: this.agentId,
          query,
          limit
      });
  }
}
