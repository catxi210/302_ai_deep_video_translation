import { useState, useCallback, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow, format } from "date-fns";
import { zhCN, enUS, ja } from "date-fns/locale";
import {
  ChevronUp,
  ChevronDown,
  VideoIcon,
  Trash2,
  Pause,
  Play,
  X,
  Download,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProxyImage } from "@/hooks/use-proxy-image";
import { calculateDuration } from "@/utils/video-format";
import { GloablTaskStatus } from "@/stores";
import { ManagedTask, TaskStep } from "@/types/task-manager";
import { assColorToCss } from "@/utils/color";
import { useMonitorMessage } from "@/hooks/global/use-monitor-message";
import { toast } from "sonner";

interface TaskItemProps {
  task: ManagedTask;
  onDelete: () => void;
  onView: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  isActive: boolean;
}

const getLocale = (locale: string) => {
  switch (locale) {
    case "zh":
      return zhCN;
    case "en":
      return enUS;
    case "ja":
      return ja;
    default:
      return enUS;
  }
};

export const TaskItem = ({
  task,
  onDelete,
  onView,
  onPause,
  onResume,
  onCancel,
  isActive,
}: TaskItemProps) => {
  const t = useTranslations();
  const locale = useLocale();
  const [isExpanded, setIsExpanded] = useState(false);
  const { getProxyUrl } = useProxyImage();
  const [imageError, setImageError] = useState(false);
  const { handleDownload } = useMonitorMessage();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const formattedCreatedAt = useMemo(
    () =>
      task.createdAt
        ? formatDistanceToNow(task.createdAt, {
            addSuffix: true,
            locale: getLocale(locale),
          })
        : "--",
    [task.createdAt, locale]
  );

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

  const formatBytes = (bytes: number) => {
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)}${units[unitIndex]}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return t("task.download.time_seconds", { seconds: Math.ceil(seconds) });
    } else if (seconds < 3600) {
      const minutes = Math.ceil(seconds / 60);
      return t("task.download.time_minutes", { minutes });
    } else {
      const hours = Math.ceil(seconds / 3600);
      return t("task.download.time_hours", { hours });
    }
  };

  const handleDownloadClick = async (videoUrl: string, fileName: string) => {
    if (isDownloading) return;
    setIsDownloading(true);

    const toastId = toast.loading(t("task.download.starting"), {
      description: t("task.download.preparing"),
    });

    try {
      const result = await handleDownload(videoUrl, fileName, (info) => {
        const percentage = Math.round(info.progress);
        const speed = formatBytes(info.speed);
        const timeLeft = formatTime(info.remainingTime);

        toast.loading(t("task.download.downloading"), {
          id: toastId,
          description: t("task.download.progress_info", {
            percentage,
            speed,
            timeLeft,
          }),
        });
      });

      if (result.success) {
        toast.success(t("task.download.success"), {
          id: toastId,
          description: fileName,
        });
      } else {
        toast.error(t("task.download.failed"), {
          id: toastId,
          description: result.error,
        });
      }
    } catch (error) {
      toast.error(t("task.download.failed"), {
        id: toastId,
        description:
          error instanceof Error
            ? error.message
            : t("task.download.unknown_error"),
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="group relative flex flex-col gap-2 rounded-lg border bg-card p-3 text-card-foreground transition-colors @container hover:bg-accent/50">
        {/* Task title and status */}
        <div
          className="flex cursor-pointer flex-col gap-2 @[420px]:flex-row @[420px]:items-center @[420px]:justify-between"
          onClick={(e) => {
            // Prevent triggering navigation when clicking buttons
            if (!(e.target as HTMLElement).closest("button")) {
              onView();
            }
          }}
        >
          <div className="flex flex-1 items-center gap-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="size-6 shrink-0">
                {isExpanded ? (
                  <ChevronUp className="size-3.5" />
                ) : (
                  <ChevronDown className="size-3.5" />
                )}
              </Button>
            </CollapsibleTrigger>
            <div className="relative aspect-video w-24 shrink-0 overflow-hidden rounded border bg-muted">
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
                  <VideoIcon className="size-4 text-muted-foreground" />
                </div>
              )}
              <div className="absolute bottom-0.5 right-0.5 rounded bg-black/60 px-1 text-[10px] text-white">
                {formatDuration(task.duration)}
              </div>
            </div>
            <span className="line-clamp-1 flex-1 text-sm font-medium">
              {task.name || t("task.unnamed_task")}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2 @[420px]:justify-end">
            {getStatusBadge(task.status)}
          </div>
        </div>

        {/* Basic information */}
        <div className="flex flex-col gap-2 text-xs text-muted-foreground @[420px]:flex-row @[420px]:items-center @[420px]:gap-4">
          <div className="flex items-center gap-1">
            <span>{t("task.languages")}:</span>
            <span>
              {t(`form.fields.language.${task.settings.sourceLanguage}`)} →{" "}
              {t(`form.fields.language.${task.settings.targetLanguage}`)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span>
              {t(`task.step.${task.currentStep}`)} -{" "}
              {t(`task.status.${task.stepProgress[task.currentStep].status}`)}
            </span>
          </div>
          <span className="@[420px]:ml-auto">{formattedCreatedAt}</span>
        </div>

        {/* Progress bar */}
        {task.status === "processing" && (
          <>
            <Progress value={getStepProgress()} className="h-1" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{t(`task.step.${task.currentStep}`)}</span>
              <span>
                {t(`task.status.${task.stepProgress[task.currentStep].status}`)}
              </span>
            </div>
          </>
        )}

        {/* Expanded details */}
        <CollapsibleContent>
          <div className="mt-2 space-y-2 border-t pt-2 text-xs">
            <div className="grid grid-cols-1 gap-2 @[420px]:grid-cols-2">
              <div>
                <div className="text-muted-foreground">
                  {t("task.created_at")}
                </div>
                <div>
                  {task.createdAt
                    ? format(task.createdAt, "yyyy-MM-dd HH:mm:ss")
                    : "--"}
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">
                  {t("task.updated_at")}
                </div>
                <div>
                  {task.updatedAt
                    ? format(task.updatedAt, "yyyy-MM-dd HH:mm:ss")
                    : "--"}
                </div>
              </div>
            </div>

            <div>
              <div className="text-muted-foreground">{t("task.settings")}</div>
              <div className="grid grid-cols-1 gap-2 @[420px]:grid-cols-2">
                <div className="flex items-center gap-1">
                  <span>{t("form.fields.voiceSeparation.label")}:</span>
                  <span>
                    {task.settings.voiceSeparation
                      ? t("common.enabled")
                      : t("common.disabled")}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{t("form.fields.subtitleLayout.label")}:</span>
                  <span>
                    {t(
                      `form.fields.subtitleLayout.${task.settings.subtitleLayout}`
                    )}
                  </span>
                </div>
              </div>
            </div>

            {task.lastError && (
              <div>
                <div className="text-muted-foreground">{t("task.error")}</div>
                <div className="text-destructive">{task.lastError}</div>
              </div>
            )}
          </div>
        </CollapsibleContent>

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            {isActive ? (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      onClick={onPause}
                    >
                      <Pause className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("task.pause")}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive hover:text-destructive"
                      onClick={onCancel}
                    >
                      <X className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("task.cancel")}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                {task.status === "completed" &&
                  task.stepProgress.burn?.result?.video_url && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-6"
                          disabled={isDownloading}
                          onClick={() => {
                            const videoUrl =
                              task.stepProgress.burn.result.video_url;
                            const fileName = `${task.name || "video"}.mp4`;
                            handleDownloadClick(videoUrl, fileName);
                          }}
                        >
                          <Download
                            className={
                              isDownloading
                                ? "size-3.5 animate-bounce"
                                : "size-3.5"
                            }
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("task.download_video")}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                {(task.status === "pending" || task.status === "failed") && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-6"
                        onClick={onResume}
                      >
                        <Play className="size-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t("task.resume")}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-destructive hover:text-destructive"
                      onClick={onDelete}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t("task.delete")}</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
          </TooltipProvider>
        </div>
      </div>
    </Collapsible>
  );
};
