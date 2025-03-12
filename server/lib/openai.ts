import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(text: string): Promise<{
  score: number;
  tone: string;
  suggestions: string[];
}> {
  try {
    console.log("Starting sentiment analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a website content analyzer. Focus only on analyzing the sentiment and tone of the provided website content. Provide a score (1-100), overall tone description, and specific content improvement suggestions. Do not provide any other type of analysis.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response content received from OpenAI");
    }

    console.log("OpenAI response:", responseContent);

    const parsed = JSON.parse(responseContent);
    if (!parsed.score || !parsed.tone || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      score: parsed.score,
      tone: parsed.tone,
      suggestions: parsed.suggestions,
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    throw new Error(`Failed to analyze sentiment: ${error.message}`);
  }
}

export async function getSEOSuggestions(content: string): Promise<{
  issues: string[];
  suggestions: string[];
}> {
  try {
    console.log("Starting SEO analysis...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a website SEO analyzer. Focus exclusively on analyzing the website content for SEO issues and providing actionable suggestions. Only look for SEO-related aspects like meta tags, content structure, keywords, and HTML semantics. Do not provide any other type of analysis. Format the response as JSON with exactly two arrays: 'issues' for SEO problems found and 'suggestions' for improvement recommendations.",
        },
        {
          role: "user",
          content,
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseContent = response.choices[0].message.content;
    if (!responseContent) {
      throw new Error("No response content received from OpenAI");
    }

    console.log("OpenAI response:", responseContent);

    const parsed = JSON.parse(responseContent);
    if (!Array.isArray(parsed.issues) || !Array.isArray(parsed.suggestions)) {
      throw new Error("Invalid response format from OpenAI");
    }

    return {
      issues: parsed.issues,
      suggestions: parsed.suggestions,
    };
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    if (error?.response?.status === 429 || error.message?.includes('quota')) {
      throw new Error("OpenAI API quota exceeded. Please try again later or check your API key limits.");
    }
    throw new Error(`Failed to get SEO suggestions: ${error.message}`);
  }
}