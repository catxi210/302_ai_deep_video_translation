"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db";
import { ManagedTask } from "@/types/task-manager";
import { TaskHeader } from "@/components/task/task-header";
import { TaskBasicInfo } from "@/components/task/task-basic-info";
import { TaskStepDetails } from "@/components/task/task-step-details";
import { TaskFormatInfo } from "@/components/task/task-format-info";
import { TaskStyleInfo } from "@/components/task/task-style-info";
import { createScopedLogger } from "@/utils";

const logger = createScopedLogger("task-detail");

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = params.id as string;
  const t = useTranslations();

  const task = useLiveQuery(
    async () => {
      try {
        return await db.tasks.get(taskId);
      } catch (error) {
        logger.error("Error loading task:", error);
        return null;
      }
    },
    [taskId],
    null
  ) as ManagedTask | null | undefined;

  const loading = task === undefined;

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t("task.loading")}</h2>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t("task.no_tasks")}</h2>
          <TaskHeader />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto h-full overflow-y-auto bg-background p-6">
      <TaskHeader />

      <div className="space-y-6">
        <TaskBasicInfo task={task} />
        {task.settings.selectedFormat && <TaskFormatInfo task={task} />}
        <TaskStyleInfo task={task} />
        <TaskStepDetails task={task} taskId={taskId} />
      </div>
    </div>
  );
}
