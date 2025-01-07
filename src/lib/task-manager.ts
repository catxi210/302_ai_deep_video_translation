import { TaskStep, ManagedTask } from "@/types/task-manager";
import { db } from "@/db";
import { TaskStatus } from "@/stores/slices/current_task";
import { atom } from "jotai";
import { TaskResult } from "@/hooks/swr/use-task-status";
import { createScopedLogger } from "@/utils";

const logger = createScopedLogger("task-manager");

const RETRY_LIMIT = 3;
const BASE_POLLING_INTERVAL = 3000;
const MAX_POLLING_INTERVAL = 30000;
const MIN_POLLING_INTERVAL = 1000;

export const activeTasksAtom = atom<Set<string>>(new Set<string>());

export interface TaskManagerEvents {
  onStepComplete: (taskId: string, step: TaskStep) => void;
  onStepFailed: (taskId: string, step: TaskStep, error: string) => void;
  onTaskComplete: (taskId: string) => void;
  onTaskFailed: (taskId: string, error: string) => void;
}

export interface TaskExecutors {
  getVideoInfo: (taskId: string) => Promise<void>;
  startDownload: (taskId: string) => Promise<void>;
  startExtract: (taskId: string) => Promise<void>;
  startTranslate: (taskId: string) => Promise<void>;
  startBurn: (taskId: string) => Promise<void>;
  getTaskStatus: (taskId: string) => Promise<TaskResult<any> | null>;
}

export class TaskManager {
  private static instance: TaskManager;
  private activePolling: Map<string, NodeJS.Timeout> = new Map();
  private events: TaskManagerEvents;
  private executors: TaskExecutors;

  private constructor(events: TaskManagerEvents, executors: TaskExecutors) {
    this.events = events;
    this.executors = executors;
    this.initializeNetworkHandlers();
    this.initializeVisibilityHandlers();
  }

