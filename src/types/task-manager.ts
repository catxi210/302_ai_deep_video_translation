import { TaskStatus, CurrentTaskState } from "@/stores/slices/current_task";

export type TaskStep =
  | "video_info"
  | "download"
  | "transcribe"
  | "translate"
  | "burn";

export interface TaskProgressInfo {
  step: TaskStep;
  status: TaskStatus;
  error?: string;
  lastUpdated: Date;
  result?: any;
  serverTaskId?: string;
}

export interface ManagedTask extends CurrentTaskState {
  currentStep: TaskStep;
  stepProgress: Record<TaskStep, TaskProgressInfo>;
  retryCount: Record<TaskStep, number>;
  lastError?: string;
}

export type TaskManagerEvents = {
  onStepComplete: (taskId: string, step: TaskStep) => void;
  onStepFailed: (taskId: string, step: TaskStep, error: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskFailed: (taskId: string, error: string) => void;
};
