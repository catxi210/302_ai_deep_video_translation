import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Trash2, VideoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo } from "react";
import { VideoPreview } from "../../../common/video/video-preview";
import { OnlineStackProps, VideoUrlFormData, videoUrlSchema } from "./types";
import { useVideoInfo } from "@/hooks/swr/use-video-info";
import FormGenerator from "@/components/common/form-generator";
import { FormatButton } from "./components/format-selection/format-button";
import {
  currentTaskAtom,
  resetCurrentTaskAtom,
  showPreviewSubtitleAtom,
} from "@/stores/slices/current_task";
import { useAtom, useSetAtom } from "jotai";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { getBestFormats, isYoutubeUrl } from "@/utils/video-format";
import { TaskSettings } from "./components/task-settings";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTaskHistory } from "@/hooks/dexie/use-task-history";
import { useTaskManager } from "@/hooks/task/use-task-manager";
import { toast } from "sonner";
import { createScopedLogger } from "@/utils";

const logger = createScopedLogger("online-stack");

export const OnlineStack = ({ stackRef }: OnlineStackProps) => {
  const t = useTranslations();
  const [currentTask, setCurrentTask] = useAtom(currentTaskAtom);
  const resetCurrentTask = useSetAtom(resetCurrentTaskAtom);
  const [showPreviewSubtitle, setShowPreviewSubtitle] = useAtom(
    showPreviewSubtitleAtom
  );
  const { addTask } = useTaskHistory();
  const { createTask } = useTaskManager();

  const {
    watch,
    register,
    handleSubmit,
    setValue: setValueForm,
    formState: { errors, isSubmitting },
  } = useForm<VideoUrlFormData>({
    defaultValues: { videoUrl: currentTask.videoUrl },
    resolver: zodResolver(videoUrlSchema, {
      errorMap: (issue) => ({
        message:
          issue.code === "too_small"
            ? t("form.errors.required")
            : t("form.errors.invalidVideoUrl"),
      }),
    }),
  });

  const {
    data: videoInfo,
    error,
    trigger: getVideoInfo,
    isMutating: isLoading,
  } = useVideoInfo();

  // Get the best quality formats from available formats
  const bestFormats = useMemo(() => {
    return videoInfo?.info?.formats
      ? getBestFormats(videoInfo.info.formats)
      : [];
  }, [videoInfo]);

  // Auto-select the first format when video info is loaded
  useEffect(() => {
    if (
      videoInfo?.info &&
      bestFormats.length > 0 &&
      !currentTask.settings.selectedFormat
    ) {
      setCurrentTask((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          selectedFormat: bestFormats[0],
        },
      }));
      toast.success(t("global.video.formatSelected"));
    }
  }, [
    videoInfo,
    bestFormats,
    currentTask.settings.selectedFormat,
    setCurrentTask,
    t,
  ]);

  // Handle video URL form submission
  const handleFormSubmit = useCallback(
    (data: VideoUrlFormData) => {
      setCurrentTask((prev) => ({ ...prev, videoUrl: data.videoUrl }));
      getVideoInfo({ videoUrl: data.videoUrl });
      toast.info(t("global.video.gettingInfo"));
    },
    [setCurrentTask, getVideoInfo, t]
  );

  // Handle task creation confirmation
  const handleConfirm = useCallback(async () => {
    stackRef.current?.pop();

    // For uploaded videos, use existing task info
    if (currentTask.name && currentTask.duration && currentTask.thumbnail) {
      await createTask({
        ...currentTask,
        status: "pending" as const,
        progress: 0,
      });
    } else if (currentTask.settings.selectedFormat && videoInfo?.info) {
      // For online videos, create task with fetched info
      await createTask({
        ...currentTask,
        name: videoInfo.info.title,
        duration: videoInfo.info.duration,
        thumbnail: videoInfo.info.thumbnail,
        status: "pending" as const,
        progress: 0,
      });
    }

    toast.success(t("global.video.taskCreated"));

    resetCurrentTask();
  }, [currentTask, videoInfo, stackRef, createTask, resetCurrentTask, t]);

  // Check if current task is an uploaded video
  const isUploadedVideo =
    currentTask.name && currentTask.duration && currentTask.thumbnail;

  // Handle task removal
  const handleRemove = useCallback(() => {
    resetCurrentTask();
    stackRef.current?.pop();
    toast.success(t("global.video.taskRemoved"));
  }, [resetCurrentTask, stackRef, t]);

  return (
    <div className="flex size-full flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => stackRef.current?.pop()}
          className="size-6"
        >
          <ArrowLeft className="size-3.5" />
        </Button>
        <span className="text-xs font-medium">
          {isUploadedVideo
            ? t("global.video.uploadedVideo")
            : t("global.video.onlineVideo")}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="size-6 text-destructive hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-3 p-3">
          {!isUploadedVideo && (
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="space-y-2"
            >
              <div className="flex flex-col items-end gap-2">
                <div className="w-full flex-1">
                  <FormGenerator
                    id="videoUrl"
                    inputType="input"
                    name="videoUrl"
                    errors={errors}
                    register={register}
                    setValue={setValueForm}
                    watch={watch}
                    label={t("form.fields.videoUrl.label")}
                    placeholder={t("form.fields.videoUrl.placeholder")}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="max-w-fit"
                  size="sm"
                >
                  {isSubmitting || isLoading ? (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  ) : (
                    <VideoIcon className="mr-1.5 size-3.5" />
                  )}
                  {t("form.get_video_info")}
                </Button>
              </div>

              {error?.message && (
                <p className="text-xs text-destructive">{error.message}</p>
              )}
            </form>
          )}

          {(videoInfo?.info || isUploadedVideo) && (
            <div className="space-y-3">
              <div className="grid gap-3 @container @lg:grid-cols-[2fr,1fr]">
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-lg border bg-card">
                    {isUploadedVideo ? (
                      <VideoPreview
                        thumbnail={currentTask.thumbnail!}
                        title={currentTask.name!}
                        url={currentTask.videoUrl!}
                        duration={currentTask.duration!}
                        subtitleStyle={currentTask.settings.subtitleStyle}
                        subtitleLayout={currentTask.settings.subtitleLayout}
                        showSubtitle={showPreviewSubtitle}
                        sourceLanguage={currentTask.settings.sourceLanguage}
                        targetLanguage={currentTask.settings.targetLanguage}
                      />
                    ) : videoInfo?.info ? (
                      <VideoPreview
                        thumbnail={videoInfo.info.thumbnail}
                        title={videoInfo.info.title}
                        url={
                          currentTask.videoUrl &&
                          isYoutubeUrl(currentTask.videoUrl)
                            ? currentTask.videoUrl
                            : currentTask.settings.selectedFormat?.url || ""
                        }
                        duration={videoInfo.info.duration}
                        subtitleStyle={currentTask.settings.subtitleStyle}
                        subtitleLayout={currentTask.settings.subtitleLayout}
                        showSubtitle={showPreviewSubtitle}
                        sourceLanguage={currentTask.settings.sourceLanguage}
                        targetLanguage={currentTask.settings.targetLanguage}
                      />
                    ) : null}
                  </div>

                  {!isUploadedVideo && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-medium text-muted-foreground">
                          {t("form.fields.formats")}
                        </span>
                        <span className="text-[0.7rem] text-muted-foreground">
                          {bestFormats.length}{" "}
                          {t("form.fields.formatsAvailable")}
                        </span>
                      </div>
                      <div className="grid gap-1.5 @sm:grid-cols-2">
                        {bestFormats.map((format) => (
                          <FormatButton
                            key={format.formatId}
                            format={format}
                            isSelected={
                              currentTask.settings.selectedFormat?.formatId ===
                              format.formatId
                            }
                            onSelect={() => {
                              setCurrentTask((prev) => ({
                                ...prev,
                                settings: {
                                  ...prev.settings,
                                  selectedFormat: format,
                                },
                              }));
                              toast.success(t("global.video.formatSelected"));
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border bg-card p-3">
                  <TaskSettings
                    voiceSeparation={currentTask.settings.voiceSeparation}
                    sourceLanguage={currentTask.settings.sourceLanguage}
                    targetLanguage={currentTask.settings.targetLanguage}
                    subtitleLayout={currentTask.settings.subtitleLayout}
                    subtitleStyle={currentTask.settings.subtitleStyle}
                    showSubtitle={showPreviewSubtitle}
                    onVoiceSeparationChange={(checked) => {
                      setCurrentTask((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          voiceSeparation: checked,
                        },
                      }));
                    }}
                    onSourceLanguageChange={(value) => {
                      setCurrentTask((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          sourceLanguage: value,
                        },
                      }));
                    }}
                    onTargetLanguageChange={(value) => {
                      setCurrentTask((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          targetLanguage: value,
                        },
                      }));
                    }}
                    onSubtitleLayoutChange={(value) => {
                      setCurrentTask((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          subtitleLayout: value,
                        },
                      }));
                    }}
                    onSubtitleStyleChange={(updates) => {
                      setCurrentTask((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          subtitleStyle: {
                            ...prev.settings.subtitleStyle,
                            ...updates,
                          },
                        },
                      }));
                    }}
                    onShowSubtitleChange={(show) =>
                      setShowPreviewSubtitle(show)
                    }
                  />
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleConfirm}
                disabled={
                  !isUploadedVideo && !currentTask.settings.selectedFormat
                }
                size="sm"
              >
                {t("global.video.confirmSelection")}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