  static getInstance(
    events: TaskManagerEvents,
    executors: TaskExecutors
  ): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager(events, executors);
    }
    return TaskManager.instance;
  }

  private initializeNetworkHandlers() {
    window.addEventListener("online", () => this.handleNetworkRecovery());
    window.addEventListener("offline", () => this.handleNetworkLoss());
  }

  private initializeVisibilityHandlers() {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        this.handleVisibilityRecovery();
      }
    });
  }

  private async handleNetworkRecovery() {
    await this.resumeAllActiveTasks();
  }

  private handleNetworkLoss() {
    this.pauseAllPolling();
  }

  private async handleVisibilityRecovery() {
    await this.resumeAllActiveTasks();
  }

  private async resumeAllActiveTasks() {
    const activeTasks = await db.tasks
      .where("status")
      .equals("processing")
      .and((task) => this.activePolling.has(task.id))
      .toArray();

    for (const task of activeTasks) {
      await this.resumeTask(task.id);
    }
  }

  private pauseAllPolling() {
    for (const [taskId, timeout] of this.activePolling) {
      clearTimeout(timeout);
      this.activePolling.delete(taskId);
    }
  }

  private getNextStep(currentStep: TaskStep): TaskStep | null {
    const steps: TaskStep[] = ["download", "transcribe", "translate", "burn"];
    const currentIndex = steps.indexOf(currentStep);
    return currentIndex < steps.length - 1 ? steps[currentIndex + 1] : null;
  }

  private getAllSteps(): TaskStep[] {
    return ["download", "transcribe", "translate", "burn"];
  }

  private getFollowingSteps(currentStep: TaskStep): TaskStep[] {
    const steps = this.getAllSteps();
    const currentIndex = steps.indexOf(currentStep);
    return steps.slice(currentIndex + 1);
  }

  /**
   * Update task state
   * Unified entry point for task state updates
   */
  private async updateTaskState(
    taskId: string,
    updates: Partial<ManagedTask>,
    options: {
      shouldStopPolling?: boolean;
      shouldStartPolling?: boolean;
      shouldStartStep?: TaskStep;
    } = {}
  ) {
    const { shouldStopPolling, shouldStartPolling, shouldStartStep } = options;

    if (shouldStopPolling) {
      this.stopPolling(taskId);
    }

    await db.tasks.update(taskId, {
      ...updates,
      updatedAt: new Date(),
    });

    if (shouldStartStep) {
      await this.startStep(taskId, shouldStartStep);
    } else if (shouldStartPolling) {
      await this.startPolling(taskId);
    }
  }

  private async updateFollowingStepsStatus(
    task: ManagedTask,
    currentStep: TaskStep,
    status: TaskStatus
  ): Promise<Partial<ManagedTask>> {
    const followingSteps = this.getFollowingSteps(currentStep);
    const updatedStepProgress = { ...task.stepProgress };

    for (const step of followingSteps) {
      updatedStepProgress[step] = {
        ...task.stepProgress[step],
        status,
        lastUpdated: new Date(),
      };
    }

    return {
      stepProgress: updatedStepProgress,
    };
  }

  /**
   * Update step state
   */
  private async updateStepState(
    task: ManagedTask,
    step: TaskStep,
    status: TaskStatus,
    error?: string,
    result?: any
  ): Promise<Partial<ManagedTask>> {
    const stepProgress = { ...task.stepProgress };
    stepProgress[step] = {
      ...stepProgress[step],
      status,
      error,
      lastUpdated: new Date(),
      result,
    };

    // If step fails, set all subsequent steps to pending
    if (status === "fail") {
      const followingSteps = this.getFollowingSteps(step);
      for (const followingStep of followingSteps) {
        stepProgress[followingStep] = {
          ...stepProgress[followingStep],
          status: "pending",
          lastUpdated: new Date(),
        };
      }
    }

    return { stepProgress };
  }

  /**
   * Update task progress
   */
  private async updateTaskProgress(
    taskId: string,
    step: TaskStep,
    status: TaskStatus,
    result?: any
  ) {
    const task = await db.tasks.get(taskId);
    if (!task) {
      logger.warn("Task not found while updating progress", { taskId });
      return;
    }

    if (task.status !== "processing") {
      logger.info("Skip updating progress for non-processing task", {
        taskId,
        currentStatus: task.status,
        attemptedUpdate: status,
      });
      return;
    }

    const error = result?.error?.message || result?.error;
    const updates = await this.updateStepState(
      task,
      step,
      status,
      error,
      result
    );

    switch (status) {
      case "success":
        await this.handleStepSuccess(task, step, updates);
        break;
      case "fail":
        await this.handleStepFailure(
          task,
          step,
          error || "Unknown error",
          updates
        );
        break;
      default:
        await this.updateTaskState(taskId, updates);
    }
  }

  /**
   * Handle step success
   */
  private async handleStepSuccess(
    task: ManagedTask,
    step: TaskStep,
    updates: Partial<ManagedTask>
  ) {
    const nextStep = this.getNextStep(step);
    if (nextStep) {
      await this.updateTaskState(
        task.id,
        {
          ...updates,
          currentStep: nextStep,
        },
        {
          shouldStartStep: nextStep,
        }
      );
      this.events.onStepComplete(task.id, step);
    } else {
      await this.updateTaskState(
        task.id,
        {
          ...updates,
          status: "completed",
        },
        {
          shouldStopPolling: true,
        }
      );
      this.events.onTaskComplete(task.id);
    }
  }

  /**
   * Handle step failure
   */
  private async handleStepFailure(
    task: ManagedTask,
    step: TaskStep,
    error: string,
    updates: Partial<ManagedTask>
  ) {
    const currentRetryCount = task.retryCount[step] || 0;
    if (currentRetryCount < RETRY_LIMIT) {
      await this.updateTaskState(
        task.id,
        {
          ...updates,
          retryCount: {
            ...task.retryCount,
            [step]: currentRetryCount + 1,
          },
        },
        {
          shouldStartStep: step,
        }
      );
      this.events.onStepFailed(task.id, step, error);
    } else {
      await this.updateTaskState(
        task.id,
        {
          ...updates,
          status: "failed",
          lastError: error,
        },
        {
          shouldStopPolling: true,
        }
      );
      this.events.onTaskFailed(task.id, error);
    }
  }

  private async startStep(taskId: string, step: TaskStep) {
    logger.info("Starting task step", {
      taskId,
      step,
      timestamp: new Date().toISOString(),
    });

    try {
      const task = await db.tasks.get(taskId);
      if (!task) {
        logger.warn("Task not found while starting step", { taskId, step });
        return;
      }

      logger.debug("Task state before starting step", {
        taskId,
        step,
        currentStep: task.currentStep,
        globalStatus: task.status,
        stepStatus: task.stepProgress[step].status,
      });

      // Set current step status to queue
      await this.updateTaskProgress(taskId, step, "queue");

      switch (step) {
        case "download":
          logger.info("Starting download step", { taskId });
          await this.executors.startDownload(taskId);
          break;
        case "transcribe":
          logger.info("Starting transcribe step", { taskId });
          await this.executors.startExtract(taskId);
          break;
        case "translate":
          logger.info("Starting translate step", { taskId });
          await this.executors.startTranslate(taskId);
          break;
        case "burn":
          logger.info("Starting burn step", { taskId });
          await this.executors.startBurn(taskId);
          break;
      }

      logger.info("Step executor started successfully", {
        taskId,
        step,
        timestamp: new Date().toISOString(),
      });

      await this.startPolling(taskId);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      logger.error("Error starting task step", {
        taskId,
        step,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      await this.updateTaskProgress(taskId, step, "fail", errorMessage);
    }
  }

  private getPollingInterval(
    step: TaskStep,
    consecutiveNoProgress: number = 0
  ): number {
    // Base polling interval
    let interval = BASE_POLLING_INTERVAL;

    // Adjust base interval based on step
    switch (step) {
      case "download":
        interval = 2000; // Download needs faster feedback
        break;
      case "transcribe":
        interval = 5000; // Transcription usually takes longer
        break;
      case "translate":
        interval = 10000; // Translation needs more time
        break;
      case "burn":
        interval = 10000; // Subtitle burning needs longer wait time
        break;
    }

    // If multiple consecutive no progress, gradually increase interval
    if (consecutiveNoProgress > 0) {
      interval = Math.min(
        interval * Math.pow(1.5, consecutiveNoProgress),
        MAX_POLLING_INTERVAL
      );
    }

    // Ensure interval is within reasonable range
    return Math.max(
      MIN_POLLING_INTERVAL,
      Math.min(interval, MAX_POLLING_INTERVAL)
    );
  }

  private async startPolling(taskId: string) {
    if (this.activePolling.has(taskId)) {
      this.stopPolling(taskId);
    }

    logger.info("Starting task polling", { taskId });

    let consecutiveNoProgress = 0;
    let lastProgress: any = null;

    const scheduleNextPoll = (step: TaskStep) => {
      if (this.activePolling.has(taskId)) {
        const interval = this.getPollingInterval(step, consecutiveNoProgress);
        logger.debug("Scheduling next poll", {
          taskId,
          interval,
          consecutiveNoProgress,
        });
        this.activePolling.set(taskId, setTimeout(poll, interval));
      }
    };

    const poll = async () => {
      const task = await db.tasks.get(taskId);
      if (!task) {
        logger.warn("Task not found during polling", { taskId });
        this.stopPolling(taskId);
        return;
      }

      try {
        const status = await this.executors.getTaskStatus(taskId);
        if (!status) {
          logger.warn("No status returned during polling", {
            taskId,
            currentStep: task.currentStep,
            globalStatus: task.status,
          });
          consecutiveNoProgress++;
          scheduleNextPoll(task.currentStep);
          return;
        }

        // Check if progress has changed
        const currentProgress = JSON.stringify(status.result);
        if (currentProgress === lastProgress) {
          consecutiveNoProgress++;
        } else {
          consecutiveNoProgress = 0;
          lastProgress = currentProgress;
        }

        logger.debug("Received task status", {
          taskId,
          status: status.status,
          currentStep: task.currentStep,
          consecutiveNoProgress,
        });

        if (status.status === "success" || status.status === "fail") {
          logger.info("Task step completed or failed during polling", {
            taskId,
            step: task.currentStep,
            status: status.status,
            result: status.result,
          });
          this.stopPolling(taskId);
          await this.updateTaskProgress(
            taskId,
            task.currentStep,
            status.status,
            status.result
          );
          return;
        }

        await this.updateTaskProgress(
          taskId,
          task.currentStep,
          status.status,
          status.result
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.error("Error during task polling", {
          taskId,
          error: errorMessage,
          stack: error instanceof Error ? error.stack : undefined,
        });
        consecutiveNoProgress++;
      }

      scheduleNextPoll(task.currentStep);
    };

    this.activePolling.set(taskId, setTimeout(poll, 0));
    logger.info("Task polling initialized", { taskId });
  }

  private stopPolling(taskId: string) {
    logger.info("Stopping task polling", { taskId });
    const timeout = this.activePolling.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.activePolling.delete(taskId);
      logger.debug("Task polling stopped", { taskId });
    }
  }

  private async retryStep(taskId: string, step: TaskStep) {
    logger.info("Retrying task step", {
      taskId,
      step,
      timestamp: new Date().toISOString(),
    });
    await this.startStep(taskId, step);
  }

  // Create task
  async createTask(
    taskData: Omit<
      ManagedTask,
      | "createdAt"
      | "updatedAt"
      | "currentStep"
      | "stepProgress"
      | "retryCount"
      | "isActive"
    >
  ) {
    const taskId = taskData.id || crypto.randomUUID();
    logger.info("Creating new task", {
      taskId,
      name: taskData.name,
      sourceLanguage: taskData.settings.sourceLanguage,
      targetLanguage: taskData.settings.targetLanguage,
    });

    const newTask: ManagedTask = {
      ...taskData,
      id: taskId,
      createdAt: new Date(),
      updatedAt: new Date(),
      currentStep: "download",
      stepProgress: {
        video_info: {
          step: "video_info",
          status: "success",
          lastUpdated: new Date(),
        },
        download: {
          step: "download",
          status: "pending",
          lastUpdated: new Date(),
        },
        transcribe: {
          step: "transcribe",
          status: "pending",
          lastUpdated: new Date(),
        },
        translate: {
          step: "translate",
          status: "pending",
          lastUpdated: new Date(),
        },
        burn: {
          step: "burn",
          status: "pending",
          lastUpdated: new Date(),
        },
      },
      retryCount: {
        video_info: 0,
        download: 0,
        transcribe: 0,
        translate: 0,
        burn: 0,
      },
      status: "processing",
    };

    await db.tasks.add(newTask);
    logger.info("Task created successfully", {
      taskId,
      initialStep: "download",
      status: "processing",
    });

    await this.startStep(taskId, "download");
  }

  /**
   * Pause task
   */
  async pauseTask(taskId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    await this.updateTaskState(
      taskId,
      {
        status: "pending",
        stepProgress: {
          ...task.stepProgress,
          [task.currentStep]: {
            ...task.stepProgress[task.currentStep],
            status: "pending",
            lastUpdated: new Date(),
          },
        },
      },
      {
        shouldStopPolling: true,
      }
    );
  }

  /**
   * Resume task
   */
  async resumeTask(taskId: string) {
    const task = await db.tasks.get(taskId);
    if (!task) return;

    const updates: Partial<ManagedTask> = {
      status: "processing",
      lastError: undefined,
    };

    if (task.stepProgress[task.currentStep].status === "fail") {
      Object.assign(updates, {
        stepProgress: {
          ...task.stepProgress,
          [task.currentStep]: {
            ...task.stepProgress[task.currentStep],
            status: "pending",
            error: undefined,
            lastUpdated: new Date(),
            result: null,
            serverTaskId: null,
          },
        },
        retryCount: {
          ...task.retryCount,
          [task.currentStep]: 0,
        },
      });
      await this.updateTaskState(taskId, updates, {
        shouldStartStep: task.currentStep,
      });
    } else {
      await this.updateTaskState(taskId, updates, {
        shouldStartPolling: true,
      });
    }
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string) {
    await this.updateTaskState(
      taskId,
      {
        status: "failed",
        lastError: "Task cancelled by user",
      },
      {
        shouldStopPolling: true,
      }
    );
  }
}
