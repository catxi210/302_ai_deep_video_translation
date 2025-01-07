"use client";

import { useTranslations } from "next-intl";
import { ManagedTask } from "@/types/task-manager";

interface TaskFormatInfoProps {
  task: ManagedTask;
}

export function TaskFormatInfo({ task }: TaskFormatInfoProps) {
  const t = useTranslations();

  if (!task.settings.selectedFormat) return null;

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">{t("form.fields.formats")}</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.resolution")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.width}x
              {task.settings.selectedFormat.height}
              {task.settings.selectedFormat.formatNote &&
                ` (${task.settings.selectedFormat.formatNote})`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.fps")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.fps || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.format_id")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.formatId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.ext")}
            </span>
            <span className="text-sm">{task.settings.selectedFormat.ext}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.video_codec")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.vcodec || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.audio_codec")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.acodec || "--"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.filesize")}
            </span>
            <span className="text-sm">
              {task.settings.selectedFormat.filesize
                ? `${(task.settings.selectedFormat.filesize / 1024 / 1024).toFixed(2)} MB`
                : task.settings.selectedFormat.filesizeApprox
                  ? `~${(task.settings.selectedFormat.filesizeApprox / 1024 / 1024).toFixed(2)} MB`
                  : "--"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
