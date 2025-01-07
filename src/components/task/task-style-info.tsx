"use client";

import { useTranslations } from "next-intl";
import { ManagedTask } from "@/types/task-manager";
import { assColorToCss } from "@/utils/color";

interface TaskStyleInfoProps {
  task: ManagedTask;
}

export function TaskStyleInfo({ task }: TaskStyleInfoProps) {
  const t = useTranslations();

  return (
    <div className="rounded-lg border bg-card p-6">
      <h2 className="mb-4 text-lg font-semibold">
        {t("form.fields.subtitleStyle.label")}
      </h2>
      <div className="space-y-6">
        {/* Primary subtitle style */}
        <div>
          <h3 className="mb-2 font-medium">
            {t("form.fields.subtitleStyle.primary")}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.fontSize")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.fontSize}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.fontFamily")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.fontFamily}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.textColor")}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded border"
                    style={{
                      backgroundColor: assColorToCss(
                        task.settings.subtitleStyle.primaryColor
                      ),
                    }}
                  />
                  <span className="text-sm">
                    {task.settings.subtitleStyle.primaryColor}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.strokeWidth")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.primaryStrokeWidth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.showStroke")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.showPrimaryStroke
                    ? t("common.enabled")
                    : t("common.disabled")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.showShadow")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.showPrimaryShadow
                    ? t("common.enabled")
                    : t("common.disabled")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary subtitle style */}
        <div>
          <h3 className="mb-2 font-medium">
            {t("form.fields.subtitleStyle.secondary")}
          </h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.fontSize")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.secondaryFontSize}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.fontFamily")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.secondaryFontFamily}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.textColor")}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded border"
                    style={{
                      backgroundColor: assColorToCss(
                        task.settings.subtitleStyle.secondaryColor
                      ),
                    }}
                  />
                  <span className="text-sm">
                    {task.settings.subtitleStyle.secondaryColor}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.strokeWidth")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.secondaryStrokeWidth}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.strokeColor")}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded border"
                    style={{
                      backgroundColor: assColorToCss(
                        task.settings.subtitleStyle.secondaryStrokeColor
                      ),
                    }}
                  />
                  <span className="text-sm">
                    {task.settings.subtitleStyle.secondaryStrokeColor}
                  </span>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.showStroke")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.showSecondaryStroke
                    ? t("common.enabled")
                    : t("common.disabled")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.showShadow")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.showSecondaryShadow
                    ? t("common.enabled")
                    : t("common.disabled")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.showBackground")}
                </span>
                <span className="text-sm">
                  {task.settings.subtitleStyle.showSecondaryBackground
                    ? t("common.enabled")
                    : t("common.disabled")}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {t("form.fields.subtitleStyle.backgroundColor")}
                </span>
                <div className="flex items-center gap-2">
                  <div
                    className="size-4 rounded border"
                    style={{
                      backgroundColor: assColorToCss(
                        task.settings.subtitleStyle.secondaryBackgroundColor
                      ),
                    }}
                  />
                  <span className="text-sm">
                    {task.settings.subtitleStyle.secondaryBackgroundColor}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shadow settings */}
        <div>
          <h3 className="mb-2 font-medium">
            {t("form.fields.subtitleStyle.shadow")}
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {t("form.fields.subtitleStyle.shadowColor")}
            </span>
            <div className="flex items-center gap-2">
              <div
                className="size-4 rounded border"
                style={{
                  backgroundColor: assColorToCss(
                    task.settings.subtitleStyle.shadowColor
                  ),
                }}
              />
              <span className="text-sm">
                {task.settings.subtitleStyle.shadowColor}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
