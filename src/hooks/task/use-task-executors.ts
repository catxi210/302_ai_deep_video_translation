import { useVideoInfo } from "@/hooks/swr/use-video-info";
import { useVideoDownload } from "@/hooks/swr/use-video-download";
import { useSubtitleExtract } from "@/hooks/swr/use-subtitle-extract";
import { useSubtitleTranslate } from "@/hooks/swr/use-subtitle-translate";
import { useSubtitleBurn } from "@/hooks/swr/use-subtitle-burn";
import { getTaskStatus } from "@/hooks/swr/use-task-status";
import { TaskExecutors } from "@/lib/task-manager";
import { useMemo } from "react";
import { TaskResult } from "@/hooks/swr/use-task-status";
import { db } from "@/db";
import { appConfigAtom, store } from "@/stores";

export function useTaskExecutors(): TaskExecutors {
  const videoInfo = useVideoInfo();
  const videoDownload = useVideoDownload();
  const subtitleExtract = useSubtitleExtract();
  const subtitleTranslate = useSubtitleTranslate();
  const subtitleBurn = useSubtitleBurn();

  return useMemo(
    () => ({
      getVideoInfo: async (taskId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task?.videoUrl) return;
        await videoInfo.trigger({ videoUrl: task.videoUrl });
      },
      startDownload: async (taskId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task || !task.videoUrl) return;
        const result = await videoDownload.startDownload({
          url: task.videoUrl,
          resolution: task.settings.selectedFormat?.height || undefined,
        });
        if (result?.task_id) {
          await db.tasks.update(taskId, {
            stepProgress: {
              ...task.stepProgress,
              download: {
                ...task.stepProgress.download,
                serverTaskId: result.task_id,
              },
            },
          });
        }
      },
      startExtract: async (taskId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;
        const downloadResult = task.stepProgress.download.result;
        if (!downloadResult) return;
        const result = await subtitleExtract.startExtract({
          audio_url: downloadResult.audio_url,
          language: task.settings.sourceLanguage,
          demucs: task.settings.voiceSeparation,
        });
        if (result?.task_id) {
          await db.tasks.update(taskId, {
            stepProgress: {
              ...task.stepProgress,
              transcribe: {
                ...task.stepProgress.transcribe,
                serverTaskId: result.task_id,
              },
            },
          });
        }
      },
      startTranslate: async (taskId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;
        const transcribeResult = task.stepProgress.transcribe.result;
        if (!transcribeResult) return;
        const { modelName } = store.get(appConfigAtom);
        const result = await subtitleTranslate.startTranslate({
          model: modelName || "claude-3-5-sonnet-20240620",
          src_lang: task.settings.sourceLanguage,
          tgt_lang: task.settings.targetLanguage,
          subtitle: {
            segments: transcribeResult.subtitle.segments,
          },
        });
        if (result?.task_id) {
          await db.tasks.update(taskId, {
            stepProgress: {
              ...task.stepProgress,
              translate: {
                ...task.stepProgress.translate,
                serverTaskId: result.task_id,
              },
            },
          });
        }
      },
      startBurn: async (taskId: string) => {
        const task = await db.tasks.get(taskId);
        if (!task) return;
        const downloadResult = task.stepProgress.download.result;
        const translateResult = task.stepProgress.translate.result;
        if (!downloadResult || !translateResult) return;

        // Build burn parameters
        const burnParams: any = {
          url: downloadResult.video_url,
          src_subtitle: [],
          trans_subtitle: translateResult.trans_subtitle,
          trans_font_name: task.settings.subtitleStyle.secondaryFontFamily,
          trans_font_size: task.settings.subtitleStyle.secondaryFontSize,
          trans_font_color: task.settings.subtitleStyle.secondaryColor,
          trans_outline_color: task.settings.subtitleStyle.secondaryStrokeColor,
          trans_outline_width: task.settings.subtitleStyle.secondaryStrokeWidth,
          trans_back_color: task.settings.subtitleStyle.showSecondaryBackground
            ? task.settings.subtitleStyle.secondaryBackgroundColor
            : undefined,
          trans_margin_v: task.settings.subtitleStyle.secondaryMarginV,
          output_width: task.settings.selectedFormat?.width || undefined,
          output_height: task.settings.selectedFormat?.height || undefined,
        };

        // Only add source subtitle parameters in double line mode
        if (task.settings.subtitleLayout === "double") {
          burnParams.src_subtitle = translateResult.src_subtitle;
          burnParams.src_font_name = task.settings.subtitleStyle.fontFamily;
          burnParams.src_font_size = task.settings.subtitleStyle.fontSize;
          burnParams.src_font_color = task.settings.subtitleStyle.primaryColor;
          burnParams.src_outline_width =
            task.settings.subtitleStyle.primaryStrokeWidth;
          burnParams.src_shadow_color = task.settings.subtitleStyle.shadowColor;
          burnParams.src_margin_v = task.settings.subtitleStyle.primaryMarginV;
          burnParams.src_back_color = task.settings.subtitleStyle
            .showPrimaryBackground
            ? task.settings.subtitleStyle.primaryBackgroundColor
            : undefined;
        }

        const result = await subtitleBurn.startBurn(burnParams);
        if (result?.task_id) {
          await db.tasks.update(taskId, {
            stepProgress: {
              ...task.stepProgress,
              burn: {
                ...task.stepProgress.burn,
                serverTaskId: result.task_id,
              },
            },
          });
        }
      },
      getTaskStatus: async (
        taskId: string
      ): Promise<TaskResult<any> | null> => {
        const task = await db.tasks.get(taskId);
        if (!task) return null;
        const serverTaskId = task.stepProgress[task.currentStep].serverTaskId;
        if (!serverTaskId) return null;
        const result = await getTaskStatus(serverTaskId);
        return result || null;
      },
    }),
    [videoInfo, videoDownload, subtitleExtract, subtitleTranslate, subtitleBurn]
  );
}
