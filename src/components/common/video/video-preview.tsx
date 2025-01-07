import { ArtPlayer } from "@/components/common/art-player";
import {
  calculateDuration,
  getYoutubeVideoId,
  isYoutubeUrl,
} from "@/utils/video-format";
import { VideoIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { SubtitleLayout, SubtitleStyle } from "@/stores/slices/current_task";
import { assColorToCss } from "@/utils/color";

export interface VideoPreviewProps {
  thumbnail: string;
  title: string;
  url: string;
  duration: number;
  subtitleStyle?: SubtitleStyle;
  subtitleLayout?: SubtitleLayout;
  showSubtitle?: boolean;
  sourceLanguage?: string;
  targetLanguage?: string;
}

const SubtitlePreview: React.FC<{
  style: SubtitleStyle;
  layout: SubtitleLayout;
  sourceLanguage?: string;
  targetLanguage?: string;
}> = ({ style, layout, sourceLanguage = "en", targetLanguage = "zh" }) => {
  const {
    fontSize,
    fontFamily,
    primaryColor,
    primaryStrokeWidth,
    shadowColor,
    secondaryFontSize,
    secondaryFontFamily,
    secondaryColor,
    secondaryStrokeColor,
    secondaryStrokeWidth,
    secondaryBackgroundColor,
    primaryMarginV,
    secondaryMarginV,
  } = style;

  const commonStyle: React.CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    textAlign: "center",
    maxWidth: "90%",
    width: "fit-content",
    padding: "4px",
    pointerEvents: "none",
    zIndex: 99,
  };

  const primaryStyle: React.CSSProperties = {
    ...commonStyle,
    fontFamily,
    fontSize: `${fontSize}px`,
    color: assColorToCss(primaryColor),
    WebkitTextStroke: style.showPrimaryStroke
      ? `${primaryStrokeWidth}px ${assColorToCss(shadowColor)}`
      : "none",
    textShadow: style.showPrimaryShadow
      ? `2px 2px 2px ${assColorToCss(shadowColor)}`
      : "none",
  };

  const secondaryStyle: React.CSSProperties = {
    ...commonStyle,
    fontFamily: secondaryFontFamily,
    fontSize: `${secondaryFontSize}px`,
    color: assColorToCss(secondaryColor),
    WebkitTextStroke: style.showSecondaryStroke
      ? `${secondaryStrokeWidth}px ${assColorToCss(secondaryStrokeColor)}`
      : "none",
    textShadow: style.showSecondaryShadow
      ? `2px 2px 2px ${assColorToCss(secondaryStrokeColor)}`
      : "none",
    backgroundColor: style.showSecondaryBackground
      ? assColorToCss(secondaryBackgroundColor)
      : "transparent",
  };

  const getPreviewText = (isSource: boolean) => {
    if (isSource) {
      switch (sourceLanguage) {
        case "en":
          return "This is source subtitle preview";
        case "ja":
          return "これは原文字幕のプレビューです";
        case "zh":
        default:
          return "这是原文字幕预览";
      }
    }
    switch (targetLanguage) {
      case "en":
        return "This is target subtitle preview";
      case "ja":
        return "これは訳文字幕のプレビューです";
      case "zh":
      default:
        return "这是译文字幕预览";
    }
  };

  if (layout === "single") {
    return (
      <div
        style={{
          ...secondaryStyle,
          bottom: `${secondaryMarginV}px`,
          position: "absolute",
          width: "100%",
        }}
      >
        {getPreviewText(true)}
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          ...secondaryStyle,
          bottom: `${secondaryMarginV}px`,
          position: "absolute",
          width: "100%",
        }}
      >
        {getPreviewText(false)}
      </div>
      <div
        style={{
          ...primaryStyle,
          bottom: `${primaryMarginV}px`,
          position: "absolute",
          width: "100%",
        }}
      >
        {getPreviewText(true)}
      </div>
    </>
  );
};

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  thumbnail,
  title,
  url,
  duration,
  subtitleStyle,
  subtitleLayout = "double",
  showSubtitle = true,
  sourceLanguage,
  targetLanguage,
}) => {
  const t = useTranslations("global");
  const { minutes, seconds } = calculateDuration(duration);

  const proxyImageUrl = `/api/302/vt/image/proxy?url=${encodeURIComponent(thumbnail)}`;

  if (!url) {
    return (
      <div className="relative aspect-video overflow-hidden bg-muted">
        <Image
          src={proxyImageUrl}
          alt={title}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0">
          {showSubtitle && subtitleStyle && (
            <SubtitlePreview
              style={subtitleStyle}
              layout={subtitleLayout}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          )}
        </div>
      </div>
    );
  }

  const isYoutube = isYoutubeUrl(url);
  const youtubeVideoId = isYoutube ? getYoutubeVideoId(url) : null;

  return (
    <>
      <div className="relative aspect-video overflow-hidden bg-muted">
        {isYoutube && youtubeVideoId ? (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            className="absolute inset-0 size-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <ArtPlayer
            url={`/api/302/vt/video/proxy?url=${encodeURIComponent(url)}`}
            poster={proxyImageUrl}
            className="absolute inset-0 size-full"
          />
        )}
        <div className="pointer-events-none absolute inset-0">
          {showSubtitle && subtitleStyle && (
            <SubtitlePreview
              style={subtitleStyle}
              layout={subtitleLayout}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
            />
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-medium">{title}</h3>
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <VideoIcon className="size-4" />
          {t("video.duration", { minutes, seconds })}
        </p>

        <p className="text-sm text-muted-foreground">
          {t("video.previewAudioNotice")}
        </p>
      </div>
    </>
  );
};
