// Video codec constants
const VIDEO_CODEC = {
  NONE: "none",
} as const;

// File size unit constants (bytes)
const FILE_SIZE_UNITS = {
  KB: 1024,
  MB: 1024 * 1024,
  GB: 1024 * 1024 * 1024,
} as const;

// First define the raw format type returned by API
export interface RawVideoFormat {
  format_id: string;
  format_note: string;
  ext: string;
  acodec: string;
  vcodec: string;
  url: string;
  width: number | null;
  height: number | null;
  fps: number | null;
  filesize: number | null;
  filesize_approx: number | null;
}

// Define unified format type using Pick and Omit utility types for optimization
type BaseVideoFormat = Pick<
  RawVideoFormat,
  "ext" | "acodec" | "vcodec" | "url" | "width" | "height" | "fps"
>;

export interface VideoFormat extends BaseVideoFormat {
  formatId: string;
  formatNote: string;
  filesize: number | null;
  filesizeApprox: number | null;
}

/**
 * Check if video format is valid
 */
const isValidVideoFormat = (format: RawVideoFormat): boolean => {
  return !!(
    format.height &&
    format.width &&
    format.vcodec &&
    format.vcodec !== VIDEO_CODEC.NONE
  );
};

/**
 * Compare quality between two formats
 */
const compareFormatQuality = (
  format: RawVideoFormat,
  current: RawVideoFormat
): boolean => {
  // If new format has exact filesize but current doesn't, prefer new format
  if (format.filesize && !current.filesize) return true;

  // If both have exact filesizes, compare fps
  if (format.filesize && current.filesize) {
    return !!(format.fps && current.fps && format.fps > current.fps);
  }

  // If neither has exact filesize, compare approximate size
  if (!format.filesize && !current.filesize) {
    return !!(
      format.filesize_approx &&
      current.filesize_approx &&
      format.filesize_approx > current.filesize_approx
    );
  }

  return false;
};

/**
 * Transform function
 */
export const transformVideoFormat = (format: RawVideoFormat): VideoFormat => ({
  formatId: format.format_id,
  formatNote: format.format_note,
  ext: format.ext,
  acodec: format.acodec,
  vcodec: format.vcodec,
  url: format.url,
  width: format.width,
  height: format.height,
  fps: format.fps,
  filesize: format.filesize,
  filesizeApprox: format.filesize_approx,
});

/**
 * Get best format for each resolution
 * @param formats List of video formats
 * @returns List of best formats sorted by resolution
 */
export const getBestFormats = (formats: RawVideoFormat[]): VideoFormat[] => {
  const resolutionMap = new Map<number, RawVideoFormat>();

  formats.forEach((format) => {
    if (!isValidVideoFormat(format)) return;

    const height = format.height!; // Already validated by isValidVideoFormat
    const current = resolutionMap.get(height);

    if (!current || compareFormatQuality(format, current)) {
      resolutionMap.set(height, format);
    }
  });

  return Array.from(resolutionMap.values())
    .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
    .map(transformVideoFormat);
};

/**
 * File size unit type
 */
export type FileSizeUnit = "B" | "KB" | "MB" | "GB";

/**
 * Calculate file size in specified unit
 * @param bytes Number of bytes
 * @param unit Target unit
 * @param decimals Number of decimal places
 * @returns Converted size or null
 */
export const calculateFileSize = (
  bytes: number | null,
  unit: FileSizeUnit = "MB",
  decimals: number = 1
): number | null => {
  if (!bytes) return null;

  const units: Record<FileSizeUnit, number> = {
    B: 1,
    KB: FILE_SIZE_UNITS.KB,
    MB: FILE_SIZE_UNITS.MB,
    GB: FILE_SIZE_UNITS.GB,
  };

  const divisor = units[unit];
  return Number((bytes / divisor).toFixed(decimals));
};

/**
 * Calculate file size in megabytes
 * @param bytes Number of bytes
 * @returns Value in MB or null
 */
export const calculateMegabytes = (bytes: number | null): number | null => {
  return calculateFileSize(bytes, "MB", 1);
};

/**
 * Duration format interface
 */
export interface Duration {
  minutes: number;
  seconds: number;
}

/**
 * Calculate duration in minutes and seconds
 * @param seconds Total seconds
 * @returns Minutes and seconds object
 */
export const calculateDuration = (seconds: number): Duration => {
  return {
    minutes: Math.floor(seconds / 60),
    seconds: Math.floor(seconds % 60),
  };
};

/**
 * Check if format is available
 */
const isFormatAvailable = (format: RawVideoFormat): boolean => {
  return !!(
    format.vcodec &&
    format.vcodec !== VIDEO_CODEC.NONE &&
    (format.filesize || format.filesize_approx)
  );
};

/**
 * Get best default format
 */
export const getBestDefaultFormat = (
  formats: RawVideoFormat[]
): VideoFormat | null => {
  const bestFormat = formats.reduce<RawVideoFormat | null>((best, current) => {
    if (!isFormatAvailable(current)) return best;
    if (!best) return current;

    const currentHeight = current.height ?? 0;
    const bestHeight = best.height ?? 0;

    return currentHeight > bestHeight ? current : best;
  }, null);

  return bestFormat ? transformVideoFormat(bestFormat) : null;
};

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;

  // Regular YouTube URL
  const regularMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (regularMatch) return regularMatch[1];

  // Shortened youtu.be URL
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];

  // Embed URL
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];

  return null;
}

export function isYoutubeUrl(url: string): boolean {
  return !!getYoutubeVideoId(url);
}
