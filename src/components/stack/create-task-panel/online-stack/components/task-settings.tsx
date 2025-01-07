import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { SubtitleLayout, SubtitleStyle } from "@/stores/slices/current_task";
import { Languages, Volume2, ArrowRight, Settings2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { SubtitleSettings } from "./subtitle-settings";
import { cn } from "@/lib/utils";

interface TaskSettingsProps {
  voiceSeparation: boolean;
  sourceLanguage: string;
  targetLanguage: string;
  subtitleLayout: SubtitleLayout;
  subtitleStyle: SubtitleStyle;
  showSubtitle: boolean;
  onVoiceSeparationChange: (enabled: boolean) => void;
  onSourceLanguageChange: (language: string) => void;
  onTargetLanguageChange: (language: string) => void;
  onSubtitleLayoutChange: (layout: SubtitleLayout) => void;
  onSubtitleStyleChange: (style: Partial<SubtitleStyle>) => void;
  onShowSubtitleChange: (show: boolean) => void;
}

// Language selection component
const LanguageSelect = ({
  value,
  onChange,
  placeholder,
  includeAuto = false,
  className,
  disabledValues = [],
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  includeAuto?: boolean;
  className?: string;
  disabledValues?: string[];
}) => {
  const t = useTranslations();

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn("h-7 text-xs motion-safe:transition-colors", className)}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {includeAuto && (
          <SelectItem
            value="auto"
            className="text-xs"
            disabled={disabledValues.includes("auto")}
          >
            {t("form.fields.sourceLanguage.auto")}
          </SelectItem>
        )}
        <SelectItem
          value="en"
          className="text-xs"
          disabled={disabledValues.includes("en")}
        >
          {t("form.fields.language.en")}
        </SelectItem>
        <SelectItem
          value="zh"
          className="text-xs"
          disabled={disabledValues.includes("zh")}
        >
          {t("form.fields.language.zh")}
        </SelectItem>
        <SelectItem
          value="ja"
          className="text-xs"
          disabled={disabledValues.includes("ja")}
        >
          {t("form.fields.language.ja")}
        </SelectItem>
      </SelectContent>
    </Select>
  );
};

const SettingSection = ({
  icon: Icon,
  title,
  children,
  className,
}: {
  icon: React.ComponentType<any>;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center gap-1.5">
      <Icon className="size-3.5 text-muted-foreground" />
      <span className="text-xs font-medium">{title}</span>
    </div>
    {children}
  </div>
);

export const TaskSettings = ({
  voiceSeparation,
  sourceLanguage,
  targetLanguage,
  subtitleLayout,
  subtitleStyle,
  showSubtitle,
  onVoiceSeparationChange,
  onSourceLanguageChange,
  onTargetLanguageChange,
  onSubtitleLayoutChange,
  onSubtitleStyleChange,
  onShowSubtitleChange,
}: TaskSettingsProps) => {
  const t = useTranslations();

  // Handle source language change
  const handleSourceLanguageChange = (newSourceLanguage: string) => {
    onSourceLanguageChange(newSourceLanguage);
    // If new source language is same as current target language, automatically adjust target language
    if (newSourceLanguage === targetLanguage) {
      // Select a different target language
      const availableLanguages = ["en", "zh", "ja"].filter(
        (lang) => lang !== newSourceLanguage
      );
      onTargetLanguageChange(availableLanguages[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1.5 border-b pb-2">
        <Settings2 className="size-3.5 text-primary" />
        <span className="text-xs font-medium">{t("form.fields.settings")}</span>
      </div>

      <div className="grid gap-4">
        {/* Voice separation enhancement settings */}
        <div className="flex items-center justify-between rounded-md border bg-card/50 px-2.5 py-1.5">
          <div className="flex items-center gap-1.5">
            <Volume2 className="size-3.5 text-muted-foreground" />
            <span className="text-xs">
              {t("form.fields.voiceSeparation.label")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-[0.7rem] text-muted-foreground">
              {voiceSeparation ? t("common.enabled") : t("common.disabled")}
            </Label>
            <Switch
              checked={voiceSeparation}
              onCheckedChange={onVoiceSeparationChange}
            />
          </div>
        </div>

        {/* Translation settings */}
        <SettingSection
          icon={Languages}
          title={t("form.fields.translation.label")}
        >
          <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-1.5">
            <LanguageSelect
              value={sourceLanguage}
              onChange={handleSourceLanguageChange}
              placeholder={t("form.fields.sourceLanguage.placeholder")}
              // includeAuto
            />
            <ArrowRight className="size-3 text-muted-foreground" />
            <LanguageSelect
              value={targetLanguage}
              onChange={onTargetLanguageChange}
              placeholder={t("form.fields.targetLanguage.placeholder")}
              disabledValues={[sourceLanguage]}
            />
          </div>
        </SettingSection>

        {/* Subtitle settings */}
        <SubtitleSettings
          subtitleLayout={subtitleLayout}
          subtitleStyle={subtitleStyle}
          showSubtitle={showSubtitle}
          onLayoutChange={onSubtitleLayoutChange}
          onStyleChange={onSubtitleStyleChange}
          onShowSubtitleChange={onShowSubtitleChange}
        />
      </div>
    </div>
  );
};
