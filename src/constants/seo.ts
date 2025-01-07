export type SEOData = {
  supportLanguages: string[];
  fallbackLanguage: string;
  languages: Record<
    string,
    { title: string; description: string; image: string }
  >;
};

export const SEO_DATA: SEOData = {
  supportLanguages: ["zh", "en", "ja"],
  fallbackLanguage: "en",
  languages: {
    zh: {
      title: "AI视频深度翻译",
      description: "使用 AI 翻译字幕并配音",
      image: "/images/global/desc_zh.png",
    },
    en: {
      title: "AI Deep Video Translation",
      description: "AI-Powered Subtitle Translation and Dubbing",
      image: "/images/global/desc_en.png",
    },
    ja: {
      title: "AIビデオ深層翻訳",
      description: "AIを使用した字幕翻訳・吹き替え」",
      image: "/images/global/desc_ja.png",
    },
  },
};
