import { calculateMegabytes } from "@/utils/video-format";
import { Check, Video, FileVideo, Gauge } from "lucide-react";
import { useTranslations } from "next-intl";
import { FormatButtonProps } from "../../types";
import { cn } from "@/lib/utils";

export const FormatButton = ({
  format,
  isSelected,
  onSelect,
}: FormatButtonProps) => {
  const t = useTranslations("global");

  const getSizeText = () => {
    if (format.filesize) {
      const mb = calculateMegabytes(format.filesize);
      return mb ? t("video.exactSize", { size: mb }) : t("video.unknownSize");
    }
    const mb = calculateMegabytes(format.filesizeApprox);
    return mb
      ? t("video.approximateSize", { size: mb })
      : t("video.unknownSize");
  };

  const isHD = (format.height ?? 0) >= 720;
  const is4K = (format.height ?? 0) >= 2160;
  const quality = is4K ? "4K" : isHD ? "HD" : "SD";
  const qualityColors = {
    "4K": "bg-green-500/10 text-green-500",
    HD: "bg-primary/10 text-primary",
    SD: "bg-muted text-muted-foreground",
  };

  return (
    <button
      onClick={onSelect}
      className={cn(
        "group relative flex h-10 items-center gap-2 rounded-md border bg-card px-2.5 text-left transition-all hover:bg-accent/50",
        isSelected && "border-primary bg-primary/5 hover:bg-primary/10"
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-sm transition-colors",
            qualityColors[quality]
          )}
        >
          {is4K ? (
            <span className="text-[0.7rem] font-bold tabular-nums">4K</span>
          ) : (
            <>
              {isHD ? (
                <Video className="size-3" />
              ) : (
                <FileVideo className="size-3" />
              )}
            </>
          )}
        </div>

        <span className="text-sm font-medium tabular-nums">
          {format.height}p
        </span>
      </div>

      <div className="h-4 w-px shrink-0 bg-border" aria-hidden="true" />

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {format.fps && (
          <div className="flex items-center gap-1 rounded-sm bg-muted/50 px-1.5 py-0.5 text-[0.7rem] text-muted-foreground">
            <Gauge className="size-2.5" />
            <span className="tabular-nums">{format.fps}fps</span>
          </div>
        )}

        <span className="truncate text-[0.7rem] text-muted-foreground">
          {getSizeText()}
        </span>
      </div>

      <div
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-sm transition-colors",
          isSelected
            ? "bg-primary text-primary-foreground"
            : "bg-transparent group-hover:bg-primary/10"
        )}
      >
        <Check
          className={cn(
            "size-3 transition-opacity",
            isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-50"
          )}
        />
      </div>
    </button>
  );
};
