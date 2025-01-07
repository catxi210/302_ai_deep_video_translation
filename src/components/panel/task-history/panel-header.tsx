import { useTranslations } from "next-intl";
import { History } from "lucide-react";

export const PanelHeader = () => {
  const t = useTranslations();

  return (
    <div className="flex items-center justify-between gap-4 border-b px-3 py-2">
      <div className="flex items-center gap-2">
        <History className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          {t("panel.taskHistory.title")}
        </span>
      </div>
    </div>
  );
};
