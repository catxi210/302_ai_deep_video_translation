import { useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { TaskManager } from "@/lib/task-manager";
import { activeTasksAtom } from "@/lib/task-manager";
import { CurrentTaskState } from "@/stores/slices/current_task";
import { useToast } from "../global/use-toast";
import { useTranslations } from "next-intl";
import { useTaskExecutors } from "./use-task-executors";
import { db } from "@/db";

export function useTaskManager() {
  const { toast } = useToast();
  const t = useTranslations();
  const [activeTasks, setActiveTasks] = useAtom(activeTasksAtom);
  const executors = useTaskExecutors();

  const taskManager = TaskManager.getInstance(
    {
      onStepComplete: (taskId, step) => {
        toast({
          title: t("task.step_complete"),
          description: t("task.step_complete_desc", {
            taskId,
            step: t(`task.step.${step}`),
          }),
        });
      },
      onStepFailed: (taskId, step, error) => {
        toast({
          title: t("task.step_failed"),
          description: t("task.step_failed_desc", {
            taskId,
            step: t(`task.step.${step}`),
            error,
          }),
          variant: "destructive",
        });
      },
      onTaskComplete: (taskId) => {
        toast({
          title: t("task.complete"),
          description: t("task.complete_desc", { taskId }),
        });
        setActiveTasks((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      },
      onTaskFailed: (taskId, error) => {
        toast({
          title: t("task.failed"),
          description: t("task.failed_desc", { taskId, error }),
          variant: "destructive",
        });
        setActiveTasks((prev) => {
          const next = new Set(prev);
          next.delete(taskId);
          return next;
        });
      },
    },
    executors
  );

  const createTask = useCallback(
    async (taskData: Omit<CurrentTaskState, "id">) => {
      const taskId = crypto.randomUUID();
      setActiveTasks((prev) => new Set(prev).add(taskId));

      await taskManager.createTask({ ...(taskData as any), id: taskId });
      return taskId;
    },
    [taskManager, setActiveTasks]
  );

  const pauseTask = useCallback(
    async (taskId: string) => {
      await taskManager.pauseTask(taskId);
      setActiveTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    },
    [taskManager, setActiveTasks]
  );

  const resumeTask = useCallback(
    async (taskId: string) => {
      await taskManager.resumeTask(taskId);
      setActiveTasks((prev) => new Set(prev).add(taskId));
    },
    [taskManager, setActiveTasks]
  );

  const cancelTask = useCallback(
    async (taskId: string) => {
      await taskManager.cancelTask(taskId);
      setActiveTasks((prev) => {
        const next = new Set(prev);
        next.delete(taskId);
        return next;
      });
    },
    [taskManager, setActiveTasks]
  );

  useEffect(() => {
    const initializeTasks = async () => {
      const processingTasks = await db.tasks
        .where("status")
        .equals("processing")
        .toArray();

      processingTasks.forEach((task) => {
        if (!activeTasks.has(task.id)) {
          resumeTask(task.id);
        }
      });
    };

    initializeTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    createTask,
    pauseTask,
    resumeTask,
    cancelTask,
    isTaskActive: (taskId: string) => activeTasks.has(taskId),
  };
}
