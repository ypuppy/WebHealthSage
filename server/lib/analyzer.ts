import { load } from "cheerio";
import { analyzeSentiment, getSEOSuggestions } from "./openai";

export async function analyzeWebsite(url: string) {
  try {
    // First validate that we can fetch the URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch website: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = load(html);

    // Basic SEO Analysis
    const seoScore = calculateSEOScore($);
    const seoDetails = await getSEOSuggestions(html);

    // Performance Analysis
    const performanceScore = calculatePerformanceScore($);

    // Security Analysis
    const securityScore = calculateSecurityScore($, response.headers);

    // Accessibility Analysis
    const accessibilityScore = calculateAccessibilityScore($);

    // Sentiment Analysis
    const visibleText = $("body").text().trim();
    if (!visibleText) {
      throw new Error("No visible text content found on the page");
    }
    const sentimentAnalysis = await analyzeSentiment(visibleText);

    return {
      seoScore,
      performanceScore,
      securityScore,
      accessibilityScore,
      sentimentScore: sentimentAnalysis.score,
      details: {
        seo: seoDetails,
        sentiment: sentimentAnalysis,
        performance: {
          issues: getPerformanceIssues($),
          suggestions: getPerformanceSuggestions($),
        },
        security: {
          issues: getSecurityIssues(response.headers),
          suggestions: getSecuritySuggestions(response.headers),
        },
        accessibility: {
          issues: getAccessibilityIssues($),
          suggestions: getAccessibilitySuggestions($),
        },
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage.includes('API key')) {
      throw new Error("OpenAI API key configuration error. Please check your API settings.");
    }
    if (errorMessage.includes('quota')) {
      throw new Error("API quota exceeded. Please try again later.");
    }
    throw new Error(`Failed to analyze website: ${errorMessage}`);
  }
}

function calculateSEOScore($: cheerio.Root): number {
  let score = 100;

  if (!$("title").length) score -= 10;
  if (!$('meta[name="description"]').length) score -= 10;
  if (!$("h1").length) score -= 5;
  if ($("img:not([alt])").length > 0) score -= 5;

  return Math.max(0, score);
}

function calculatePerformanceScore($: cheerio.Root): number {
  let score = 100;

  const scripts = $("script").length;
  if (scripts > 15) score -= 10;

  const styles = $("link[rel='stylesheet']").length;
  if (styles > 5) score -= 10;

  const images = $("img").length;
  if (images > 20) score -= 10;

  return Math.max(0, score);
}

function calculateSecurityScore($: cheerio.Root, headers: Headers): number {
  let score = 100;

  if (!headers.get("Content-Security-Policy")) score -= 20;
  if (!headers.get("X-Frame-Options")) score -= 10;
  if (!headers.get("X-XSS-Protection")) score -= 10;

  return Math.max(0, score);
}

function calculateAccessibilityScore($: cheerio.Root): number {
  let score = 100;

  if ($("img:not([alt])").length > 0) score -= 10;
  if ($("a:not([aria-label])").length > 0) score -= 10;
  if (!$("html[lang]").length) score -= 10;

  return Math.max(0, score);
}

function getPerformanceIssues($: cheerio.Root): string[] {
  const issues: string[] = [];

  if ($("script").length > 15) {
    issues.push("High number of script tags detected");
  }
  if ($("link[rel='stylesheet']").length > 5) {
    issues.push("Multiple external stylesheets found");
  }
  if ($("img").length > 20) {
    issues.push("Large number of images may impact load time");
  }

  return issues;
}

function getPerformanceSuggestions($: cheerio.Root): string[] {
  const suggestions: string[] = [];

  if ($("script").length > 15) {
    suggestions.push("Consider bundling JavaScript files");
  }
  if ($("link[rel='stylesheet']").length > 5) {
    suggestions.push("Combine CSS files to reduce HTTP requests");
  }
  if ($("img").length > 20) {
    suggestions.push("Implement lazy loading for images");
  }

  return suggestions;
}

function getSecurityIssues(headers: Headers): string[] {
  const issues: string[] = [];

  if (!headers.get("Content-Security-Policy")) {
    issues.push("Missing Content Security Policy header");
  }
  if (!headers.get("X-Frame-Options")) {
    issues.push("Missing X-Frame-Options header");
  }
  if (!headers.get("X-XSS-Protection")) {
    issues.push("Missing X-XSS-Protection header");
  }

  return issues;
}

function getSecuritySuggestions(headers: Headers): string[] {
  const suggestions: string[] = [];

  if (!headers.get("Content-Security-Policy")) {
    suggestions.push("Implement Content Security Policy");
  }
  if (!headers.get("X-Frame-Options")) {
    suggestions.push("Add X-Frame-Options header to prevent clickjacking");
  }
  if (!headers.get("X-XSS-Protection")) {
    suggestions.push("Enable X-XSS-Protection header");
  }

  return suggestions;
}

function getAccessibilityIssues($: cheerio.Root): string[] {
  const issues: string[] = [];

  if ($("img:not([alt])").length > 0) {
    issues.push("Images missing alt text");
  }
  if ($("a:not([aria-label])").length > 0) {
    issues.push("Links missing aria labels");
  }
  if (!$("html[lang]").length) {
    issues.push("Language attribute missing on HTML tag");
  }

  return issues;
}

function getAccessibilitySuggestions($: cheerio.Root): string[] {
  const suggestions: string[] = [];

  if ($("img:not([alt])").length > 0) {
    suggestions.push("Add descriptive alt text to all images");
  }
  if ($("a:not([aria-label])").length > 0) {
    suggestions.push("Add aria labels to all navigation links");
  }
  if (!$("html[lang]").length) {
    suggestions.push("Specify language in HTML tag");
  }

  return suggestions;
}