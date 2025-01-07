import { RawVideoFormat, VideoFormat } from "@/utils/video-format";
import { atom } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { v4 as uuidv4 } from "uuid";

// ==============================
// Type Definitions
// ==============================

export type GloablTaskStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

// ==============================
// Task Status for Each Stage
// ==============================

// Task Status
export type TaskStatus =
  | "pending"
  | "queue"
  | "processing"
  | "success"
  | "fail";

// Subtitle Segment
export type SubtitleSegment = {
  start: number;
  end: number;
  text: string;
  words?: {
    start: number;
    end: number;
    word: string;
    score: number;
  }[];
};

// SRT Subtitle
export type SrtSubtitle = {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
};

// Task Result
export type TaskResult<T = any> = {
  result: T;
  status: TaskStatus;
};

// Get Video Info Task
// Step 0: Get video information
export type GetVideoInfoTask = {
  duration: number;
  formats: RawVideoFormat[];
  id: string;
  thumbnail: string;
  title: string;
};

// Download Task
// Step 1: Get video and audio files
export type DownloadTask = {
  downloadTaskId: string;
  downloadStatus: TaskStatus;
  videoUrl: string;
  audioUrl: string;
};

// Transcribe Task
// Step 2: Get source subtitles with word-level timing
export type TranscribeTask = {
  transcribeTaskId: string;
  transcribeStatus: TaskStatus;
  srcWordLevelSubtitles: SubtitleSegment[];
};

// Translate Task
// Step 3: Get translated subtitles
export type TranslateTask = {
  translateTaskId: string;
  translateStatus: TaskStatus;
  srcSubtitles: SrtSubtitle[];
  transSubtitles: SrtSubtitle[];
};

// Burn Task
// Step 4: Get video with burned subtitles
export type BurnTask = {
  burnTaskId: string;
  burnStatus: TaskStatus;
  videoUrl: string;
};

// ==============================
// Task Pre-Configuration
// ==============================

// Subtitle Style
export type SubtitleStyle = {
  // Source subtitle styles
  fontSize: number; // src_font_size - Source subtitle font size
  fontFamily: string; // src_font_name - Source subtitle font family
  primaryColor: string; // src_font_color - Source subtitle font color
  primaryStrokeWidth: number; // src_outline_width - Source subtitle outline width
  shadowColor: string; // src_shadow_color - Source subtitle shadow color
  showPrimaryShadow: boolean; // Whether to show source subtitle shadow
  showPrimaryStroke: boolean; // Whether to show source subtitle stroke
  primaryMarginV: number; // src_margin_v - Source subtitle vertical margin
  primaryBackgroundColor: string; // src_back_color - Source subtitle background color
  showPrimaryBackground: boolean; // Whether to show source subtitle background

  // Translation subtitle styles
  secondaryFontSize: number; // trans_font_size - Translation subtitle font size
  secondaryFontFamily: string; // trans_font_name - Translation subtitle font family
  secondaryColor: string; // trans_font_color - Translation subtitle color
  secondaryStrokeColor: string; // trans_outline_color - Translation subtitle stroke color
  secondaryStrokeWidth: number; // trans_outline_width - Translation subtitle stroke width
  secondaryBackgroundColor: string; // trans_back_color - Translation subtitle background color
  showSecondaryShadow: boolean; // Whether to show translation subtitle shadow
  showSecondaryStroke: boolean; // Whether to show translation subtitle stroke
  showSecondaryBackground: boolean; // Whether to show translation subtitle background
  secondaryMarginV: number; // trans_margin_v - Translation subtitle vertical margin
};

// Subtitle Layout "single" | "double"
export type SubtitleLayout = "single" | "double";

// Current Task
export type CurrentTaskState = {
  id: string;
  createdAt?: Date;
  updatedAt?: Date;

  videoUrl?: string; // Original video URL
  name?: string; // Video name
  duration?: number; // Video duration
  thumbnail?: string; // Video thumbnail

  status: GloablTaskStatus; // Overall task status
  progress: number; // Overall task progress
  errorMessage?: string; // Overall task error message

  // Status for each task stage
  GetVideoInfoTask?: GetVideoInfoTask;
  DownloadTask?: DownloadTask;
  TranscribeTask?: TranscribeTask;
  TranslateTask?: TranslateTask;
  BurnTask?: BurnTask;

  settings: {
    selectedFormat?: VideoFormat; // Selected video format

    voiceSeparation: boolean; // Voice separation enhancement
    sourceLanguage: string; // Source video language
    targetLanguage: string; // Target language
    subtitleLayout: SubtitleLayout; // Subtitle layout
    subtitleStyle: SubtitleStyle; // Subtitle style
  };
};

// ==============================
// Default Values
// ==============================
const defaultSubtitleStyle: SubtitleStyle = {
  // Source subtitle default styles
  fontSize: 15, // Default value
  fontFamily: "NotoSansCJK-Regular", // Default font
  primaryColor: "&HFFFFFF", // White
  primaryStrokeWidth: 1, // Default value
  shadowColor: "&H80000000", // Semi-transparent black
  showPrimaryShadow: false, // Default no shadow
  showPrimaryStroke: false, // Default no stroke
  primaryMarginV: 0, // Default source vertical margin
  primaryBackgroundColor: "&H33000000", // Semi-transparent black
  showPrimaryBackground: false, // Default no background

  // Translation subtitle default styles
  secondaryFontSize: 17, // Default value
  secondaryFontFamily: "NotoSansCJK-Regular", // Default font
  secondaryColor: "&H00FFFF", // Cyan
  secondaryStrokeColor: "&H000000", // Black
  secondaryStrokeWidth: 0, // Default value
  secondaryBackgroundColor: "&H33000000", // Semi-transparent black
  showSecondaryShadow: false, // Default no shadow
  showSecondaryStroke: false, // Default no stroke
  showSecondaryBackground: true, // Default show background
  secondaryMarginV: 27, // Default translation vertical margin
};

export const defaultTaskState: CurrentTaskState = {
  id: uuidv4(),

  status: "pending",
  progress: 0,

  settings: {
    voiceSeparation: true,
    sourceLanguage: "en",
    targetLanguage: "zh",
    subtitleLayout: "double",
    subtitleStyle: defaultSubtitleStyle,
  },
};

// Atom
export const currentTaskAtom = atomWithStorage<CurrentTaskState>(
  "current-task",
  defaultTaskState,
  createJSONStorage(() =>
    typeof window !== "undefined"
      ? localStorage
      : {
          getItem: () => null,
          setItem: () => null,
          removeItem: () => null,
        }
  ),
  {
    getOnInit: true,
  }
);

export const resetCurrentTaskAtom = atom(null, (get, set) => {
  const currentTask = get(currentTaskAtom);
  set(currentTaskAtom, {
    ...currentTask,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date(),

    videoUrl: undefined,
    name: undefined,
    duration: undefined,
    thumbnail: undefined,

    status: "pending",
    progress: 0,
    errorMessage: undefined,

    GetVideoInfoTask: undefined,
    DownloadTask: undefined,
    TranscribeTask: undefined,
    TranslateTask: undefined,
    BurnTask: undefined,

    settings: {
      ...currentTask.settings,
      selectedFormat: undefined,
    },
  });
});

export const showPreviewSubtitleAtom = atomWithStorage(
  "show-preview-subtitle",
  false
);
