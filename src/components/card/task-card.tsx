import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Trash2, Clock, Languages, Type } from "lucide-react";
import { useTranslations } from "next-intl";

interface TaskCardProps {
  className?: string;
  status?: "processing" | "completed" | "failed";
  title?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
  duration?: string;
  progress?: number;
  onPlay?: () => void;
  onDelete?: () => void;
}

export const TaskCard = ({
  className,
  status = "processing",
  title = "Untitled Task",
  sourceLanguage = "auto",
  targetLanguage = "en",
  duration = "00:00",
  progress = 0,
  onPlay,
  onDelete,
}: TaskCardProps) => {
  const t = useTranslations();

  const statusColors = {
    processing: "bg-primary/10 text-primary hover:bg-primary/20",
    completed: "bg-green-500/10 text-green-500 hover:bg-green-500/20",
    failed: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  };

  return (
    <Card
      className={cn("group relative overflow-hidden border bg-card", className)}
    >
      {/* Progress bar background */}
      <div
        className="absolute inset-x-0 bottom-0 h-0.5 bg-muted"
        aria-hidden="true"
      />
      {/* Progress bar */}
      <div
        className="absolute inset-y-0 left-0 bg-primary/5 transition-all duration-300"
        style={{ width: `${progress}%` }}
        aria-hidden="true"
      />

      <div className="relative space-y-2 p-3">
        {/* Title and status */}
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Type className="size-3.5 text-muted-foreground" />
              <span className="line-clamp-1 text-sm font-medium">{title}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Languages className="size-3.5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {t(`form.fields.language.${sourceLanguage}`)} →{" "}
                {t(`form.fields.language.${targetLanguage}`)}
              </span>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              "h-5 rounded-md px-1.5 text-[0.7rem] font-medium",
              statusColors[status]
            )}
          >
            {t(`task.status.${status}`)}
          </Badge>
        </div>

        {/* Duration and actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Clock className="size-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity"
              onClick={onPlay}
            >
              <Play className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-destructive opacity-0 group-hover:opacity-100 motion-safe:transition-opacity"
              onClick={onDelete}
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
