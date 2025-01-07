"use client";

import { Badge } from "@/components/ui/badge";
import { ManagedTask, TaskStep } from "@/types/task-manager";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { TaskStepPreview } from "./task-step-preview";
import { TaskStatus } from "@/stores/slices/current_task";
import { useCallback } from "react";

interface TaskStepDetailsProps {
  task: ManagedTask;
  taskId: string;
}

export function TaskStepDetails({ task, taskId }: TaskStepDetailsProps) {
  const t = useTranslations();

  const getStatusBadge = useCallback(
    (status: TaskStatus) => {
      switch (status) {
        case "queue":
          return <Badge variant="secondary">{t("task.status.queue")}</Badge>;
        case "processing":
          return <Badge variant="default">{t("task.status.processing")}</Badge>;
        case "success":
          return (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-500/90"
            >
              {t("task.status.success")}
            </Badge>
          );
        case "fail":
          return <Badge variant="destructive">{t("task.status.fail")}</Badge>;
        default:
          return null;
      }
    },
    [t]
  );

  const steps: TaskStep[] = ["download", "transcribe", "translate", "burn"];

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-xl font-semibold">{t("task.step.details")}</h2>
      <div className="space-y-4">
        {steps.map((step) => {
          const progress = task.stepProgress[step];
          const isCurrentStep = task.currentStep === step;
          return (
            <div key={step} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="font-medium">{t(`task.step.${step}`)}</div>
                  {isCurrentStep && (
                    <Badge variant="outline">{t("task.current_step")}</Badge>
                  )}
                </div>
                {getStatusBadge(progress.status)}
              </div>

              {/* Step Details */}
              {progress.status === "success" && progress.result && (
                <TaskStepPreview
                  step={step}
                  progress={progress}
                  task={task}
                  taskId={taskId}
                />
              )}

              {/* Error Message */}
              {progress.error && (
                <div className="mt-2 text-sm text-destructive">
                  {progress.error}
                </div>
              )}

              {/* Update Time */}
              <div className="mt-2 text-sm text-muted-foreground">
                {t("task.updated_at")}:{" "}
                {progress.lastUpdated
                  ? format(progress.lastUpdated, "yyyy-MM-dd HH:mm:ss")
                  : "--"}
              </div>

              {/* Server Task ID */}
              {progress.serverTaskId && (
                <div className="mt-1 text-xs text-muted-foreground">
                  {t("task.server_task_id")}: {progress.serverTaskId}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
