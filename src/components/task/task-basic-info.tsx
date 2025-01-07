"use client";

import { useState, useCallback, useMemo } from "react";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import Image from "next/image";
import { VideoIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useProxyImage } from "@/hooks/use-proxy-image";
import { GloablTaskStatus } from "@/stores";
import { ManagedTask, TaskStep } from "@/types/task-manager";
import { calculateDuration } from "@/utils/video-format";

interface TaskBasicInfoProps {
  task: ManagedTask;
}

export function TaskBasicInfo({ task }: TaskBasicInfoProps) {
  const t = useTranslations();
  const { getProxyUrl } = useProxyImage();
  const [imageError, setImageError] = useState(false);

  const getStatusBadge = useCallback(
    (status: GloablTaskStatus) => {
      switch (status) {
        case "pending":
          return <Badge variant="secondary">{t("task.status.pending")}</Badge>;
        case "processing":
          return <Badge variant="default">{t("task.status.processing")}</Badge>;
        case "completed":
          return (
            <Badge
              variant="default"
              className="bg-green-500 hover:bg-green-500/90"
            >
              {t("task.status.completed")}
            </Badge>
          );
        case "failed":
          return <Badge variant="destructive">{t("task.status.failed")}</Badge>;
        default:
          return null;
      }
    },
    [t]
  );

  const formatDuration = useCallback((seconds?: number) => {
    if (!seconds) return "--:--";
    const { minutes, seconds: remainingSeconds } = calculateDuration(seconds);
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }, []);

  const getStepProgress = useCallback(() => {
    const steps: TaskStep[] = ["download", "transcribe", "translate", "burn"];
    const currentIndex = steps.indexOf(task.currentStep);
    // If current step status is success, show progress of next step
    if (task.stepProgress[task.currentStep].status === "success") {
      return ((currentIndex + 1) / steps.length) * 100;
    }
    // If current step is processing, show progress of current step
    return (currentIndex / steps.length) * 100;
  }, [task.currentStep, task.stepProgress]);

  const { step, status } = useMemo(
    () => ({
      step: t(`task.step.${task.currentStep}`),
      status: t(`task.status.${task.stepProgress[task.currentStep].status}`),
    }),
    [t, task.currentStep, task.stepProgress]
  );

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden rounded border bg-muted lg:w-72">
          {task.thumbnail && !imageError ? (
            <Image
              src={getProxyUrl(task.thumbnail)}
              alt={task.name || t("task.unnamed_task")}
              layout="fill"
              objectFit="cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <VideoIcon className="size-8 text-muted-foreground" />
            </div>
          )}
          <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-1 text-sm text-white">
            {formatDuration(task.duration)}
          </div>
        </div>

        {/* Task Information */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold">
              {task.name || t("task.unnamed_task")}
            </h1>
            <span className="flex-shrink-0">{getStatusBadge(task.status)}</span>
          </div>

          <div className="grid gap-4 text-sm text-muted-foreground">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <span className="font-medium">{t("task.languages")}:</span>{" "}
                {t(`form.fields.language.${task.settings.sourceLanguage}`)} →{" "}
                {t(`form.fields.language.${task.settings.targetLanguage}`)}
              </div>
              <div>
                <span className="font-medium">{t("task.current_step")}:</span>{" "}
                {step} - {status}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <span className="font-medium">{t("task.created_at")}:</span>{" "}
                {task.createdAt
                  ? format(task.createdAt, "yyyy-MM-dd HH:mm:ss")
                  : "--"}
              </div>
              <div>
                <span className="font-medium">{t("task.updated_at")}:</span>{" "}
                {task.updatedAt
                  ? format(task.updatedAt, "yyyy-MM-dd HH:mm:ss")
                  : "--"}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <span className="font-medium">
                  {t("form.fields.voiceSeparation.label")}:
                </span>{" "}
                {task.settings.voiceSeparation
                  ? t("common.enabled")
                  : t("common.disabled")}
              </div>
              <div>
                <span className="font-medium">
                  {t("form.fields.subtitleLayout.label")}:
                </span>{" "}
                {t(
                  `form.fields.subtitleLayout.${task.settings.subtitleLayout}`
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {task.status === "processing" && (
            <div className="space-y-2">
              <div className="text-sm font-medium">
                {t("task.progress")}: {Math.round(getStepProgress())}%
              </div>
              <Progress value={getStepProgress()} className="h-2" />
            </div>
          )}

          {/* Error Message */}
          {task.lastError && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <div className="font-medium">{t("task.error")}:</div>
              <div className="mt-1">{task.lastError}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
