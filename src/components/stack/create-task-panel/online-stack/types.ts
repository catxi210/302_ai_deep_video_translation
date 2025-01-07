import { StackRef } from "@/components/ui/stack";
import { RawVideoFormat, VideoFormat } from "@/utils/video-format";
import { RefObject } from "react";
import { z } from "zod";

export const videoUrlSchema = z.object({
  videoUrl: z.string().min(1).url(),
});

export type VideoUrlFormData = z.infer<typeof videoUrlSchema>;

export interface OnlineStackProps {
  stackRef: RefObject<StackRef>;
}

export interface VideoUrlFormProps {}

export interface VideoInfoProps {
  title: string;
  duration: number;
  selectedFormat?: VideoFormat;
}

export interface FormatSelectionProps {
  formats: RawVideoFormat[];
  bestFormats: VideoFormat[];
  selectedFormatId?: string;
  onFormatSelect: (format: RawVideoFormat | VideoFormat) => void;
}

export interface FormatButtonProps {
  format: VideoFormat;
  isSelected: boolean;
  onSelect: () => void;
}
