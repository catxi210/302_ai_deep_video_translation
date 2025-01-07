import { Button } from "@/components/ui/button";
import { StackRef } from "@/components/ui/stack";
import { Upload, ArrowRight, FileVideo, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { RefObject, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { useUnifiedFileUpload } from "@/hooks/global/use-unified-file-upload";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { currentTaskAtom } from "@/stores/slices/current_task";
import { createScopedLogger } from "@/utils";

const logger = createScopedLogger("upload-stack");

// Get video duration
const getVideoDuration = (file: File): Promise<number> => {
  logger.debug("Starting to get video duration for:", file.name);
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = () => {
      const duration = video.duration;
      logger.debug("Video duration loaded:", duration);
      resolve(duration);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = (e) => {
      logger.error("Error loading video metadata:", e);
      resolve(0);
    };

    const objectUrl = URL.createObjectURL(file);
    logger.debug("Created object URL for duration:", objectUrl);
    video.src = objectUrl;
  });
};

// Get video thumbnail
const getVideoThumbnail = (file: File): Promise<string> => {
  logger.debug("Starting to get video thumbnail for:", file.name);
  return new Promise((resolve) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");

    video.onloadeddata = () => {
      logger.debug("Video data loaded. Dimensions:", {
        width: video.videoWidth,
        height: video.videoHeight,
      });

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const thumbnail = canvas.toDataURL("image/jpeg");
      logger.debug("Thumbnail generated, length:", thumbnail.length);
      resolve(thumbnail);
      URL.revokeObjectURL(video.src);
    };

    video.onerror = (e) => {
      logger.error("Error loading video for thumbnail:", e);
      resolve("");
    };

    const objectUrl = URL.createObjectURL(file);
    logger.debug("Created object URL for thumbnail:", objectUrl);
    video.src = objectUrl;
    video.load();
  });
};

export const UploadStack = ({
  stackRef,
}: {
  stackRef: RefObject<StackRef>;
}) => {
  const t = useTranslations("uploader");
  const [currentTask, setCurrentTask] = useAtom(currentTaskAtom);
  const uploadFileRef = useRef<File | null>(null);

  const {
    handleFileSelect,
    selectedFiles,
    uploadProgress,
    isUploading,
    error,
    upload,
    removeFile,
  } = useUnifiedFileUpload({
    validationConfig: {
      maxFileSize: 1024 * 1024 * 1024, // 1GB
      acceptedTypes: {
        "video/": ["mp4", "webm", "mkv", "avi"],
      },
      maxFiles: 1,
    },
    onUploadStart: (files) => {
      logger.debug("Upload starting:", files);
      if (files[0]) {
        uploadFileRef.current = files[0];
      }
    },
    onUploadProgress: (progress) => {
      logger.debug("Upload progress:", progress);
    },
    onUploadError: (error) => {
      logger.error("Upload error:", error);
      uploadFileRef.current = null;
    },
    onUploadSuccess: async (files) => {
      logger.debug("onUploadSuccess called with files:", files);
      const uploadedFile = uploadFileRef.current;
      logger.debug("Saved upload file:", uploadedFile);

      if (files[0]?.url && uploadedFile) {
        try {
          logger.debug("Upload successful, file info:", {
            name: uploadedFile.name,
            type: uploadedFile.type,
            size: uploadedFile.size,
            uploadedUrl: files[0].url,
          });

          const [duration, thumbnail] = await Promise.all([
            getVideoDuration(uploadedFile),
            getVideoThumbnail(uploadedFile),
          ]);

          logger.debug("Metadata extracted:", {
            duration,
            thumbnailLength: thumbnail.length,
          });

          setCurrentTask((prev) => {
            logger.debug("Updating current task with:", {
              videoUrl: files[0].url,
              name: uploadedFile.name,
              duration,
              thumbnail: thumbnail.slice(0, 100) + "...",
            });
            return {
              ...prev,
              videoUrl: files[0].url,
              name: uploadedFile.name,
              duration,
              thumbnail,
            };
          });

          logger.debug("Current task updated with metadata");
          logger.debug("Pushing to online stack");
          stackRef.current?.push("online");
        } catch (err) {
          logger.error("Failed to get video metadata:", err);
          setCurrentTask((prev) => {
            logger.debug("Updating current task with basic info:", {
              videoUrl: files[0].url,
              name: uploadedFile.name,
            });
            return {
              ...prev,
              videoUrl: files[0].url,
              name: uploadedFile.name,
            };
          });
          logger.debug("Pushing to online stack (fallback)");
          stackRef.current?.push("online");
        }
      } else {
        logger.error("Missing required data:", {
          hasUrl: !!files[0]?.url,
          hasUploadedFile: !!uploadedFile,
        });
      }
      uploadFileRef.current = null;
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      logger.debug("Files dropped:", acceptedFiles);
      handleFileSelect(acceptedFiles);
      if (acceptedFiles.length > 0) {
        logger.debug("Starting upload for files:", acceptedFiles);
        upload(acceptedFiles);
      }
    },
    [handleFileSelect, upload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "video/*": [".mp4", ".webm"],
    },
    maxSize: 1024 * 1024 * 1024, // 1GB
    maxFiles: 1,
  });

  const handleOnlineClick = () => {
    stackRef.current?.push("online");
  };

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 p-3">
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "group relative flex w-full max-w-xl cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-md border-2 border-dashed border-primary/20 bg-card/5 p-3 py-8 transition-colors hover:border-primary/50 hover:bg-accent/50",
          isDragActive && "border-primary bg-accent/50",
          isUploading && "pointer-events-none opacity-50"
        )}
      >
        <input {...getInputProps()} />

        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--primary)_0%,transparent_40%)] opacity-5 group-hover:opacity-20" />

        {selectedFiles.length > 0 ? (
          <div className="flex w-full flex-col gap-4 px-4">
            {selectedFiles.map((file, index) => (
              <div
                key={file.name}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex flex-1 items-center gap-2 truncate">
                  <FileVideo className="size-4 shrink-0" />
                  <span className="truncate text-sm">{file.name}</span>
                </div>
                {!isUploading && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </div>
            ))}
            {isUploading && (
              <Progress value={uploadProgress} className="h-1 w-full" />
            )}
          </div>
        ) : (
          <>
            {/* Icon */}
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/5 group-hover:bg-primary/10">
              <Upload className="size-3.5 text-primary" />
            </div>

            {/* Text Information */}
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-base font-medium tracking-wide text-foreground">
                {t("info.drag_drop")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                <FileVideo className="size-3" />
                <span>{t("info.formats")}</span>
              </div>
            </div>

            {/* File Size Limit Tip */}
            <div className="flex items-center gap-2 rounded-md bg-card/5 px-2.5 py-1.5 text-xs text-muted-foreground">
              <span>{t("info.size_limit", { maxSize: "1GB" })}</span>
            </div>
          </>
        )}

        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      </div>

      {/* Divider */}
      <div className="flex w-full max-w-xs items-center gap-2">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <span className="text-xs font-medium text-muted-foreground">
          {t("info.or")}
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      </div>

      {/* Online Task Button */}
      <Button
        variant="outline"
        className="group relative min-w-32 overflow-hidden"
        onClick={handleOnlineClick}
      >
        <span className="relative z-10 flex items-center gap-2">
          {t("create_online_task")}
          <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </Button>
    </div>
  );
};
