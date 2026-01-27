export type AgentId = string;
export type WorkflowId = string; // Convex ID
export type StepKey = string;

export type WorkflowStatus = "pending" | "running" | "completed" | "failed" | "paused";
export type StepStatus = "pending" | "running" | "completed" | "failed";

export type MemoryType = "text" | "observation" | "plan";

export interface AgentMemory {
  agentId: AgentId;
  content: string;
  type: MemoryType;
  metadata?: Record<string, any>;
  embeddingId?: string; // ID from embeddings table
}

export interface WorkflowState {
  agentId: AgentId;
  status: WorkflowStatus;
  state: Record<string, any>;
  result?: any;
  error?: string;
}

export interface SolverJob {
  agentId: AgentId;
  workflowId?: WorkflowId;
  formulation: any;
  result?: any;
  status: "pending" | "processing" | "completed" | "failed";
}
