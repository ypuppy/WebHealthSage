import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(text: string): Promise<{
  score: number;
  tone: string;
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the sentiment and tone of the website content. Provide a score (1-100), overall tone, and suggestions for improvement. Format the response as JSON with the exact keys: score, tone, suggestions.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    if (!parsed.score || !parsed.tone || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      score: parsed.score,
      tone: parsed.tone,
      suggestions: parsed.suggestions,
    };
  } catch (error: any) {
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    if (error?.response?.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
    }
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}

export async function getSEOSuggestions(content: string): Promise<{
  issues: string[];
  suggestions: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Analyze the website content for SEO issues and provide actionable suggestions. Format the response as JSON with exactly two arrays: 'issues' and 'suggestions'.",
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No response content received from OpenAI");
    }

    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed.issues) || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      issues: parsed.issues,
      suggestions: parsed.suggestions,
    };
  } catch (error: any) {
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    if (error?.response?.status === 401) {
      throw new Error("Invalid OpenAI API key. Please check your API key configuration.");
    }
    throw new Error(`Failed to get SEO suggestions: ${error.message}`);
  }
}