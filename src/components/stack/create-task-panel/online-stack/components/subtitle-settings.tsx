import { Type, AlignCenter, Baseline, Droplets, Square } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubtitleLayout, SubtitleStyle } from "@/stores/slices/current_task";
import { ColorPicker } from "./ui/color-picker";
import { StyleSlider } from "./ui/style-slider";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye } from "lucide-react";

interface SubtitleSettingsProps {
  subtitleStyle: SubtitleStyle;
  subtitleLayout: SubtitleLayout;
  showSubtitle: boolean;
  onStyleChange: (style: Partial<SubtitleStyle>) => void;
  onLayoutChange: (layout: SubtitleLayout) => void;
  onShowSubtitleChange: (show: boolean) => void;
}

const SettingGroup = ({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: React.ComponentType<any>;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground">{title}</span>
    </div>
    <div className="space-y-2">{children}</div>
  </div>
);

const TextStyleSection = ({
  color,
  strokeColor,
  strokeWidth,
  fontSize,
  fontFamily,
  marginV,
  onStyleChange,
  textColorLabel,
  strokeColorLabel,
  strokeWidthLabel,
  fontSizeLabel,
  marginVLabel,
  isSecondary = false,
  showShadow,
  showStroke,
  showBackground,
  backgroundColor,
}: {
  color: string;
  strokeColor: string;
  strokeWidth: number;
  fontSize: number;
  fontFamily: string;
  marginV: number;
  onStyleChange: (style: Partial<SubtitleStyle>) => void;
  textColorLabel: string;
  strokeColorLabel: string;
  strokeWidthLabel: string;
  fontSizeLabel: string;
  marginVLabel: string;
  isSecondary?: boolean;
  showShadow: boolean;
  showStroke: boolean;
  showBackground?: boolean;
  backgroundColor?: string;
}) => {
  const t = useTranslations();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <ColorPicker
          label={textColorLabel}
          value={color}
          onChange={(value) =>
            onStyleChange(
              isSecondary ? { secondaryColor: value } : { primaryColor: value }
            )
          }
        />
        <ColorPicker
          label={strokeColorLabel}
          value={strokeColor}
          onChange={(value) =>
            onStyleChange(
              isSecondary
                ? { secondaryStrokeColor: value }
                : { shadowColor: value }
            )
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <StyleSlider
          label={strokeWidthLabel}
          value={strokeWidth}
          onChange={(value) =>
            onStyleChange(
              isSecondary
                ? { secondaryStrokeWidth: value }
                : { primaryStrokeWidth: value }
            )
          }
          min={0}
          max={5}
          step={0.5}
        />
        <StyleSlider
          label={fontSizeLabel}
          value={fontSize}
          onChange={(value) =>
            onStyleChange(
              isSecondary ? { secondaryFontSize: value } : { fontSize: value }
            )
          }
          min={12}
          max={48}
        />
      </div>
      <div className="grid grid-cols-1 gap-2">
        <StyleSlider
          label={marginVLabel}
          value={marginV}
          onChange={(value) =>
            onStyleChange(
              isSecondary
                ? { secondaryMarginV: value }
                : { primaryMarginV: value }
            )
          }
          min={0}
          max={100}
          step={1}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center justify-between rounded-md border bg-card/50 px-2 py-1">
          <div className="flex items-center gap-1.5">
            <Droplets className="size-3.5 text-muted-foreground" />
            <Label className="text-[0.7rem] text-muted-foreground">
              {t("form.fields.subtitleStyle.showShadow")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[0.7rem] text-muted-foreground">
              {showShadow ? t("common.show") : t("common.hide")}
            </Label>
            <Switch
              checked={showShadow}
              onCheckedChange={(checked) =>
                onStyleChange(
                  isSecondary
                    ? { showSecondaryShadow: checked }
                    : { showPrimaryShadow: checked }
                )
              }
            />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-md border bg-card/50 px-2 py-1">
          <div className="flex items-center gap-1.5">
            <Square className="size-3.5 text-muted-foreground" />
            <Label className="text-[0.7rem] text-muted-foreground">
              {t("form.fields.subtitleStyle.showStroke")}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[0.7rem] text-muted-foreground">
              {showStroke ? t("common.show") : t("common.hide")}
            </Label>
            <Switch
              checked={showStroke}
              onCheckedChange={(checked) =>
                onStyleChange(
                  isSecondary
                    ? { showSecondaryStroke: checked }
                    : { showPrimaryStroke: checked }
                )
              }
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-md border bg-card/50 px-2 py-1">
        <div className="flex items-center gap-1.5">
          <Square className="size-3.5 fill-muted-foreground text-muted-foreground" />
          <Label className="text-[0.7rem] text-muted-foreground">
            {t("form.fields.subtitleStyle.showBackground")}
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <Label className="text-[0.7rem] text-muted-foreground">
            {showBackground ? t("common.show") : t("common.hide")}
          </Label>
          <Switch
            checked={showBackground}
            onCheckedChange={(checked) =>
              onStyleChange(
                isSecondary
                  ? { showSecondaryBackground: checked }
                  : { showPrimaryBackground: checked }
              )
            }
          />
        </div>
      </div>
      {showBackground && (
        <ColorPicker
          label={t("form.fields.subtitleStyle.backgroundColor")}
          value={backgroundColor}
          onChange={(value) =>
            onStyleChange(
              isSecondary
                ? { secondaryBackgroundColor: value }
                : { primaryBackgroundColor: value }
            )
          }
        />
      )}
    </div>
  );
};

export const SubtitleSettings = ({
  subtitleStyle,
  subtitleLayout,
  showSubtitle,
  onStyleChange,
  onLayoutChange,
  onShowSubtitleChange,
}: SubtitleSettingsProps) => {
  const t = useTranslations();

  return (
    <SettingGroup title={t("form.fields.subtitleLayout.label")} icon={Type}>
      <div className="space-y-3">
        {/* Subtitle preview toggle */}
        <div className="flex items-center justify-between rounded-md border bg-card/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Eye className="size-3.5 text-muted-foreground" />
            <span className="text-xs">
              {t("form.fields.subtitleStyle.preview")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[0.7rem] text-muted-foreground">
              {showSubtitle ? t("common.show") : t("common.hide")}
            </Label>
            <Switch
              checked={showSubtitle}
              onCheckedChange={onShowSubtitleChange}
            />
          </div>
        </div>

        {/* Layout selection */}
        <Select value={subtitleLayout} onValueChange={onLayoutChange}>
          <SelectTrigger className="h-7 text-xs">
            <SelectValue
              placeholder={t("form.fields.subtitleLayout.placeholder")}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single" className="text-xs">
              {t("form.fields.subtitleLayout.single")}
            </SelectItem>
            <SelectItem value="double" className="text-xs">
              {t("form.fields.subtitleLayout.double")}
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Secondary subtitle style */}
        <SettingGroup
          title={t("form.fields.subtitleStyle.secondary")}
          icon={Baseline}
          className="rounded-lg border bg-card/50 p-3"
        >
          <TextStyleSection
            color={subtitleStyle.secondaryColor}
            strokeColor={subtitleStyle.secondaryStrokeColor}
            strokeWidth={subtitleStyle.secondaryStrokeWidth}
            fontSize={subtitleStyle.secondaryFontSize}
            fontFamily={subtitleStyle.secondaryFontFamily}
            marginV={subtitleStyle.secondaryMarginV}
            onStyleChange={onStyleChange}
            textColorLabel={t("form.fields.subtitleStyle.textColor")}
            strokeColorLabel={t("form.fields.subtitleStyle.strokeColor")}
            strokeWidthLabel={t("form.fields.subtitleStyle.strokeWidth")}
            fontSizeLabel={t("form.fields.subtitleStyle.fontSize")}
            marginVLabel={t("form.fields.subtitleStyle.marginV")}
            isSecondary
            showShadow={subtitleStyle.showSecondaryShadow}
            showStroke={subtitleStyle.showSecondaryStroke}
            showBackground={subtitleStyle.showSecondaryBackground}
            backgroundColor={subtitleStyle.secondaryBackgroundColor}
          />
        </SettingGroup>

        {/* Primary subtitle style - only shown in double layout mode */}
        {subtitleLayout === "double" && (
          <SettingGroup
            title={t("form.fields.subtitleStyle.primary")}
            icon={AlignCenter}
            className="rounded-lg border bg-card/50 p-3"
          >
            <TextStyleSection
              color={subtitleStyle.primaryColor}
              strokeColor={subtitleStyle.shadowColor}
              strokeWidth={subtitleStyle.primaryStrokeWidth}
              fontSize={subtitleStyle.fontSize}
              fontFamily={subtitleStyle.fontFamily}
              marginV={subtitleStyle.primaryMarginV}
              onStyleChange={onStyleChange}
              textColorLabel={t("form.fields.subtitleStyle.textColor")}
              strokeColorLabel={t("form.fields.subtitleStyle.strokeColor")}
              strokeWidthLabel={t("form.fields.subtitleStyle.strokeWidth")}
              fontSizeLabel={t("form.fields.subtitleStyle.fontSize")}
              marginVLabel={t("form.fields.subtitleStyle.marginV")}
              showShadow={subtitleStyle.showPrimaryShadow}
              showStroke={subtitleStyle.showPrimaryStroke}
              showBackground={subtitleStyle.showPrimaryBackground}
              backgroundColor={subtitleStyle.primaryBackgroundColor}
            />
          </SettingGroup>
        )}
      </div>
    </SettingGroup>
  );
};
