import { MetadataRoute } from "next";

// 학습·수집용 AI 크롤러. 검색 노출과 무관하므로 사이트 전체를 막아 서버 부하를 줄인다
const AI_CRAWLERS = [
  "GPTBot",
  "CCBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "PerplexityBot",
  "Bytespider",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        disallow: "/admin/",
      },
      {
        userAgent: AI_CRAWLERS,
        disallow: "/",
      },
    ],
    sitemap: "https://grinergy.tech/sitemap.xml",
  };
}
