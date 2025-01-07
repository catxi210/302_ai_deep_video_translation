"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  useTaskHistory,
  TaskFilter,
  TaskSort,
} from "@/hooks/dexie/use-task-history";
import { useTaskManager } from "@/hooks/task/use-task-manager";
import { PanelHeader } from "./task-history/panel-header";
import { SearchFilter } from "./task-history/search-filter";
import { TaskList } from "./task-history/task-list";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TaskHistoryPanelProps {
  className?: string;
}

export const TaskHistoryPanel = ({ className }: TaskHistoryPanelProps) => {
  const router = useRouter();
  const t = useTranslations();
  const [filter, setFilter] = useState<TaskFilter>({});
  const [sort, setSort] = useState<TaskSort>({
    field: "createdAt",
    direction: "desc",
  });
  const [taskToCancel, setTaskToCancel] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { tasks, deleteTask } = useTaskHistory(filter, sort);
  const { pauseTask, resumeTask, cancelTask, isTaskActive } = useTaskManager();

  const handleFilterChange = useCallback((newFilter: TaskFilter) => {
    setFilter(newFilter);
  }, []);

  const handleSortChange = useCallback((newSort: TaskSort) => {
    setSort(newSort);
  }, []);

  const handleViewTask = useCallback(
    (taskId: string) => {
      router.push(`/task/${taskId}`);
    },
    [router]
  );

  const handlePauseTask = useCallback(
    async (taskId: string) => {
      try {
        await pauseTask(taskId);
        toast.success(t("task.pause"), {
          description: t("task.step_complete_desc", {
            taskId,
            step: t("task.pause"),
          }),
        });
      } catch (error) {
        toast.error(t("task.failed"), {
          description:
            error instanceof Error
              ? error.message
              : t("global.error.unknown_error"),
        });
      }
    },
    [pauseTask, t]
  );

  const handleResumeTask = useCallback(
    async (taskId: string) => {
      try {
        await resumeTask(taskId);
        toast.success(t("task.resume"), {
          description: t("task.step_complete_desc", {
            taskId,
            step: t("task.resume"),
          }),
        });
      } catch (error) {
        toast.error(t("task.failed"), {
          description:
            error instanceof Error
              ? error.message
              : t("global.error.unknown_error"),
        });
      }
    },
    [resumeTask, t]
  );

  const handleCancelTask = useCallback(async (taskId: string) => {
    setTaskToCancel(taskId);
  }, []);

  const handleConfirmCancel = useCallback(
    async (taskId: string) => {
      try {
        await cancelTask(taskId);
        toast.success(t("task.cancel_success"), {
          description: t("task.step_complete_desc", {
            taskId,
            step: t("task.cancel"),
          }),
        });
      } catch (error) {
        toast.error(t("task.failed"), {
          description:
            error instanceof Error
              ? error.message
              : t("global.error.unknown_error"),
        });
      } finally {
        setTaskToCancel(null);
      }
    },
    [cancelTask, t]
  );

  const handleDeleteTask = useCallback(async (taskId: string) => {
    setTaskToDelete(taskId);
  }, []);

  const handleConfirmDelete = useCallback(
    async (taskId: string) => {
      try {
        if (isTaskActive(taskId)) {
          await cancelTask(taskId);
        }
        await deleteTask(taskId);
        toast.success(t("task.delete_success"), {
          description: t("task.step_complete_desc", {
            taskId,
            step: t("task.delete"),
          }),
        });
      } catch (error) {
        toast.error(t("task.failed"), {
          description:
            error instanceof Error
              ? error.message
              : t("global.error.unknown_error"),
        });
      } finally {
        setTaskToDelete(null);
      }
    },
    [isTaskActive, cancelTask, deleteTask, t]
  );

  const isFiltered = useMemo(() => {
    return Object.keys(filter).length > 0;
  }, [filter]);

  return (
    <>
      <div className={cn("flex size-full flex-col", className)}>
        <PanelHeader />
        <SearchFilter
          onFilterChange={handleFilterChange}
          onSortChange={handleSortChange}
        />
        <TaskList
          tasks={tasks}
          onDeleteTask={handleDeleteTask}
          onViewTask={handleViewTask}
          onPauseTask={handlePauseTask}
          onResumeTask={handleResumeTask}
          onCancelTask={handleCancelTask}
          isTaskActive={isTaskActive}
          isFiltered={isFiltered}
        />
      </div>

      <AlertDialog
        open={!!taskToCancel}
        onOpenChange={() => setTaskToCancel(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.cancel")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.cancel_warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("global.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToCancel && handleConfirmCancel(taskToCancel)}
            >
              {t("global.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={() => setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("task.delete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("task.delete_warning")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("global.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => taskToDelete && handleConfirmDelete(taskToDelete)}
            >
              {t("global.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
