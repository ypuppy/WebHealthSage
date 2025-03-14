import { load, type CheerioAPI } from "cheerio";
import { analyzeSentiment, getSEOSuggestions } from "./openai";

function validateResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Failed to fetch website: ${response.statusText}`);
  }
}

function validateContent($: CheerioAPI, visibleText: string) {
  if (!visibleText.trim()) {
    throw new Error("No visible text content found on the page");
  }

  if (!$("body").length) {
    throw new Error("Invalid HTML structure: no body tag found");
  }
}

export async function analyzeWebsite(url: string) {
  try {
    console.log(`Starting analysis for URL: ${url}`);

    // Step 1: Fetch and validate website content
    console.log("Fetching website content...");
    const response = await fetch(url);
    validateResponse(response);

    const html = await response.text();
    console.log("Website content fetched successfully");

    const $ = load(html);
    const visibleText = $("body").text();
    validateContent($, visibleText);

    // Step 2: Perform technical analysis first (non-AI dependent)
    console.log("Starting technical analysis...");
    const seoScore = calculateSEOScore($);
    const performanceScore = calculatePerformanceScore($);
    const securityScore = calculateSecurityScore($, response.headers);
    const accessibilityScore = calculateAccessibilityScore($);
    console.log("Technical analysis completed");

    // Step 3: Get AI-powered insights
    console.log("Starting AI analysis...");
    const [seoDetails, sentimentAnalysis] = await Promise.all([
      getSEOSuggestions(html),
      analyzeSentiment(visibleText),
    ]);
    console.log("AI analysis completed");

    // Step 4: Compile final report
    const result = {
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

    console.log("Analysis completed successfully");
    return result;
  } catch (error) {
    console.error("Analysis failed:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyze website: ${errorMessage}`);
  }
}

function calculateSEOScore($: CheerioAPI): number {
  let score = 100;

  if (!$("title").length) score -= 10;
  if (!$('meta[name="description"]').length) score -= 10;
  if (!$("h1").length) score -= 5;
  if ($("img:not([alt])").length > 0) score -= 5;

  return Math.max(0, score);
}

function calculatePerformanceScore($: CheerioAPI): number {
  let score = 100;

  const scripts = $("script").length;
  if (scripts > 15) score -= 10;

  const styles = $("link[rel='stylesheet']").length;
  if (styles > 5) score -= 10;

  const images = $("img").length;
  if (images > 20) score -= 10;

  return Math.max(0, score);
}

function calculateSecurityScore($: CheerioAPI, headers: Headers): number {
  let score = 100;

  if (!headers.get("Content-Security-Policy")) score -= 20;
  if (!headers.get("X-Frame-Options")) score -= 10;
  if (!headers.get("X-XSS-Protection")) score -= 10;

  return Math.max(0, score);
}

function calculateAccessibilityScore($: CheerioAPI): number {
  let score = 100;

  if ($("img:not([alt])").length > 0) score -= 10;
  if ($("a:not([aria-label])").length > 0) score -= 10;
  if (!$("html[lang]").length) score -= 10;

  return Math.max(0, score);
}

function getPerformanceIssues($: CheerioAPI): string[] {
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

function getPerformanceSuggestions($: CheerioAPI): string[] {
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

function getAccessibilityIssues($: CheerioAPI): string[] {
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

function getAccessibilitySuggestions($: CheerioAPI): string[] {
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