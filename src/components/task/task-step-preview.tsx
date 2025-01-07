"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ManagedTask } from "@/types/task-manager";
import { TaskStep } from "@/types/task-manager";
import {
  generateBilingualSRT,
  generateBilingualVTT,
  downloadSubtitle,
  generateBilingualASS,
} from "@/utils/subtitle-converter";
import { Music4, Subtitles, Type, VideoIcon } from "lucide-react";
import { ArtPlayer } from "@/components/common/art-player";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useMonitorMessage } from "@/hooks/global/use-monitor-message";
import { useState } from "react";
import { toast } from "sonner";

interface TaskStepPreviewProps {
  step: TaskStep;
  progress: any;
  task: ManagedTask;
  taskId: string;
}

export function TaskStepPreview({
  step,
  progress,
  task,
  taskId,
}: TaskStepPreviewProps) {
  const t = useTranslations();
  const { handleDownload } = useMonitorMessage();
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownloadClick = async (url: string, fileName: string) => {
    if (isDownloading) return;
    setIsDownloading(true);

    const toastId = toast.loading(t("task.download.starting"), {
      description: t("task.download.preparing"),
    });

    try {
      const result = await handleDownload(url, fileName, (info) => {
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

  switch (step) {
    case "video_info":
      return (
        <div className="mt-2 grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <VideoIcon className="h-4 w-4" />
                {t("task.video_info")}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("task.task_id")}
                </span>
                <span className="font-medium">{progress.result.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("task.duration")}
                </span>
                <span className="font-medium">{progress.result.duration}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {t("form.fields.formats")}
                </span>
                <span className="font-medium">
                  {progress.result.formats?.length || 0}{" "}
                  {t("form.fields.formatsAvailable")}
                </span>
              </div>
            </CardContent>
          </Card>
          {progress.result.thumbnail && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Type className="h-4 w-4" />
                  {t("task.thumbnail")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <img
                  src={progress.result.thumbnail}
                  alt={t("task.video_thumbnail")}
                  className="aspect-video w-full rounded-lg object-cover"
                />
              </CardContent>
            </Card>
          )}
        </div>
      );

    case "download":
      return (
        <div className="mt-2 space-y-3">
          {progress.result.video_url && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <VideoIcon className="h-4 w-4" />
                  {t("task.video_preview")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ArtPlayer
                  url={progress.result.video_url}
                  poster={task.thumbnail}
                  className="aspect-video w-full rounded-lg"
                />
              </CardContent>
            </Card>
          )}
          <div className="flex flex-wrap gap-2">
            {progress.result.audio_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isDownloading}
                onClick={() => {
                  const fileName = `${task.name || taskId}_audio.mp3`;
                  handleDownloadClick(progress.result.audio_url, fileName);
                }}
              >
                <Music4 className="h-4 w-4" />
                {t("task.audio_file")}
              </Button>
            )}
            {progress.result.video_url && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={isDownloading}
                onClick={() => {
                  const fileName = `${task.name || taskId}_video.mp4`;
                  handleDownloadClick(progress.result.video_url, fileName);
                }}
              >
                <VideoIcon className="h-4 w-4" />
                {t("task.video_file")}
              </Button>
            )}
          </div>
        </div>
      );

    case "transcribe":
      return (
        <div className="mt-2 space-y-3">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {progress.result.subtitle?.segments && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Subtitles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("task.segments")}
                    </div>
                    <div className="text-xl font-bold">
                      {progress.result.subtitle.segments.length}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t("task.segments")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {progress.result.subtitle.word_segments && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Type className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("task.word_segments")}
                    </div>
                    <div className="text-xl font-bold">
                      {progress.result.subtitle.word_segments.length}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t("task.words")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Subtitle preview */}
          {progress.result.subtitle?.segments && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium">
                    <Subtitles className="h-4 w-4" />
                    {t("task.subtitle_preview")}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        const content = progress.result.subtitle.segments
                          .map((segment: any) => {
                            const start = new Date(segment.start * 1000)
                              .toISOString()
                              .slice(11, 23)
                              .replace(".", ",");
                            const end = new Date(segment.end * 1000)
                              .toISOString()
                              .slice(11, 23)
                              .replace(".", ",");
                            return `${start} --> ${end}\n${segment.text}\n\n`;
                          })
                          .join("");
                        const filename = `${task?.name || taskId}_transcribed.srt`;
                        downloadSubtitle(content, filename);
                      }}
                    >
                      SRT
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7"
                      onClick={() => {
                        const content =
                          "WEBVTT\n\n" +
                          progress.result.subtitle.segments
                            .map((segment: any) => {
                              const start = new Date(segment.start * 1000)
                                .toISOString()
                                .slice(11, 23);
                              const end = new Date(segment.end * 1000)
                                .toISOString()
                                .slice(11, 23);
                              return `${start} --> ${end}\n${segment.text}\n\n`;
                            })
                            .join("");
                        const filename = `${task?.name || taskId}_transcribed.vtt`;
                        downloadSubtitle(content, filename);
                      }}
                    >
                      VTT
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] rounded-md border bg-muted/50 p-4">
                  <div className="space-y-2">
                    {progress.result.subtitle.segments
                      .slice(0, 10)
                      .map((segment: any, index: number) => (
                        <div
                          key={index}
                          className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                        >
                          <div className="text-xs text-muted-foreground">
                            {t("task.time_range", {
                              start: segment.start.toFixed(3),
                              end: segment.end.toFixed(3),
                            })}
                          </div>
                          <div className="mt-1 text-sm">{segment.text}</div>
                        </div>
                      ))}
                    {progress.result.subtitle.segments.length > 10 && (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        {t("task.more_subtitles", {
                          count: progress.result.subtitle.segments.length - 10,
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}

          {/* Word segments preview */}
          {progress.result.subtitle.word_segments && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Type className="h-4 w-4" />
                  {t("task.word_segments_preview")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[240px] rounded-md border bg-muted/50 p-4">
                  <div className="flex flex-wrap gap-2">
                    {progress.result.subtitle.word_segments
                      .slice(0, 50)
                      .map((word: any, index: number) => (
                        <div
                          key={index}
                          className={cn(
                            "rounded-md border bg-card px-2.5 py-1.5 transition-colors hover:bg-accent/50",
                            word?.score &&
                              word.score < 0.5 &&
                              "border-destructive"
                          )}
                        >
                          <div className="text-xs text-muted-foreground">
                            {t("task.time_range", {
                              start: word?.start?.toFixed(3),
                              end: word?.end?.toFixed(3),
                            })}
                          </div>
                          <div className="mt-0.5 text-sm font-medium">
                            {word?.word}
                          </div>
                          {word?.score && (
                            <div
                              className={cn(
                                "text-xs",
                                word.score < 0.5
                                  ? "text-destructive"
                                  : "text-muted-foreground"
                              )}
                            >
                              {t("task.confidence", {
                                score: (word?.score * 100).toFixed(1),
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    {progress.result.subtitle.word_segments.length > 50 && (
                      <div className="py-2 text-center text-sm text-muted-foreground">
                        {t("task.more_words", {
                          count:
                            progress.result.subtitle.word_segments.length - 50,
                        })}
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </div>
      );

    case "translate":
      return (
        <div className="mt-2 space-y-3">
          {/* Subtitle statistics */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {progress.result.src_subtitle && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Subtitles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("task.source_segments")}
                    </div>
                    <div className="text-xl font-bold">
                      {progress.result.src_subtitle.length}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t("task.segments")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            {progress.result.trans_subtitle && (
              <Card>
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Type className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("task.translated_segments")}
                    </div>
                    <div className="text-xl font-bold">
                      {progress.result.trans_subtitle.length}
                      <span className="ml-1 text-xs font-normal text-muted-foreground">
                        {t("task.segments")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Subtitle download buttons */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Subtitles className="h-4 w-4" />
                {t("task.download_subtitles")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      !progress.result.src_subtitle ||
                      !progress.result.trans_subtitle
                    )
                      return;

                    const content = generateBilingualSRT(
                      progress.result.src_subtitle,
                      progress.result.trans_subtitle
                    );

                    const filename = `${task?.name || taskId}_bilingual.srt`;
                    downloadSubtitle(content, filename);
                  }}
                >
                  {t("task.download_srt")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      !progress.result.src_subtitle ||
                      !progress.result.trans_subtitle
                    )
                      return;

                    const content = generateBilingualVTT(
                      progress.result.src_subtitle,
                      progress.result.trans_subtitle
                    );

                    const filename = `${task?.name || taskId}_bilingual.vtt`;
                    downloadSubtitle(content, filename);
                  }}
                >
                  {t("task.download_vtt")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (
                      !progress.result.src_subtitle ||
                      !progress.result.trans_subtitle
                    )
                      return;

                    const content = generateBilingualASS(
                      progress.result.src_subtitle,
                      progress.result.trans_subtitle,
                      {
                        fontFamily: task.settings.subtitleStyle.fontFamily,
                        fontSize: task.settings.subtitleStyle.fontSize,
                        primaryColor: task.settings.subtitleStyle.primaryColor,
                        primaryStrokeWidth:
                          task.settings.subtitleStyle.primaryStrokeWidth,
                        secondaryBackgroundColor:
                          task.settings.subtitleStyle.secondaryBackgroundColor,
                        secondaryColor:
                          task.settings.subtitleStyle.secondaryColor,
                        secondaryFontFamily:
                          task.settings.subtitleStyle.secondaryFontFamily,
                        secondaryFontSize:
                          task.settings.subtitleStyle.secondaryFontSize,
                        secondaryStrokeColor:
                          task.settings.subtitleStyle.secondaryStrokeColor,
                        secondaryStrokeWidth:
                          task.settings.subtitleStyle.secondaryStrokeWidth,
                        shadowColor: task.settings.subtitleStyle.shadowColor,
                        showPrimaryShadow:
                          task.settings.subtitleStyle.showPrimaryShadow,
                        showPrimaryStroke:
                          task.settings.subtitleStyle.showPrimaryStroke,
                        showSecondaryBackground:
                          task.settings.subtitleStyle.showSecondaryBackground,
                        showSecondaryShadow:
                          task.settings.subtitleStyle.showSecondaryShadow,
                        showSecondaryStroke:
                          task.settings.subtitleStyle.showSecondaryStroke,
                      },
                      {
                        width: task.settings.selectedFormat?.width || 1920,
                        height: task.settings.selectedFormat?.height || 1080,
                      }
                    );

                    const filename = `${task?.name || taskId}_bilingual.ass`;
                    downloadSubtitle(content, filename);
                  }}
                >
                  {t("task.download_ass")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Subtitle preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Subtitles className="h-4 w-4" />
                {t("task.subtitle_preview")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[240px] rounded-md border bg-muted/50 p-4">
                <div className="space-y-2">
                  {progress.result.src_subtitle
                    ?.slice(0, 10)
                    .map((sub: any, index: number) => (
                      <div
                        key={index}
                        className="rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50"
                      >
                        <div className="text-xs text-muted-foreground">
                          {t("task.time_range", {
                            start: sub.start_time,
                            end: sub.end_time,
                          })}
                        </div>
                        <div className="mt-1 grid gap-1">
                          <div className="text-sm">{sub.text}</div>
                          {progress.result.trans_subtitle?.[index] && (
                            <div className="text-sm text-primary">
                              {progress.result.trans_subtitle[index].text}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  {(progress.result.src_subtitle?.length || 0) > 10 && (
                    <div className="py-2 text-center text-sm text-muted-foreground">
                      {t("task.more_subtitles", {
                        count: (progress.result.src_subtitle?.length || 0) - 10,
                      })}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      );

    case "burn":
      return progress.result.video_url ? (
        <div className="mt-2 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <VideoIcon className="h-4 w-4" />
                {t("task.output_video")}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ArtPlayer
                url={progress.result.video_url}
                poster={task.thumbnail}
                className="aspect-video w-full rounded-lg"
              />
            </CardContent>
          </Card>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isDownloading}
            onClick={() => {
              const fileName = `${task.name || taskId}_output.mp4`;
              handleDownloadClick(progress.result.video_url, fileName);
            }}
          >
            <VideoIcon className="h-4 w-4" />
            {t("task.download_video")}
          </Button>
        </div>
      ) : null;

    default:
      return null;
  }
}
