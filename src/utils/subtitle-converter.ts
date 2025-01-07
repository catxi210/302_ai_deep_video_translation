interface Subtitle {
  start_time: string;
  end_time: string;
  text: string;
}

interface SubtitleStyle {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  primaryStrokeWidth: number;
  secondaryBackgroundColor: string;
  secondaryColor: string;
  secondaryFontFamily: string;
  secondaryFontSize: number;
  secondaryStrokeColor: string;
  secondaryStrokeWidth: number;
  shadowColor: string;
  showPrimaryShadow: boolean;
  showPrimaryStroke: boolean;
  showSecondaryBackground: boolean;
  showSecondaryShadow: boolean;
  showSecondaryStroke: boolean;
}

interface VideoFormat {
  width?: number;
  height?: number;
}

// Convert time format from "00:00:00.000" to "0:00:00.00" (ASS format)
const convertTimeToASS = (time: string) => {
  // Remove the last millisecond digit
  const timeWithoutLastMs = time.slice(0, -1);
  // Remove leading zero if present
  return timeWithoutLastMs.replace(/^0/, "");
};

// Convert color from "#RRGGBB" or "#RRGGBBAA" to ASS format "&HAABBGGRR"
const convertColorToASS = (color: string) => {
  // Remove # symbol
  const hex = color.replace("#", "");
  // If 6 digits, add FF as alpha
  const rgba = hex.length === 6 ? `FF${hex}` : hex;
  // Extract components
  const aa = rgba.slice(0, 2);
  const rr = rgba.slice(2, 4);
  const gg = rgba.slice(4, 6);
  const bb = rgba.slice(6, 8);
  // Return ASS format
  return `&H${aa}${bb}${gg}${rr}`;
};

// Generate ASS style definition
const generateASSStyles = (style: SubtitleStyle, isSecondary = false) => {
  const fontFamily = isSecondary ? style.secondaryFontFamily : style.fontFamily;
  const fontSize = isSecondary ? style.secondaryFontSize : style.fontSize;
  const primaryColor = convertColorToASS(style.primaryColor);
  const secondaryColor = convertColorToASS(style.secondaryColor);
  const outlineColor = convertColorToASS(style.secondaryStrokeColor);
  const shadowColor = convertColorToASS(style.shadowColor);
  const outlineWidth = isSecondary
    ? style.secondaryStrokeWidth
    : style.primaryStrokeWidth;
  const showOutline = isSecondary
    ? style.showSecondaryStroke
    : style.showPrimaryStroke;
  const showShadow = isSecondary
    ? style.showSecondaryShadow
    : style.showPrimaryShadow;

  return `Style: ${isSecondary ? "Secondary" : "Default"},${fontFamily},${fontSize},${primaryColor},${secondaryColor},${outlineColor},${shadowColor},0,0,0,0,100,100,0,0,${showOutline ? outlineWidth : 0},${showShadow ? 1 : 0},1,2,0,5,0,1,0,0`;
};

// Generate ASS format subtitles
export const generateASS = (
  subtitles: Subtitle[],
  style: SubtitleStyle,
  format?: VideoFormat
): string => {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${format?.width || 1920}
PlayResY: ${format?.height || 1080}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${generateASSStyles(style)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = subtitles
    .map((sub) => {
      const start = convertTimeToASS(sub.start_time);
      const end = convertTimeToASS(sub.end_time);
      return `Dialogue: 0,${start},${end},Default,,0,0,0,,${sub.text}`;
    })
    .join("\n");

  return `${header}\n\n${events}`;
};

// Generate bilingual ASS format subtitles
export const generateBilingualASS = (
  srcSubtitles: Subtitle[],
  transSubtitles: Subtitle[],
  style: SubtitleStyle,
  format?: VideoFormat
): string => {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: ${format?.width || 1920}
PlayResY: ${format?.height || 1080}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
${generateASSStyles(style)}
${generateASSStyles(style, true)}

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events = srcSubtitles
    .map((srcSub, index) => {
      const transSub = transSubtitles[index];
      const start = convertTimeToASS(srcSub.start_time);
      const end = convertTimeToASS(srcSub.end_time);
      // Source language subtitle on top
      const srcLine = `Dialogue: 0,${start},${end},Default,,0,0,40,,${srcSub.text}`;
      // Translation subtitle below
      const transLine = transSub
        ? `Dialogue: 0,${start},${end},Secondary,,0,0,0,,${transSub.text}`
        : "";
      return [srcLine, transLine].filter(Boolean).join("\n");
    })
    .join("\n");

  return `${header}\n\n${events}`;
};

// Convert time format from "00:00:00.000" to "00:00:00,000" (SRT format)
const convertTimeToSRT = (time: string) => {
  return time.replace(".", ",");
};

// Generate SRT format subtitles
export const generateSRT = (subtitles: Subtitle[]): string => {
  return subtitles
    .map((sub, index) => {
      return `${index + 1}\n${convertTimeToSRT(sub.start_time)} --> ${convertTimeToSRT(
        sub.end_time
      )}\n${sub.text}\n`;
    })
    .join("\n");
};

// Generate VTT format subtitles
export const generateVTT = (subtitles: Subtitle[]): string => {
  return `WEBVTT\n\n${subtitles
    .map((sub) => {
      return `${sub.start_time} --> ${sub.end_time}\n${sub.text}\n`;
    })
    .join("\n")}`;
};

// Generate bilingual subtitles (SRT format)
export const generateBilingualSRT = (
  srcSubtitles: Subtitle[],
  transSubtitles: Subtitle[]
): string => {
  return srcSubtitles
    .map((srcSub, index) => {
      const transSub = transSubtitles[index];
      return `${index + 1}\n${convertTimeToSRT(srcSub.start_time)} --> ${convertTimeToSRT(
        srcSub.end_time
      )}\n${srcSub.text}\n${transSub?.text || ""}\n`;
    })
    .join("\n");
};

// Generate bilingual subtitles (VTT format)
export const generateBilingualVTT = (
  srcSubtitles: Subtitle[],
  transSubtitles: Subtitle[]
): string => {
  return `WEBVTT\n\n${srcSubtitles
    .map((srcSub, index) => {
      const transSub = transSubtitles[index];
      return `${srcSub.start_time} --> ${srcSub.end_time}\n${srcSub.text}\n${transSub?.text || ""}\n`;
    })
    .join("\n")}`;
};

// Helper function to download files
export const downloadSubtitle = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
