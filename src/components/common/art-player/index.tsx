"use client";

import { createScopedLogger } from "@/utils";
import Artplayer from "artplayer";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

const logger = createScopedLogger("ArtPlayer");

Artplayer.LOG_VERSION = false;

interface ArtPlayerProps {
  url: string;
  poster?: string;
  volume?: number;
  muted?: boolean;
  autoplay?: boolean;
  pip?: boolean;
  loop?: boolean;
  theme?: string;
  getInstance?: (art: Artplayer) => void;
  className?: string;
}

export const ArtPlayer = ({
  url,
  poster,
  volume = 0.7,
  muted = false,
  autoplay = false,
  pip = true,
  loop = false,
  theme = "#00a1d6",
  getInstance,
  className,
}: ArtPlayerProps) => {
  const artRef = useRef<Artplayer>();
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("global");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const art = new Artplayer({
      container,
      url,
      poster,
      volume,
      muted,
      autoplay,
      pip,
      loop,
      theme,
      fullscreen: true,
      fullscreenWeb: true,
      playbackRate: true,
      aspectRatio: true,
      setting: true,
      hotkey: true,
      flip: true,
      miniProgressBar: true,
      screenshot: true,
      fastForward: true,
      lock: true,
      autoSize: false,
      type: "video",
      controls: [
        {
          position: "right",
          html: '<div class="art-icon art-icon-screenshot"></div>',
          tooltip: t("video.screenshot"),
          click: async function () {
            try {
              const { $player } = this.template;
              const { default: html2canvas } = await import("html2canvas");
              const canvas = await html2canvas($player, {
                ignoreElements: (element: Element) => {
                  return [
                    "art-bottom",
                    "art-notice",
                    "art-mask",
                    "art-loading",
                    "art-info",
                    "art-contextmenus",
                  ].includes(element.className);
                },
              });

              canvas.toBlob((blob: Blob | null) => {
                if (!blob) return;
                const downloadUrl = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = downloadUrl;
                a.download = `${Date.now()}.png`;
                a.click();
                URL.revokeObjectURL(downloadUrl);
              });
            } catch (error) {
              logger.error("Screenshot error:", error);
            }
          },
        },
      ],
      layers: [
        {
          name: "error",
          html: `<div class="art-video-player-error">${t("error.video_play_error")}</div>`,
          style: {
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "none",
          },
        },
      ],
    });

    art.on("error", (error) => {
      logger.error("PPlayer error error:", error);
      const errorDiv = document.querySelector(".art-video-player-error");
      if (errorDiv instanceof HTMLElement) {
        errorDiv.style.display = "block";
      }
    });

    art.on("video:ended", () => {
      if (loop && art) {
        art.seek = 0;
        art.play();
      }
    });

    artRef.current = art;
    getInstance?.(art);

    return () => {
      if (artRef.current) {
        artRef.current.destroy();
        artRef.current = undefined;
      }
    };
  }, [url, poster, volume, muted, autoplay, pip, loop, theme, getInstance, t]);

  return <div ref={containerRef} className={className} />;
};
